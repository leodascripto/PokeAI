// src/services/pokemonApi.ts - VERSÃO SIMPLIFICADA SEM CORS
import axios from 'axios';
import { Pokemon, PokemonListResponse } from '../types/pokemon';
import { pokemon3DService } from './pokemon3DService';

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

  async getPokemonById(id: number, enhance: boolean = true): Promise<Pokemon> {
    const cacheKey = `pokemon_${id}_enhanced_${enhance}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/pokemon/${id}`);
      let pokemon: Pokemon = response.data;

      // Enriquecer com informações de assets (sem verificações HTTP)
      if (enhance) {
        pokemon = this.enhancePokemonAssets(pokemon);
      }

      this.cache.set(cacheKey, pokemon);
      return pokemon;
    } catch (error) {
      console.error(`Erro ao buscar Pokemon ${id}:`, error);
      throw new Error(`Falha ao carregar Pokemon ${id}`);
    }
  }

  async getPokemonByName(name: string, enhance: boolean = true): Promise<Pokemon> {
    const cacheKey = `pokemon_${name}_enhanced_${enhance}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/pokemon/${name.toLowerCase()}`);
      let pokemon: Pokemon = response.data;

      if (enhance) {
        pokemon = this.enhancePokemonAssets(pokemon);
      }

      this.cache.set(cacheKey, pokemon);
      return pokemon;
    } catch (error) {
      console.error(`Erro ao buscar Pokemon ${name}:`, error);
      throw new Error(`Falha ao carregar Pokemon ${name}`);
    }
  }

  // Método que enriquece Pokemon com assets SEM fazer verificações HTTP (evita CORS)
  private enhancePokemonAssets(pokemon: Pokemon): Pokemon {
    try {
      const urls = pokemon3DService.getGuaranteedSpriteUrls(pokemon.id);
      
      // Determinar qualidade baseado na geração (sem verificações HTTP)
      const isGen1 = pokemon.id >= 1 && pokemon.id <= 151;
      const hasAnimated = isGen1; // Gen 1 tem sprites animados disponíveis
      const hasHighQuality = true; // Sempre temos sprites de alta qualidade
      
      // Enriquecer sprites existentes
      const enhancedSprites = {
        ...pokemon.sprites,
        animated: {
          front_default: hasAnimated ? urls.animated : undefined,
          back_default: undefined,
          front_shiny: hasAnimated ? urls.animated : undefined
        },
        enhanced: {
          high_quality: urls.homeSprite,
          official_art: urls.officialArt,
          front_default: urls.frontDefault
        }
      };

      // Determinar preferência de display
      let preferredDisplay: 'animated' | 'high_quality' | 'static' = 'high_quality';
      if (hasAnimated) {
        preferredDisplay = 'animated';
      }

      // Retornar Pokemon enriquecido
      const enhancedPokemon: Pokemon = {
        ...pokemon,
        sprites: enhancedSprites,
        assets: {
          has3D: false, // Desabilitado por questões de CORS
          hasAnimated: hasAnimated,
          quality: hasHighQuality ? 'high' : hasAnimated ? 'medium' : 'low',
          preferredDisplay
        }
      };

      return enhancedPokemon;
    } catch (error) {
      console.error(`Erro ao enriquecer Pokemon ${pokemon.name}:`, error);
      return pokemon; // Retornar Pokemon original se houver erro
    }
  }

  async getFirst151Pokemon(enhance: boolean = true): Promise<Pokemon[]> {
    const cacheKey = `first_151_enhanced_${enhance}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      console.log('🚀 Carregando primeiros 151 Pokémon...');
      
      const pokemonList = await this.getPokemonList(151, 0);
      
      // Carregar em lotes menores para melhor performance
      const batchSize = 15;
      const pokemon: Pokemon[] = [];
      
      for (let i = 0; i < pokemonList.results.length; i += batchSize) {
        const batch = pokemonList.results.slice(i, i + batchSize);
        const batchPromises = batch.map((_, index) => 
          this.getPokemonById(i + index + 1, enhance)
        );
        
        try {
          const batchResults = await Promise.all(batchPromises);
          pokemon.push(...batchResults);
          
          // Log do progresso
          console.log(`📦 Lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(pokemonList.results.length/batchSize)} carregado (${pokemon.length}/${pokemonList.results.length})`);
        } catch (batchError) {
          console.warn(`Erro no lote ${Math.floor(i/batchSize) + 1}:`, batchError);
          // Continuar com próximo lote mesmo se houver erro
        }
      }
      
      console.log(`✅ ${pokemon.length} Pokémon carregados!`);
      
      this.cache.set(cacheKey, pokemon);
      return pokemon;
    } catch (error) {
      console.error('Erro ao buscar os primeiros 151 Pokemon:', error);
      throw new Error('Falha ao carregar os primeiros 151 Pokemon');
    }
  }

  async searchPokemon(query: string, enhance: boolean = true): Promise<Pokemon[]> {
    try {
      const allPokemon = await this.getFirst151Pokemon(enhance);
      return allPokemon.filter(pokemon => 
        pokemon.name.toLowerCase().includes(query.toLowerCase()) ||
        pokemon.id.toString().includes(query)
      );
    } catch (error) {
      console.error('Erro na busca de Pokemon:', error);
      throw new Error('Falha na busca de Pokemon');
    }
  }

  // Método para obter a melhor URL de sprite
  getBestSpriteUrl(pokemon: Pokemon, preference?: 'animated' | 'high_quality' | 'static'): string {
    const actualPreference = preference || pokemon.assets?.preferredDisplay || 'high_quality';
    
    // Usar URLs garantidas do serviço 3D
    const urls = pokemon3DService.getGuaranteedSpriteUrls(pokemon.id);
    
    switch (actualPreference) {
      case 'animated':
        return urls.animated || urls.homeSprite;
      
      case 'high_quality':
        return urls.homeSprite;
      
      case 'static':
      default:
        return urls.officialArt || pokemon.sprites.other['official-artwork'].front_default;
    }
  }

  // Estatísticas de assets carregados (baseado em lógica, não verificações HTTP)
  getAssetsStats(pokemonList: Pokemon[]): {
    total: number;
    with3D: number;
    withAnimated: number;
    staticOnly: number;
  } {
    const gen1Pokemon = pokemonList.filter(p => p.id >= 1 && p.id <= 151);
    
    return {
      total: pokemonList.length,
      with3D: 0, // Desabilitado por questões de CORS
      withAnimated: gen1Pokemon.length, // Gen 1 tem sprites animados
      staticOnly: pokemonList.length - gen1Pokemon.length
    };
  }

  clearCache(): void {
    this.cache.clear();
    pokemon3DService.clearCache();
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  // Método para testar conectividade (sem CORS)
  async testAPIConnectivity(): Promise<boolean> {
    try {
      await axios.get(`${API_BASE_URL}/pokemon/1`, { timeout: 5000 });
      return true;
    } catch (error) {
      console.error('PokeAPI não acessível:', error);
      return false;
    }
  }

  // Pré-carregar sprites essenciais (usando URLs que funcionam)
  async preloadEssentialSprites(pokemonIds: number[]): Promise<void> {
    const preloadPromises = pokemonIds.slice(0, 10).map(async (id) => {
      try {
        const urls = pokemon3DService.getGuaranteedSpriteUrls(id);
        // Apenas marcar como carregado, sem verificar HTTP
        console.log(`📷 Sprite ${id} preparado: ${urls.officialArt}`);
      } catch (error) {
        console.warn(`Erro ao preparar sprite ${id}:`, error);
      }
    });

    await Promise.allSettled(preloadPromises);
    console.log('✅ Sprites essenciais preparados');
  }
}

export const pokemonApi = new PokemonApiService();