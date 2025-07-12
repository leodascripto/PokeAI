// src/hooks/usePokemon.ts - VERSÃO SIMPLIFICADA SEM CORS
import { useState, useEffect, useCallback } from 'react';
import { Pokemon } from '../types/pokemon';
import { pokemonApi } from '../services/pokemonApi';

interface UsePokemonOptions {
  enhance?: boolean;
  batchSize?: number;
  enableProgressTracking?: boolean;
}

interface LoadingProgress {
  current: number;
  total: number;
  percentage: number;
  phase: 'loading' | 'enhancing' | 'complete';
}

export const usePokemon = (options: UsePokemonOptions = {}) => {
  const {
    enhance = true,
    batchSize = 15,
    enableProgressTracking = true
  } = options;

  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Pokemon[]>([]);
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress>({
    current: 0,
    total: 151,
    percentage: 0,
    phase: 'loading'
  });
  const [assetsStats, setAssetsStats] = useState({
    total: 0,
    with3D: 0,
    withAnimated: 0,
    staticOnly: 0
  });

  const updateProgress = useCallback((current: number, total: number, phase: LoadingProgress['phase']) => {
    if (enableProgressTracking) {
      const percentage = Math.round((current / total) * 100);
      setLoadingProgress({
        current,
        total,
        percentage,
        phase
      });
    }
  }, [enableProgressTracking]);

  const loadPokemon = useCallback(async () => {
    setLoading(true);
    setError(null);
    updateProgress(0, 151, 'loading');
    
    try {
      console.log('🚀 Iniciando carregamento dos Pokémon...');
      
      // Simular progresso para melhor UX
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev.current < prev.total - 10) {
            const increment = Math.random() * 5 + 2;
            const newCurrent = Math.min(prev.current + increment, prev.total - 10);
            return {
              ...prev,
              current: newCurrent,
              percentage: Math.round((newCurrent / prev.total) * 100)
            };
          }
          return prev;
        });
      }, 200);

      const data = await pokemonApi.getFirst151Pokemon(enhance);
      
      clearInterval(progressInterval);
      updateProgress(151, 151, enhance ? 'enhancing' : 'complete');
      
      // Simular fase de enhancing se necessário
      if (enhance) {
        setTimeout(() => {
          updateProgress(151, 151, 'complete');
        }, 500);
      }
      
      setPokemon(data);
      
      // Calcular estatísticas de assets
      if (enhance) {
        const stats = pokemonApi.getAssetsStats(data);
        setAssetsStats(stats);
        
        console.log('📊 Estatísticas de Assets:');
        console.log(`- Total: ${stats.total}`);
        console.log(`- Com Animação: ${stats.withAnimated} (${Math.round(stats.withAnimated/stats.total*100)}%)`);
        console.log(`- Apenas Estático: ${stats.staticOnly} (${Math.round(stats.staticOnly/stats.total*100)}%)`);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('❌ Erro ao carregar Pokémon:', err);
      updateProgress(0, 151, 'loading');
    } finally {
      setLoading(false);
    }
  }, [enhance, updateProgress]);

  const searchPokemon = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await pokemonApi.searchPokemon(query, enhance);
      setSearchResults(results);
      
      console.log(`🔍 Busca por "${query}": ${results.length} resultados encontrados`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na busca');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [enhance]);

  const getPokemonById = useCallback(async (id: number): Promise<Pokemon | null> => {
    try {
      return await pokemonApi.getPokemonById(id, enhance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar Pokémon');
      return null;
    }
  }, [enhance]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setError(null);
  }, []);

  const refreshAssets = useCallback(async () => {
    if (pokemon.length === 0) return;
    
    setLoading(true);
    try {
      console.log('🔄 Atualizando cache dos Pokémon...');
      
      // Limpar cache e recarregar
      pokemonApi.clearCache();
      await loadPokemon();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar cache');
    } finally {
      setLoading(false);
    }
  }, [pokemon.length, loadPokemon]);

  const getAssetQualityStats = useCallback(() => {
    if (!enhance || pokemon.length === 0) return null;
    
    const qualityDistribution = pokemon.reduce((acc, p) => {
      const quality = p.assets?.quality || 'low';
      acc[quality] = (acc[quality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      distribution: qualityDistribution,
      averageQuality: pokemon.filter(p => p.assets?.quality === 'high').length / pokemon.length,
      recommendedSettings: {
        preferAnimated: assetsStats.withAnimated > pokemon.length * 0.5,
        preferHighQuality: true, // Sempre preferir alta qualidade
        fallbackToStatic: true // Sempre ter fallback
      }
    };
  }, [enhance, pokemon, assetsStats]);

  // Pré-carregar sprites populares
  const preloadPopularSprites = useCallback(async () => {
    const popularIds = [25, 1, 4, 7, 150, 151, 6, 9, 3]; // Pikachu, starters, Mewtwo, Mew, etc.
    await pokemonApi.preloadEssentialSprites(popularIds);
  }, []);

  useEffect(() => {
    loadPokemon();
    if (enhance) {
      preloadPopularSprites();
    }
  }, [loadPokemon, enhance, preloadPopularSprites]);

  return {
    // Data
    pokemon,
    searchResults,
    assetsStats,
    
    // State
    loading,
    error,
    loadingProgress,
    
    // Actions
    searchPokemon,
    getPokemonById,
    clearSearch,
    reloadPokemon: loadPokemon,
    refreshAssets,
    
    // Utils
    getAssetQualityStats
  };
};

export const usePokemonDetail = (pokemonId: number | null, options: UsePokemonOptions = {}) => {
  const { enhance = true } = options;
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pokemonId) {
      setPokemon(null);
      return;
    }

    const loadPokemonDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await pokemonApi.getPokemonById(pokemonId, enhance);
        setPokemon(data);
        
        if (enhance && data.assets) {
          console.log(`✅ ${data.name} carregado: Animated=${data.assets.hasAnimated}, Quality=${data.assets.quality}`);
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar detalhes');
      } finally {
        setLoading(false);
      }
    };

    loadPokemonDetail();
  }, [pokemonId, enhance]);

  return { pokemon, loading, error };
};

// Hook para estatísticas de performance
export const usePokemonPerformance = () => {
  const [performanceData, setPerformanceData] = useState({
    cacheSize: 0,
    loadTimes: [] as number[],
    averageLoadTime: 0,
    connectivityStatus: 'unknown' as 'good' | 'poor' | 'unknown'
  });

  const updatePerformanceStats = useCallback(() => {
    const cacheSize = pokemonApi.getCacheSize();
    setPerformanceData(prev => ({
      ...prev,
      cacheSize
    }));
  }, []);

  const recordLoadTime = useCallback((duration: number) => {
    setPerformanceData(prev => {
      const newLoadTimes = [...prev.loadTimes, duration].slice(-20); // Keep last 20
      const averageLoadTime = newLoadTimes.reduce((a, b) => a + b, 0) / newLoadTimes.length;
      
      return {
        ...prev,
        loadTimes: newLoadTimes,
        averageLoadTime
      };
    });
  }, []);

  const testConnectivity = useCallback(async () => {
    const startTime = Date.now();
    const isConnected = await pokemonApi.testAPIConnectivity();
    const duration = Date.now() - startTime;
    
    setPerformanceData(prev => ({
      ...prev,
      connectivityStatus: isConnected ? (duration < 2000 ? 'good' : 'poor') : 'poor'
    }));

    recordLoadTime(duration);
  }, [recordLoadTime]);

  const clearCache = useCallback(() => {
    pokemonApi.clearCache();
    updatePerformanceStats();
  }, [updatePerformanceStats]);

  useEffect(() => {
    const interval = setInterval(updatePerformanceStats, 10000);
    testConnectivity(); // Teste inicial
    return () => clearInterval(interval);
  }, [updatePerformanceStats, testConnectivity]);

  return {
    performanceData,
    recordLoadTime,
    testConnectivity,
    clearCache,
    updatePerformanceStats
  };
};