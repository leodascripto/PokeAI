import { useState, useEffect, useCallback } from 'react';
import { Pokemon } from '../types/pokemon';
import { pokemonApi } from '../services/pokemonApi';

export const usePokemon = () => {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Pokemon[]>([]);

  const loadPokemon = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await pokemonApi.getFirst151Pokemon();
      setPokemon(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchPokemon = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await pokemonApi.searchPokemon(query);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na busca');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getPokemonById = useCallback(async (id: number): Promise<Pokemon | null> => {
    try {
      return await pokemonApi.getPokemonById(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar Pokémon');
      return null;
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setError(null);
  }, []);

  useEffect(() => {
    loadPokemon();
  }, [loadPokemon]);

  return {
    pokemon,
    searchResults,
    loading,
    error,
    searchPokemon,
    getPokemonById,
    clearSearch,
    reloadPokemon: loadPokemon
  };
};

export const usePokemonDetail = (pokemonId: number | null) => {
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
        const data = await pokemonApi.getPokemonById(pokemonId);
        setPokemon(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar detalhes');
      } finally {
        setLoading(false);
      }
    };

    loadPokemonDetail();
  }, [pokemonId]);

  return { pokemon, loading, error };
};