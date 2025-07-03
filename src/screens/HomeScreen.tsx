import React, { useState, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  SafeAreaView,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Pokemon } from '../types/pokemon';
import { usePokemon } from '../hooks/usePokemon';
import { useTeam } from '../hooks/useTeam';
import { PokemonList } from '../components/PokemonList';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const { 
    pokemon, 
    searchResults, 
    loading, 
    error, 
    searchPokemon, 
    clearSearch,
    reloadPokemon 
  } = usePokemon();
  
  const { 
    team, 
    addPokemonToTeam, 
    isPokemonInTeam,
    isTeamFull 
  } = useTeam();

  const displayedPokemon = searchQuery.trim() ? searchResults : pokemon;
  const teamPokemonIds = team.filter(p => p !== null).map(p => p!.id);

  useFocusEffect(
    useCallback(() => {
      // Recarregar dados quando a tela ganhar foco
      if (pokemon.length === 0) {
        reloadPokemon();
      }
    }, [pokemon.length, reloadPokemon])
  );

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchPokemon(query);
    } else {
      clearSearch();
    }
  }, [searchPokemon, clearSearch]);

  const handlePokemonPress = useCallback((selectedPokemon: Pokemon) => {
    navigation.navigate('PokemonDetail', { 
      pokemonId: selectedPokemon.id,
      pokemon: selectedPokemon 
    });
  }, [navigation]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reloadPokemon();
      if (searchQuery.trim()) {
        await searchPokemon(searchQuery);
      }
    } finally {
      setRefreshing(false);
    }
  }, [reloadPokemon, searchPokemon, searchQuery]);

  const showAddToTeamAlert = useCallback((pokemon: Pokemon) => {
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar Pokémon..."
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <Ionicons 
              name="close-circle" 
              size={20} 
              color="#999" 
              style={styles.clearIcon}
              onPress={() => handleSearch('')}
            />
          )}
        </View>
      </View>

      <PokemonList
        pokemon={displayedPokemon}
        loading={loading}
        onPokemonPress={handlePokemonPress}
        teamPokemonIds={teamPokemonIds}
        showEmpty={true}
        emptyMessage={
          searchQuery.trim() 
            ? `Nenhum Pokémon encontrado para "${searchQuery}"` 
            : 'Nenhum Pokémon disponível'
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearIcon: {
    marginLeft: 10,
  },
});