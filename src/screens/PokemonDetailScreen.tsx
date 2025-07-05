// src/screens/PokemonDetailScreen.tsx - SCROLL CORRIGIDO
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Pokemon } from '../types/pokemon';
import { useTeam } from '../hooks/useTeam';
import { usePokemonDetail } from '../hooks/usePokemon';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import { getTypeColor, getTypeGradient } from '../utils/typeColors';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PokemonDetailedInfo } from '../components/PokemonDetailedInfo';
import { PokemonLocationInfo } from '../components/PokemonLocationInfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const [activeTab, setActiveTab] = useState<'stats' | 'info' | 'detailed' | 'location'>('stats');
  const insets = useSafeAreaInsets();
  
  const { colors, isDark } = useTheme();
  const { showToast, ToastComponent } = useToast();
  
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
      const slotIndex = team.findIndex(p => p?.id === pokemon.id);
      if (slotIndex !== -1) {
        try {
          await removePokemonFromTeam(slotIndex);
          showToast(`${pokemon.name} removido da equipe!`, 'success');
        } catch (error) {
          showToast(
            error instanceof Error ? error.message : 'Erro ao remover Pokémon',
            'error'
          );
        }
      }
      return;
    }

    if (isTeamFull()) {
      showToast(
        'Equipe cheia! Remova um Pokémon primeiro.', 
        'warning',
        'Ver Equipe',
        () => navigation.navigate('Team')
      );
      return;
    }

    try {
      await addPokemonToTeam(pokemon);
      showToast(
        `${pokemon.name} adicionado à equipe!`, 
        'success',
        'Ver Equipe',
        () => navigation.navigate('Team')
      );
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Erro ao adicionar Pokémon',
        'error'
      );
    }
  }, [pokemon, isPokemonInTeam, isTeamFull, addPokemonToTeam, removePokemonFromTeam, team, navigation, showToast]);

  const handleGetRecommendations = useCallback(() => {
    if (!pokemon) return;
    
    navigation.navigate('Recommendations', { 
      currentTeam: team 
    });
  }, [pokemon, team, navigation]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <LoadingSpinner text="Carregando detalhes..." />
      </SafeAreaView>
    );
  }

  if (!pokemon) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={64} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.text }]}>Pokémon não encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  const primaryType = pokemon.types[0].type.name;
  const gradient = getTypeGradient(primaryType) as [string, string, ...string[]];
  const inTeam = isPokemonInTeam(pokemon.id);

  const getStatBarWidth = (baseStat: number) => {
    return Math.min((baseStat / 150) * 100, 100);
  };

  const getStatColor = (baseStat: number) => {
    if (baseStat >= 100) return colors.success;
    if (baseStat >= 70) return colors.warning;
    return colors.error;
  };

  const renderStats = () => (
    <View style={styles.tabContent}>
      {pokemon.stats.map((stat, index) => (
        <View key={index} style={styles.statRow}>
          <Text style={[styles.statName, { color: colors.textSecondary }]}>
            {stat.stat.name.replace('-', ' ').toUpperCase()}
          </Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{stat.base_stat}</Text>
          <View style={[styles.statBarContainer, { backgroundColor: colors.border }]}>
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
      
      <View style={[styles.totalStatsContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.totalStatsText, { color: colors.text }]}>
          Total: {pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)}
        </Text>
      </View>
    </View>
  );

  const renderInfo = () => (
    <View style={styles.tabContent}>
      <View style={styles.infoRow}>
        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Altura:</Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>{(pokemon.height / 10).toFixed(1)} m</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Peso:</Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>{(pokemon.weight / 10).toFixed(1)} kg</Text>
      </View>
      
      <View style={styles.infoSection}>
        <Text style={[styles.infoSectionTitle, { color: colors.text }]}>Habilidades:</Text>
        {pokemon.abilities.map((ability, index) => (
          <View key={index} style={[styles.abilityItem, { backgroundColor: colors.card }]}>
            <Text style={[styles.abilityName, { color: colors.text }]}>
              {ability.ability.name.replace('-', ' ')}
              {ability.is_hidden && ' (Oculta)'}
            </Text>
          </View>
        ))}
      </View>
      
      <View style={styles.infoSection}>
        <Text style={[styles.infoSectionTitle, { color: colors.text }]}>Tipos:</Text>
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'stats':
        return renderStats();
      case 'info':
        return renderInfo();
      case 'detailed':
        return <PokemonDetailedInfo pokemon={pokemon} />;
      case 'location':
        return <PokemonLocationInfo pokemon={pokemon} />;
      default:
        return renderStats();
    }
  };

  const actionButtonHeight = 80;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      
      {/* Header fixo */}
      <LinearGradient
        colors={gradient}
        style={[styles.header, { paddingTop: insets.top }]}
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

      {/* Content área */}
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        {/* Tabs fixas */}
        <View style={[styles.tabs, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'stats' && [styles.activeTab, { borderBottomColor: colors.primary }]
            ]}
            onPress={() => setActiveTab('stats')}
          >
            <Text style={[
              styles.tabText, 
              { color: activeTab === 'stats' ? colors.primary : colors.textSecondary }
            ]}>
              Stats
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'info' && [styles.activeTab, { borderBottomColor: colors.primary }]
            ]}
            onPress={() => setActiveTab('info')}
          >
            <Text style={[
              styles.tabText, 
              { color: activeTab === 'info' ? colors.primary : colors.textSecondary }
            ]}>
              Info
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'detailed' && [styles.activeTab, { borderBottomColor: colors.primary }]
            ]}
            onPress={() => setActiveTab('detailed')}
          >
            <Text style={[
              styles.tabText, 
              { color: activeTab === 'detailed' ? colors.primary : colors.textSecondary }
            ]}>
              Detalhes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'location' && [styles.activeTab, { borderBottomColor: colors.primary }]
            ]}
            onPress={() => setActiveTab('location')}
          >
            <Text style={[
              styles.tabText, 
              { color: activeTab === 'location' ? colors.primary : colors.textSecondary }
            ]}>
              Local
            </Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo scrollável da aba ativa */}
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: actionButtonHeight + insets.bottom + 20 }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          {renderTabContent()}
        </ScrollView>
      </View>

      {/* Botões de ação fixos na parte inferior */}
      <View style={[
        styles.actions, 
        { 
          backgroundColor: colors.surface, 
          borderTopColor: colors.border,
          paddingBottom: insets.bottom 
        }
      ]}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
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
          style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.primary, borderWidth: 1 }]}
          onPress={handleGetRecommendations}
        >
          <Ionicons name="bulb" size={20} color={colors.primary} />
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>
            Ver Recomendações
          </Text>
        </TouchableOpacity>
      </View>
      
      <ToastComponent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 10,
  },
  tabContent: {
    paddingHorizontal: 20,
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
  },
  statValue: {
    width: 40,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    marginRight: 12,
  },
  statBarContainer: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  statBar: {
    height: '100%',
    borderRadius: 4,
  },
  totalStatsContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  totalStatsText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    marginTop: 20,
  },
  infoSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  abilityItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  abilityName: {
    fontSize: 14,
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
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
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
    marginTop: 16,
  },
});