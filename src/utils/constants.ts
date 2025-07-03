export const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

export const MAX_POKEMON_GENERATION_1 = 151;

export const POKEMON_STATS = {
  HP: 'hp',
  ATTACK: 'attack',
  DEFENSE: 'defense',
  SPECIAL_ATTACK: 'special-attack',
  SPECIAL_DEFENSE: 'special-defense',
  SPEED: 'speed'
} as const;

export const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
] as const;

export const TEAM_SIZE_LIMIT = 6;

export const RECOMMENDATION_SCORE_THRESHOLDS = {
  EXCELLENT: 80,
  GOOD: 60,
  FAIR: 40
} as const;

export const SYNERGY_TYPES = {
  TYPE_BALANCE: 'type_balance',
  STAT_COMPLEMENT: 'stat_complement',
  MOVE_COVERAGE: 'move_coverage',
  DEFENSIVE_WALL: 'defensive_wall',
  OFFENSIVE_CORE: 'offensive_core'
} as const;

export const CACHE_DURATION = {
  POKEMON_DATA: 1000 * 60 * 60, // 1 hora
  TEAM_DATA: 1000 * 60 * 30, // 30 minutos
  RECOMMENDATIONS: 1000 * 60 * 15 // 15 minutos
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  POKEMON_NOT_FOUND: 'Pokémon não encontrado.',
  TEAM_FULL: 'Equipe já está cheia (6 Pokémon).',
  POKEMON_ALREADY_IN_TEAM: 'Este Pokémon já está na sua equipe.',
  EMPTY_TEAM: 'A equipe está vazia.',
  SAVE_ERROR: 'Erro ao salvar dados.',
  LOAD_ERROR: 'Erro ao carregar dados.'
} as const;

export const SUCCESS_MESSAGES = {
  POKEMON_ADDED: 'Pokémon adicionado à equipe!',
  POKEMON_REMOVED: 'Pokémon removido da equipe!',
  TEAM_SAVED: 'Equipe salva com sucesso!',
  TEAM_LOADED: 'Equipe carregada com sucesso!',
  TEAM_CLEARED: 'Equipe limpa com sucesso!'
} as const;