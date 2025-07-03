import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Pokemon } from '../types/pokemon';
import { useTeam } from '../hooks/useTeam';
import { usePokemonDetail } from '../hooks/usePokemon';
import { getTypeColor, getTypeGradient } from '../utils/typeColors';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface PokemonDetailScreenProps {
  navigation: any;
  route: {
    params: {
      pokemonId: number;
      pokemon?: Pokemon;
    };
  };
}

const { width } = Dimensions.get('window');

export const PokemonDetailScreen: React.FC<PokemonDetailScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { pokemonId, pokemon: initialPokemon } = route.params;
  const [activeTab, setActiveTab] = useState<'stats' | 'info'>('stats');
  
  const { pokemon: detailedPokemon, loading } = usePokemonDetail(
    initialPokemon ? null : pokemonId
  );
  
  const {
    addPokemonToTeam,
    removePokemonFromTeam,
    isPokemonInTeam,
    isTeamFull,
    team
  } = useTeam();

  const pokemon = initialPokemon || detailedPokemon;

  const handleAddToTeam = useCallback(async () => {
    if (!pokemon) return;

    if (isPokemonInTeam(pokemon.id)) {
      Alert.alert(
        'Remover da equipe',
        `Deseja remover ${pokemon.name} da sua equipe?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Remover', 
            style: 'destructive',
            onPress: async () => {
              try {
                const slotIndex = team.findIndex(p => p?.id === pokemon.id);
                if (slotIndex !== -1) {
                  await removePokemonFromTeam(slotIndex);
                  Alert.alert('Sucesso', `${pokemon.name} foi removido da equipe!`);
                }
              } catch (error) {
                Alert.alert(
                  'Erro',
                  error instanceof Error ? error.message : 'Erro ao remover Pokémon'
                );
              }
            }
          }
        ]
      );
      return;
    }

    if (isTeamFull()) {
      Alert.alert(
        'Equipe cheia',
        'Sua equipe já tem 6 Pokémon. Remova um Pokémon primeiro.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Ver Equipe', 
            onPress: () => navigation.navigate('Team') 
          }
        ]
      );
      return;
    }

    try {
      await addPokemonToTeam(pokemon);
      Alert.alert(
        'Sucesso!',
        `${pokemon.name} foi adicionado à sua equipe!`,
        [
          { text: 'OK' },
          { 
            text: 'Ver Equipe', 
            onPress: () => navigation.navigate('Team') 
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao adicionar Pokémon'
      );
    }
  }, [pokemon, isPokemonInTeam, isTeamFull, addPokemonToTeam, removePokemonFromTeam, team, navigation]);

  const handleGetRecommendations = useCallback(() => {
    if (!pokemon) return;
    
    navigation.navigate('Recommendations', { 
      targetPokemon: pokemon,
      currentTeam: team 
    });
  }, [pokemon, team, navigation]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner text="Carregando detalhes..." />
      </SafeAreaView>
    );
  }

  if (!pokemon) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Pokémon não encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  const primaryType = pokemon.types[0].type.name;
  const gradient = getTypeGradient(primaryType);
  const inTeam = isPokemonInTeam(pokemon.id);

  const getStatBarWidth = (baseStat: number) => {
    return Math.min((baseStat / 150) * 100, 100);
  };

  const getStatColor = (baseStat: number) => {
    if (baseStat >= 100) return '#4CAF50';
    if (baseStat >= 70) return '#FF9800';
    return '#F44336';
  };

  const renderStats = () => (
    <View style={styles.tabContent}>
      {pokemon.stats.map((stat, index) => (
        <View key={index} style={styles.statRow}>
          <Text style={styles.statName}>
            {stat.stat.name.replace('-', ' ').toUpperCase()}
          </Text>
          <Text style={styles.statValue}>{stat.base_stat}</Text>
          <View style={styles.statBarContainer}>
            <View 
              style={[
                styles.statBar,
                { 
                  width: `${getStatBarWidth(stat.base_stat)}%`,
                  backgroundColor: getStatColor(stat.base_stat)
                }
              ]} 
            />
          </View>
        </View>
      ))}
      
      <View style={styles.totalStatsContainer}>
        <Text style={styles.totalStatsText}>
          Total: {pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)}
        </Text>
      </View>
    </View>
  );

  const renderInfo = () => (
    <View style={styles.tabContent}>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Altura:</Text>
        <Text style={styles.infoValue}>{(pokemon.height / 10).toFixed(1)} m</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Peso:</Text>
        <Text style={styles.infoValue}>{(pokemon.weight / 10).toFixed(1)} kg</Text>
      </View>
      
      <View style={styles.infoSection}>
        <Text style={styles.infoSectionTitle}>Habilidades:</Text>
        {pokemon.abilities.map((ability, index) => (
          <View key={index} style={styles.abilityItem}>
            <Text style={styles.abilityName}>
              {ability.ability.name.replace('-', ' ')}
              {ability.is_hidden && ' (Oculta)'}
            </Text>
          </View>
        ))}
      </View>
      
      <View style={styles.infoSection}>
        <Text style={styles.infoSectionTitle}>Tipos:</Text>
        <View style={styles.typesContainer}>
          {pokemon.types.map((type, index) => (
            <View
              key={index}
              style={[
                styles.typeTagLarge,
                { backgroundColor: getTypeColor(type.type.name) }
              ]}
            >
              <Text style={styles.typeTextLarge}>
                {type.type.name.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={gradient}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.pokemonName}>
              {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
            </Text>
            <Text style={styles.pokemonId}>
              #{pokemon.id.toString().padStart(3, '0')}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.teamButton, inTeam && styles.teamButtonActive]}
            onPress={handleAddToTeam}
          >
            <Ionicons 
              name={inTeam ? "star" : "star-outline"} 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.imageContainer}>
          <Image
            source={{ 
              uri: pokemon.sprites.other['official-artwork'].front_default || 
                   pokemon.sprites.front_default 
            }}
            style={styles.pokemonImage}
            resizeMode="contain"
          />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
            onPress={() => setActiveTab('stats')}
          >
            <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
              Estatísticas
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'info' && styles.activeTab]}
            onPress={() => setActiveTab('info')}
          >
            <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>
              Informações
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.tabContainer} showsVerticalScrollIndicator={false}>
          {activeTab === 'stats' ? renderStats() : renderInfo()}
        </ScrollView>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleAddToTeam}
          >
            <Ionicons 
              name={inTeam ? "remove-circle" : "add-circle"} 
              size={20} 
              color="#fff" 
            />
            <Text style={styles.actionButtonText}>
              {inTeam ? 'Remover da Equipe' : 'Adicionar à Equipe'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleGetRecommendations}
          >
            <Ionicons name="bulb" size={20} color="#007AFF" />
            <Text style={[styles.actionButtonText, { color: '#007AFF' }]}>
              Ver Recomendações
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  pokemonName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  pokemonId: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginTop: 4,
  },
  teamButton: {
    padding: 8,
  },
  teamButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  imageContainer: {
    alignItems: 'center',
  },
  pokemonImage: {
    width: 200,
    height: 200,
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    paddingTop: 20,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#999',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContainer: {
    flex: 1,
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statName: {
    width: 100,
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  statValue: {
    width: 40,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
    marginRight: 12,
  },
  statBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  statBar: {
    height: '100%',
    borderRadius: 4,
  },
  totalStatsContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    alignItems: 'center',
  },
  totalStatsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  infoSection: {
    marginTop: 20,
  },
  infoSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  abilityItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  abilityName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  typesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  typeTagLarge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  typeTextLarge: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
});