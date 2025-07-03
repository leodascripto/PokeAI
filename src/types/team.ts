import { Pokemon } from './pokemon';

export interface Team {
  id: string;
  name: string;
  pokemon: (Pokemon | null)[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamSlot {
  index: number;
  pokemon: Pokemon | null;
}

export interface RecommendationData {
  targetPokemon: Pokemon;
  recommendations: PokemonRecommendation[];
  teamAnalysis: TeamAnalysis;
}

export interface PokemonRecommendation {
  pokemon: Pokemon;
  score: number;
  reasons: string[];
  synergy: SynergyType[];
}

export interface TeamAnalysis {
  typeDistribution: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export type SynergyType = 
  | 'type_balance' 
  | 'stat_complement' 
  | 'move_coverage' 
  | 'defensive_wall' 
  | 'offensive_core';

export const MAX_TEAM_SIZE = 6;