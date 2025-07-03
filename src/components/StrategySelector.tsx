// src/components/StrategySelector.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TeamStrategy, TeamStrategyType, MonoTypeStrategy, TEAM_STRATEGIES } from '../types/teamStrategy';
import { POKEMON_TYPES } from '../utils/constants';
import { useTheme } from '../context/ThemeContext';
import { getTypeColor, getTypeGradient } from '../utils/typeColors';

interface StrategySelectorProps {
  currentStrategy: TeamStrategy | null;
  onStrategySelect: (strategy: TeamStrategy) => void;
  onClose: () => void;
  visible: boolean;
}

const { width } = Dimensions.get('window');

export const StrategySelector: React.FC<StrategySelectorProps> = ({
  currentStrategy,
  onStrategySelect,
  onClose,
  visible
}) => {
  const { colors, isDark } = useTheme();
  const [selectedType, setSelectedType] = useState<string>('fire');
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const handleStrategySelect = (strategyType: TeamStrategyType) => {
    if (strategyType === 'mono_type') {
      setShowTypeSelector(true);
    } else {
      const strategy = TEAM_STRATEGIES[strategyType];
      onStrategySelect(strategy);
      onClose();
    }
  };

  const handleMonoTypeSelect = (type: string) => {
    const baseStrategy = TEAM_STRATEGIES.mono_type;
    const monoStrategy: MonoTypeStrategy = {
      ...baseStrategy,
      selectedType: type,
      name: `Mono ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      description: `Equipe focada exclusivamente em Pokémon do tipo ${type}`,
      preferences: {
        ...baseStrategy.preferences,
        typeDistribution: {
          preferred: [type],
          avoided: [],
          maxSameType: 6
        }
      }
    };

    onStrategySelect(monoStrategy);
    setShowTypeSelector(false);
    onClose();
  };

  const renderStrategyCard = (strategyType: TeamStrategyType) => {
    const strategy = TEAM_STRATEGIES[strategyType];
    const isSelected = currentStrategy?.type === strategyType;

    return (
      <TouchableOpacity
        key={strategyType}
        style={[
          styles.strategyCard,
          {
            backgroundColor: colors.card,
            borderColor: isSelected ? colors.primary : colors.border
          }
        ]}
        onPress={() => handleStrategySelect(strategyType)}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons 
              name={strategy.icon as any} 
              size={24} 
              color={colors.primary}
            />
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.strategyName, { color: colors.text }]}>
              {strategy.name}
            </Text>
            <Text style={[styles.strategyDescription, { color: colors.textSecondary }]}>
              {strategy.description}
            </Text>
          </View>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
          )}
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Foco Principal:
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {getStrategyFocus(strategy)}
            </Text>
          </View>

          <View style={styles.tipsContainer}>
            <Text style={[styles.tipsTitle, { color: colors.text }]}>Dica:</Text>
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              {strategy.tips[0]}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTypeSelector = () => (
    <Modal
      visible={showTypeSelector}
      transparent
      animationType="slide"
      onRequestClose={() => setShowTypeSelector(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.typeModalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.typeModalHeader}>
            <Text style={[styles.typeModalTitle, { color: colors.text }]}>
              Escolha o Tipo para Mono Type
            </Text>
            <TouchableOpacity onPress={() => setShowTypeSelector(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.typeList} showsVerticalScrollIndicator={false}>
            <View style={styles.typeGrid}>
              {POKEMON_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeCard,
                    selectedType === type && styles.selectedTypeCard
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <LinearGradient
                    colors={getTypeGradient(type)}
                    style={styles.typeGradient}
                  >
                    <Text style={styles.typeText}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.typeModalActions}>
            <TouchableOpacity
              style={[styles.typeButton, { backgroundColor: colors.card }]}
              onPress={() => setShowTypeSelector(false)}
            >
              <Text style={[styles.typeButtonText, { color: colors.textSecondary }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, { backgroundColor: colors.primary }]}
              onPress={() => handleMonoTypeSelect(selectedType)}
            >
              <Text style={styles.typeButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const getStrategyFocus = (strategy: TeamStrategy): string => {
    const priorities = strategy.preferences.statPriorities;
    const maxStat = Object.entries(priorities).reduce((a, b) => a[1] > b[1] ? a : b);
    
    const statNames: Record<string, string> = {
      hp: 'HP e Resistência',
      attack: 'Ataque Físico',
      defense: 'Defesa Física',
      specialAttack: 'Ataque Especial',
      specialDefense: 'Defesa Especial',
      speed: 'Velocidade'
    };

    return statNames[maxStat[0]] || 'Equilibrado';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Escolha sua Estratégia
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Selecione uma estratégia para otimizar as recomendações da sua equipe
          </Text>

          <ScrollView 
            style={styles.strategiesList}
            showsVerticalScrollIndicator={false}
          >
            {Object.keys(TEAM_STRATEGIES).map(strategyType => 
              renderStrategyCard(strategyType as TeamStrategyType)
            )}
          </ScrollView>
        </View>
      </View>

      {renderTypeSelector()}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
  },
  strategiesList: {
    flex: 1,
    marginBottom: 20,
  },
  strategyCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  strategyName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  strategyDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  cardDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  tipsContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 8,
  },
  tipsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    lineHeight: 16,
  },
  // Type selector styles
  typeModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: '70%',
  },
  typeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  typeModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  typeList: {
    flex: 1,
    marginBottom: 20,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  typeCard: {
    width: '48%',
    height: 50,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
  },
  selectedTypeCard: {
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  typeGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  typeModalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 20,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});TEAM_STRATEGIES).map(strategyType => 
              renderStrategyCard(strategyType as TeamStrategyType)
            )}
          </ScrollView>
        </View>
      </View>

      {renderTypeSelector()}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
  },
  strategiesList: {
    flex: 1,
    marginBottom: 20,
  },
  strategyCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  strategyName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  strategyDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  cardDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  tipsContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 8,
  },
  tipsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    lineHeight: 16,
  },
  // Type selector styles
  typeModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: '70%',
  },
  typeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  typeModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  typeList: {
    flex: 1,
    marginBottom: 20,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  typeCard: {
    width: '48%',
    height: 50,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
  },
  selectedTypeCard: {
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  typeGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  typeModalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 20,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});