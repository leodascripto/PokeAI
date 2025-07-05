// src/hooks/usePokemonLocation.ts - CORRIGIDO
import { useState, useEffect, useCallback } from 'react';
import { ProcessedPokemonLocation } from '../types/pokemonLocation';
import { pokemonLocationApi } from '../services/pokemonLocationApi';

export const usePokemonLocation = (pokemonId: number | null) => {
  const [location, setLocation] = useState<ProcessedPokemonLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEvolutionOnly, setIsEvolutionOnly] = useState(false);

  const loadLocation = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    setIsEvolutionOnly(false);

    try {
      console.log(`🔍 Buscando localização para Pokémon ${id}...`);
      
      // Primeiro tenta buscar dados especiais
      let locationData = pokemonLocationApi.getSpecialLocationInfo(id);
      
      if (locationData) {
        console.log(`✅ Encontrou dados especiais para Pokémon ${id}`);
        setLocation(locationData);
        setIsEvolutionOnly(false);
      } else {
        console.log(`🌐 Buscando na API para Pokémon ${id}...`);
        
        // Se não tem dados especiais, busca na API
        locationData = await pokemonLocationApi.getPokemonEncounters(id);
        
        if (locationData) {
          console.log(`✅ Encontrou dados da API para Pokémon ${id}`);
          setLocation(locationData);
          setIsEvolutionOnly(false);
        } else {
          console.log(`⚠️ Pokémon ${id} não encontrado na natureza - provavelmente evolução`);
          setLocation(null);
          setIsEvolutionOnly(true);
        }
      }
    } catch (err) {
      console.error(`❌ Erro ao carregar localização para Pokémon ${id}:`, err);
      
      // Tentar dados especiais como fallback
      const specialData = pokemonLocationApi.getSpecialLocationInfo(id);
      if (specialData) {
        console.log(`🔄 Usando dados especiais como fallback para Pokémon ${id}`);
        setLocation(specialData);
        setIsEvolutionOnly(false);
        setError(null);
      } else {
        // Se não conseguiu nem dados especiais, verificar se é evolução
        if (isLikelyEvolution(id)) {
          console.log(`🔄 Pokémon ${id} identificado como evolução`);
          setLocation(null);
          setIsEvolutionOnly(true);
          setError(null);
        } else {
          setError(err instanceof Error ? err.message : 'Erro ao carregar localização');
          setLocation(null);
          setIsEvolutionOnly(false);
        }
      }
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
      setIsEvolutionOnly(false);
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
    isEvolutionOnly
  };
};

// Função auxiliar para identificar se um Pokémon é provavelmente uma evolução
function isLikelyEvolution(pokemonId: number): boolean {
  // Lista de Pokémon que são evoluções conhecidas (primeira geração)
  const evolutions = [
    2, 3, // Ivysaur, Venusaur
    5, 6, // Charmeleon, Charizard
    8, 9, // Wartortle, Blastoise
    11, 12, // Metapod, Butterfree
    14, 15, // Kakuna, Beedrill
    17, 18, // Pidgeotto, Pidgeot
    20, // Raticate
    22, // Fearow
    24, // Arbok
    26, // Raichu
    28, // Sandslash
    30, 31, // Nidorina, Nidoqueen
    33, 34, // Nidorino, Nidoking
    36, // Clefable
    38, // Ninetales
    40, // Wigglytuff
    42, // Golbat
    44, 45, // Gloom, Vileplume
    47, // Parasect
    49, // Venomoth
    51, // Dugtrio
    53, // Persian
    55, // Golduck
    57, // Primeape
    59, // Arcanine
    61, 62, // Poliwhirl, Poliwrath
    64, 65, // Kadabra, Alakazam
    67, 68, // Machoke, Machamp
    70, 71, // Weepinbell, Victreebel
    73, // Tentacruel
    75, 76, // Graveler, Golem
    78, // Rapidash
    80, // Slowbro
    82, // Magnezone
    85, // Dodrio
    87, // Dewgong
    89, // Muk
    91, // Cloyster
    93, 94, // Haunter, Gengar
    97, // Hypno
    99, // Kingler
    101, // Electrode
    103, // Exeggutor
    105, // Marowak
    110, // Weezing
    112, // Rhydon
    114, // Tangela
    117, // Seadra
    119, // Seaking
    121, // Starmie
    124, // Jynx
    125, // Electabuzz
    126, // Magmar
    130, // Gyarados
    134, 135, 136, // Vaporeon, Jolteon, Flareon
    139, // Omastar
    141, // Kabutops
    143, // Snorlax
    148, 149 // Dragonair, Dragonite
  ];
  
  return evolutions.includes(pokemonId);
}