import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pokemon } from '../types/pokemon';
import { Team, MAX_TEAM_SIZE } from '../types/team';

const TEAM_STORAGE_KEY = '@pokemon_team';
const TEAMS_STORAGE_KEY = '@pokemon_teams';

class TeamManagerService {
  private currentTeam: (Pokemon | null)[] = Array(MAX_TEAM_SIZE).fill(null);
  private teams: Team[] = [];

  async loadCurrentTeam(): Promise<(Pokemon | null)[]> {
    try {
      const teamData = await AsyncStorage.getItem(TEAM_STORAGE_KEY);
      if (teamData) {
        this.currentTeam = JSON.parse(teamData);
      }
      return this.currentTeam;
    } catch (error) {
      console.error('Erro ao carregar equipe:', error);
      return this.currentTeam;
    }
  }

  async saveCurrentTeam(): Promise<void> {
    try {
      await AsyncStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(this.currentTeam));
    } catch (error) {
      console.error('Erro ao salvar equipe:', error);
      throw new Error('Falha ao salvar equipe');
    }
  }

  async addPokemonToTeam(pokemon: Pokemon, slotIndex?: number): Promise<boolean> {
    // Verificar se o Pokémon já está na equipe
    if (this.isPokemonInTeam(pokemon.id)) {
      throw new Error('Este Pokémon já está na sua equipe!');
    }

    // Se um slot específico foi fornecido
    if (slotIndex !== undefined) {
      if (slotIndex < 0 || slotIndex >= MAX_TEAM_SIZE) {
        throw new Error('Posição inválida na equipe');
      }
      this.currentTeam[slotIndex] = pokemon;
    } else {
      // Encontrar o primeiro slot vazio
      const emptySlotIndex = this.currentTeam.findIndex(slot => slot === null);
      if (emptySlotIndex === -1) {
        throw new Error('Equipe está cheia! Remova um Pokémon primeiro.');
      }
      this.currentTeam[emptySlotIndex] = pokemon;
    }

    await this.saveCurrentTeam();
    return true;
  }

  async removePokemonFromTeam(slotIndex: number): Promise<boolean> {
    if (slotIndex < 0 || slotIndex >= MAX_TEAM_SIZE) {
      throw new Error('Posição inválida na equipe');
    }

    this.currentTeam[slotIndex] = null;
    await this.saveCurrentTeam();
    return true;
  }

  async movePokemon(fromIndex: number, toIndex: number): Promise<boolean> {
    if (fromIndex < 0 || fromIndex >= MAX_TEAM_SIZE || 
        toIndex < 0 || toIndex >= MAX_TEAM_SIZE) {
      throw new Error('Posições inválidas na equipe');
    }

    const temp = this.currentTeam[fromIndex];
    this.currentTeam[fromIndex] = this.currentTeam[toIndex];
    this.currentTeam[toIndex] = temp;

    await this.saveCurrentTeam();
    return true;
  }

  getCurrentTeam(): (Pokemon | null)[] {
    return [...this.currentTeam];
  }

  getTeamSize(): number {
    return this.currentTeam.filter(pokemon => pokemon !== null).length;
  }

  isPokemonInTeam(pokemonId: number): boolean {
    return this.currentTeam.some(pokemon => pokemon?.id === pokemonId);
  }

  isTeamFull(): boolean {
    return this.getTeamSize() >= MAX_TEAM_SIZE;
  }

  getEmptySlots(): number[] {
    return this.currentTeam
      .map((pokemon, index) => pokemon === null ? index : -1)
      .filter(index => index !== -1);
  }

  getTeamTypes(): string[] {
    const types: string[] = [];
    this.currentTeam
      .filter(pokemon => pokemon !== null)
      .forEach(pokemon => {
        pokemon!.types.forEach(type => {
          if (!types.includes(type.type.name)) {
            types.push(type.type.name);
          }
        });
      });
    return types;
  }

  async clearTeam(): Promise<void> {
    this.currentTeam = Array(MAX_TEAM_SIZE).fill(null);
    await this.saveCurrentTeam();
  }

  // Gerenciamento de múltiplas equipes
  async saveTeam(name: string): Promise<string> {
    const teamId = Date.now().toString();
    const team: Team = {
      id: teamId,
      name,
      pokemon: [...this.currentTeam],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.teams.push(team);
    await this.saveTeams();
    return teamId;
  }

  async loadTeam(teamId: string): Promise<boolean> {
    const team = this.teams.find(t => t.id === teamId);
    if (!team) {
      throw new Error('Equipe não encontrada');
    }

    this.currentTeam = [...team.pokemon];
    await this.saveCurrentTeam();
    return true;
  }

  async deleteTeam(teamId: string): Promise<boolean> {
    const index = this.teams.findIndex(t => t.id === teamId);
    if (index === -1) {
      throw new Error('Equipe não encontrada');
    }

    this.teams.splice(index, 1);
    await this.saveTeams();
    return true;
  }

  async loadTeams(): Promise<Team[]> {
    try {
      const teamsData = await AsyncStorage.getItem(TEAMS_STORAGE_KEY);
      if (teamsData) {
        this.teams = JSON.parse(teamsData);
      }
      return this.teams;
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
      return [];
    }
  }

  private async saveTeams(): Promise<void> {
    try {
      await AsyncStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(this.teams));
    } catch (error) {
      console.error('Erro ao salvar equipes:', error);
      throw new Error('Falha ao salvar equipes');
    }
  }

  getTeams(): Team[] {
    return [...this.teams];
  }

  // Estatísticas da equipe
  getTeamStats() {
    const activePokemon = this.currentTeam.filter(p => p !== null) as Pokemon[];
    
    if (activePokemon.length === 0) {
      return {
        totalStats: 0,
        averageStats: {},
        typeDistribution: {},
        recommendations: []
      };
    }

    let totalStats = 0;
    const statTotals = {
      hp: 0,
      attack: 0,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 0
    };

    const typeDistribution: Record<string, number> = {};

    activePokemon.forEach(pokemon => {
      pokemon.stats.forEach(stat => {
        const value = stat.base_stat;
        totalStats += value;

        switch (stat.stat.name) {
          case 'hp':
            statTotals.hp += value;
            break;
          case 'attack':
            statTotals.attack += value;
            break;
          case 'defense':
            statTotals.defense += value;
            break;
          case 'special-attack':
            statTotals.specialAttack += value;
            break;
          case 'special-defense':
            statTotals.specialDefense += value;
            break;
          case 'speed':
            statTotals.speed += value;
            break;
        }
      });

      pokemon.types.forEach(type => {
        const typeName = type.type.name;
        typeDistribution[typeName] = (typeDistribution[typeName] || 0) + 1;
      });
    });

    const averageStats = {
      hp: Math.round(statTotals.hp / activePokemon.length),
      attack: Math.round(statTotals.attack / activePokemon.length),
      defense: Math.round(statTotals.defense / activePokemon.length),
      specialAttack: Math.round(statTotals.specialAttack / activePokemon.length),
      specialDefense: Math.round(statTotals.specialDefense / activePokemon.length),
      speed: Math.round(statTotals.speed / activePokemon.length)
    };

    return {
      totalStats,
      averageStats,
      typeDistribution,
      teamSize: activePokemon.length
    };
  }
}

export const teamManager = new TeamManagerService();