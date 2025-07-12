// src/services/pokemon3DService.ts - VERSÃO CORRIGIDA PARA DISPOSITIVOS FÍSICOS
import axios from 'axios';
import { Platform } from 'react-native';

export interface Pokemon3DAssets {
  model3D?: string;
  animatedSprite?: string;
  frontAnimated?: string;
  backAnimated?: string;
  shinyAnimated?: string;
  hasVariants?: boolean;
}

interface ConnectivityTest {
  githubRaw: boolean;
  pokemonDB: boolean;
  pokemonApiCDN: boolean;
  isEmulator: boolean;
  networkQuality: 'good' | 'poor' | 'offline';
}

class Pokemon3DService {
  private cache: Map<string, Pokemon3DAssets> = new Map();
  private connectivityStatus: ConnectivityTest | null = null;
  private lastConnectivityCheck: number = 0;
  private readonly CONNECTIVITY_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos

  // URLs otimizadas para diferentes ambientes
  private readonly SPRITE_SOURCES = {
    // Sempre funciona - GitHub Raw (CDN confiável)
    githubRaw: {
      officialArt: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork',
      homeSprites: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home',
      frontDefault: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon',
      dreamWorld: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world'
    },
    
    // CDN da PokeAPI (mais confiável)
    pokeApiCDN: {
      sprites: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon',
      officialArt: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork'
    },
    
    // Backup URLs (podem ter problemas de CORS em dispositivos)
    pokemonDB: 'https://img.pokemondb.net/sprites/black-white/anim/normal',
    
    // URLs locais para fallback (se necessário)
    fallback: {
      base: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'
    }
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

  // Método principal com detecção automática de ambiente
  async getPokemonAssets(pokemonId: number, pokemonName: string): Promise<Pokemon3DAssets> {
    const cacheKey = `assets_${pokemonId}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // Verificar conectividade se necessário
      await this.ensureConnectivityStatus();
      
      const normalizedName = this.POKEMON_NAME_MAP[pokemonId] || pokemonName.toLowerCase();
      const assets = await this.buildOptimalAssets(pokemonId, normalizedName);
      
      this.cache.set(cacheKey, assets);
      return assets;
    } catch (error) {
      console.error(`Erro ao buscar assets para ${pokemonName}:`, error);
      return this.getFallbackAssets(pokemonId);
    }
  }

  // Verifica conectividade e qualidade da rede
  private async ensureConnectivityStatus(): Promise<void> {
    const now = Date.now();
    
    if (this.connectivityStatus && (now - this.lastConnectivityCheck) < this.CONNECTIVITY_CHECK_INTERVAL) {
      return;
    }

    console.log('🔍 Testando conectividade...');
    
    try {
      const results = await Promise.allSettled([
        this.testUrl(`${this.SPRITE_SOURCES.githubRaw.officialArt}/1.png`, 3000),
        this.testUrl(`${this.SPRITE_SOURCES.pokeApiCDN.sprites}/1.png`, 3000),
        this.testUrl(`${this.SPRITE_SOURCES.pokemonDB}/bulbasaur.gif`, 2000)
      ]);

      this.connectivityStatus = {
        githubRaw: results[0].status === 'fulfilled',
        pokemonApiCDN: results[1].status === 'fulfilled', 
        pokemonDB: results[2].status === 'fulfilled',
        isEmulator: this.detectEmulator(),
        networkQuality: this.assessNetworkQuality(results)
      };

      this.lastConnectivityCheck = now;

      console.log('📊 Status de conectividade:', {
        environment: this.connectivityStatus.isEmulator ? 'Emulador' : 'Dispositivo físico',
        github: this.connectivityStatus.githubRaw ? '✅' : '❌',
        pokemonApiCDN: this.connectivityStatus.pokemonApiCDN ? '✅' : '❌', 
        pokemonDB: this.connectivityStatus.pokemonDB ? '✅' : '❌',
        networkQuality: this.connectivityStatus.networkQuality
      });

    } catch (error) {
      console.error('❌ Erro no teste de conectividade:', error);
      this.connectivityStatus = {
        githubRaw: false,
        pokemonApiCDN: false,
        pokemonDB: false,
        isEmulator: this.detectEmulator(),
        networkQuality: 'poor'
      };
    }
  }

  // Constroi assets baseado na conectividade disponível
  private async buildOptimalAssets(pokemonId: number, normalizedName: string): Promise<Pokemon3DAssets> {
    const connectivity = this.connectivityStatus!;
    
    // Escolher fontes baseado na disponibilidade
    let primarySource: string;
    let animatedSource: string | undefined;
    let hasVariants = false;

    if (connectivity.githubRaw) {
      // GitHub Raw é a fonte mais confiável
      primarySource = `${this.SPRITE_SOURCES.githubRaw.officialArt}/${pokemonId}.png`;
      
      if (connectivity.networkQuality === 'good') {
        // Tentar sprite animado apenas com boa conexão
        if (connectivity.pokemonDB && pokemonId <= 151) {
          animatedSource = `${this.SPRITE_SOURCES.pokemonDB}/${normalizedName}.gif`;
          hasVariants = true;
        }
      }
    } else if (connectivity.pokemonApiCDN) {
      // Fallback para CDN da PokeAPI
      primarySource = `${this.SPRITE_SOURCES.pokeApiCDN.officialArt}/${pokemonId}.png`;
    } else {
      // Último recurso - URL básica que deve sempre funcionar
      primarySource = `${this.SPRITE_SOURCES.fallback.base}/${pokemonId}.png`;
    }

    const assets: Pokemon3DAssets = {
      frontAnimated: primarySource,
      animatedSprite: animatedSource,
      model3D: undefined, // Desabilitar 3D por ora
      hasVariants
    };

    return assets;
  }

  // Testa uma URL específica com timeout
  private async testUrl(url: string, timeout: number): Promise<boolean> {
    try {
      const response = await axios.head(url, { 
        timeout,
        // Headers para evitar problemas de CORS
        headers: {
          'Accept': 'image/*',
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
    // No React Native, podemos usar alguns indicadores
    if (Platform.OS === 'android') {
      // Android emulators geralmente têm características específicas
      return Platform.Version === 10000;
    }
    
    if (Platform.OS === 'ios') {
      // iOS simulators
      return Platform.isPad === undefined;
    }

    return false;
  }

  // Avalia qualidade da rede baseado nos testes
  private assessNetworkQuality(results: PromiseSettledResult<boolean>[]): 'good' | 'poor' | 'offline' {
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
    
    if (successCount === 0) return 'offline';
    if (successCount >= 2) return 'good';
    return 'poor';
  }

  // Assets de fallback garantidos
  private getFallbackAssets(pokemonId: number): Pokemon3DAssets {
    return {
      frontAnimated: `${this.SPRITE_SOURCES.fallback.base}/${pokemonId}.png`,
      hasVariants: false
    };
  }

  // Método público para obter a melhor URL disponível
  getBestSpriteUrl(pokemonId: number, pokemonName: string, preference: 'animated' | 'high_quality' | 'static' = 'high_quality'): string {
    const normalizedName = this.POKEMON_NAME_MAP[pokemonId] || pokemonName.toLowerCase();
    
    // Se não temos status de conectividade, usar fonte mais confiável
    if (!this.connectivityStatus) {
      return `${this.SPRITE_SOURCES.githubRaw.officialArt}/${pokemonId}.png`;
    }

    const connectivity = this.connectivityStatus;

    switch (preference) {
      case 'animated':
        // Só tentar animado se a conectividade for boa e for Gen 1
        if (connectivity.pokemonDB && connectivity.networkQuality === 'good' && pokemonId <= 151) {
          return `${this.SPRITE_SOURCES.pokemonDB}/${normalizedName}.gif`;
        }
        // Fallback para high quality
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
        } else if (connectivity.pokemonApiCDN) {
          return `${this.SPRITE_SOURCES.pokeApiCDN.officialArt}/${pokemonId}.png`;
        } else {
          return `${this.SPRITE_SOURCES.fallback.base}/${pokemonId}.png`;
        }
    }
  }

  // Verificar disponibilidade inteligente
  async checkAssetAvailability(pokemonId: number, pokemonName: string): Promise<{
    has3D: boolean;
    hasAnimated: boolean;
    hasStatic: boolean;
    recommendedMode: 'animated' | 'static';
  }> {
    await this.ensureConnectivityStatus();
    
    const connectivity = this.connectivityStatus!;
    const isGen1 = pokemonId >= 1 && pokemonId <= 151;
    
    // Recomendação baseada no ambiente
    let recommendedMode: 'animated' | 'static' = 'static';
    
    if (connectivity.isEmulator && connectivity.networkQuality === 'good') {
      // No emulador com boa conexão, preferir animado
      recommendedMode = isGen1 ? 'animated' : 'static';
    } else if (!connectivity.isEmulator) {
      // Em dispositivo físico, ser mais conservador
      recommendedMode = connectivity.networkQuality === 'good' && isGen1 ? 'animated' : 'static';
    }

    return {
      has3D: false, // Desabilitado por ora
      hasAnimated: connectivity.pokemonDB && isGen1 && connectivity.networkQuality !== 'poor',
      hasStatic: connectivity.githubRaw || connectivity.pokemonApiCDN,
      recommendedMode
    };
  }

  // URLs garantidas para fallback
  getGuaranteedSpriteUrls(pokemonId: number) {
    return {
      // Sempre funcionam - GitHub Raw tem CDN global
      officialArt: `${this.SPRITE_SOURCES.githubRaw.officialArt}/${pokemonId}.png`,
      frontDefault: `${this.SPRITE_SOURCES.githubRaw.frontDefault}/${pokemonId}.png`,
      homeSprite: `${this.SPRITE_SOURCES.githubRaw.homeSprites}/${pokemonId}.png`,
      dreamWorld: `${this.SPRITE_SOURCES.githubRaw.dreamWorld}/${pokemonId}.svg`,
      
      // Pode não funcionar em todos os dispositivos
      animated: this.connectivityStatus?.pokemonDB && pokemonId <= 151 ? 
        `${this.SPRITE_SOURCES.pokemonDB}/${this.POKEMON_NAME_MAP[pokemonId] || 'pokemon'}.gif` : null
    };
  }

  // Status da conectividade para debug
  getConnectivityStatus(): ConnectivityTest | null {
    return this.connectivityStatus;
  }

  // Limpar cache e reconectar
  async refreshConnectivity(): Promise<void> {
    this.connectivityStatus = null;
    this.lastConnectivityCheck = 0;
    await this.ensureConnectivityStatus();
  }

  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Cache limpo');
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

export const pokemon3DService = new Pokemon3DService();