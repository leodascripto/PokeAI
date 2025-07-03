import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Pokemon } from '../types/pokemon';
import { useTheme } from '../context/ThemeContext';
import { getTypeColor, getTypeGradient } from '../utils/typeColors';

interface PokemonCardProps {
  pokemon: Pokemon;
  onPress: () => void;
  onQuickAdd?: (pokemon: Pokemon) => void;
  isInTeam?: boolean;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2;

export const PokemonCard: React.FC<PokemonCardProps> = ({ 
  pokemon, 
  onPress, 
  onQuickAdd,
  isInTeam = false 
}) => {
  const { colors, isDark } = useTheme();
  const primaryType = pokemon.types[0].type.name;
  const gradient = getTypeGradient(primaryType);

  const handleQuickAdd = (e: any) => {
    e.stopPropagation();
    if (onQuickAdd) {
      onQuickAdd(pokemon);
    }
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <LinearGradient
        colors={gradient}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {isInTeam && (
          <View style={styles.teamBadge}>
            <Ionicons name="star" size={16} color="#333" />
          </View>
        )}
        
        <View style={styles.header}>
          <Text style={styles.id}>#{pokemon.id.toString().padStart(3, '0')}</Text>
          {onQuickAdd && !isInTeam && (
            <TouchableOpacity 
              style={styles.quickAddButton}
              onPress={handleQuickAdd}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="add-circle" size={20} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.imageContainer}>
          <Image
            source={{ 
              uri: pokemon.sprites.other['official-artwork'].front_default || 
                   pokemon.sprites.front_default 
            }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
          </Text>
          
          <View style={styles.types}>
            {pokemon.types.map((type, index) => (
              <View
                key={index}
                style={[
                  styles.typeTag,
                  { backgroundColor: getTypeColor(type.type.name) }
                ]}
              >
                <Text style={styles.typeText}>
                  {type.type.name.toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
          
          <View style={styles.statsPreview}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>HP</Text>
              <Text style={styles.statValue}>{pokemon.stats[0].base_stat}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>ATK</Text>
              <Text style={styles.statValue}>{pokemon.stats[1].base_stat}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>DEF</Text>
              <Text style={styles.statValue}>{pokemon.stats[2].base_stat}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    marginBottom: 16,
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
    position: 'relative',
    minHeight: 200,
  },
  teamBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  id: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: 'bold',
  },
  quickAddButton: {
    padding: 2,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  image: {
    width: 80,
    height: 80,
  },
  info: {
    alignItems: 'center',
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  types: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 8,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  typeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 4,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    fontWeight: '500',
  },
  statValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
});