import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Pokemon } from '../types/pokemon';
import { getTypeGradient } from '../utils/typeColors';

interface TeamSlotProps {
  pokemon: Pokemon | null;
  slotIndex: number;
  onPress: () => void;
  onLongPress?: () => void;
  showRemoveButton?: boolean;
  onRemove?: () => void;
}

const { width } = Dimensions.get('window');
const slotSize = (width - 80) / 3;

export const TeamSlot: React.FC<TeamSlotProps> = ({
  pokemon,
  slotIndex,
  onPress,
  onLongPress,
  showRemoveButton = false,
  onRemove
}) => {
  if (!pokemon) {
    return (
      <TouchableOpacity 
        style={styles.emptySlot} 
        onPress={onPress}
        onLongPress={onLongPress}
      >
        <View style={styles.emptySlotContent}>
          <Ionicons name="add-circle-outline" size={32} color="#ccc" />
          <Text style={styles.emptySlotText}>Slot {slotIndex + 1}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  const primaryType = pokemon.types[0].type.name;
  const gradient = getTypeGradient(primaryType);

  return (
    <TouchableOpacity 
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.container}
    >
      <LinearGradient
        colors={gradient}
        style={styles.filledSlot}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {showRemoveButton && onRemove && (
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={onRemove}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={20} color="#ff4444" />
          </TouchableOpacity>
        )}
        
        <View style={styles.slotNumber}>
          <Text style={styles.slotNumberText}>{slotIndex + 1}</Text>
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
          <Text style={styles.level}>Lv. 50</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: slotSize,
    height: slotSize + 20,
    marginBottom: 16,
  },
  emptySlot: {
    width: slotSize,
    height: slotSize + 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
  },
  emptySlotContent: {
    alignItems: 'center',
  },
  emptySlotText: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  filledSlot: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    padding: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
    zIndex: 10,
  },
  slotNumber: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotNumberText: {
    color: '#333',
    fontSize: 10,
    fontWeight: 'bold',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  image: {
    width: 50,
    height: 50,
  },
  info: {
    alignItems: 'center',
    marginTop: 4,
  },
  name: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  level: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    marginTop: 2,
  },
});