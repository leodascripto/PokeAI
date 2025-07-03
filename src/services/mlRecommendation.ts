import { Pokemon } from '../types/pokemon';
import { PokemonRecommendation, TeamAnalysis, SynergyType } from '../types/team';
import { TYPE_EFFECTIVENESS } from '../utils/typeEffectiveness';

class MLRecommendationService {
  
  // Sistema de recomendação baseado em tipos, stats e sinergia
  async getRecommendations(
    targetPokemon: Pokemon, 
    currentTeam: (Pokemon | null)[], 
    allPokemon: Pokemon[]
  ): Promise<PokemonRecommendation[]> {
    
    const teamAnalysis = this.analyzeTeam([...currentTeam.filter(p => p !== null) as Pokemon[], targetPokemon]);
    const availablePokemon = allPokemon.filter(p => 
      !currentTeam.some(teamMember => teamMember?.id === p.id) && 
      p.id !== targetPokemon.id
    );

    const recommendations = availablePokemon.map(pokemon => {
      const score = this.calculateSynergyScore(targetPokemon, pokemon, currentTeam, teamAnalysis);
      const reasons = this.generateReasons(targetPokemon, pokemon, currentTeam, teamAnalysis);
      const synergy = this.identifySynergyTypes(targetPokemon, pokemon, currentTeam);

      return {
        pokemon,
        score,
        reasons,
        synergy
      };
    });

    // Ordenar por score e retornar top 10
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  private calculateSynergyScore(
    targetPokemon: Pokemon, 
    candidatePokemon: Pokemon, 
    currentTeam: (Pokemon | null)[],
    teamAnalysis: TeamAnalysis
  ): number {
    let score = 0;

    // 1. Balanceamento de tipos (40% do score)
    score += this.calculateTypeBalance(targetPokemon, candidatePokemon, currentTeam) * 0.4;

    // 2. Complementaridade de stats (30% do score)
    score += this.calculateStatComplementarity(targetPokemon, candidatePokemon) * 0.3;

    // 3. Cobertura defensiva (20% do score)
    score += this.calculateDefensiveCoverage(candidatePokemon, teamAnalysis) * 0.2;

    // 4. Diversidade geral (10% do score)
    score += this.calculateDiversity(candidatePokemon, currentTeam) * 0.1;

    return Math.min(score, 100); // Limitar a 100
  }

  private calculateTypeBalance(
    targetPokemon: Pokemon, 
    candidatePokemon: Pokemon, 
    currentTeam: (Pokemon | null)[]
  ): number {
    const targetTypes = targetPokemon.types.map(t => t.type.name);
    const candidateTypes = candidatePokemon.types.map(t => t.type.name);
    
    // Verificar se complementa as fraquezas do pokemon alvo
    let balance = 0;
    
    for (const targetType of targetTypes) {
      const weaknesses = this.getTypeWeaknesses(targetType);
      
      for (const candidateType of candidateTypes) {
        const resistances = this.getTypeResistances(candidateType);
        
        // Se o candidato resiste ao que o alvo é fraco, +pontos
        const commonWeaknesses = weaknesses.filter(w => resistances.includes(w));
        balance += commonWeaknesses.length * 15;
      }
    }

    // Penalizar tipos duplicados na equipe
    const teamTypes = currentTeam
      .filter(p => p !== null)
      .flatMap(p => p!.types.map(t => t.type.name));
    
    for (const candidateType of candidateTypes) {
      if (teamTypes.includes(candidateType)) {
        balance -= 10;
      }
    }

    return Math.max(0, balance);
  }

  private calculateStatComplementarity(targetPokemon: Pokemon, candidatePokemon: Pokemon): number {
    const targetStats = this.getStatObject(targetPokemon);
    const candidateStats = this.getStatObject(candidatePokemon);
    
    let complementarity = 0;
    
    // Se um é físico e outro especial, +pontos
    if (targetStats.attack > targetStats.specialAttack && candidateStats.specialAttack > candidateStats.attack) {
      complementarity += 20;
    }
    if (targetStats.specialAttack > targetStats.attack && candidateStats.attack > candidateStats.specialAttack) {
      complementarity += 20;
    }
    
    // Se um é ofensivo e outro defensivo, +pontos
    const targetOffensive = targetStats.attack + targetStats.specialAttack;
    const targetDefensive = targetStats.defense + targetStats.specialDefense;
    const candidateOffensive = candidateStats.attack + candidateStats.specialAttack;
    const candidateDefensive = candidateStats.defense + candidateStats.specialDefense;
    
    if (targetOffensive > targetDefensive && candidateDefensive > candidateOffensive) {
      complementarity += 25;
    }
    if (targetDefensive > targetOffensive && candidateOffensive > candidateDefensive) {
      complementarity += 25;
    }
    
    // Se um é rápido e outro lento mas tanky, +pontos
    if (targetStats.speed > 90 && candidateStats.speed < 50 && candidateStats.hp > 80) {
      complementarity += 15;
    }
    
    return complementarity;
  }

  private calculateDefensiveCoverage(candidatePokemon: Pokemon, teamAnalysis: TeamAnalysis): number {
    const candidateTypes = candidatePokemon.types.map(t => t.type.name);
    let coverage = 0;
    
    // Verificar se cobre fraquezas da equipe
    for (const weakness of teamAnalysis.weaknesses) {
      for (const candidateType of candidateTypes) {
        const resistances = this.getTypeResistances(candidateType);
        if (resistances.includes(weakness)) {
          coverage += 20;
        }
      }
    }
    
    return coverage;
  }

  private calculateDiversity(candidatePokemon: Pokemon, currentTeam: (Pokemon | null)[]): number {
    const teamPokemon = currentTeam.filter(p => p !== null) as Pokemon[];
    
    // Verificar se é diferente dos outros em categoria de stats
    const candidateCategory = this.getStatCategory(candidatePokemon);
    const teamCategories = teamPokemon.map(p => this.getStatCategory(p));
    
    if (!teamCategories.includes(candidateCategory)) {
      return 30;
    }
    
    return 0;
  }

  private getStatCategory(pokemon: Pokemon): string {
    const stats = this.getStatObject(pokemon);
    const totalOffensive = stats.attack + stats.specialAttack;
    const totalDefensive = stats.defense + stats.specialDefense;
    
    if (stats.speed > 100) return 'sweeper';
    if (totalDefensive > totalOffensive + 50) return 'tank';
    if (totalOffensive > totalDefensive + 50) return 'attacker';
    if (stats.hp > 100) return 'wall';
    return 'balanced';
  }

  private generateReasons(
    targetPokemon: Pokemon, 
    candidatePokemon: Pokemon, 
    currentTeam: (Pokemon | null)[],
    teamAnalysis: TeamAnalysis
  ): string[] {
    const reasons: string[] = [];
    const targetTypes = targetPokemon.types.map(t => t.type.name);
    const candidateTypes = candidatePokemon.types.map(t => t.type.name);
    
    // Razões baseadas em tipos
    for (const targetType of targetTypes) {
      const weaknesses = this.getTypeWeaknesses(targetType);
      for (const candidateType of candidateTypes) {
        const resistances = this.getTypeResistances(candidateType);
        const commonWeaknesses = weaknesses.filter(w => resistances.includes(w));
        
        if (commonWeaknesses.length > 0) {
          reasons.push(`Resiste aos tipos que ${targetPokemon.name} é fraco: ${commonWeaknesses.join(', ')}`);
        }
      }
    }
    
    // Razões baseadas em stats
    const targetStats = this.getStatObject(targetPokemon);
    const candidateStats = this.getStatObject(candidatePokemon);
    
    if (targetStats.attack > targetStats.specialAttack && candidateStats.specialAttack > candidateStats.attack) {
      reasons.push('Complementa com ataques especiais fortes');
    }
    
    if (targetStats.speed > 90 && candidateStats.defense + candidateStats.specialDefense > 150) {
      reasons.push('Oferece proteção defensiva para um atacante rápido');
    }
    
    // Razões baseadas na equipe
    if (teamAnalysis.weaknesses.length > 0) {
      const coveredWeaknesses = teamAnalysis.weaknesses.filter(weakness =>
        candidateTypes.some(type => this.getTypeResistances(type).includes(weakness))
      );
      
      if (coveredWeaknesses.length > 0) {
        reasons.push(`Cobre fraquezas da equipe: ${coveredWeaknesses.join(', ')}`);
      }
    }
    
    return reasons.slice(0, 3); // Limitar a 3 razões principais
  }

  private identifySynergyTypes(
    targetPokemon: Pokemon, 
    candidatePokemon: Pokemon, 
    currentTeam: (Pokemon | null)[]
  ): SynergyType[] {
    const synergies: SynergyType[] = [];
    
    // Verificar balanceamento de tipos
    const targetTypes = targetPokemon.types.map(t => t.type.name);
    const candidateTypes = candidatePokemon.types.map(t => t.type.name);
    
    const hasTypeBalance = targetTypes.some(targetType => {
      const weaknesses = this.getTypeWeaknesses(targetType);
      return candidateTypes.some(candidateType => {
        const resistances = this.getTypeResistances(candidateType);
        return weaknesses.some(w => resistances.includes(w));
      });
    });
    
    if (hasTypeBalance) {
      synergies.push('type_balance');
    }
    
    // Verificar complementaridade de stats
    const targetStats = this.getStatObject(targetPokemon);
    const candidateStats = this.getStatObject(candidatePokemon);
    
    const physicalSpecialBalance = 
      (targetStats.attack > targetStats.specialAttack && candidateStats.specialAttack > candidateStats.attack) ||
      (targetStats.specialAttack > targetStats.attack && candidateStats.attack > candidateStats.specialAttack);
    
    if (physicalSpecialBalance) {
      synergies.push('stat_complement');
    }
    
    // Verificar núcleo defensivo
    if (candidateStats.defense + candidateStats.specialDefense > 150) {
      synergies.push('defensive_wall');
    }
    
    // Verificar núcleo ofensivo
    if (candidateStats.attack + candidateStats.specialAttack > 150) {
      synergies.push('offensive_core');
    }
    
    return synergies;
  }

  private analyzeTeam(team: Pokemon[]): TeamAnalysis {
    const typeDistribution: Record<string, number> = {};
    const allTypes = team.flatMap(p => p.types.map(t => t.type.name));
    
    allTypes.forEach(type => {
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;
    });
    
    const weaknesses: string[] = [];
    const strengths: string[] = [];
    
    // Analisar fraquezas comuns
    const commonWeaknesses = this.findCommonWeaknesses(team);
    weaknesses.push(...commonWeaknesses);
    
    // Analisar forças
    const resistances = this.findCommonResistances(team);
    strengths.push(...resistances);
    
    return {
      typeDistribution,
      strengths,
      weaknesses,
      recommendations: this.generateTeamRecommendations(typeDistribution, weaknesses)
    };
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

  private generateTeamRecommendations(
    typeDistribution: Record<string, number>, 
    weaknesses: string[]
  ): string[] {
    const recommendations: string[] = [];
    
    if (weaknesses.length > 0) {
      recommendations.push(`Adicione Pokémon que resistam a: ${weaknesses.join(', ')}`);
    }
    
    const mostCommonType = Object.entries(typeDistribution)
      .sort(([, a], [, b]) => b - a)[0];
    
    if (mostCommonType && mostCommonType[1] > 2) {
      recommendations.push(`Considere diversificar - muitos Pokémon do tipo ${mostCommonType[0]}`);
    }
    
    return recommendations;
  }

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
}

export const mlRecommendationService = new MLRecommendationService();