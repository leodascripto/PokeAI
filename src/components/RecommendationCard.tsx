import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PokemonRecommendation, SynergyType } from '../types/team';
import { getTypeGradient } from '../utils/typeColors';

interface RecommendationCardProps {
  recommendation: PokemonRecommendation;
  onPress: () => void;
  onAddToTeam: () => void;
}

const synergyIcons: Record<SynergyType, string> = {
  type_balance: 'scale-outline',  // ✅ Ícone válido para balanço
  stat_complement: 'stats-chart',
  move_coverage: 'shield-checkmark',
  defensive_wall: 'shield',
  offensive_core: 'flash'
};

const synergyLabels: Record<SynergyType, string> = {
  type_balance: 'Equilíbrio',
  stat_complement: 'Complemento',
  move_coverage: 'Cobertura',
  defensive_wall: 'Defesa',
  offensive_core: 'Ataque'
};

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onPress,
  onAddToTeam
}) => {
  const { pokemon, score, reasons, synergy } = recommendation;
  const primaryType = pokemon.types[0].type.name;
  const gradient = getTypeGradient(primaryType);

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Boa';
    return 'Regular';
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <LinearGradient
        colors={[...gradient, 'rgba(255,255,255,0.1)']}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.pokemonInfo}>
            <Image
              source={{ 
                uri: pokemon.sprites.other['official-artwork'].front_default || 
                     pokemon.sprites.front_default 
              }}
              style={styles.image}
              resizeMode="contain"
            />
            <View style={styles.nameContainer}>
              <Text style={styles.name}>
                {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
              </Text>
              <Text style={styles.id}>#{pokemon.id.toString().padStart(3, '0')}</Text>
            </View>
          </View>
          
          <View style={styles.scoreContainer}>
            <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(score) }]}>
              <Text style={styles.scoreText}>{Math.round(score)}</Text>
            </View>
            <Text style={[styles.scoreLabel, { color: getScoreColor(score) }]}>
              {getScoreLabel(score)}
            </Text>
          </View>
        </View>

        {synergy.length > 0 && (
          <View style={styles.synergyContainer}>
            <Text style={styles.synergyTitle}>Sinergias:</Text>
            <View style={styles.synergyList}>
              {synergy.slice(0, 3).map((type, index) => (
                <View key={index} style={styles.synergyItem}>
                  <Ionicons 
                    name={synergyIcons[type] as any} 
                    size={14} 
                    color="rgba(255,255,255,0.9)" 
                  />
                  <Text style={styles.synergyText}>
                    {synergyLabels[type]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.reasonsContainer}>
          <Text style={styles.reasonsTitle}>Por que combina:</Text>
          {reasons.slice(0, 2).map((reason, index) => (
            <Text key={index} style={styles.reasonText}>
              • {reason}
            </Text>
          ))}
        </View>

        <View style={styles.footer}>
          <View style={styles.types}>
            {pokemon.types.map((type, index) => (
              <View key={index} style={styles.typeTag}>
                <Text style={styles.typeText}>
                  {type.type.name.toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={(e) => {
              e.stopPropagation();
              onAddToTeam();
            }}
          >
            <Ionicons name="add-circle" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 8,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pokemonInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  id: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 50,
    alignItems: 'center',
  },
  scoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  synergyContainer: {
    marginBottom: 12,
  },
  synergyTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  synergyList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  synergyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  synergyText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  reasonsContainer: {
    marginBottom: 12,
  },
  reasonsTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  reasonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  types: {
    flexDirection: 'row',
    flex: 1,
    gap: 6,
  },
  typeTag: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 8,
    marginLeft: 12,
  },
});