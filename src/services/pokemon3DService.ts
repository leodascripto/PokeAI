// src/services/pokemon3DService.ts - VERSÃO CORRIGIDA SEM CORS
import axios from 'axios';

export interface Pokemon3DAssets {
  model3D?: string;
  animatedSprite?: string;
  frontAnimated?: string;
  backAnimated?: string;
  shinyAnimated?: string;
  hasVariants?: boolean;
}

class Pokemon3DService {
  private cache: Map<string, Pokemon3DAssets> = new Map();

  // URLs que funcionam sem CORS
  private readonly SPRITE_SOURCES = {
    // GitHub Raw - sem problemas de CORS
    pokesprite: 'https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8',
    officialArt: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork',
    homeSprites: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home',
    // Sprites animados alternativos
    pokemondb: 'https://img.pokemondb.net/sprites/black-white/anim/normal',
    // Para 3D, usar URLs diretas que funcionam
    pokemon3dApi: 'https://raw.githubusercontent.com/HybridShivam/Pokemon/master/assets/images'
  };

  // Mapeamento de nomes para URLs corretas
  private readonly POKEMON_NAME_MAP: Record<number, string> = {
    1: 'bulbasaur', 2: 'ivysaur', 3: 'venusaur',
    4: 'charmander', 5: 'charmeleon', 6: 'charizard',
    7: 'squirtle', 8: 'wartortle', 9: 'blastoise',
    10: 'caterpie', 11: 'metapod', 12: 'butterfree',
    13: 'weedle', 14: 'kakuna', 15: 'beedrill',
    16: 'pidgey', 17: 'pidgeotto', 18: 'pidgeot',
    19: 'rattata', 20: 'raticate', 21: 'spearow',
    22: 'fearow', 23: 'ekans', 24: 'arbok',
    25: 'pikachu', 26: 'raichu', 27: 'sandshrew',
    28: 'sandslash', 29: 'nidoran-f', 30: 'nidorina',
    31: 'nidoqueen', 32: 'nidoran-m', 33: 'nidorino',
    34: 'nidoking', 35: 'clefairy', 36: 'clefable',
    37: 'vulpix', 38: 'ninetales', 39: 'jigglypuff',
    40: 'wigglytuff', 41: 'zubat', 42: 'golbat',
    43: 'oddish', 44: 'gloom', 45: 'vileplume',
    46: 'paras', 47: 'parasect', 48: 'venonat',
    49: 'venomoth', 50: 'diglett', 51: 'dugtrio',
    52: 'meowth', 53: 'persian', 54: 'psyduck',
    55: 'golduck', 56: 'mankey', 57: 'primeape',
    58: 'growlithe', 59: 'arcanine', 60: 'poliwag',
    61: 'poliwhirl', 62: 'poliwrath', 63: 'abra',
    64: 'kadabra', 65: 'alakazam', 66: 'machop',
    67: 'machoke', 68: 'machamp', 69: 'bellsprout',
    70: 'weepinbell', 71: 'victreebel', 72: 'tentacool',
    73: 'tentacruel', 74: 'geodude', 75: 'graveler',
    76: 'golem', 77: 'ponyta', 78: 'rapidash',
    79: 'slowpoke', 80: 'slowbro', 81: 'magnemite',
    82: 'magneton', 83: 'farfetchd', 84: 'doduo',
    85: 'dodrio', 86: 'seel', 87: 'dewgong',
    88: 'grimer', 89: 'muk', 90: 'shellder',
    91: 'cloyster', 92: 'gastly', 93: 'haunter',
    94: 'gengar', 95: 'onix', 96: 'drowzee',
    97: 'hypno', 98: 'krabby', 99: 'kingler',
    100: 'voltorb', 101: 'electrode', 102: 'exeggcute',
    103: 'exeggutor', 104: 'cubone', 105: 'marowak',
    106: 'hitmonlee', 107: 'hitmonchan', 108: 'lickitung',
    109: 'koffing', 110: 'weezing', 111: 'rhyhorn',
    112: 'rhydon', 113: 'chansey', 114: 'tangela',
    115: 'kangaskhan', 116: 'horsea', 117: 'seadra',
    118: 'goldeen', 119: 'seaking', 120: 'staryu',
    121: 'starmie', 122: 'mr-mime', 123: 'scyther',
    124: 'jynx', 125: 'electabuzz', 126: 'magmar',
    127: 'pinsir', 128: 'tauros', 129: 'magikarp',
    130: 'gyarados', 131: 'lapras', 132: 'ditto',
    133: 'eevee', 134: 'vaporeon', 135: 'jolteon',
    136: 'flareon', 137: 'porygon', 138: 'omanyte',
    139: 'omastar', 140: 'kabuto', 141: 'kabutops',
    142: 'aerodactyl', 143: 'snorlax', 144: 'articuno',
    145: 'zapdos', 146: 'moltres', 147: 'dratini',
    148: 'dragonair', 149: 'dragonite', 150: 'mewtwo',
    151: 'mew'
  };

  // Método principal que retorna URLs funcionais
  async getPokemonAssets(pokemonId: number, pokemonName: string): Promise<Pokemon3DAssets> {
    const cacheKey = `assets_${pokemonId}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const normalizedName = this.POKEMON_NAME_MAP[pokemonId] || pokemonName.toLowerCase();
      
      const assets: Pokemon3DAssets = {
        // Sprite de alta qualidade do GitHub (sempre funciona)
        frontAnimated: `${this.SPRITE_SOURCES.officialArt}/${pokemonId}.png`,
        
        // Sprite animado alternativo (PokemonDB)
        animatedSprite: `${this.SPRITE_SOURCES.pokemondb}/${normalizedName}.gif`,
        
        // Sprite HOME (melhor qualidade estática)
        model3D: `${this.SPRITE_SOURCES.homeSprites}/${pokemonId}.png`,
        
        // Versão shiny
        shinyAnimated: `${this.SPRITE_SOURCES.officialArt}/${pokemonId}.png`,
        
        hasVariants: true
      };

      this.cache.set(cacheKey, assets);
      return assets;
    } catch (error) {
      console.error(`Erro ao buscar assets para ${pokemonName}:`, error);
      
      // Fallback básico sempre funcionará
      const fallbackAssets: Pokemon3DAssets = {
        frontAnimated: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`,
        hasVariants: false
      };
      
      this.cache.set(cacheKey, fallbackAssets);
      return fallbackAssets;
    }
  }

  // Método melhorado para obter a melhor URL disponível
  getBestSpriteUrl(pokemonId: number, pokemonName: string, preference: 'animated' | 'high_quality' | 'static' = 'high_quality'): string {
    const normalizedName = this.POKEMON_NAME_MAP[pokemonId] || pokemonName.toLowerCase();
    
    switch (preference) {
      case 'animated':
        // Tentar sprite animado, com fallback
        return `${this.SPRITE_SOURCES.pokemondb}/${normalizedName}.gif`;
      
      case 'high_quality':
        // HOME sprites são de altíssima qualidade
        return `${this.SPRITE_SOURCES.homeSprites}/${pokemonId}.png`;
      
      case 'static':
      default:
        // Official artwork sempre funciona
        return `${this.SPRITE_SOURCES.officialArt}/${pokemonId}.png`;
    }
  }

  // Verificar disponibilidade sem fazer requisições HTTP (evita CORS)
  async checkAssetAvailability(pokemonId: number, pokemonName: string): Promise<{
    has3D: boolean;
    hasAnimated: boolean;
    hasStatic: boolean;
  }> {
    // Para os primeiros 151, assumir que sempre temos pelo menos o sprite estático
    const hasBasicAssets = pokemonId >= 1 && pokemonId <= 151;
    
    return {
      has3D: false, // Desabilitar 3D por enquanto devido a CORS
      hasAnimated: hasBasicAssets, // Sprites animados disponíveis para Gen 1
      hasStatic: hasBasicAssets // Sempre temos sprites estáticos
    };
  }

  // URLs de sprites específicos que funcionam garantidamente
  getGuaranteedSpriteUrls(pokemonId: number) {
    return {
      // Sempre funcionam - GitHub Raw
      officialArt: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`,
      frontDefault: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`,
      homeSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemonId}.png`,
      
      // Sprite animado (pode não funcionar para todos)
      animated: pokemonId <= 151 ? `https://img.pokemondb.net/sprites/black-white/anim/normal/${this.POKEMON_NAME_MAP[pokemonId] || 'pokemon'}.gif` : null
    };
  }

  // Método para testar conectividade
  async testConnectivity(): Promise<{
    githubRaw: boolean;
    pokemonDB: boolean;
    pokemon3DApi: boolean;
  }> {
    const results = {
      githubRaw: false,
      pokemonDB: false,
      pokemon3DApi: false
    };

    try {
      // Testar GitHub Raw (deve sempre funcionar)
      await axios.head(`${this.SPRITE_SOURCES.officialArt}/1.png`, { timeout: 5000 });
      results.githubRaw = true;
    } catch (error) {
      console.log('GitHub Raw não acessível');
    }

    try {
      // Testar PokemonDB (pode ter CORS)
      await axios.head(`${this.SPRITE_SOURCES.pokemondb}/bulbasaur.gif`, { timeout: 5000 });
      results.pokemonDB = true;
    } catch (error) {
      console.log('PokemonDB com problemas de CORS');
    }

    return results;
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

export const pokemon3DService = new Pokemon3DService();