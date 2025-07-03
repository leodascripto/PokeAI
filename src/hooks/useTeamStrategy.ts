// src/hooks/useTeamStrategy.ts
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TeamStrategy, TEAM_STRATEGIES } from '../types/teamStrategy';
import { Pokemon } from '../types/pokemon';
import { 
  enhancedMLRecommendationService, 
  StrategyRecommendationResult 
} from '../services/enhancedMLRecommendation';
import { pokemonApi } from '../services/pokemonApi';

const STRATEGY_STORAGE_KEY = '@team_strategy';

export const useTeamStrategy = () => {
  const [currentStrategy, setCurrentStrategy] = useState<TeamStrategy | null>(null);
  const [strategyResults, setStrategyResults] = useState<StrategyRecommendationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar estratégia salva
  useEffect(() => {
    loadSavedStrategy();
  }, []);

  const loadSavedStrategy = async () => {
    try {
      const savedStrategy = await AsyncStorage.getItem(STRATEGY_STORAGE_KEY);
      if (savedStrategy) {
        const strategy = JSON.parse(savedStrategy);
        setCurrentStrategy(strategy);
      } else {
        // Estratégia padrão
        setCurrentStrategy(TEAM_STRATEGIES.balanced);
      }
    } catch (error) {
      console.error('Erro ao carregar estratégia:', error);
      setCurrentStrategy(TEAM_STRATEGIES.balanced);
    }
  };

  const saveStrategy = async (strategy: TeamStrategy) => {
    try {
      await AsyncStorage.setItem(STRATEGY_STORAGE_KEY, JSON.stringify(strategy));
      setCurrentStrategy(strategy);
    } catch (error) {
      console.error('Erro ao salvar estratégia:', error);
      throw new Error('Falha ao salvar estratégia');
    }
  };

  const getStrategyRecommendations = useCallback(async (
    currentTeam: (Pokemon | null)[]
  ) => {
    if (!currentStrategy) return;

    setLoading(true);
    setError(null);

    try {
      const allPokemon = await pokemonApi.getFirst151Pokemon();
      const results = await enhancedMLRecommendationService.getStrategyRecommendations(
        currentStrategy,
        currentTeam,
        allPokemon
      );
      
      setStrategyResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar recomendações');
      setStrategyResults(null);
    } finally {
      setLoading(false);
    }
  }, [currentStrategy]);

  const resetStrategy = () => {
    setCurrentStrategy(TEAM_STRATEGIES.balanced);
    setStrategyResults(null);
  };

  const clearResults = () => {
    setStrategyResults(null);
    setError(null);
  };

  return {
    currentStrategy,
    strategyResults,
    loading,
    error,
    saveStrategy,
    getStrategyRecommendations,
    resetStrategy,
    clearResults
  };
};

export const useStrategyAnalysis = (
  currentTeam: (Pokemon | null)[],
  strategy: TeamStrategy | null
) => {
  const [analysis, setAnalysis] = useState<{
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    coverage: number;
  } | null>(null);

  useEffect(() => {
    if (!strategy || currentTeam.every(p => p === null)) {
      setAnalysis(null);
      return;
    }

    analyzeTeamStrategy();
  }, [currentTeam, strategy]);

  const analyzeTeamStrategy = async () => {
    if (!strategy) return;

    try {
      const activePokemon = currentTeam.filter(p => p !== null) as Pokemon[];
      
      // Análise básica da equipe com a estratégia atual
      const strengths: string[] = [];
      const weaknesses: string[] = [];
      const recommendations: string[] = [];
      
      // Analisar cobertura de tipos (para não mono-type)
      if (strategy.type !== 'mono_type') {
        const typesCovered = new Set(
          activePokemon.flatMap(p => p.types.map(t => t.type.name))
        );
        
        if (typesCovered.size >= 4) {
          strengths.push('Boa diversidade de tipos');
        } else if (typesCovered.size <= 2) {
          weaknesses.push('Pouca diversidade de tipos');
          recommendations.push('Considere adicionar mais variedade de tipos');
        }
      }

      // Analisar distribuição de stats baseada na estratégia
      if (activePokemon.length > 0) {
        const avgStats = calculateAverageStats(activePokemon);
        const priorities = strategy.preferences.statPriorities;

        // Verificar se as stats estão alinhadas com a estratégia
        Object.entries(priorities).forEach(([stat, priority]) => {
          const statValue = avgStats[stat as keyof typeof avgStats];
          
          if (priority > 1.2 && statValue > 90) {
            strengths.push(`Excelente ${getStatName(stat)} conforme estratégia`);
          } else if (priority > 1.2 && statValue < 70) {
            weaknesses.push(`${getStatName(stat)} baixo para esta estratégia`);
            recommendations.push(`Adicione Pokémon com maior ${getStatName(stat).toLowerCase()}`);
          }
        });
      }

      // Análise específica por estratégia
      switch (strategy.type) {
        case 'mono_type':
          analyzeMonoTypeStrategy(activePokemon, strategy, strengths, weaknesses, recommendations);
          break;
        case 'offensive':
          analyzeOffensiveStrategy(activePokemon, strengths, weaknesses, recommendations);
          break;
        case 'defensive':
          analyzeDefensiveStrategy(activePokemon, strengths, weaknesses, recommendations);
          break;
        case 'speed':
          analyzeSpeedStrategy(activePokemon, strengths, weaknesses, recommendations);
          break;
      }

      // Calcular coverage geral (0-100)
      let coverage = 60; // Base
      coverage += Math.min(strengths.length * 8, 32);
      coverage -= Math.min(weaknesses.length * 6, 30);
      coverage = Math.max(0, Math.min(100, coverage));

      setAnalysis({
        strengths: strengths.slice(0, 4),
        weaknesses: weaknesses.slice(0, 4),
        recommendations: recommendations.slice(0, 3),
        coverage
      });

    } catch (error) {
      console.error('Erro na análise da estratégia:', error);
      setAnalysis(null);
    }
  };

  return analysis;
};

// Funções auxiliares
const calculateAverageStats = (pokemon: Pokemon[]) => {
  const totals = {
    hp: 0,
    attack: 0,
    defense: 0,
    specialAttack: 0,
    specialDefense: 0,
    speed: 0
  };

  pokemon.forEach(p => {
    p.stats.forEach(stat => {
      switch (stat.stat.name) {
        case 'hp':
          totals.hp += stat.base_stat;
          break;
        case 'attack':
          totals.attack += stat.base_stat;
          break;
        case 'defense':
          totals.defense += stat.base_stat;
          break;
        case 'special-attack':
          totals.specialAttack += stat.base_stat;
          break;
        case 'special-defense':
          totals.specialDefense += stat.base_stat;
          break;
        case 'speed':
          totals.speed += stat.base_stat;
          break;
      }
    });
  });

  const count = pokemon.length;
  return {
    hp: Math.round(totals.hp / count),
    attack: Math.round(totals.attack / count),
    defense: Math.round(totals.defense / count),
    specialAttack: Math.round(totals.specialAttack / count),
    specialDefense: Math.round(totals.specialDefense / count),
    speed: Math.round(totals.speed / count)
  };
};

const getStatName = (stat: string): string => {
  const names: Record<string, string> = {
    hp: 'HP',
    attack: 'Ataque',
    defense: 'Defesa',
    specialAttack: 'Ataque Especial',
    specialDefense: 'Defesa Especial',
    speed: 'Velocidade'
  };
  return names[stat] || stat;
};

const analyzeMonoTypeStrategy = (
  pokemon: Pokemon[],
  strategy: TeamStrategy,
  strengths: string[],
  weaknesses: string[],
  recommendations: string[]
) => {
  if (pokemon.length === 0) return;

  const types = new Set(pokemon.flatMap(p => p.types.map(t => t.type.name)));
  
  if (types.size === 1) {
    strengths.push('Perfeita consistência de tipo');
  } else if (types.size <= 2) {
    strengths.push('Boa consistência de tipo');
  } else {
    weaknesses.push('Muitos tipos diferentes para mono-type');
    recommendations.push('Foque em um único tipo principal');
  }

  // Verificar diversidade de roles dentro do mono-type
  const roles = pokemon.map(p => identifyRole(p));
  const uniqueRoles = new Set(roles);
  
  if (uniqueRoles.size >= 3) {
    strengths.push('Boa diversidade de roles');
  } else {
    recommendations.push('Adicione mais variedade de roles (tank, sweeper, support)');
  }
};

const analyzeOffensiveStrategy = (
  pokemon: Pokemon[],
  strengths: string[],
  weaknesses: string[],
  recommendations: string[]
) => {
  if (pokemon.length === 0) return;

  const avgStats = calculateAverageStats(pokemon);
  
  if (avgStats.attack + avgStats.specialAttack > 180) {
    strengths.push('Excelente poder ofensivo');
  }
  
  if (avgStats.speed > 95) {
    strengths.push('Boa velocidade para strikes primeiro');
  } else {
    weaknesses.push('Velocidade insuficiente para estratégia ofensiva');
    recommendations.push('Adicione Pokémon mais rápidos');
  }
  
  if (avgStats.defense + avgStats.specialDefense < 120) {
    weaknesses.push('Defesas muito baixas');
    recommendations.push('Considere pelo menos um tank para proteção');
  }
};

const analyzeDefensiveStrategy = (
  pokemon: Pokemon[],
  strengths: string[],
  weaknesses: string[],
  recommendations: string[]
) => {
  if (pokemon.length === 0) return;

  const avgStats = calculateAverageStats(pokemon);
  
  if (avgStats.hp > 85) {
    strengths.push('Excelente resistência');
  }
  
  if (avgStats.defense + avgStats.specialDefense > 160) {
    strengths.push('Defesas sólidas');
  } else {
    weaknesses.push('Defesas insuficientes para estratégia defensiva');
    recommendations.push('Adicione mais Pokémon com alta defesa');
  }
  
  if (avgStats.attack + avgStats.specialAttack < 100) {
    weaknesses.push('Poder ofensivo muito baixo');
    recommendations.push('Inclua pelo menos um win condition ofensivo');
  }
};

const analyzeSpeedStrategy = (
  pokemon: Pokemon[],
  strengths: string[],
  weaknesses: string[],
  recommendations: string[]
) => {
  if (pokemon.length === 0) return;

  const avgStats = calculateAverageStats(pokemon);
  
  if (avgStats.speed > 105) {
    strengths.push('Velocidade excepcional');
  } else if (avgStats.speed < 95) {
    weaknesses.push('CRÍTICO: Velocidade muito baixa para speed team');
    recommendations.push('URGENTE: Substitua por Pokémon mais rápidos');
  }
  
  const fastPokemon = pokemon.filter(p => {
    const speedStat = p.stats.find(s => s.stat.name === 'speed');
    return speedStat && speedStat.base_stat > 100;
  });
  
  if (fastPokemon.length < pokemon.length * 0.8) {
    weaknesses.push('Nem todos os Pokémon são rápidos o suficiente');
    recommendations.push('Pelo menos 80% da equipe deve ter Speed 100+');
  }
};

const identifyRole = (pokemon: Pokemon): string => {
  const stats = pokemon.stats.reduce((acc, stat) => {
    acc[stat.stat.name] = stat.base_stat;
    return acc;
  }, {} as Record<string, number>);

  const offensive = (stats.attack || 0) + (stats['special-attack'] || 0);
  const defensive = (stats.defense || 0) + (stats['special-defense'] || 0);
  const speed = stats.speed || 0;

  if (speed > 100 && offensive > 120) return 'sweeper';
  if (offensive > 140) return 'wallbreaker';
  if (defensive > 140) return 'tank';
  if ((stats.hp || 0) > 100) return 'support';
  
  return 'balanced';
};