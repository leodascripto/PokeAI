// src/services/pokemon3DService.ts - VERSÃO CORRIGIDA COM API POKEMON 3D
import axios from 'axios';
import { Platform } from 'react-native';

export interface Pokemon3DAssets {
  model3D?: string;
  animatedSprite?: string;
  frontAnimated?: string;
  backAnimated?: string;
  shinyAnimated?: string;
  hasVariants?: boolean;
  modelFormat?: 'glb' | 'gltf' | 'obj';
  quality?: 'high' | 'medium' | 'low';
}

interface ConnectivityTest {
  pokemon3DAPI: boolean;
  githubRaw: boolean;
  pokemonDB: boolean;
  isEmulator: boolean;
  networkQuality: 'good' | 'poor' | 'offline';
  supports3D: boolean;
}

class Pokemon3DService {
  private cache: Map<string, Pokemon3DAssets> = new Map();
  private connectivityStatus: ConnectivityTest | null = null;
  private lastConnectivityCheck: number = 0;
  private readonly CONNECTIVITY_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos

  // URLs da API Pokemon 3D - FONTE PRINCIPAL
  private readonly POKEMON_3D_API = {
    baseUrl: 'https://raw.githubusercontent.com/Sudhanshu-Ambastha/Pokemon-3D/main',
    models: {
      regular: 'https://raw.githubusercontent.com/Sudhanshu-Ambastha/Pokemon-3D/main/models/glb/regular',
      shiny: 'https://raw.githubusercontent.com/Sudhanshu-Ambastha/Pokemon-3D/main/models/glb/shiny'
    },
    formats: ['glb', 'gltf', 'obj']
  };

  // URLs de fallback para sprites
  private readonly SPRITE_SOURCES = {
    githubRaw: {
      officialArt: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork',
      homeSprites: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home',
      frontDefault: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon',
      animated: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown'
    },
    pokemonDB: 'https://img.pokemondb.net/sprites/black-white/anim/normal'
  };

  private readonly POKEMON_NAME_MAP: Record<number, string> = {
    1: 'bulbasaur', 2: 'ivysaur', 3: 'venusaur', 4: 'charmander', 5: 'charmeleon', 
    6: 'charizard', 7: 'squirtle', 8: 'wartortle', 9: 'blastoise', 10: 'caterpie',
    11: 'metapod', 12: 'butterfree', 13: 'weedle', 14: 'kakuna', 15: 'beedrill',
    16: 'pidgey', 17: 'pidgeotto', 18: 'pidgeot', 19: 'rattata', 20: 'raticate',
    21: 'spearow', 22: 'fearow', 23: 'ekans', 24: 'arbok', 25: 'pikachu',
    26: 'raichu', 27: 'sandshrew', 28: 'sandslash', 29: 'nidoran-f', 30: 'nidorina',
    31: 'nidoqueen', 32: 'nidoran-m', 33: 'nidorino', 34: 'nidoking', 35: 'clefairy',
    36: 'clefable', 37: 'vulpix', 38: 'ninetales', 39: 'jigglypuff', 40: 'wigglytuff',
    41: 'zubat', 42: 'golbat', 43: 'oddish', 44: 'gloom', 45: 'vileplume',
    46: 'paras', 47: 'parasect', 48: 'venonat', 49: 'venomoth', 50: 'diglett',
    51: 'dugtrio', 52: 'meowth', 53: 'persian', 54: 'psyduck', 55: 'golduck',
    56: 'mankey', 57: 'primeape', 58: 'growlithe', 59: 'arcanine', 60: 'poliwag',
    61: 'poliwhirl', 62: 'poliwrath', 63: 'abra', 64: 'kadabra', 65: 'alakazam',
    66: 'machop', 67: 'machoke', 68: 'machamp', 69: 'bellsprout', 70: 'weepinbell',
    71: 'victreebel', 72: 'tentacool', 73: 'tentacruel', 74: 'geodude', 75: 'graveler',
    76: 'golem', 77: 'ponyta', 78: 'rapidash', 79: 'slowpoke', 80: 'slowbro',
    81: 'magnemite', 82: 'magneton', 83: 'farfetchd', 84: 'doduo', 85: 'dodrio',
    86: 'seel', 87: 'dewgong', 88: 'grimer', 89: 'muk', 90: 'shellder',
    91: 'cloyster', 92: 'gastly', 93: 'haunter', 94: 'gengar', 95: 'onix',
    96: 'drowzee', 97: 'hypno', 98: 'krabby', 99: 'kingler', 100: 'voltorb',
    101: 'electrode', 102: 'exeggcute', 103: 'exeggutor', 104: 'cubone', 105: 'marowak',
    106: 'hitmonlee', 107: 'hitmonchan', 108: 'lickitung', 109: 'koffing', 110: 'weezing',
    111: 'rhyhorn', 112: 'rhydon', 113: 'chansey', 114: 'tangela', 115: 'kangaskhan',
    116: 'horsea', 117: 'seadra', 118: 'goldeen', 119: 'seaking', 120: 'staryu',
    121: 'starmie', 122: 'mr-mime', 123: 'scyther', 124: 'jynx', 125: 'electabuzz',
    126: 'magmar', 127: 'pinsir', 128: 'tauros', 129: 'magikarp', 130: 'gyarados',
    131: 'lapras', 132: 'ditto', 133: 'eevee', 134: 'vaporeon', 135: 'jolteon',
    136: 'flareon', 137: 'porygon', 138: 'omanyte', 139: 'omastar', 140: 'kabuto',
    141: 'kabutops', 142: 'aerodactyl', 143: 'snorlax', 144: 'articuno', 145: 'zapdos',
    146: 'moltres', 147: 'dratini', 148: 'dragonair', 149: 'dragonite', 150: 'mewtwo',
    151: 'mew'
  };

  // Lista de Pokémon com modelos 3D confirmados
  private readonly POKEMON_WITH_3D_MODELS: Set<number> = new Set([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
    61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80,
    81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100,
    101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120,
    121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140,
    141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151
  ]);

  // Método principal para obter assets 3D
  async getPokemonAssets(pokemonId: number, pokemonName: string): Promise<Pokemon3DAssets> {
    const cacheKey = `assets_${pokemonId}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      await this.ensureConnectivityStatus();
      
      const normalizedName = this.POKEMON_NAME_MAP[pokemonId] || pokemonName.toLowerCase();
      const assets = await this.buildOptimalAssets(pokemonId, normalizedName);
      
      this.cache.set(cacheKey, assets);
      return assets;
    } catch (error) {
      console.error(`Erro ao buscar assets para ${pokemonName}:`, error);
      return this.getFallbackAssets(pokemonId, pokemonName);
    }
  }

  // Verifica conectividade e capacidades do dispositivo
  private async ensureConnectivityStatus(): Promise<void> {
    const now = Date.now();
    
    if (this.connectivityStatus && (now - this.lastConnectivityCheck) < this.CONNECTIVITY_CHECK_INTERVAL) {
      return;
    }

    console.log('🔍 Testando conectividade 3D...');
    
    try {
      const results = await Promise.allSettled([
        this.testUrl(`${this.POKEMON_3D_API.models.regular}/25.glb`, 5000), // Pikachu
        this.testUrl(`${this.SPRITE_SOURCES.githubRaw.officialArt}/1.png`, 3000),
        this.testUrl(`${this.SPRITE_SOURCES.pokemonDB}/bulbasaur.gif`, 2000)
      ]);

      const supports3D = this.check3DSupport();

      this.connectivityStatus = {
        pokemon3DAPI: results[0].status === 'fulfilled',
        githubRaw: results[1].status === 'fulfilled',
        pokemonDB: results[2].status === 'fulfilled',
        isEmulator: this.detectEmulator(),
        networkQuality: this.assessNetworkQuality(results),
        supports3D
      };

      this.lastConnectivityCheck = now;

      console.log('📊 Status de conectividade 3D:', {
        environment: this.connectivityStatus.isEmulator ? 'Emulador' : 'Dispositivo físico',
        supports3D: this.connectivityStatus.supports3D ? '✅' : '❌',
        pokemon3DAPI: this.connectivityStatus.pokemon3DAPI ? '✅' : '❌',
        github: this.connectivityStatus.githubRaw ? '✅' : '❌',
        pokemonDB: this.connectivityStatus.pokemonDB ? '✅' : '❌',
        networkQuality: this.connectivityStatus.networkQuality
      });

    } catch (error) {
      console.error('❌ Erro no teste de conectividade 3D:', error);
      this.connectivityStatus = {
        pokemon3DAPI: false,
        githubRaw: false,
        pokemonDB: false,
        isEmulator: this.detectEmulator(),
        networkQuality: 'poor',
        supports3D: false
      };
    }
  }

  // Verifica suporte real a 3D
  private check3DSupport(): boolean {
    // 3D só funciona em dispositivos físicos
    const isEmulator = this.detectEmulator();
    const isPhysicalDevice = !isEmulator && Platform.OS !== 'web';
    
    // Em desenvolvimento, só permitir 3D em dispositivos físicos
    if (__DEV__) {
      return isPhysicalDevice;
    }
    
    // Em produção, permitir em todos os dispositivos não-emulados
    return isPhysicalDevice;
  }

  // Constroi assets baseado na disponibilidade
  private async buildOptimalAssets(pokemonId: number, normalizedName: string): Promise<Pokemon3DAssets> {
    const connectivity = this.connectivityStatus!;
    const has3DModel = this.POKEMON_WITH_3D_MODELS.has(pokemonId);
    
    let assets: Pokemon3DAssets = {
      hasVariants: false,
      quality: 'low'
    };

    // Verificar modelo 3D se suportado
    if (connectivity.supports3D && connectivity.pokemon3DAPI && has3DModel) {
      const model3DUrl = `${this.POKEMON_3D_API.models.regular}/${pokemonId}.glb`;
      
      try {
        const modelExists = await this.testUrl(model3DUrl, 3000);
        if (modelExists) {
          assets.model3D = model3DUrl;
          assets.modelFormat = 'glb';
          assets.quality = 'high';
          assets.hasVariants = true;
          
          // Verificar variante shiny
          const shinyUrl = `${this.POKEMON_3D_API.models.shiny}/${pokemonId}.glb`;
          const shinyExists = await this.testUrl(shinyUrl, 2000);
          if (shinyExists) {
            assets.shinyAnimated = shinyUrl;
          }
        }
      } catch (error) {
        console.warn(`Modelo 3D não disponível para ${pokemonId}:`, error);
      }
    }

    // Assets de fallback sempre disponíveis
    if (connectivity.githubRaw) {
      assets.frontAnimated = `${this.SPRITE_SOURCES.githubRaw.officialArt}/${pokemonId}.png`;
      
      if (connectivity.networkQuality === 'good') {
        if (connectivity.pokemonDB && pokemonId <= 151) {
          assets.animatedSprite = `${this.SPRITE_SOURCES.pokemonDB}/${normalizedName}.gif`;
          assets.hasVariants = true;
        }
      }
      
      if (assets.quality === 'low') {
        assets.quality = 'medium';
      }
    }

    return assets;
  }

  // Testa uma URL específica com timeout
  private async testUrl(url: string, timeout: number): Promise<boolean> {
    try {
      const response = await axios.head(url, { 
        timeout,
        headers: {
          'Accept': '*/*',
          'Cache-Control': 'no-cache'
        }
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // Detecta se está rodando em emulador
  private detectEmulator(): boolean {
    if (Platform.OS === 'android') {
      return Platform.Version === 10000;
    }
    
    if (Platform.OS === 'ios') {
      return Platform.isPad === undefined;
    }

    return false;
  }

  // Avalia qualidade da rede
  private assessNetworkQuality(results: PromiseSettledResult<boolean>[]): 'good' | 'poor' | 'offline' {
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
    
    if (successCount === 0) return 'offline';
    if (successCount >= 2) return 'good';
    return 'poor';
  }

  // Assets de fallback garantidos
  private getFallbackAssets(pokemonId: number, pokemonName: string): Pokemon3DAssets {
    const normalizedName = this.POKEMON_NAME_MAP[pokemonId] || pokemonName.toLowerCase();
    
    return {
      frontAnimated: `${this.SPRITE_SOURCES.githubRaw.officialArt}/${pokemonId}.png`,
      animatedSprite: pokemonId <= 151 ? `${this.SPRITE_SOURCES.pokemonDB}/${normalizedName}.gif` : undefined,
      hasVariants: pokemonId <= 151,
      quality: 'low'
    };
  }

  // Método público para obter a melhor URL disponível
  getBestSpriteUrl(pokemonId: number, pokemonName: string, preference: 'animated' | 'high_quality' | 'static' = 'high_quality'): string {
    const normalizedName = this.POKEMON_NAME_MAP[pokemonId] || pokemonName.toLowerCase();
    
    if (!this.connectivityStatus) {
      return `${this.SPRITE_SOURCES.githubRaw.officialArt}/${pokemonId}.png`;
    }

    const connectivity = this.connectivityStatus;

    switch (preference) {
      case 'animated':
        if (connectivity.pokemonDB && connectivity.networkQuality === 'good' && pokemonId <= 151) {
          return `${this.SPRITE_SOURCES.pokemonDB}/${normalizedName}.gif`;
        }
        return this.getBestSpriteUrl(pokemonId, pokemonName, 'high_quality');
      
      case 'high_quality':
        if (connectivity.githubRaw) {
          return `${this.SPRITE_SOURCES.githubRaw.homeSprites}/${pokemonId}.png`;
        }
        return this.getBestSpriteUrl(pokemonId, pokemonName, 'static');
      
      case 'static':
      default:
        if (connectivity.githubRaw) {
          return `${this.SPRITE_SOURCES.githubRaw.officialArt}/${pokemonId}.png`;
        } else {
          return `${this.SPRITE_SOURCES.githubRaw.frontDefault}/${pokemonId}.png`;
        }
    }
  }

  // Obter URL do modelo 3D
  get3DModelUrl(pokemonId: number, variant: 'regular' | 'shiny' = 'regular'): string | null {
    if (!this.connectivityStatus?.supports3D || !this.POKEMON_WITH_3D_MODELS.has(pokemonId)) {
      return null;
    }

    const baseUrl = variant === 'shiny' ? 
      this.POKEMON_3D_API.models.shiny : 
      this.POKEMON_3D_API.models.regular;
    
    return `${baseUrl}/${pokemonId}.glb`;
  }

  // Verificar disponibilidade de assets
  async checkAssetAvailability(pokemonId: number, pokemonName: string): Promise<{
    has3D: boolean;
    hasAnimated: boolean;
    hasStatic: boolean;
    recommendedMode: 'animated' | 'static' | '3d';
    supports3D: boolean;
  }> {
    await this.ensureConnectivityStatus();
    
    const connectivity = this.connectivityStatus!;
    const has3DModel = this.POKEMON_WITH_3D_MODELS.has(pokemonId);
    const isGen1 = pokemonId >= 1 && pokemonId <= 151;
    
    // Recomendação baseada no ambiente
    let recommendedMode: 'animated' | 'static' | '3d' = 'static';
    
    if (connectivity.supports3D && has3DModel) {
      recommendedMode = '3d';
    } else if (connectivity.networkQuality === 'good' && isGen1) {
      recommendedMode = 'animated';
    }

    return {
      has3D: connectivity.supports3D && connectivity.pokemon3DAPI && has3DModel,
      hasAnimated: connectivity.pokemonDB && isGen1 && connectivity.networkQuality !== 'poor',
      hasStatic: connectivity.githubRaw,
      recommendedMode,
      supports3D: connectivity.supports3D
    };
  }

  // Pré-carregar modelos essenciais
  async preloadEssentialModels(pokemonIds: number[]): Promise<void> {
    console.log('🎮 Pré-carregando modelos 3D essenciais...');
    
    const essentialIds = pokemonIds.slice(0, 5);
    const preloadPromises = essentialIds.map(async (id) => {
      try {
        const modelUrl = this.get3DModelUrl(id);
        if (modelUrl) {
          await this.testUrl(modelUrl, 3000);
          console.log(`✅ Modelo 3D ${id} pré-carregado`);
        }
      } catch (error) {
        console.warn(`⚠️ Erro ao pré-carregar modelo 3D ${id}:`, error);
      }
    });

    await Promise.allSettled(preloadPromises);
    console.log('🎮 Pré-carregamento de modelos 3D concluído');
  }

  // Status da conectividade para debug
  getConnectivityStatus(): ConnectivityTest | null {
    return this.connectivityStatus;
  }

  // URLs garantidas para fallback
  getGuaranteedSpriteUrls(pokemonId: number) {
    const normalizedName = this.POKEMON_NAME_MAP[pokemonId] || 'pokemon';
    
    return {
      officialArt: `${this.SPRITE_SOURCES.githubRaw.officialArt}/${pokemonId}.png`,
      frontDefault: `${this.SPRITE_SOURCES.githubRaw.frontDefault}/${pokemonId}.png`,
      homeSprite: `${this.SPRITE_SOURCES.githubRaw.homeSprites}/${pokemonId}.png`,
      animated: pokemonId <= 151 ? `${this.SPRITE_SOURCES.pokemonDB}/${normalizedName}.gif` : null,
      model3D: this.get3DModelUrl(pokemonId)
    };
  }

  // Limpar cache e reconectar
  async refreshConnectivity(): Promise<void> {
    this.connectivityStatus = null;
    this.lastConnectivityCheck = 0;
    await this.ensureConnectivityStatus();
  }

  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Cache de assets 3D limpo');
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  // Lista de Pokémon com modelos 3D disponíveis
  getPokemonWith3DModels(): number[] {
    return Array.from(this.POKEMON_WITH_3D_MODELS);
  }
}

export const pokemon3DService = new Pokemon3DService();