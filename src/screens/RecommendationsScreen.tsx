import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Pokemon } from '../types/pokemon';
import { PokemonRecommendation } from '../types/team';
import { useRecommendations } from '../hooks/useTeam';
import { useTeam } from '../hooks/useTeam';
import { RecommendationCard } from '../components/RecommendationCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getTypeGradient } from '../utils/typeColors';

interface RecommendationsScreenProps {
  navigation: any;
  route: {
    params: {
      targetPokemon: Pokemon;
      currentTeam: (Pokemon | null)[];
    };
  };
}

export const RecommendationsScreen: React.FC<RecommendationsScreenProps> = ({
  navigation,
  route
}) => {
  const { targetPokemon, currentTeam } = route.params;
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    recommendations,
    loading,
    error,
    getRecommendations,
    clearRecommendations
  } = useRecommendations();
  
  const {
    addPokemonToTeam,
    isPokemonInTeam,
    isTeamFull
  } = useTeam();

  useEffect(() => {
    loadRecommendations();
    
    return () => {
      clearRecommendations();
    };
  }, [targetPokemon, currentTeam]);

  const loadRecommendations = useCallback(async () => {
    await getRecommendations(targetPokemon, currentTeam);
  }, [targetPokemon, currentTeam, getRecommendations]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadRecommendations();
    } finally {
      setRefreshing(false);
    }
  }, [loadRecommendations]);

  const handleRecommendationPress = useCallback((recommendation: PokemonRecommendation) => {
    navigation.navigate('PokemonDetail', {
      pokemonId: recommendation.pokemon.id,
      pokemon: recommendation.pokemon
    });
  }, [navigation]);

  const handleAddToTeam = useCallback(async (recommendation: PokemonRecommendation) => {
    const pokemon = recommendation.pokemon;
    
    if (isPokemonInTeam(pokemon.id)) {
      Alert.alert(
        'Pokémon já está na equipe',
        `${pokemon.name} já faz parte da sua equipe!`
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

    Alert.alert(
      'Adicionar à equipe',
      `Deseja adicionar ${pokemon.name} à sua equipe?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Adicionar', 
          onPress: async () => {
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
          }
        }
      ]
    );
  }, [isPokemonInTeam, isTeamFull, addPokemonToTeam, navigation]);

  const renderRecommendation = ({ item }: { item: PokemonRecommendation }) => (
    <RecommendationCard
      recommendation={item}
      onPress={() => handleRecommendationPress(item)}
      onAddToTeam={() => handleAddToTeam(item)}
    />
  );

  const renderHeader = () => {
    const primaryType = targetPokemon.types[0].type.name;
    const gradient = getTypeGradient(primaryType);

    return (
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
          
          <Text style={styles.headerTitle}>Recomendações</Text>
          
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={loading}
          >
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.targetPokemonContainer}>
          <Image
            source={{ 
              uri: targetPokemon.sprites.other['official-artwork'].front_default || 
                   targetPokemon.sprites.front_default 
            }}
            style={styles.targetPokemonImage}
            resizeMode="contain"
          />
          <View style={styles.targetPokemonInfo}>
            <Text style={styles.targetPokemonName}>
              {targetPokemon.name.charAt(0).toUpperCase() + targetPokemon.name.slice(1)}
            </Text>
            <Text style={styles.targetPokemonSubtitle}>
              Baseado neste Pokémon
            </Text>
          </View>
        </View>
      </LinearGradient>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bulb-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>
          Nenhuma recomendação encontrada
        </Text>
        <Text style={styles.emptySubtitle}>
          Tente adicionar mais Pokémon à sua equipe para obter melhores recomendações.
        </Text>
        <TouchableOpacity 
          style={styles.emptyButton}
          onPress={handleRefresh}
        >
          <Text style={styles.emptyButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (loading) return <LoadingSpinner style={styles.footerLoader} />;
    
    if (recommendations.length > 0) {
      return (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {recommendations.length} recomendação{recommendations.length !== 1 ? 'ões' : ''} encontrada{recommendations.length !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.footerSubtext}>
            Baseado em sinergia de tipos, complementaridade de stats e estratégia de equipe
          </Text>
        </View>
      );
    }
    
    return null;
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={64} color="#FF6B6B" />
          <Text style={styles.errorTitle}>Erro ao carregar recomendações</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRefresh}
          >
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={recommendations}
        renderItem={renderRecommendation}
        keyExtractor={(item) => item.pokemon.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContainer: {
    flexGrow: 1,
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
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
  },
  targetPokemonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  targetPokemonImage: {
    width: 60,
    height: 60,
    marginRight: 16,
  },
  targetPokemonInfo: {
    flex: 1,
  },
  targetPokemonName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  targetPokemonSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLoader: {
    marginVertical: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});