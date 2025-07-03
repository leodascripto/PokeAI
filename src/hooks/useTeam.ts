import { useState, useEffect, useCallback } from 'react';
import { Pokemon } from '../types/pokemon';
import { Team, PokemonRecommendation } from '../types/team';
import { teamManager } from '../services/teamManager';
import { mlRecommendationService } from '../services/mlRecommendation';
import { pokemonApi } from '../services/pokemonApi';

export const useTeam = () => {
  const [team, setTeam] = useState<(Pokemon | null)[]>([]);
  const [savedTeams, setSavedTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTeam = useCallback(async () => {
    setLoading(true);
    try {
      const currentTeam = await teamManager.loadCurrentTeam();
      setTeam(currentTeam);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar equipe');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSavedTeams = useCallback(async () => {
    try {
      const teams = await teamManager.loadTeams();
      setSavedTeams(teams);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar equipes salvas');
    }
  }, []);

  const addPokemonToTeam = useCallback(async (pokemon: Pokemon, slotIndex?: number) => {
    setError(null);
    try {
      await teamManager.addPokemonToTeam(pokemon, slotIndex);
      const updatedTeam = teamManager.getCurrentTeam();
      setTeam(updatedTeam);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar Pokémon');
      return false;
    }
  }, []);

  const removePokemonFromTeam = useCallback(async (slotIndex: number) => {
    setError(null);
    try {
      await teamManager.removePokemonFromTeam(slotIndex);
      const updatedTeam = teamManager.getCurrentTeam();
      setTeam(updatedTeam);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover Pokémon');
      return false;
    }
  }, []);

  const movePokemon = useCallback(async (fromIndex: number, toIndex: number) => {
    setError(null);
    try {
      await teamManager.movePokemon(fromIndex, toIndex);
      const updatedTeam = teamManager.getCurrentTeam();
      setTeam(updatedTeam);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao mover Pokémon');
      return false;
    }
  }, []);

  const clearTeam = useCallback(async () => {
    setError(null);
    try {
      await teamManager.clearTeam();
      const updatedTeam = teamManager.getCurrentTeam();
      setTeam(updatedTeam);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao limpar equipe');
    }
  }, []);

  const saveTeam = useCallback(async (name: string) => {
    setError(null);
    try {
      const teamId = await teamManager.saveTeam(name);
      await loadSavedTeams();
      return teamId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar equipe');
      return null;
    }
  }, [loadSavedTeams]);

  const loadSavedTeam = useCallback(async (teamId: string) => {
    setError(null);
    try {
      await teamManager.loadTeam(teamId);
      const updatedTeam = teamManager.getCurrentTeam();
      setTeam(updatedTeam);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar equipe salva');
      return false;
    }
  }, []);

  const deleteTeam = useCallback(async (teamId: string) => {
    setError(null);
    try {
      await teamManager.deleteTeam(teamId);
      await loadSavedTeams();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir equipe');
      return false;
    }
  }, [loadSavedTeams]);

  const getTeamStats = useCallback(() => {
    return teamManager.getTeamStats();
  }, [team]);

  const isPokemonInTeam = useCallback((pokemonId: number) => {
    return teamManager.isPokemonInTeam(pokemonId);
  }, [team]);

  const isTeamFull = useCallback(() => {
    return teamManager.isTeamFull();
  }, [team]);

  const getEmptySlots = useCallback(() => {
    return teamManager.getEmptySlots();
  }, [team]);

  useEffect(() => {
    loadTeam();
    loadSavedTeams();
  }, [loadTeam, loadSavedTeams]);

  return {
    team,
    savedTeams,
    loading,
    error,
    addPokemonToTeam,
    removePokemonFromTeam,
    movePokemon,
    clearTeam,
    saveTeam,
    loadSavedTeam,
    deleteTeam,
    getTeamStats,
    isPokemonInTeam,
    isTeamFull,
    getEmptySlots,
    reloadTeam: loadTeam
  };
};

export const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState<PokemonRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = useCallback(async (
    targetPokemon: Pokemon,
    currentTeam: (Pokemon | null)[]
  ) => {
    setLoading(true);
    setError(null);

    try {
      const allPokemon = await pokemonApi.getFirst151Pokemon();
      const recommendations = await mlRecommendationService.getRecommendations(
        targetPokemon,
        currentTeam,
        allPokemon
      );
      setRecommendations(recommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar recomendações');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearRecommendations = useCallback(() => {
    setRecommendations([]);
    setError(null);
  }, []);

  return {
    recommendations,
    loading,
    error,
    getRecommendations,
    clearRecommendations
  };
};