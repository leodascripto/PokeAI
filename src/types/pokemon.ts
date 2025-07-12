// src/types/pokemon.ts - Enhanced with 3D assets
export interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
    // Novos campos para 3D e animações
    animated?: {
      front_default?: string;
      back_default?: string;
      front_shiny?: string;
      back_shiny?: string;
    };
    model3d?: {
      glb_url?: string;
      obj_url?: string;
      viewer_url?: string;
    };
  };
  types: PokemonType[];
  stats: PokemonStat[];
  height: number;
  weight: number;
  abilities: PokemonAbility[];
  // Metadados sobre assets disponíveis
  assets?: {
    has3D: boolean;
    hasAnimated: boolean;
    quality: 'high' | 'medium' | 'low';
    preferredDisplay: 'animated' | '3d' | 'static';
  };
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
}

export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export type PokemonTypeNames = 
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

export interface TeamPokemon extends Pokemon {
  teamSlot: number;
}

// Configurações de preferência de display
export interface DisplayPreferences {
  preferred3D: boolean;
  preferredAnimated: boolean;
  fallbackToStatic: boolean;
  qualityThreshold: 'high' | 'medium' | 'low';
}