import axios from 'axios';
import { Pokemon, PokemonListResponse } from '../types/pokemon';

const API_BASE_URL = 'https://pokeapi.co/api/v2';

class PokemonApiService {
  private cache: Map<string, any> = new Map();

  async getPokemonList(limit: number = 151, offset: number = 0): Promise<PokemonListResponse> {
    const cacheKey = `list_${limit}_${offset}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/pokemon`, {
        params: { limit, offset }
      });
      
      this.cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar lista de Pokemon:', error);
      throw new Error('Falha ao carregar lista de Pokemon');
    }
  }

  async getPokemonById(id: number): Promise<Pokemon> {
    const cacheKey = `pokemon_${id}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/pokemon/${id}`);
      this.cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar Pokemon ${id}:`, error);
      throw new Error(`Falha ao carregar Pokemon ${id}`);
    }
  }

  async getPokemonByName(name: string): Promise<Pokemon> {
    const cacheKey = `pokemon_${name}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/pokemon/${name.toLowerCase()}`);
      this.cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar Pokemon ${name}:`, error);
      throw new Error(`Falha ao carregar Pokemon ${name}`);
    }
  }

  async getPokemonSpecies(id: number) {
    const cacheKey = `species_${id}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/pokemon-species/${id}`);
      this.cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar espécie do Pokemon ${id}:`, error);
      return null;
    }
  }

  async getPokemonEncounters(id: number) {
    const cacheKey = `encounters_${id}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/pokemon/${id}/encounters`);
      this.cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar encontros do Pokemon ${id}:`, error);
      return [];
    }
  }

  async getFirst151Pokemon(): Promise<Pokemon[]> {
    const cacheKey = 'first_151';
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const pokemonList = await this.getPokemonList(151, 0);
      const pokemonPromises = pokemonList.results.map((_, index) => 
        this.getPokemonById(index + 1)
      );
      
      const pokemon = await Promise.all(pokemonPromises);
      this.cache.set(cacheKey, pokemon);
      return pokemon;
    } catch (error) {
      console.error('Erro ao buscar os primeiros 151 Pokemon:', error);
      throw new Error('Falha ao carregar os primeiros 151 Pokemon');
    }
  }

  async searchPokemon(query: string): Promise<Pokemon[]> {
    try {
      const allPokemon = await this.getFirst151Pokemon();
      return allPokemon.filter(pokemon => 
        pokemon.name.toLowerCase().includes(query.toLowerCase()) ||
        pokemon.id.toString().includes(query)
      );
    } catch (error) {
      console.error('Erro na busca de Pokemon:', error);
      throw new Error('Falha na busca de Pokemon');
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

export const pokemonApi = new PokemonApiService();