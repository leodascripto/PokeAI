// src/components/StrategySelector.tsx - VERSÃO FINAL CORRIGIDA
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  TeamStrategy, 
  TeamStrategyType, 
  MonoTypeStrategy, 
  TEAM_STRATEGIES,
  validateStrategies 
} from '../types/teamStrategy';
import { POKEMON_TYPES } from '../utils/constants';
import { useTheme } from '../context/ThemeContext';
import { getTypeGradient } from '../utils/typeColors';

interface StrategySelectorProps {
  currentStrategy: TeamStrategy | null;
  onStrategySelect: (strategy: TeamStrategy) => void;
  onClose: () => void;
  visible: boolean;
}

const { width, height } = Dimensions.get('window');

export const StrategySelector: React.FC<StrategySelectorProps> = ({
  currentStrategy,
  onStrategySelect,
  onClose,
  visible
}) => {
  const { colors, isDark } = useTheme();
  const [selectedType, setSelectedType] = useState<string>('fire');
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [strategiesLoaded, setStrategiesLoaded] = useState(false);

  // Verificar se as estratégias estão carregadas corretamente
  useEffect(() => {
    if (visible) {
      console.log('🔍 StrategySelector: Verificando estratégias...');
      const isValid = validateStrategies();
      setStrategiesLoaded(isValid);
      
      if (!isValid) {
        console.error('❌ Estratégias não carregadas corretamente');
        Alert.alert('Erro', 'Erro ao carregar estratégias');
      } else {
        console.log('✅ Estratégias carregadas com sucesso');
      }
    }
  }, [visible]);

  const handleStrategySelect = (strategyType: TeamStrategyType) => {
    console.log('🎯 Selecionando estratégia:', strategyType);
    
    try {
      if (strategyType === 'mono_type') {
        setShowTypeSelector(true);
        return;
      }

      const strategy = TEAM_STRATEGIES[strategyType];
      if (!strategy) {
        throw new Error(`Estratégia ${strategyType} não encontrada`);
      }

      console.log('✅ Estratégia selecionada:', strategy.name);
      onStrategySelect(strategy);
      onClose();
    } catch (error) {
      console.error('❌ Erro ao selecionar estratégia:', error);
      Alert.alert('Erro', 'Erro ao selecionar estratégia');
    }
  };

  const handleMonoTypeSelect = (type: string) => {
    console.log('🎯 Selecionando mono-type:', type);
    
    try {
      const baseStrategy = TEAM_STRATEGIES.mono_type;
      if (!baseStrategy) {
        throw new Error('Estratégia mono_type não encontrada');
      }

      const monoStrategy: MonoTypeStrategy = {
        ...baseStrategy,
        type: "mono_type",
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

      console.log('✅ Mono-type criado:', monoStrategy.name);
      onStrategySelect(monoStrategy);
      setShowTypeSelector(false);
      onClose();
    } catch (error) {
      console.error('❌ Erro ao criar mono-type:', error);
      Alert.alert('Erro', 'Erro ao criar estratégia mono-type');
    }
  };

  const getStrategyIcon = (iconName: string): any => {
    const iconMap: Record<string, string> = {
      'balance': 'balance',
      'funnel': 'funnel',
      'flash': 'flash',
      'shield': 'shield',
      'speedometer': 'speedometer',
      'partly-sunny': 'partly-sunny',
      'people': 'people',
      'hourglass': 'hourglass'
    };

    return iconMap[iconName] || 'settings';
  };

  const getStrategyFocus = (strategy: TeamStrategy): string => {
    try {
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
    } catch (error) {
      console.error('Erro ao calcular foco da estratégia:', error);
      return 'Equilibrado';
    }
  };

  const renderStrategyCard = (strategyType: TeamStrategyType, index: number) => {
    try {
      const strategy = TEAM_STRATEGIES[strategyType];
      if (!strategy) {
        console.warn(`Estratégia ${strategyType} não encontrada`);
        return null;
      }

      const isSelected = currentStrategy?.type === strategyType;
      
      return (
        <TouchableOpacity
          key={`${strategyType}-${index}`}
          style={[
            styles.strategyCard,
            {
              backgroundColor: colors.card,
              borderColor: isSelected ? colors.primary : colors.border,
              borderWidth: isSelected ? 2 : 1,
            }
          ]}
          onPress={() => handleStrategySelect(strategyType)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons 
                name={getStrategyIcon(strategy.icon)} 
                size={24} 
                color={colors.primary}
              />
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.strategyName, { color: colors.text }]}>
                {strategy.name}
              </Text>
              <Text style={[styles.strategyDescription, { color: colors.textSecondary }]} numberOfLines={2}>
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
                Foco:
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={1}>
                {getStrategyFocus(strategy)}
              </Text>
            </View>

            <View style={[styles.tipsContainer, { backgroundColor: colors.primary + '10' }]}>
              <Text style={[styles.tipText, { color: colors.textSecondary }]} numberOfLines={2}>
                💡 {strategy.tips[0]}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    } catch (error) {
      console.error(`Erro ao renderizar card da estratégia ${strategyType}:`, error);
      return null;
    }
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
              Escolha o Tipo
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
                    selectedType === type && [styles.selectedTypeCard, { borderColor: colors.primary }]
                  ]}
                  onPress={() => setSelectedType(type)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={getTypeGradient(type) as [import('react-native').ColorValue, import('react-native').ColorValue, ...import('react-native').ColorValue[]]}
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
              style={[styles.typeButton, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
              onPress={() => setShowTypeSelector(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.typeButtonText, { color: colors.textSecondary }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, { backgroundColor: colors.primary }]}
              onPress={() => handleMonoTypeSelect(selectedType)}
              activeOpacity={0.7}
            >
              <Text style={[styles.typeButtonText, { color: '#fff' }]}>
                Confirmar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (!visible) return null;

  const strategiesArray = Object.keys(TEAM_STRATEGIES) as TeamStrategyType[];
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Escolha sua Estratégia
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Subtitle */}
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Selecione uma estratégia para otimizar as recomendações da sua equipe
          </Text>

          {/* Lista de Estratégias */}
          <ScrollView 
            style={styles.strategiesList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
          >
            {strategiesLoaded && strategiesArray.length > 0 ? (
              strategiesArray.map((strategyType, index) => 
                renderStrategyCard(strategyType, index)
              )
            ) : (
              <View style={styles.loadingContainer}>
                <Text style={[styles.loadingText, { color: colors.text }]}>
                  {strategiesLoaded ? '❌ Nenhuma estratégia disponível' : '⏳ Carregando estratégias...'}
                </Text>
              </View>
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
    maxHeight: height * 0.85,
    minHeight: height * 0.6,
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
    flex: 1,
  },
  closeButton: {
    padding: 8,
    marginRight: -8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
  },
  strategiesList: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  strategyCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
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
    flex: 1,
    textAlign: 'right',
  },
  tipsContainer: {
    borderRadius: 8,
    padding: 12,
  },
  tipText: {
    fontSize: 12,
    lineHeight: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  // Type selector styles
  typeModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: height * 0.7,
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
    flex: 1,
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
    fontSize: 16,
    fontWeight: '600',
  },
});