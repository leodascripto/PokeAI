// src/components/PokemonCard.tsx - VERSÃO SIMPLIFICADA SEM CORS
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Pokemon } from '../types/pokemon';
import { useTheme } from '../context/ThemeContext';
import { getTypeColor, getTypeGradient } from '../utils/typeColors';
import { EnhancedPokemonImage } from './EnhancedPokemonImage';

interface PokemonCardProps {
  pokemon: Pokemon;
  onPress: () => void;
  onQuickAdd?: (pokemon: Pokemon) => void;
  isInTeam?: boolean;
  showImageControls?: boolean;
  preferredImageMode?: 'static' | 'animated' | '3d';
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2;

export const PokemonCard: React.FC<PokemonCardProps> = ({ 
  pokemon, 
  onPress, 
  onQuickAdd,
  isInTeam = false,
  showImageControls = false,
  preferredImageMode = 'static'
}) => {
  const { colors, isDark } = useTheme();
  const [currentImageMode, setCurrentImageMode] = useState<'static' | 'animated' | '3d'>(preferredImageMode);
  const primaryType = pokemon.types[0].type.name;
  const gradient = getTypeGradient(primaryType) as [string, string];

  const handleQuickAdd = (e: any) => {
    e.stopPropagation();
    if (onQuickAdd) {
      onQuickAdd(pokemon);
    }
  };

  const handleImageModeChange = (mode: 'static' | 'animated' | '3d') => {
    setCurrentImageMode(mode);
  };

  const renderQualityIndicator = () => {
    if (!pokemon.assets) return null;

    const qualityIcons = {
      high: 'diamond',
      medium: 'star',
      low: 'image'
    };

    const qualityColors = {
      high: colors.success,
      medium: colors.warning,
      low: colors.textSecondary
    };

    return (
      <View style={[styles.qualityIndicator, { backgroundColor: qualityColors[pokemon.assets.quality] }]}>
        <Ionicons 
          name={qualityIcons[pokemon.assets.quality] as any} 
          size={10} 
          color="#FFFFFF" 
        />
      </View>
    );
  };

  const renderAssetsBadges = () => {
    if (!pokemon.assets) return null;

    const badges = [];
    
    if (pokemon.assets.hasAnimated) {
      badges.push(
        <View key="animated" style={[styles.assetBadge, { backgroundColor: colors.warning }]}>
          <Ionicons name="play" size={8} color="#FFFFFF" />
        </View>
      );
    }

    if (pokemon.assets.quality === 'high') {
      badges.push(
        <View key="hd" style={[styles.assetBadge, { backgroundColor: colors.success }]}>
          <Text style={styles.assetBadgeText}>HD</Text>
        </View>
      );
    }

    if (badges.length === 0) return null;

    return (
      <View style={styles.assetBadgesContainer}>
        {badges}
      </View>
    );
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
          <View style={styles.headerActions}>
            {renderQualityIndicator()}
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
        </View>
        
        <View style={styles.imageContainer}>
          <EnhancedPokemonImage
            pokemon={pokemon}
            width={80}
            height={80}
            showControls={showImageControls}
            defaultView={currentImageMode}
            onViewChange={handleImageModeChange}
          />
          {renderAssetsBadges()}
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

          {/* Indicador simples de qualidade */}
          {pokemon.assets && (
            <View style={styles.assetsInfo}>
              <Text style={styles.assetsInfoText}>
                {pokemon.assets.hasAnimated ? '🎬' : '📷'} {pokemon.assets.quality.toUpperCase()}
              </Text>
            </View>
          )}
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
    minHeight: 220,
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
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  id: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: 'bold',
  },
  quickAddButton: {
    padding: 2,
  },
  qualityIndicator: {
    borderRadius: 8,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 8,
    position: 'relative',
  },
  assetBadgesContainer: {
    position: 'absolute',
    top: -4,
    left: -4,
    flexDirection: 'row',
    gap: 2,
  },
  assetBadge: {
    borderRadius: 6,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  assetBadgeText: {
    color: '#FFFFFF',
    fontSize: 6,
    fontWeight: 'bold',
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
    marginBottom: 8,
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
  assetsInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  assetsInfoText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 8,
    fontWeight: '500',
  },
});