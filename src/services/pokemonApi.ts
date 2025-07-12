// src/services/pokemonApi.ts - VERSÃO OTIMIZADA PARA DISPOSITIVOS FÍSICOS
import axios from 'axios';
import { Pokemon, PokemonListResponse } from '../types/pokemon';
import { pokemon3DService } from './pokemon3DService';

const API_BASE_URL = 'https://pokeapi.co/api/v2';

class PokemonApiService {
  private cache: Map<string, any> = new Map();
  private enhancementMode: 'full' | 'conservative' | 'minimal' = 'conservative';

  async getPokemonList(limit: number = 151, offset: number = 0): Promise<PokemonListResponse> {
    const cacheKey = `list_${limit}_${offset}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/pokemon`, {
        params: { limit, offset },
        timeout: 10000 // 10 segundos
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
      const response = await axios.get(`${API_BASE_URL}/pokemon/${id}`, {
        timeout: 8000 // 8 segundos para dados individuais
      });
      let pokemon: Pokemon = response.data;

      // Enriquecer com assets baseado no modo de enhancement
      if (enhance) {
        pokemon = await this.enhancePokemonAssetsIntelligent(pokemon);
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
      const response = await axios.get(`${API_BASE_URL}/pokemon/${name.toLowerCase()}`, {
        timeout: 8000
      });
      let pokemon: Pokemon = response.data;

      if (enhance) {
        pokemon = await this.enhancePokemonAssetsIntelligent(pokemon);
      }

      this.cache.set(cacheKey, pokemon);
      return pokemon;
    } catch (error) {
      console.error(`Erro ao buscar Pokemon ${name}:`, error);
      throw new Error(`Falha ao carregar Pokemon ${name}`);
    }
  }

  // Enhancement inteligente baseado no ambiente
  private async enhancePokemonAssetsIntelligent(pokemon: Pokemon): Promise<Pokemon> {
    try {
      console.log(`🔧 Enriquecendo ${pokemon.name} (modo: ${this.enhancementMode})`);

      // Obter informações de disponibilidade
      const availability = await pokemon3DService.checkAssetAvailability(pokemon.id, pokemon.name);
      const connectivityStatus = pokemon3DService.getConnectivityStatus();

      // URLs garantidas
      const guaranteedUrls = pokemon3DService.getGuaranteedSpriteUrls(pokemon.id);

      // Construir sprites enriquecidos baseado na disponibilidade
      const enhancedSprites = {
        ...pokemon.sprites,
        enhanced: {
          high_quality: guaranteedUrls.homeSprite,
          official_art: guaranteedUrls.officialArt,
          front_default: guaranteedUrls.frontDefault,
          dream_world: guaranteedUrls.dreamWorld
        }
      };

      // Adicionar sprites animados apenas se disponível e recomendado
      if (availability.hasAnimated && guaranteedUrls.animated) {
        enhancedSprites.animated = {
          front_default: guaranteedUrls.animated,
          back_default: undefined,
          front_shiny: guaranteedUrls.animated
        };
      }

      // Determinar qualidade baseada na conectividade
      let quality: 'high' | 'medium' | 'low' = 'low';

      if (connectivityStatus) {
        if (connectivityStatus.githubRaw && connectivityStatus.networkQuality === 'good') {
          quality = 'high';
        } else if (connectivityStatus.githubRaw || connectivityStatus.pokemonApiCDN) {
          quality = 'medium';
        }
      }

      // Metadados de assets
      const assets = {
        has3D: false, // Desabilitado até resolver questões de compatibilidade
        hasAnimated: availability.hasAnimated,
        quality,
        preferredDisplay: availability.recommendedMode
      };

      const enhancedPokemon: Pokemon = {
        ...pokemon,
        sprites: enhancedSprites,
        assets
      };

      console.log(`✅ ${pokemon.name} enriquecido: ${quality} quality, animated: ${availability.hasAnimated}`);
      return enhancedPokemon;

    } catch (error) {
      console.warn(`⚠️ Erro ao enriquecer ${pokemon.name}, usando dados básicos:`, error);

      // Fallback seguro
      return {
        ...pokemon,
        assets: {
          has3D: false,
          hasAnimated: false,
          quality: 'low',
          preferredDisplay: 'static'
        }
      };
    }
  }

  async getFirst151Pokemon(enhance: boolean = true): Promise<Pokemon[]> {
    const cacheKey = `first_151_enhanced_${enhance}_mode_${this.enhancementMode}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      console.log(`🚀 Carregando primeiros 151 Pokémon (modo: ${this.enhancementMode})...`);

      // Detectar ambiente e ajustar estratégia
      await this.optimizeForEnvironment();

      const pokemonList = await this.getPokemonList(151, 0);

      // Ajustar tamanho do lote baseado no ambiente
      const batchSize = this.getBatchSizeForEnvironment();
      const pokemon: Pokemon[] = [];

      for (let i = 0; i < pokemonList.results.length; i += batchSize) {
        const batch = pokemonList.results.slice(i, i + batchSize);
        const batchPromises = batch.map((_, index) =>
          this.getPokemonById(i + index + 1, enhance)
        );

        try {
          const batchResults = await Promise.allSettled(batchPromises);

          // Processar resultados, incluindo falhas
          batchResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              pokemon.push(result.value);
            } else {
              console.warn(`❌ Falha ao carregar Pokémon ${i + index + 1}:`, result.reason);
            }
          });

          console.log(`📦 Lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(pokemonList.results.length / batchSize)} processado (${pokemon.length}/${pokemonList.results.length})`);

          // Pequena pausa entre lotes para evitar sobrecarga
          if (i + batchSize < pokemonList.results.length) {
            await this.delay(500); // 500ms entre lotes
          }

        } catch (batchError) {
          console.warn(`⚠️ Erro no lote ${Math.floor(i / batchSize) + 1}:`, batchError);
        }
      }

      console.log(`✅ ${pokemon.length}/${pokemonList.results.length} Pokémon carregados com sucesso!`);

      // Só armazenar no cache se conseguiu carregar a maioria
      if (pokemon.length > pokemonList.results.length * 0.8) {
        this.cache.set(cacheKey, pokemon);
      }

      return pokemon;
    } catch (error) {
      console.error('❌ Erro ao buscar os primeiros 151 Pokemon:', error);
      throw new Error('Falha ao carregar os primeiros 151 Pokemon');
    }
  }

  // Otimizar configurações baseado no ambiente
  private async optimizeForEnvironment(): Promise<void> {
    try {
      await pokemon3DService.refreshConnectivity();
      const status = pokemon3DService.getConnectivityStatus();

      if (!status) {
        this.enhancementMode = 'minimal';
        return;
      }

      if (status.isEmulator && status.networkQuality === 'good') {
        this.enhancementMode = 'full';
      } else if (status.networkQuality === 'good' && (status.githubRaw || status.pokemonApiCDN)) {
        this.enhancementMode = 'conservative';
      } else {
        this.enhancementMode = 'minimal';
      }

      console.log(`⚙️ Modo de enhancement: ${this.enhancementMode}`);
      console.log(`📱 Ambiente: ${status.isEmulator ? 'Emulador' : 'Dispositivo físico'}`);
      console.log(`🌐 Qualidade da rede: ${status.networkQuality}`);

    } catch (error) {
      console.warn('⚠️ Erro ao otimizar para ambiente, usando modo minimal:', error);
      this.enhancementMode = 'minimal';
    }
  }

  // Tamanho do lote baseado no ambiente
  private getBatchSizeForEnvironment(): number {
    switch (this.enhancementMode) {
      case 'full': return 20; // Emulador com boa conexão
      case 'conservative': return 12; // Dispositivo com conexão ok
      case 'minimal': return 8; // Conexão ruim ou problemas
      default: return 10;
    }
  }

  // Utilitário para delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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

  // Método otimizado para obter a melhor URL de sprite
  getBestSpriteUrl(pokemon: Pokemon, preference?: 'animated' | 'high_quality' | 'static'): string {
    try {
      if (pokemon.assets) {
        let rawPreference: 'animated' | 'high_quality' | 'static' | '3d' | undefined =
          preference || pokemon.assets.preferredDisplay || 'static';

        if (rawPreference === '3d') {
          rawPreference = 'high_quality';
        }

        const actualPreference = rawPreference as 'animated' | 'high_quality' | 'static';
        return pokemon3DService.getBestSpriteUrl(pokemon.id, pokemon.name, actualPreference);
      }

      // Fallback para sprites originais da API
      if (preference === 'animated' && pokemon.sprites.animated?.front_default) {
        return pokemon.sprites.animated.front_default;
      }

      // Corrigir o tipo de 'enhanced' ou usar fallback com any
      if (
        preference === 'high_quality' &&
        (pokemon.sprites as any).enhanced?.high_quality
      ) {
        return (pokemon.sprites as any).enhanced.high_quality;
      }


      // Último recurso - official artwork ou sprite padrão
      return pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;

    } catch (error) {
      console.warn(`Erro ao obter sprite URL para ${pokemon.name}:`, error);
      return pokemon.sprites.front_default;
    }
  }

  // Estatísticas de assets melhoradas
  getAssetsStats(pokemonList: Pokemon[]): {
    total: number;
    with3D: number;
    withAnimated: number;
    staticOnly: number;
    highQuality: number;
    byQuality: Record<string, number>;
    environmentInfo: {
      enhancementMode: string;
      connectivity: any;
    };
  } {
    const stats = {
      total: pokemonList.length,
      with3D: 0,
      withAnimated: 0,
      staticOnly: 0,
      highQuality: 0,
      byQuality: { high: 0, medium: 0, low: 0 },
      environmentInfo: {
        enhancementMode: this.enhancementMode,
        connectivity: pokemon3DService.getConnectivityStatus()
      }
    };

    pokemonList.forEach(pokemon => {
      if (pokemon.assets) {
        if (pokemon.assets.has3D) stats.with3D++;
        if (pokemon.assets.hasAnimated) stats.withAnimated++;
        if (pokemon.assets.quality === 'high') stats.highQuality++;

        stats.byQuality[pokemon.assets.quality]++;

        if (!pokemon.assets.hasAnimated && !pokemon.assets.has3D) {
          stats.staticOnly++;
        }
      } else {
        stats.staticOnly++;
        stats.byQuality.low++;
      }
    });

    return stats;
  }

  // Método para forçar refresh dos assets
  async refreshAssets(): Promise<void> {
    console.log('🔄 Iniciando refresh de assets...');

    try {
      // Limpar caches
      this.clearCache();
      await pokemon3DService.refreshConnectivity();

      // Reotimizar para ambiente
      await this.optimizeForEnvironment();

      console.log('✅ Assets refreshed');
    } catch (error) {
      console.error('❌ Erro no refresh de assets:', error);
      throw new Error('Falha ao atualizar assets');
    }
  }

  // Diagnóstico do ambiente
  async getDiagnosticInfo(): Promise<{
    environment: string;
    enhancementMode: string;
    connectivity: any;
    cacheSize: number;
    recommendedSettings: {
      preferredDisplay: 'animated' | 'static';
      enableHighQuality: boolean;
      batchSize: number;
    };
  }> {
    await this.optimizeForEnvironment();
    const connectivity = pokemon3DService.getConnectivityStatus();

    const recommendedSettings = {
      preferredDisplay: (connectivity?.networkQuality === 'good' && !connectivity?.isEmulator) ? 'animated' : 'static' as 'animated' | 'static',
      enableHighQuality: connectivity?.githubRaw || false,
      batchSize: this.getBatchSizeForEnvironment()
    };

    return {
      environment: connectivity?.isEmulator ? 'Emulador' : 'Dispositivo físico',
      enhancementMode: this.enhancementMode,
      connectivity,
      cacheSize: this.getCacheSize(),
      recommendedSettings
    };
  }

  clearCache(): void {
    this.cache.clear();
    pokemon3DService.clearCache();
    console.log('🧹 Cache completo limpo');
  }

  getCacheSize(): number {
    return this.cache.size + pokemon3DService.getCacheSize();
  }

  // Método para testar conectividade sem CORS
  async testAPIConnectivity(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE_URL}/pokemon/1`, {
        timeout: 5000,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      return response.status === 200;
    } catch (error) {
      console.error('PokeAPI não acessível:', error);
      return false;
    }
  }

  // Pré-carregar sprites essenciais com retry
  async preloadEssentialSprites(pokemonIds: number[]): Promise<void> {
    console.log('📷 Pré-carregando sprites essenciais...');

    const essentialIds = pokemonIds.slice(0, 5); // Apenas os 5 primeiros para não sobrecarregar
    const preloadPromises = essentialIds.map(async (id) => {
      try {
        const pokemon = await this.getPokemonById(id, true);
        const spriteUrl = this.getBestSpriteUrl(pokemon, 'static');

        // Testar se a URL funciona
        await axios.head(spriteUrl, { timeout: 3000 });
        console.log(`✅ Sprite ${id} pré-carregado: ${spriteUrl}`);
      } catch (error) {
        console.warn(`⚠️ Erro ao pré-carregar sprite ${id}:`, error);
      }
    });

    await Promise.allSettled(preloadPromises);
    console.log('📷 Pré-carregamento concluído');
  }

  // Configurar modo de enhancement manualmente
  setEnhancementMode(mode: 'full' | 'conservative' | 'minimal'): void {
    this.enhancementMode = mode;
    console.log(`⚙️ Modo de enhancement alterado para: ${mode}`);
  }

  getEnhancementMode(): string {
    return this.enhancementMode;
  }
}

export const pokemonApi = new PokemonApiService();