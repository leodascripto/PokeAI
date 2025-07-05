import { useState, useEffect, useCallback } from 'react';
import { ProcessedPokemonLocation } from '../types/pokemonLocation';
import { pokemonLocationApi } from '../services/pokemonLocationApi';

export const usePokemonLocation = (pokemonId: number | null) => {
  const [location, setLocation] = useState<ProcessedPokemonLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLocation = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      // Primeiro tenta buscar dados especiais (starters, lendários, etc.)
      let locationData = pokemonLocationApi.getSpecialLocationInfo(id);
      
      // Se não tem dados especiais, busca na API
      if (!locationData) {
        locationData = await pokemonLocationApi.getPokemonEncounters(id);
      }

      setLocation(locationData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar localização');
      setLocation(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (pokemonId) {
      loadLocation(pokemonId);
    } else {
      setLocation(null);
      setError(null);
    }
  }, [pokemonId, loadLocation]);

  const retry = useCallback(() => {
    if (pokemonId) {
      loadLocation(pokemonId);
    }
  }, [pokemonId, loadLocation]);

  return {
    location,
    loading,
    error,
    retry,
    hasLocation: location !== null,
    isEvolutionOnly: location === null && !loading && !error
  };
};