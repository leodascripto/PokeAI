// src/services/pokemonLocationApi.ts - CORRIGIDO
import axios from 'axios';
import {
  PokemonEncounter,
  LocationArea,
  ProcessedPokemonLocation,
  ProcessedLocationData,
  ProcessedEncounter,
  LocationRarity,
  LOCATION_NAME_MAPPING,
  METHOD_NAME_MAPPING,
  CONDITION_NAME_MAPPING
} from '../types/pokemonLocation';

const API_BASE_URL = 'https://pokeapi.co/api/v2';

class PokemonLocationApiService {
  private cache: Map<string, any> = new Map();

  async getPokemonEncounters(pokemonId: number): Promise<ProcessedPokemonLocation | null> {
    const cacheKey = `encounters_${pokemonId}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Primeiro verifica se tem dados especiais
      const specialData = this.getSpecialLocationInfo(pokemonId);
      if (specialData) {
        this.cache.set(cacheKey, specialData);
        return specialData;
      }

      // Se não tem dados especiais, busca na API
      const response = await axios.get(`${API_BASE_URL}/pokemon/${pokemonId}/encounters`, {
        timeout: 10000 // 10 segundos de timeout
      });
      
      const encounters: PokemonEncounter[] = response.data;
      
      if (encounters.length === 0) {
        // Pokémon não encontrado na natureza
        this.cache.set(cacheKey, null);
        return null;
      }

      const processed = await this.processEncounterData(pokemonId, encounters);
      this.cache.set(cacheKey, processed);
      return processed;
    } catch (error) {
      console.error(`Erro ao buscar localizações do Pokémon ${pokemonId}:`, error);
      
      // Se houve erro, retorna dados especiais se existirem
      const specialData = this.getSpecialLocationInfo(pokemonId);
      if (specialData) {
        this.cache.set(cacheKey, specialData);
        return specialData;
      }
      
      // Se não tem dados especiais, retorna null
      this.cache.set(cacheKey, null);
      return null;
    }
  }

  async getLocationDetails(locationUrl: string): Promise<LocationArea | null> {
    const cacheKey = `location_${locationUrl}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await axios.get(locationUrl, { timeout: 8000 });
      const locationData: LocationArea = response.data;
      
      this.cache.set(cacheKey, locationData);
      return locationData;
    } catch (error) {
      console.error(`Erro ao buscar detalhes da localização ${locationUrl}:`, error);
      return null;
    }
  }

  private async processEncounterData(
    pokemonId: number, 
    encounters: PokemonEncounter[]
  ): Promise<ProcessedPokemonLocation> {
    try {
      const pokemonResponse = await axios.get(`${API_BASE_URL}/pokemon/${pokemonId}`, { timeout: 5000 });
      const pokemonName = pokemonResponse.data.name;

      const locations: ProcessedLocationData[] = [];
      const availableVersions = new Set<string>();

      for (const encounter of encounters) {
        const locationName = encounter.location_area.name;
        const displayName = this.getDisplayName(locationName);
        
        const processedEncounters: ProcessedEncounter[] = [];

        for (const versionDetail of encounter.version_details) {
          const version = versionDetail.version.name;
          
          // Aceitar mais versões para ter mais dados
          if (!['firered', 'leafgreen', 'red', 'blue', 'yellow'].includes(version)) {
            continue;
          }

          // Mapear versões antigas para as novas
          const mappedVersion = this.mapVersion(version);
          availableVersions.add(mappedVersion);

          for (const encounterDetail of versionDetail.encounter_details) {
            const processedEncounter: ProcessedEncounter = {
              version: mappedVersion,
              method: this.getMethodName(encounterDetail.method.name),
              minLevel: encounterDetail.min_level,
              maxLevel: encounterDetail.max_level,
              chance: encounterDetail.chance,
              conditions: encounterDetail.condition_values
                .map(cv => this.getConditionName(cv.name))
                .filter(name => name !== ''), // Filtrar condições vazias
              rarity: this.calculateRarity(encounterDetail.chance)
            };

            processedEncounters.push(processedEncounter);
          }
        }

        if (processedEncounters.length > 0) {
          const existingLocation = locations.find(loc => loc.locationName === locationName);
          
          if (existingLocation) {
            existingLocation.encounters.push(...processedEncounters);
          } else {
            locations.push({
              locationName,
              displayName,
              encounters: processedEncounters
            });
          }
        }
      }

      // Se não encontrou nenhuma localização, usar dados especiais se existirem
      if (locations.length === 0) {
        const specialData = this.getSpecialLocationInfo(pokemonId);
        if (specialData) {
          return specialData;
        }
      }

      return {
        pokemonId,
        pokemonName,
        locations: locations.sort((a, b) => a.displayName.localeCompare(b.displayName)),
        availableVersions: Array.from(availableVersions).sort()
      };
    } catch (error) {
      console.error('Erro ao processar dados de encontro:', error);
      
      // Fallback para dados especiais
      const specialData = this.getSpecialLocationInfo(pokemonId);
      if (specialData) {
        return specialData;
      }
      
      throw error;
    }
  }

  private mapVersion(version: string): string {
    const versionMapping: Record<string, string> = {
      'red': 'firered',
      'blue': 'leafgreen', 
      'yellow': 'firered',
      'firered': 'firered',
      'leafgreen': 'leafgreen'
    };
    
    return versionMapping[version] || version;
  }

  private getDisplayName(locationName: string): string {
    return LOCATION_NAME_MAPPING[locationName] || this.formatLocationName(locationName);
  }

  private formatLocationName(name: string): string {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private getMethodName(methodName: string): string {
    return METHOD_NAME_MAPPING[methodName] || this.formatLocationName(methodName);
  }

  private getConditionName(conditionName: string): string {
    return CONDITION_NAME_MAPPING[conditionName] || this.formatLocationName(conditionName);
  }

  private calculateRarity(chance: number): LocationRarity {
    if (chance >= 30) return 'common';
    if (chance >= 15) return 'uncommon';
    if (chance >= 5) return 'rare';
    if (chance >= 1) return 'very_rare';
    return 'extremely_rare';
  }

  getRarityColor(rarity: LocationRarity): string {
    switch (rarity) {
      case 'common': return '#4CAF50';
      case 'uncommon': return '#FF9800';
      case 'rare': return '#2196F3';
      case 'very_rare': return '#9C27B0';
      case 'extremely_rare': return '#F44336';
      default: return '#757575';
    }
  }

  getRarityLabel(rarity: LocationRarity): string {
    switch (rarity) {
      case 'common': return 'Comum';
      case 'uncommon': return 'Incomum';
      case 'rare': return 'Raro';
      case 'very_rare': return 'Muito Raro';
      case 'extremely_rare': return 'Extremamente Raro';
      default: return 'Desconhecido';
    }
  }

  // Dados especiais para Pokémon que não aparecem na API ou têm métodos especiais
  getSpecialLocationInfo(pokemonId: number): ProcessedPokemonLocation | null {
    const specialCases: Record<number, ProcessedPokemonLocation> = {
      // Starters
      1: {
        pokemonId: 1,
        pokemonName: 'bulbasaur',
        availableVersions: ['firered', 'leafgreen'],
        locations: [{
          locationName: 'starter',
          displayName: 'Laboratório do Prof. Oak - Pallet Town',
          encounters: [{
            version: 'both',
            method: 'Pokémon Inicial',
            minLevel: 5,
            maxLevel: 5,
            chance: 100,
            conditions: ['Escolha como starter'],
            rarity: 'common'
          }]
        }]
      },
      4: {
        pokemonId: 4,
        pokemonName: 'charmander',
        availableVersions: ['firered', 'leafgreen'],
        locations: [{
          locationName: 'starter',
          displayName: 'Laboratório do Prof. Oak - Pallet Town',
          encounters: [{
            version: 'both',
            method: 'Pokémon Inicial',
            minLevel: 5,
            maxLevel: 5,
            chance: 100,
            conditions: ['Escolha como starter'],
            rarity: 'common'
          }]
        }]
      },
      7: {
        pokemonId: 7,
        pokemonName: 'squirtle',
        availableVersions: ['firered', 'leafgreen'],
        locations: [{
          locationName: 'starter',
          displayName: 'Laboratório do Prof. Oak - Pallet Town',
          encounters: [{
            version: 'both',
            method: 'Pokémon Inicial',
            minLevel: 5,
            maxLevel: 5,
            chance: 100,
            conditions: ['Escolha como starter'],
            rarity: 'common'
          }]
        }]
      },
      // Pokémon de presente
      106: {
        pokemonId: 106,
        pokemonName: 'hitmonlee',
        availableVersions: ['firered', 'leafgreen'],
        locations: [{
          locationName: 'fighting-dojo',
          displayName: 'Dojo de Luta - Saffron City',
          encounters: [{
            version: 'both',
            method: 'Presente',
            minLevel: 30,
            maxLevel: 30,
            chance: 100,
            conditions: ['Derrote o mestre do dojo'],
            rarity: 'common'
          }]
        }]
      },
      107: {
        pokemonId: 107,
        pokemonName: 'hitmonchan',
        availableVersions: ['firered', 'leafgreen'],
        locations: [{
          locationName: 'fighting-dojo',
          displayName: 'Dojo de Luta - Saffron City',
          encounters: [{
            version: 'both',
            method: 'Presente',
            minLevel: 30,
            maxLevel: 30,
            chance: 100,
            conditions: ['Derrote o mestre do dojo'],
            rarity: 'common'
          }]
        }]
      },
      131: {
        pokemonId: 131,
        pokemonName: 'lapras',
        availableVersions: ['firered', 'leafgreen'],
        locations: [{
          locationName: 'silph-co',
          displayName: 'Silph Co. - Saffron City',
          encounters: [{
            version: 'both',
            method: 'Presente',
            minLevel: 25,
            maxLevel: 25,
            chance: 100,
            conditions: ['Receba do funcionário após derrotar Team Rocket'],
            rarity: 'common'
          }]
        }]
      },
      133: {
        pokemonId: 133,
        pokemonName: 'eevee',
        availableVersions: ['firered', 'leafgreen'],
        locations: [{
          locationName: 'celadon-city',
          displayName: 'Celadon City - Pokémon Mansion',
          encounters: [{
            version: 'both',
            method: 'Presente',
            minLevel: 25,
            maxLevel: 25,
            chance: 100,
            conditions: ['Receba no topo do Celadon Mansion'],
            rarity: 'common'
          }]
        }]
      },
      // Lendários
      144: {
        pokemonId: 144,
        pokemonName: 'articuno',
        availableVersions: ['firered', 'leafgreen'],
        locations: [{
          locationName: 'seafoam-islands',
          displayName: 'Seafoam Islands',
          encounters: [{
            version: 'both',
            method: 'Pokémon Lendário',
            minLevel: 50,
            maxLevel: 50,
            chance: 100,
            conditions: ['Único encontro', 'Quebrar pedras para chegar'],
            rarity: 'extremely_rare'
          }]
        }]
      },
      145: {
        pokemonId: 145,
        pokemonName: 'zapdos',
        availableVersions: ['firered', 'leafgreen'],
        locations: [{
          locationName: 'power-plant',
          displayName: 'Power Plant',
          encounters: [{
            version: 'both',
            method: 'Pokémon Lendário',
            minLevel: 50,
            maxLevel: 50,
            chance: 100,
            conditions: ['Único encontro', 'Requer Surf'],
            rarity: 'extremely_rare'
          }]
        }]
      },
      146: {
        pokemonId: 146,
        pokemonName: 'moltres',
        availableVersions: ['firered', 'leafgreen'],
        locations: [{
          locationName: 'mt-ember',
          displayName: 'Mt. Ember - One Island',
          encounters: [{
            version: 'both',
            method: 'Pokémon Lendário',
            minLevel: 50,
            maxLevel: 50,
            chance: 100,
            conditions: ['Único encontro', 'Requer Ruby e Sapphire'],
            rarity: 'extremely_rare'
          }]
        }]
      },
      150: {
        pokemonId: 150,
        pokemonName: 'mewtwo',
        availableVersions: ['firered', 'leafgreen'],
        locations: [{
          locationName: 'cerulean-cave',
          displayName: 'Cerulean Cave',
          encounters: [{
            version: 'both',
            method: 'Pokémon Lendário',
            minLevel: 70,
            maxLevel: 70,
            chance: 100,
            conditions: ['Único encontro', 'Após se tornar Campeão da Liga'],
            rarity: 'extremely_rare'
          }]
        }]
      },
      151: {
        pokemonId: 151,
        pokemonName: 'mew',
        availableVersions: ['firered', 'leafgreen'],
        locations: [{
          locationName: 'special-event',
          displayName: 'Evento Especial',
          encounters: [{
            version: 'both',
            method: 'Evento Nintendo',
            minLevel: 30,
            maxLevel: 30,
            chance: 100,
            conditions: ['Apenas via evento oficial ou glitch'],
            rarity: 'extremely_rare'
          }]
        }]
      },
      // Evoluções que só são obtidas por evolução
    //   2: null, // Ivysaur - evolução
    //   3: null, // Venusaur - evolução
    //   5: null, // Charmeleon - evolução
    //   6: null, // Charizard - evolução
    //   8: null, // Wartortle - evolução
    //   9: null, // Blastoise - evolução
      // Adicionar mais conforme necessário...
    };

    return specialCases[pokemonId] !== undefined ? specialCases[pokemonId] : null;
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

export const pokemonLocationApi = new PokemonLocationApiService();