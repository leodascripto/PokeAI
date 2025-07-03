import React, { useState, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  RefreshControl,
  TouchableOpacity,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Pokemon } from '../types/pokemon';
import { usePokemon } from '../hooks/usePokemon';
import { useTeam } from '../hooks/useTeam';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import { PokemonList } from '../components/PokemonList';
import { SafeAreaWrapper } from '../components/SafeAreaWrapper';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const { colors, isDark, toggleTheme } = useTheme();
  const { showToast, ToastComponent } = useToast();
  
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
      showToast('Pokédex atualizada!', 'success');
    } catch (error) {
      showToast('Erro ao atualizar a Pokédex', 'error');
    } finally {
      setRefreshing(false);
    }
  }, [reloadPokemon, searchPokemon, searchQuery, showToast]);

  const handleQuickAdd = useCallback(async (pokemon: Pokemon) => {
    if (isPokemonInTeam(pokemon.id)) {
      showToast(`${pokemon.name} já está na equipe!`, 'warning');
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
  }, [isPokemonInTeam, isTeamFull, addPokemonToTeam, navigation, showToast]);

  return (
    <SafeAreaWrapper style={{ backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar Pokémon..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={[styles.themeButton, { backgroundColor: colors.card }]}
          onPress={toggleTheme}
        >
          <Ionicons 
            name={isDark ? 'sunny' : 'moon'} 
            size={24} 
            color={colors.primary} 
          />
        </TouchableOpacity>
      </View>

      <PokemonList
        pokemon={displayedPokemon}
        loading={loading}
        onPokemonPress={handlePokemonPress}
        onQuickAdd={handleQuickAdd}
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
            colors={[colors.primary]}
            tintColor={colors.primary}
            progressBackgroundColor={colors.surface}
          />
        }
      />
      
      <ToastComponent />
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 50,
    marginRight: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  themeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
});