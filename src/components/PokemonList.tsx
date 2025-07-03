import React from 'react';
import { FlatList, View, StyleSheet, Text } from 'react-native';
import { Pokemon } from '../types/pokemon';
import { PokemonCard } from './PokemonCard';
import { LoadingSpinner } from './LoadingSpinner';

interface PokemonListProps {
  pokemon: Pokemon[];
  loading: boolean;
  onPokemonPress: (pokemon: Pokemon) => void;
  teamPokemonIds?: number[];
  showEmpty?: boolean;
  emptyMessage?: string;
}

export const PokemonList: React.FC<PokemonListProps> = ({
  pokemon,
  loading,
  onPokemonPress,
  teamPokemonIds = [],
  showEmpty = true,
  emptyMessage = 'Nenhum Pokémon encontrado'
}) => {
  const renderPokemonCard = ({ item }: { item: Pokemon }) => (
    <PokemonCard
      pokemon={item}
      onPress={() => onPokemonPress(item)}
      isInTeam={teamPokemonIds.includes(item.id)}
    />
  );

  const renderEmpty = () => {
    if (loading) return <LoadingSpinner />;

    if (!showEmpty) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  };

  const renderHeader = () => {
    if (loading || pokemon.length === 0) return null;

    return (
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {pokemon.length} Pokémon{pokemon.length !== 1 ? 's' : ''} encontrado{pokemon.length !== 1 ? 's' : ''}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (loading) return <LoadingSpinner style={styles.footerLoader} />;
    return null;
  };

  return (
    <FlatList
      data={pokemon}
      renderItem={renderPokemonCard}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      showsVerticalScrollIndicator={false}
      getItemLayout={(data, index) => ({
        length: 180, // altura aproximada do card + margin
        offset: 180 * Math.floor(index / 2),
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
    paddingBottom: 100, // espaço extra para navegação
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
    color: '#666',
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
    color: '#999',
    textAlign: 'center',
  },
  footerLoader: {
    marginVertical: 20,
  },
});