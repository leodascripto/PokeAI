export interface PokemonEncounter {
  location_area: {
    name: string;
    url: string;
  };
  version_details: VersionEncounterDetail[];
}

export interface VersionEncounterDetail {
  max_chance: number;
  encounter_details: EncounterDetail[];
  version: {
    name: string;
    url: string;
  };
}

export interface EncounterDetail {
  min_level: number;
  max_level: number;
  condition_values: ConditionValue[];
  chance: number;
  method: {
    name: string;
    url: string;
  };
}

export interface ConditionValue {
  name: string;
  url: string;
}

export interface LocationArea {
  id: number;
  name: string;
  game_index: number;
  encounter_method_rates: EncounterMethodRate[];
  location: {
    name: string;
    url: string;
  };
  names: LocationName[];
  pokemon_encounters: PokemonEncounterInArea[];
}

export interface EncounterMethodRate {
  encounter_method: {
    name: string;
    url: string;
  };
  version_details: VersionEncounterDetail[];
}

export interface LocationName {
  name: string;
  language: {
    name: string;
    url: string;
  };
}

export interface PokemonEncounterInArea {
  pokemon: {
    name: string;
    url: string;
  };
  version_details: VersionEncounterDetail[];
}

// Tipos processados para exibição
export interface ProcessedPokemonLocation {
  pokemonId: number;
  pokemonName: string;
  locations: ProcessedLocationData[];
  availableVersions: string[];
}

export interface ProcessedLocationData {
  locationName: string;
  displayName: string;
  encounters: ProcessedEncounter[];
}

export interface ProcessedEncounter {
  version: string;
  method: string;
  minLevel: number;
  maxLevel: number;
  chance: number;
  conditions: string[];
  rarity: LocationRarity;
}

export type LocationRarity = 
  | 'common'     // 30%+
  | 'uncommon'   // 15-29%
  | 'rare'       // 5-14%
  | 'very_rare'  // 1-4%
  | 'extremely_rare'; // <1%

export type GameVersion = 'firered' | 'leafgreen' | 'both';

// Mapeamento de nomes da API para nomes amigáveis
export const LOCATION_NAME_MAPPING: Record<string, string> = {
  'viridian-forest': 'Floresta de Viridian',
  'mt-moon-1f': 'Monte Moon - 1º Andar',
  'mt-moon-b1f': 'Monte Moon - Subsolo 1',
  'mt-moon-b2f': 'Monte Moon - Subsolo 2',
  'rock-tunnel-1f': 'Túnel da Rocha - 1º Andar',
  'rock-tunnel-b1f': 'Túnel da Rocha - Subsolo',
  'seafoam-islands-1f': 'Ilhas Seafoam - 1º Andar',
  'seafoam-islands-b1f': 'Ilhas Seafoam - Subsolo 1',
  'seafoam-islands-b2f': 'Ilhas Seafoam - Subsolo 2',
  'seafoam-islands-b3f': 'Ilhas Seafoam - Subsolo 3',
  'seafoam-islands-b4f': 'Ilhas Seafoam - Subsolo 4',
  'pokemon-mansion-1f': 'Mansão Pokémon - 1º Andar',
  'pokemon-mansion-2f': 'Mansão Pokémon - 2º Andar',
  'pokemon-mansion-3f': 'Mansão Pokémon - 3º Andar',
  'pokemon-mansion-b1f': 'Mansão Pokémon - Subsolo',
  'victory-road-1f': 'Estrada da Vitória - 1º Andar',
  'victory-road-2f': 'Estrada da Vitória - 2º Andar',
  'victory-road-3f': 'Estrada da Vitória - 3º Andar',
  'cerulean-cave-1f': 'Caverna de Cerulean - 1º Andar',
  'cerulean-cave-2f': 'Caverna de Cerulean - 2º Andar',
  'cerulean-cave-b1f': 'Caverna de Cerulean - Subsolo',
  'power-plant': 'Usina de Energia',
  'safari-zone-area-1': 'Zona Safari - Área 1',
  'safari-zone-area-2': 'Zona Safari - Área 2',
  'safari-zone-area-3': 'Zona Safari - Área 3',
  'safari-zone-area-4': 'Zona Safari - Área 4',
  'kanto-route-1': 'Rota 1',
  'kanto-route-2': 'Rota 2',
  'kanto-route-3': 'Rota 3',
  'kanto-route-4': 'Rota 4',
  'kanto-route-5': 'Rota 5',
  'kanto-route-6': 'Rota 6',
  'kanto-route-7': 'Rota 7',
  'kanto-route-8': 'Rota 8',
  'kanto-route-9': 'Rota 9',
  'kanto-route-10': 'Rota 10',
  'kanto-route-11': 'Rota 11',
  'kanto-route-12': 'Rota 12',
  'kanto-route-13': 'Rota 13',
  'kanto-route-14': 'Rota 14',
  'kanto-route-15': 'Rota 15',
  'kanto-route-16': 'Rota 16',
  'kanto-route-17': 'Rota 17',
  'kanto-route-18': 'Rota 18',
  'kanto-route-19': 'Rota 19',
  'kanto-route-20': 'Rota 20',
  'kanto-route-21': 'Rota 21',
  'kanto-route-22': 'Rota 22',
  'kanto-route-23': 'Rota 23',
  'kanto-route-24': 'Rota 24',
  'kanto-route-25': 'Rota 25'
};

export const METHOD_NAME_MAPPING: Record<string, string> = {
  'walk': 'Caminhando na grama',
  'surf': 'Surfando',
  'old-rod': 'Vara Velha',
  'good-rod': 'Vara Boa',
  'super-rod': 'Super Vara',
  'rock-smash': 'Quebra-Pedra',
  'headbutt': 'Cabeçada em árvore'
};

export const CONDITION_NAME_MAPPING: Record<string, string> = {
  'time-morning': 'Manhã',
  'time-day': 'Dia',
  'time-night': 'Noite',
  'season-spring': 'Primavera',
  'season-summer': 'Verão',
  'season-autumn': 'Outono',
  'season-winter': 'Inverno',
  'swarm': 'Enxame'
};