// src/services/enhancedMLRecommendation.ts
import { Pokemon } from '../types/pokemon';
import { PokemonRecommendation, TeamAnalysis, SynergyType } from '../types/team';
import { TeamStrategy, TeamStrategyType, MonoTypeStrategy, TEAM_STRATEGIES } from '../types/teamStrategy';
import { TYPE_EFFECTIVENESS } from '../utils/typeEffectiveness';
import { POKEMON_TYPES } from '../utils/constants';

export interface StrategyRecommendationResult {
  recommendations: PokemonRecommendation[];
  analysis: TeamAnalysis;
  strategyTips: string[];
  warnings: string[];
  coverage: StrategyCoverage;
}

interface StrategyCoverage {
  typesCovered: string[];
  typesWeak: string[];
  roleBalance: Record<string, number>;
  statDistribution: Record<string, number>;
}

class EnhancedMLRecommendationService {
  
  async getStrategyRecommendations(
    strategy: TeamStrategy,
    currentTeam: (Pokemon | null)[],
    allPokemon: Pokemon[]
  ): Promise<StrategyRecommendationResult> {
    
    const teamAnalysis = this.analyzeTeamWithStrategy(currentTeam, strategy);
    const availablePokemon = this.filterAvailablePokemon(allPokemon, currentTeam, strategy);
    
    const recommendations = availablePokemon.map(pokemon => {
      const score = this.calculateStrategyScore(pokemon, currentTeam, strategy, teamAnalysis);
      const reasons = this.generateStrategyReasons(pokemon, currentTeam, strategy, teamAnalysis);
      const synergy = this.identifyStrategySynergy(pokemon, currentTeam, strategy);

      return {
        pokemon,
        score,
        reasons,
        synergy
      };
    });

    // Ordenar por score estratégico
    const sortedRecommendations = recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    const coverage = this.analyzeCoverage(currentTeam, strategy);
    const strategyTips = this.generateStrategyTips(currentTeam, strategy, coverage);
    const warnings = this.generateStrategyWarnings(currentTeam, strategy, coverage);

    return {
      recommendations: sortedRecommendations,
      analysis: teamAnalysis,
      strategyTips,
      warnings,
      coverage
    };
  }

  private filterAvailablePokemon(
    allPokemon: Pokemon[], 
    currentTeam: (Pokemon | null)[], 
    strategy: TeamStrategy
  ): Pokemon[] {
    const teamPokemonIds = currentTeam.filter(p => p !== null).map(p => p!.id);
    
    return allPokemon.filter(pokemon => {
      // Não incluir Pokémon já na equipe
      if (teamPokemonIds.includes(pokemon.id)) return false;
      
      // Filtros específicos por estratégia
      if (strategy.type === 'mono_type') {
        const monoStrategy = strategy as MonoTypeStrategy;
        const pokemonTypes = pokemon.types.map(t => t.type.name);
        return pokemonTypes.includes(monoStrategy.selectedType);
      }
      
      // Para outras estratégias, usar filtros gerais
      if (strategy.preferences.typeDistribution?.avoided) {
        const pokemonTypes = pokemon.types.map(t => t.type.name);
        const hasAvoidedType = pokemonTypes.some(type => 
          strategy.preferences.typeDistribution!.avoided.includes(type)
        );
        if (hasAvoidedType) return false;
      }
      
      return true;
    });
  }

  private calculateStrategyScore(
    pokemon: Pokemon,
    currentTeam: (Pokemon | null)[],
    strategy: TeamStrategy,
    teamAnalysis: TeamAnalysis
  ): number {
    const weights = strategy.preferences.synergyWeights;
    let score = 0;

    // 1. Score baseado nas prioridades de stat da estratégia
    score += this.calculateStatScore(pokemon, strategy.preferences.statPriorities) * 0.3;

    // 2. Score baseado no role que o Pokémon preenche
    score += this.calculateRoleScore(pokemon, currentTeam, strategy.preferences.roleDistribution) * 0.25;

    // 3. Score baseado na sinergia de tipos (com peso da estratégia)
    score += this.calculateTypeBalance(pokemon, currentTeam, strategy) * weights.typeBalance;

    // 4. Score baseado na complementaridade (com peso da estratégia)
    score += this.calculateStatComplementarity(pokemon, currentTeam) * weights.statComplement;

    // 5. Score baseado na cobertura defensiva (com peso da estratégia)
    score += this.calculateDefensiveCoverage(pokemon, teamAnalysis, strategy) * weights.defensiveCoverage;

    // 6. Score baseado na sinergia ofensiva (com peso da estratégia)
    score += this.calculateOffensiveSynergy(pokemon, currentTeam, strategy) * weights.offensiveSynergy;

    // 7. Bônus específicos da estratégia
    score += this.calculateStrategyBonus(pokemon, currentTeam, strategy);

    return Math.min(score, 100);
  }

  private calculateStatScore(pokemon: Pokemon, statPriorities: Record<string, number>): number {
    const stats = this.getStatObject(pokemon);
    let score = 0;

    // Calcular score baseado nas prioridades da estratégia
    score += stats.hp * statPriorities.hp * 0.15;
    score += stats.attack * statPriorities.attack * 0.18;
    score += stats.defense * statPriorities.defense * 0.16;
    score += stats.specialAttack * statPriorities.specialAttack * 0.18;
    score += stats.specialDefense * statPriorities.specialDefense * 0.16;
    score += stats.speed * statPriorities.speed * 0.17;

    return Math.min(score / 10, 40); // Normalizar
  }

  private calculateRoleScore(
    pokemon: Pokemon,
    currentTeam: (Pokemon | null)[],
    roleDistribution: Record<string, number>
  ): number {
    const pokemonRole = this.identifyPokemonRole(pokemon);
    const currentRoles = this.analyzeCurrentRoles(currentTeam);
    
    const needed = roleDistribution[pokemonRole] || 0;
    const current = currentRoles[pokemonRole] || 0;
    
    if (current >= needed) {
      return 0; // Role já preenchido
    }
    
    return (needed - current) * 20; // Mais pontos se o role é muito necessário
  }

  private calculateTypeBalance(
    pokemon: Pokemon,
    currentTeam: (Pokemon | null)[],
    strategy: TeamStrategy
  ): number {
    const pokemonTypes = pokemon.types.map(t => t.type.name);
    let score = 0;

    if (strategy.type === 'mono_type') {
      // Para mono type, dar pontos por ter o tipo correto
      const monoStrategy = strategy as MonoTypeStrategy;
      if (pokemonTypes.includes(monoStrategy.selectedType)) {
        score += 30;
        
        // Bônus por tipo secundário que ajuda defensivamente
        const secondaryTypes = pokemonTypes.filter(t => t !== monoStrategy.selectedType);
        if (secondaryTypes.length > 0) {
          const mainTypeWeaknesses = this.getTypeWeaknesses(monoStrategy.selectedType);
          const secondaryResistances = this.getTypeResistances(secondaryTypes[0]);
          const coveredWeaknesses = mainTypeWeaknesses.filter(w => secondaryResistances.includes(w));
          score += coveredWeaknesses.length * 5;
        }
      }
    } else {
      // Para outras estratégias, balanceamento tradicional
      score += this.calculateTraditionalTypeBalance(pokemon, currentTeam);
    }

    return score;
  }

  private calculateStatComplementarity(pokemon: Pokemon, currentTeam: (Pokemon | null)[]): number {
    const teamPokemon = currentTeam.filter(p => p !== null) as Pokemon[];
    if (teamPokemon.length === 0) return 20;

    const pokemonStats = this.getStatObject(pokemon);
    let complementarity = 0;

    teamPokemon.forEach(teamMember => {
      const memberStats = this.getStatObject(teamMember);
      
      // Complementaridade física/especial
      if (pokemonStats.attack > pokemonStats.specialAttack && memberStats.specialAttack > memberStats.attack) {
        complementarity += 8;
      }
      if (pokemonStats.specialAttack > pokemonStats.attack && memberStats.attack > memberStats.specialAttack) {
        complementarity += 8;
      }
      
      // Complementaridade ofensivo/defensivo
      const pokemonOffensive = pokemonStats.attack + pokemonStats.specialAttack;
      const pokemonDefensive = pokemonStats.defense + pokemonStats.specialDefense;
      const memberOffensive = memberStats.attack + memberStats.specialAttack;
      const memberDefensive = memberStats.defense + memberStats.specialDefense;
      
      if (pokemonOffensive > pokemonDefensive && memberDefensive > memberOffensive) {
        complementarity += 6;
      }
      if (pokemonDefensive > pokemonOffensive && memberOffensive > memberDefensive) {
        complementarity += 6;
      }
    });

    return Math.min(complementarity, 35);
  }

  private calculateDefensiveCoverage(
    pokemon: Pokemon,
    teamAnalysis: TeamAnalysis,
    strategy: TeamStrategy
  ): number {
    if (strategy.type === 'mono_type') {
      // Para mono type, verificar se ajuda com as fraquezas inerentes
      const monoStrategy = strategy as MonoTypeStrategy;
      const mainTypeWeaknesses = this.getTypeWeaknesses(monoStrategy.selectedType);
      const pokemonTypes = pokemon.types.map(t => t.type.name);
      
      let coverage = 0;
      pokemonTypes.forEach(type => {
        const resistances = this.getTypeResistances(type);
        const coveredWeaknesses = mainTypeWeaknesses.filter(w => resistances.includes(w));
        coverage += coveredWeaknesses.length * 8;
      });
      
      return coverage;
    }

    // Para outras estratégias, cobertura tradicional
    const pokemonTypes = pokemon.types.map(t => t.type.name);
    let coverage = 0;
    
    teamAnalysis.weaknesses.forEach(weakness => {
      pokemonTypes.forEach(type => {
        const resistances = this.getTypeResistances(type);
        if (resistances.includes(weakness)) {
          coverage += 10;
        }
      });
    });
    
    return coverage;
  }

  private calculateOffensiveSynergy(
    pokemon: Pokemon,
    currentTeam: (Pokemon | null)[],
    strategy: TeamStrategy
  ): number {
    if (strategy.type === 'offensive' || strategy.type === 'speed') {
      // Para estratégias ofensivas, priorizar alta velocidade e ataque
      const stats = this.getStatObject(pokemon);
      const offensiveTotal = stats.attack + stats.specialAttack;
      const speedBonus = stats.speed > 100 ? 15 : stats.speed > 80 ? 10 : 0;
      
      return Math.min((offensiveTotal / 8) + speedBonus, 35);
    }
    
    if (strategy.type === 'stall' || strategy.type === 'defensive') {
      // Para estratégias defensivas, priorizar bulk
      const stats = this.getStatObject(pokemon);
      const defensiveTotal = stats.hp + stats.defense + stats.specialDefense;
      
      return Math.min(defensiveTotal / 10, 35);
    }
    
    return 15; // Score neutro para outras estratégias
  }

  private calculateStrategyBonus(
    pokemon: Pokemon,
    currentTeam: (Pokemon | null)[],
    strategy: TeamStrategy
  ): number {
    let bonus = 0;
    const stats = this.getStatObject(pokemon);
    
    switch (strategy.type) {
      case 'speed':
        if (stats.speed > 110) bonus += 15;
        else if (stats.speed > 95) bonus += 10;
        else if (stats.speed < 60) bonus -= 10;
        break;
        
      case 'stall':
        if (stats.hp > 100) bonus += 10;
        if (stats.defense + stats.specialDefense > 160) bonus += 15;
        if (stats.attack + stats.specialAttack > 120) bonus -= 5;
        break;
        
      case 'weather':
        // Bônus para Pokémon que se beneficiam de clima
        const pokemonTypes = pokemon.types.map(t => t.type.name);
        if (pokemonTypes.includes('fire') || pokemonTypes.includes('grass') || 
            pokemonTypes.includes('water') || pokemonTypes.includes('rock')) {
          bonus += 10;
        }
        break;
        
      case 'mono_type':
        // Bônus por diversidade de stats dentro do mesmo tipo
        const role = this.identifyPokemonRole(pokemon);
        const currentRoles = this.analyzeCurrentRoles(currentTeam);
        if (!currentRoles[role] || currentRoles[role] === 0) {
          bonus += 15;
        }
        break;
    }
    
    return bonus;
  }

  private generateStrategyReasons(
    pokemon: Pokemon,
    currentTeam: (Pokemon | null)[],
    strategy: TeamStrategy,
    teamAnalysis: TeamAnalysis
  ): string[] {
    const reasons: string[] = [];
    const stats = this.getStatObject(pokemon);
    const pokemonTypes = pokemon.types.map(t => t.type.name);
    const role = this.identifyPokemonRole(pokemon);

    // Razões específicas por estratégia
    switch (strategy.type) {
      case 'mono_type':
        const monoStrategy = strategy as MonoTypeStrategy;
        if (pokemonTypes.includes(monoStrategy.selectedType)) {
          reasons.push(`Pokémon do tipo ${monoStrategy.selectedType} conforme estratégia mono-tipo`);
          
          const secondaryTypes = pokemonTypes.filter(t => t !== monoStrategy.selectedType);
          if (secondaryTypes.length > 0) {
            const mainWeaknesses = this.getTypeWeaknesses(monoStrategy.selectedType);
            const secondaryResistances = this.getTypeResistances(secondaryTypes[0]);
            const coveredWeaknesses = mainWeaknesses.filter(w => secondaryResistances.includes(w));
            
            if (coveredWeaknesses.length > 0) {
              reasons.push(`Tipo secundário ${secondaryTypes[0]} ajuda contra fraquezas: ${coveredWeaknesses.join(', ')}`);
            }
          }
        }
        break;
        
      case 'offensive':
        if (stats.attack + stats.specialAttack > 140) {
          reasons.push('Alto poder ofensivo ideal para estratégia agressiva');
        }
        if (stats.speed > 100) {
          reasons.push('Velocidade alta permite atacar primeiro');
        }
        break;
        
      case 'defensive':
        if (stats.hp > 80 && (stats.defense > 80 || stats.specialDefense > 80)) {
          reasons.push('Excelente capacidade defensiva para absorver dano');
        }
        break;
        
      case 'speed':
        if (stats.speed > 110) {
          reasons.push('Velocidade excepcional para controle do campo');
        }
        if (stats.attack > 100 || stats.specialAttack > 100) {
          reasons.push('Combina velocidade com poder para sweeping');
        }
        break;
        
      case 'stall':
        if (stats.hp > 100) {
          reasons.push('Alto HP para prolongar a batalha');
        }
        if (stats.defense + stats.specialDefense > 160) {
          reasons.push('Defesas excelentes para outlast oponentes');
        }
        break;
    }

    // Razões baseadas no role necessário
    const currentRoles = this.analyzeCurrentRoles(currentTeam);
    const neededRoles = strategy.preferences.roleDistribution;
    
    Object.entries(neededRoles).forEach(([neededRole, neededCount]) => {
      const currentCount = currentRoles[neededRole] || 0;
      if (role === neededRole && currentCount < neededCount) {
        reasons.push(`Preenche o role de ${neededRole} necessário para a estratégia`);
      }
    });

    // Razões de cobertura
    if (strategy.type !== 'mono_type') {
      const coveredWeaknesses = teamAnalysis.weaknesses.filter(weakness =>
        pokemonTypes.some(type => this.getTypeResistances(type).includes(weakness))
      );
      
      if (coveredWeaknesses.length > 0) {
        reasons.push(`Cobre fraquezas da equipe: ${coveredWeaknesses.join(', ')}`);
      }
    }

    return reasons.slice(0, 3);
  }

  private identifyStrategySynergy(
    pokemon: Pokemon,
    currentTeam: (Pokemon | null)[],
    strategy: TeamStrategy
  ): SynergyType[] {
    const synergies: SynergyType[] = [];
    const stats = this.getStatObject(pokemon);
    const pokemonTypes = pokemon.types.map(t => t.type.name);
    
    // Sinergia específica por estratégia
    switch (strategy.type) {
      case 'mono_type':
        const monoStrategy = strategy as MonoTypeStrategy;
        if (pokemonTypes.includes(monoStrategy.selectedType)) {
          synergies.push('type_balance');
        }
        break;
        
      case 'offensive':
      case 'speed':
        if (stats.attack > 100 || stats.specialAttack > 100) {
          synergies.push('offensive_core');
        }
        break;
        
      case 'defensive':
      case 'stall':
        if (stats.defense + stats.specialDefense > 140) {
          synergies.push('defensive_wall');
        }
        break;
    }
    
    // Sinergia de complementaridade sempre aplicável
    const teamPokemon = currentTeam.filter(p => p !== null) as Pokemon[];
    if (teamPokemon.length > 0) {
      const hasStatComplement = teamPokemon.some(member => {
        const memberStats = this.getStatObject(member);
        return (stats.attack > stats.specialAttack && memberStats.specialAttack > memberStats.attack) ||
               (stats.specialAttack > stats.attack && memberStats.attack > memberStats.specialAttack);
      });
      
      if (hasStatComplement) {
        synergies.push('stat_complement');
      }
    }
    
    // Sinergia de cobertura de movimentos (simplificada)
    synergies.push('move_coverage');
    
    return synergies;
  }

  private analyzeCoverage(currentTeam: (Pokemon | null)[], strategy: TeamStrategy): StrategyCoverage {
    const teamPokemon = currentTeam.filter(p => p !== null) as Pokemon[];
    
    const typesCovered: string[] = [];
    const typesWeak: string[] = [];
    const roleBalance: Record<string, number> = {};
    const statDistribution: Record<string, number> = {
      hp: 0,
      attack: 0,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 0
    };
    
    // Analisar tipos cobertos
    teamPokemon.forEach(pokemon => {
      pokemon.types.forEach(type => {
        if (!typesCovered.includes(type.type.name)) {
          typesCovered.push(type.type.name);
        }
      });
    });
    
    // Analisar fraquezas comuns
    if (strategy.type === 'mono_type') {
      const monoStrategy = strategy as MonoTypeStrategy;
      typesWeak.push(...this.getTypeWeaknesses(monoStrategy.selectedType));
    } else {
      const commonWeaknesses = this.findCommonWeaknesses(teamPokemon);
      typesWeak.push(...commonWeaknesses);
    }
    
    // Analisar distribuição de roles
    teamPokemon.forEach(pokemon => {
      const role = this.identifyPokemonRole(pokemon);
      roleBalance[role] = (roleBalance[role] || 0) + 1;
    });
    
    // Analisar distribuição de stats
    if (teamPokemon.length > 0) {
      teamPokemon.forEach(pokemon => {
        const stats = this.getStatObject(pokemon);
        statDistribution.hp += stats.hp;
        statDistribution.attack += stats.attack;
        statDistribution.defense += stats.defense;
        statDistribution.specialAttack += stats.specialAttack;
        statDistribution.specialDefense += stats.specialDefense;
        statDistribution.speed += stats.speed;
      });
      
      // Calcular médias
      Object.keys(statDistribution).forEach(stat => {
        statDistribution[stat] = Math.round(statDistribution[stat] / teamPokemon.length);
      });
    }
    
    return {
      typesCovered,
      typesWeak,
      roleBalance,
      statDistribution
    };
  }

  private generateStrategyTips(
    currentTeam: (Pokemon | null)[],
    strategy: TeamStrategy,
    coverage: StrategyCoverage
  ): string[] {
    const tips: string[] = [];
    const teamSize = currentTeam.filter(p => p !== null).length;
    
    // Tips gerais da estratégia
    tips.push(...strategy.tips);
    
    // Tips específicos baseados na análise atual
    switch (strategy.type) {
      case 'mono_type':
        const monoStrategy = strategy as MonoTypeStrategy;
        const typeWeaknesses = this.getTypeWeaknesses(monoStrategy.selectedType);
        
        if (coverage.typesWeak.length > 0) {
          tips.push(`Priorize Pokémon com tipos secundários que resistam a: ${coverage.typesWeak.slice(0, 3).join(', ')}`);
        }
        
        if (Object.keys(coverage.roleBalance).length < 3) {
          tips.push('Diversifique os roles: inclua sweepers, tanks e support');
        }
        break;
        
      case 'offensive':
        if (coverage.statDistribution.speed < 90) {
          tips.push('Adicione mais Pokémon com alta velocidade para garantir primeiro turno');
        }
        if (!coverage.roleBalance.wallbreaker || coverage.roleBalance.wallbreaker === 0) {
          tips.push('Inclua pelo menos um wallbreaker para quebrar defesas');
        }
        break;
        
      case 'defensive':
        if (coverage.statDistribution.hp < 80) {
          tips.push('Adicione Pokémon com mais HP para maior sustentabilidade');
        }
        if (coverage.roleBalance.sweeper && coverage.roleBalance.sweeper > 1) {
          tips.push('Considere trocar alguns sweepers por mais tanks');
        }
        break;
        
      case 'speed':
        if (coverage.statDistribution.speed < 100) {
          tips.push('CRÍTICO: Todos os Pokémon devem ter Speed alta (100+)');
        }
        break;
        
      case 'balanced':
        const totalRoles = Object.values(coverage.roleBalance).reduce((a, b) => a + b, 0);
        if (totalRoles > 0) {
          const roleRatio = Object.keys(coverage.roleBalance).length / totalRoles;
          if (roleRatio < 0.5) {
            tips.push('Diversifique mais os roles da equipe');
          }
        }
        break;
    }
    
    // Tips baseados no tamanho da equipe
    if (teamSize < 3) {
      tips.push('Construa uma base sólida com pelo menos 3 Pokémon complementares');
    } else if (teamSize >= 4) {
      tips.push('Ajuste fino: foque em cobrir fraquezas específicas restantes');
    }
    
    return tips.slice(0, 5);
  }

  private generateStrategyWarnings(
    currentTeam: (Pokemon | null)[],
    strategy: TeamStrategy,
    coverage: StrategyCoverage
  ): string[] {
    const warnings: string[] = [];
    
    // Warnings gerais da estratégia
    warnings.push(...strategy.warnings);
    
    // Warnings específicos baseados na situação atual
    switch (strategy.type) {
      case 'mono_type':
        const monoStrategy = strategy as MonoTypeStrategy;
        const criticalWeaknesses = this.getTypeWeaknesses(monoStrategy.selectedType);
        
        warnings.push(`ATENÇÃO: Equipe extremamente vulnerável a tipos: ${criticalWeaknesses.join(', ')}`);
        
        if (coverage.typesCovered.length === 1) {
          warnings.push('Sem tipos secundários para mitigar fraquezas');
        }
        break;
        
      case 'offensive':
        if (coverage.statDistribution.defense + coverage.statDistribution.specialDefense < 120) {
          warnings.push('Equipe muito frágil - pode ser eliminada rapidamente');
        }
        if (!coverage.roleBalance.tank || coverage.roleBalance.tank === 0) {
          warnings.push('Sem tanques - vulnerável a estratégias de stall');
        }
        break;
        
      case 'speed':
        if (coverage.statDistribution.speed < 95) {
          warnings.push('CRÍTICO: Velocidade média muito baixa para estratégia speed');
        }
        if (coverage.statDistribution.hp > 90) {
          warnings.push('HP muito alto pode indicar Pokémon lentos na equipe');
        }
        break;
        
      case 'stall':
        if (!coverage.roleBalance.sweeper || coverage.roleBalance.sweeper === 0) {
          warnings.push('Sem win conditions - como você vai vencer?');
        }
        if (coverage.roleBalance.sweeper && coverage.roleBalance.sweeper > 1) {
          warnings.push('Muitos sweepers para uma estratégia defensiva');
        }
        break;
    }
    
    // Warnings gerais
    if (coverage.typesWeak.length > 3) {
      warnings.push(`Muitas fraquezas comuns: ${coverage.typesWeak.slice(0, 3).join(', ')}...`);
    }
    
    return warnings.slice(0, 4);
  }

  // Métodos auxiliares existentes (adaptados)
  private analyzeTeamWithStrategy(team: (Pokemon | null)[], strategy: TeamStrategy): TeamAnalysis {
    const activePokemon = team.filter(p => p !== null) as Pokemon[];
    
    const typeDistribution: Record<string, number> = {};
    const allTypes = activePokemon.flatMap(p => p.types.map(t => t.type.name));
    
    allTypes.forEach(type => {
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;
    });
    
    const weaknesses: string[] = [];
    const strengths: string[] = [];
    
    if (strategy.type === 'mono_type') {
      const monoStrategy = strategy as MonoTypeStrategy;
      weaknesses.push(...this.getTypeWeaknesses(monoStrategy.selectedType));
      strengths.push(...this.getTypeResistances(monoStrategy.selectedType));
    } else {
      weaknesses.push(...this.findCommonWeaknesses(activePokemon));
      strengths.push(...this.findCommonResistances(activePokemon));
    }
    
    return {
      typeDistribution,
      strengths,
      weaknesses,
      recommendations: this.generateTeamRecommendations(typeDistribution, weaknesses, strategy)
    };
  }

  private generateTeamRecommendations(
    typeDistribution: Record<string, number>,
    weaknesses: string[],
    strategy: TeamStrategy
  ): string[] {
    const recommendations: string[] = [];
    
    if (strategy.type === 'mono_type') {
      const monoStrategy = strategy as MonoTypeStrategy;
      recommendations.push(`Mantenha foco no tipo ${monoStrategy.selectedType}`);
      
      if (weaknesses.length > 0) {
        recommendations.push(`Busque tipos secundários que resistam a: ${weaknesses.join(', ')}`);
      }
    } else {
      if (weaknesses.length > 0) {
        recommendations.push(`Adicione Pokémon que resistam a: ${weaknesses.join(', ')}`);
      }
      
      const mostCommonType = Object.entries(typeDistribution)
        .sort(([, a], [, b]) => b - a)[0];
      
      if (mostCommonType && mostCommonType[1] > 2 && strategy.type !== 'mono_type') {
        recommendations.push(`Considere diversificar - muitos Pokémon do tipo ${mostCommonType[0]}`);
      }
    }
    
    return recommendations;
  }

  private identifyPokemonRole(pokemon: Pokemon): string {
    const stats = this.getStatObject(pokemon);
    const totalOffensive = stats.attack + stats.specialAttack;
    const totalDefensive = stats.defense + stats.specialDefense;
    
    if (stats.speed > 100 && totalOffensive > 120) return 'sweeper';
    if (totalOffensive > 140) return 'wallbreaker';
    if (totalDefensive > 140) return 'tank';
    if (stats.hp > 100) return 'support';
    
    return 'sweeper'; // Default
  }

  private analyzeCurrentRoles(currentTeam: (Pokemon | null)[]): Record<string, number> {
    const roles: Record<string, number> = {};
    
    currentTeam.forEach(pokemon => {
      if (pokemon) {
        const role = this.identifyPokemonRole(pokemon);
        roles[role] = (roles[role] || 0) + 1;
      }
    });
    
    return roles;
  }

  private calculateTraditionalTypeBalance(pokemon: Pokemon, currentTeam: (Pokemon | null)[]): number {
    const pokemonTypes = pokemon.types.map(t => t.type.name);
    const teamTypes = currentTeam
      .filter(p => p !== null)
      .flatMap(p => p!.types.map(t => t.type.name));
    
    let balance = 0;
    
    // Verificar cobertura de fraquezas
    const teamWeaknesses = this.findCommonWeaknesses(currentTeam.filter(p => p !== null) as Pokemon[]);
    pokemonTypes.forEach(type => {
      const resistances = this.getTypeResistances(type);
      const coveredWeaknesses = teamWeaknesses.filter(w => resistances.includes(w));
      balance += coveredWeaknesses.length * 10;
    });
    
    // Penalizar tipos duplicados
    pokemonTypes.forEach(type => {
      if (teamTypes.includes(type)) {
        balance -= 5;
      }
    });
    
    return Math.max(0, balance);
  }

  // Métodos utilitários (mantidos dos originais)
  private getTypeWeaknesses(type: string): string[] {
    return TYPE_EFFECTIVENESS[type]?.weakTo || [];
  }

  private getTypeResistances(type: string): string[] {
    return TYPE_EFFECTIVENESS[type]?.resistantTo || [];
  }

  private getStatObject(pokemon: Pokemon) {
    const stats = {
      hp: 0,
      attack: 0,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 0
    };

    pokemon.stats.forEach(stat => {
      switch (stat.stat.name) {
        case 'hp':
          stats.hp = stat.base_stat;
          break;
        case 'attack':
          stats.attack = stat.base_stat;
          break;
        case 'defense':
          stats.defense = stat.base_stat;
          break;
        case 'special-attack':
          stats.specialAttack = stat.base_stat;
          break;
        case 'special-defense':
          stats.specialDefense = stat.base_stat;
          break;
        case 'speed':
          stats.speed = stat.base_stat;
          break;
      }
    });

    return stats;
  }

  private findCommonWeaknesses(team: Pokemon[]): string[] {
    const allWeaknesses = team.flatMap(pokemon => 
      pokemon.types.flatMap(type => this.getTypeWeaknesses(type.type.name))
    );
    
    const weaknessCounts: Record<string, number> = {};
    allWeaknesses.forEach(weakness => {
      weaknessCounts[weakness] = (weaknessCounts[weakness] || 0) + 1;
    });
    
    return Object.entries(weaknessCounts)
      .filter(([_, count]) => count >= 2)
      .map(([weakness, _]) => weakness);
  }

  private findCommonResistances(team: Pokemon[]): string[] {
    const allResistances = team.flatMap(pokemon => 
      pokemon.types.flatMap(type => this.getTypeResistances(type.type.name))
    );
    
    const resistanceCounts: Record<string, number> = {};
    allResistances.forEach(resistance => {
      resistanceCounts[resistance] = (resistanceCounts[resistance] || 0) + 1;
    });
    
    return Object.entries(resistanceCounts)
      .filter(([_, count]) => count >= 2)
      .map(([resistance, _]) => resistance);
  }
}

export const enhancedMLRecommendationService = new EnhancedMLRecommendationService();