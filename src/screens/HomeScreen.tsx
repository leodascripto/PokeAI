// src/screens/HomeScreen.tsx - Enhanced with 3D support
import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  RefreshControl,
  TouchableOpacity,
  Platform,
  Alert,
  Text
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pokemon } from '../types/pokemon';
import { usePokemon } from '../hooks/usePokemon';
import { useTeam } from '../hooks/useTeam';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import { PokemonList } from '../components/PokemonList';
import { SafeAreaWrapper } from '../components/SafeAreaWrapper';
import { LoadingProgressIndicator } from '../components/LoadingProgressIndicator';

interface HomeScreenProps {
  navigation: any;
}

interface DisplaySettings {
  preferredDisplay: 'auto' | 'static' | 'animated' | '3d';
  autoFallback: boolean;
  showImageControls: boolean;
  enableHighQuality: boolean;
  preloadAssets: boolean;
}

const DEFAULT_SETTINGS: DisplaySettings = {
  preferredDisplay: 'auto',
  autoFallback: true,
  showImageControls: true,
  enableHighQuality: true,
  preloadAssets: false
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(DEFAULT_SETTINGS);
  const [firstLoad, setFirstLoad] = useState(true);
  
  const { colors, isDark, toggleTheme } = useTheme();
  const { showToast, ToastComponent } = useToast();
  
  const { 
    pokemon, 
    searchResults, 
    loading, 
    error, 
    loadingProgress,
    assetsStats,
    searchPokemon, 
    clearSearch,
    reloadPokemon,
    getAssetQualityStats 
  } = usePokemon({ 
    include3D: true,
    enableProgressTracking: true 
  });
  
  const { 
    team, 
    addPokemonToTeam, 
    isPokemonInTeam,
    isTeamFull 
  } = useTeam();

  const displayedPokemon = searchQuery.trim() ? searchResults : pokemon;
  const teamPokemonIds = team.filter(p => p !== null).map(p => p!.id);

  // Carregar configurações de display
  useEffect(() => {
    loadDisplaySettings();
  }, []);

  // Mostrar estatísticas quando carregamento completar
  useEffect(() => {
    if (loadingProgress.phase === 'complete' && firstLoad && assetsStats.total > 0) {
      setFirstLoad(false);
      setTimeout(() => {
        showAssetsStatistics();
      }, 1000);
    }
  }, [loadingProgress.phase, firstLoad, assetsStats]);

  const loadDisplaySettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('@display_settings');
      if (savedSettings) {
        setDisplaySettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de display:', error);
    }
  };

  const showAssetsStatistics = () => {
    const stats = getAssetQualityStats();
    if (!stats) return;

    const message = `🎮 Pokédex carregada com sucesso!\n\n` +
      `📊 Estatísticas:\n` +
      `• ${assetsStats.with3D} Pokémon com modelos 3D\n` +
      `• ${assetsStats.withAnimated} com sprites animados\n` +
      `• ${assetsStats.staticOnly} apenas com imagens estáticas\n\n` +
      `💡 Dica: Você pode configurar as preferências de exibição nas configurações!`;

    showToast(
      'Pokédex 3D carregada!',
      'success',
      'Configurar',
      () => navigation.navigate('DisplaySettings')
    );
  };

  useFocusEffect(
    useCallback(() => {
      if (pokemon.length === 0 && !loading) {
        reloadPokemon();
      }
      // Recarregar configurações quando voltar da tela de configurações
      loadDisplaySettings();
    }, [pokemon.length, loading, reloadPokemon])
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
      showToast('Pokédex atualizada com assets 3D!', 'success');
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
      
      // Mensagem especial para Pokémon com assets 3D
      const assetInfo = pokemon.assets?.has3D ? ' (com modelo 3D!)' : 
                       pokemon.assets?.hasAnimated ? ' (animado!)' : '';
      
      showToast(
        `${pokemon.name}${assetInfo} adicionado à equipe!`, 
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

  const handleOpenSettings = useCallback(() => {
    navigation.navigate('DisplaySettings');
  }, [navigation]);

  const getPreferredImageMode = (): 'static' | 'animated' | '3d' => {
    switch (displaySettings.preferredDisplay) {
      case '3d':
        return '3d';
      case 'animated':
        return 'animated';
      case 'static':
        return 'static';
      case 'auto':
      default:
        // Auto: priorizar 3D > Animado > Estático baseado na disponibilidade
        return 'animated'; // Padrão para auto
    }
  };

  const renderHeader = () => (
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
      
      <View style={styles.headerActions}>
        {/* Botão de configurações de display */}
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.card }]}
          onPress={handleOpenSettings}
        >
          <Ionicons name="settings" size={20} color={colors.primary} />
          {/* Indicador de qualidade dos assets */}
          {assetsStats.with3D > 0 && (
            <View style={[styles.qualityIndicator, { backgroundColor: colors.success }]}>
              <Ionicons name="cube" size={8} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>
        
        {/* Botão de tema */}
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.card }]}
          onPress={toggleTheme}
        >
          <Ionicons 
            name={isDark ? 'sunny' : 'moon'} 
            size={20} 
            color={colors.primary} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAssetsInfo = () => {
    if (assetsStats.total === 0 || searchQuery.trim()) return null;

    return (
      <View style={[styles.assetsInfo, { backgroundColor: colors.card }]}>
        <View style={styles.assetsInfoContent}>
          <Ionicons name="information-circle" size={16} color={colors.primary} />
          <Text style={[styles.assetsInfoText, { color: colors.text }]}>
            {assetsStats.with3D} modelos 3D • {assetsStats.withAnimated} sprites animados
          </Text>
        </View>
        <TouchableOpacity onPress={handleOpenSettings}>
          <Ionicons name="settings" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  const customRefreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      colors={[colors.primary]}
      tintColor={colors.primary}
      progressBackgroundColor={colors.surface}
      title="Atualizando assets 3D..."
      titleColor={colors.textSecondary}
    />
  );

  return (
    <SafeAreaWrapper style={{ backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {renderHeader()}
      {renderAssetsInfo()}

      <PokemonList
        pokemon={displayedPokemon}
        loading={loading && pokemon.length === 0} // Só mostrar loading se não tiver Pokémon carregados
        onPokemonPress={handlePokemonPress}
        onQuickAdd={handleQuickAdd}
        teamPokemonIds={teamPokemonIds}
        showEmpty={true}
        emptyMessage={
          searchQuery.trim() 
            ? `Nenhum Pokémon encontrado para "${searchQuery}"` 
            : 'Nenhum Pokémon disponível'
        }
        refreshControl={customRefreshControl}
        // Passar configurações de display para os cards
        preferredImageMode={getPreferredImageMode()}
        showImageControls={displaySettings.showImageControls}
      />
      
      {/* Indicador de progresso para carregamento inicial */}
      <LoadingProgressIndicator
        visible={loading && pokemon.length === 0}
        current={loadingProgress.current}
        total={loadingProgress.total}
        phase={loadingProgress.phase}
        assetsStats={assetsStats.total > 0 ? assetsStats : undefined}
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
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
    position: 'relative',
  },
  qualityIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assetsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
  },
  assetsInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assetsInfoText: {
    fontSize: 14,
    fontWeight: '500',
  },
});