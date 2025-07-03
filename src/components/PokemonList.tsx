import React from 'react';
import { FlatList, View, StyleSheet, Text, RefreshControl, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pokemon } from '../types/pokemon';
import { PokemonCard } from './PokemonCard';
import { LoadingSpinner } from './LoadingSpinner';
import { useTheme } from '../context/ThemeContext';

interface PokemonListProps {
  pokemon: Pokemon[];
  loading: boolean;
  onPokemonPress: (pokemon: Pokemon) => void;
  onQuickAdd?: (pokemon: Pokemon) => void;
  teamPokemonIds?: number[];
  showEmpty?: boolean;
  emptyMessage?: string;
  refreshControl?: React.ReactElement<any>;
}

export const PokemonList: React.FC<PokemonListProps> = ({
  pokemon,
  loading,
  onPokemonPress,
  onQuickAdd,
  teamPokemonIds = [],
  showEmpty = true,
  emptyMessage = 'Nenhum Pokémon encontrado',
  refreshControl
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const renderPokemonCard = ({ item }: { item: Pokemon }) => (
    <PokemonCard
      pokemon={item}
      onPress={() => onPokemonPress(item)}
      onQuickAdd={onQuickAdd}
      isInTeam={teamPokemonIds.includes(item.id)}
    />
  );

  const renderEmpty = () => {
    if (loading) return <LoadingSpinner />;

    if (!showEmpty) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{emptyMessage}</Text>
      </View>
    );
  };

  const renderHeader = () => {
    if (loading || pokemon.length === 0) return null;

    return (
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: colors.textSecondary }]}>
          {pokemon.length} Pokémon{pokemon.length !== 1 ? 's' : ''} encontrado{pokemon.length !== 1 ? 's' : ''}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (loading) return <LoadingSpinner style={styles.footerLoader} />;
    
    // Espaço para tab bar considerando SafeArea
    const bottomSpace = insets.bottom + 90; // 70 (tab bar) + 20 (padding extra)
    
    return <View style={[styles.footerSpacer, { height: bottomSpace }]} />;
  };

  return (
    <FlatList
      data={pokemon}
      renderItem={renderPokemonCard}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
      getItemLayout={(data, index) => ({
        length: 240, // altura atualizada do card + margin
        offset: 240 * Math.floor(index / 2),
        index,
      })}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={8}
      updateCellsBatchingPeriod={50}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  footerLoader: {
    marginVertical: 20,
  },
  footerSpacer: {
    width: '100%',
  },
});