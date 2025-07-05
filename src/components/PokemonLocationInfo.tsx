import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Pokemon } from '../types/pokemon';
import { ProcessedPokemonLocation, ProcessedEncounter, GameVersion } from '../types/pokemonLocation';
import { usePokemonLocation } from '../hooks/usePokemonLocation';
import { useTheme } from '../context/ThemeContext';
import { pokemonLocationApi } from '../services/pokemonLocationApi';
import { LoadingSpinner } from './LoadingSpinner';

interface PokemonLocationInfoProps {
  pokemon: Pokemon;
}

export const PokemonLocationInfo: React.FC<PokemonLocationInfoProps> = ({ pokemon }) => {
  const { colors } = useTheme();
  const { location, loading, error, isEvolutionOnly } = usePokemonLocation(pokemon.id);

  const getGameVersionIcon = (versions: string[]) => {
    if (versions.includes('firered') && versions.includes('leafgreen')) {
      return '🔴🍃'; // Both versions
    } else if (versions.includes('firered')) {
      return '🔴'; // FireRed only
    } else if (versions.includes('leafgreen')) {
      return '🍃'; // LeafGreen only
    }
    return '🎮';
  };

  const getGameVersionText = (versions: string[]) => {
    if (versions.includes('firered') && versions.includes('leafgreen')) {
      return 'FireRed & LeafGreen';
    } else if (versions.includes('firered')) {
      return 'Apenas FireRed';
    } else if (versions.includes('leafgreen')) {
      return 'Apenas LeafGreen';
    }
    return 'Ambas as versões';
  };

  const renderEncounter = (encounter: ProcessedEncounter, index: number) => {
    const rarityColor = pokemonLocationApi.getRarityColor(encounter.rarity);
    const rarityLabel = pokemonLocationApi.getRarityLabel(encounter.rarity);

    return (
      <View key={index} style={[styles.encounterCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <View style={styles.encounterHeader}>
          <View style={styles.encounterMethod}>
            <Ionicons name="location" size={16} color={colors.primary} />
            <Text style={[styles.methodText, { color: colors.text }]}>{encounter.method}</Text>
          </View>
          <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
            <Text style={styles.rarityText}>{rarityLabel}</Text>
          </View>
        </View>

        <View style={styles.encounterDetails}>
          <View style={styles.levelInfo}>
            <Ionicons name="trending-up" size={14} color={colors.textSecondary} />
            <Text style={[styles.levelText, { color: colors.textSecondary }]}>
              Nível {encounter.minLevel}
              {encounter.minLevel !== encounter.maxLevel && `-${encounter.maxLevel}`}
            </Text>
          </View>

          <View style={styles.chanceInfo}>
            <Ionicons name="analytics" size={14} color={colors.textSecondary} />
            <Text style={[styles.chanceText, { color: colors.textSecondary }]}>
              {encounter.chance}% de chance
            </Text>
          </View>
        </View>

        {encounter.conditions.length > 0 && (
          <View style={styles.conditionsContainer}>
            <Text style={[styles.conditionsTitle, { color: colors.textSecondary }]}>Condições:</Text>
            {encounter.conditions.map((condition, condIndex) => (
              <View key={condIndex} style={[styles.conditionTag, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.conditionText, { color: colors.primary }]}>{condition}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.versionInfo}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            {encounter.version === 'both' ? 'Ambas versões' : 
             encounter.version === 'firered' ? 'FireRed' : 'LeafGreen'}
          </Text>
        </View>
      </View>
    );
  };

  const renderLocation = (locationData: any, index: number) => {
    return (
      <View key={index} style={[styles.locationContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.locationHeader}>
          <Ionicons name="map" size={20} color={colors.primary} />
          <Text style={[styles.locationName, { color: colors.text }]}>{locationData.displayName}</Text>
        </View>

        <View style={styles.encountersContainer}>
          {locationData.encounters.map((encounter: ProcessedEncounter, encIndex: number) => 
            renderEncounter(encounter, encIndex)
          )}
        </View>
      </View>
    );
  };

  const renderEvolutionOnlyMessage = () => (
    <View style={[styles.messageContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Ionicons name="arrow-up-circle" size={48} color={colors.primary} />
      <Text style={[styles.messageTitle, { color: colors.text }]}>Apenas por Evolução</Text>
      <Text style={[styles.messageText, { color: colors.textSecondary }]}>
        Este Pokémon não pode ser encontrado na natureza. Obtenha através de evolução, troca ou como presente.
      </Text>
    </View>
  );

  const renderNoLocationMessage = () => (
    <View style={[styles.messageContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Ionicons name="help-circle" size={48} color={colors.textSecondary} />
      <Text style={[styles.messageTitle, { color: colors.text }]}>Localização Desconhecida</Text>
      <Text style={[styles.messageText, { color: colors.textSecondary }]}>
        Não foi possível encontrar informações de localização para este Pokémon.
      </Text>
    </View>
  );

  const renderErrorMessage = () => (
    <View style={[styles.messageContainer, { backgroundColor: colors.card, borderColor: colors.error }]}>
      <Ionicons name="warning" size={48} color={colors.error} />
      <Text style={[styles.messageTitle, { color: colors.text }]}>Erro ao Carregar</Text>
      <Text style={[styles.messageText, { color: colors.textSecondary }]}>
        {error || 'Ocorreu um erro ao carregar as informações de localização.'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner text="Carregando localizações..." />
      </View>
    );
  }

  if (error) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {renderErrorMessage()}
      </ScrollView>
    );
  }

  if (isEvolutionOnly) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {renderEvolutionOnlyMessage()}
      </ScrollView>
    );
  }

  if (!location) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {renderNoLocationMessage()}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header com informações das versões */}
      <View style={[styles.headerContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.headerContent}>
          <Text style={styles.gameVersionIcon}>{getGameVersionIcon(location.availableVersions)}</Text>
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Disponível em:</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {getGameVersionText(location.availableVersions)}
            </Text>
          </View>
        </View>
      </View>

      {/* Lista de localizações */}
      <View style={styles.locationsContainer}>
        {location.locations.map((locationData, index) => renderLocation(locationData, index))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameVersionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  locationsContainer: {
    gap: 16,
    paddingBottom: 20,
  },
  locationContainer: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationName: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  encountersContainer: {
    gap: 12,
  },
  encounterCard: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  encounterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  encounterMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rarityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  encounterDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 12,
    marginLeft: 4,
  },
  chanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chanceText: {
    fontSize: 12,
    marginLeft: 4,
  },
  conditionsContainer: {
    marginTop: 8,
  },
  conditionsTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  conditionTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  conditionText: {
    fontSize: 10,
    fontWeight: '500',
  },
  versionInfo: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  versionText: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  messageContainer: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 20,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});