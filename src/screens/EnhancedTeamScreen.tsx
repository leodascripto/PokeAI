// src/screens/EnhancedTeamScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pokemon } from '../types/pokemon';
import { useTeam } from '../hooks/useTeam';
import { useTeamStrategy, useStrategyAnalysis } from '../hooks/useTeamStrategy';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import { TeamSlot } from '../components/TeamSlot';
import { StrategySelector } from '../components/StrategySelector';

interface EnhancedTeamScreenProps {
  navigation: any;
}

export const EnhancedTeamScreen: React.FC<EnhancedTeamScreenProps> = ({ navigation }) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [showStrategySelector, setShowStrategySelector] = useState(false);

  const { colors, isDark } = useTheme();
  const { showToast, ToastComponent } = useToast();

  const {
    team,
    loading,
    error,
    removePokemonFromTeam,
    movePokemon,
    clearTeam,
    saveTeam,
    getTeamStats,
    reloadTeam
  } = useTeam();

  const {
    currentStrategy,
    saveStrategy
  } = useTeamStrategy();

  const strategyAnalysis = useStrategyAnalysis(team, currentStrategy);
  const teamStats = getTeamStats();

  useFocusEffect(
    useCallback(() => {
      reloadTeam();
    }, [reloadTeam])
  );

  const handleSlotPress = useCallback((slotIndex: number) => {
    const pokemon = team[slotIndex];
    
    if (pokemon) {
      navigation.navigate('PokemonDetail', { 
        pokemonId: pokemon.id,
        pokemon: pokemon 
      });
    } else {
      navigation.navigate('Home');
    }
  }, [team, navigation]);

  const handleSlotLongPress = useCallback((slotIndex: number) => {
    const pokemon = team[slotIndex];
    
    if (pokemon) {
      setSelectedSlot(slotIndex);
      showToast(
        `${pokemon.name} - O que deseja fazer?`,
        'info',
        'Remover',
        () => handleRemovePokemon(slotIndex)
      );
    }
  }, [team, showToast]);

  const handleRemovePokemon = useCallback(async (slotIndex: number) => {
    const pokemon = team[slotIndex];
    if (!pokemon) return;

    try {
      await removePokemonFromTeam(slotIndex);
      showToast(`${pokemon.name} removido da equipe!`, 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Erro ao remover Pokémon',
        'error'
      );
    }
  }, [team, removePokemonFromTeam, showToast]);

  const handleClearTeam = useCallback(() => {
    if (teamStats.teamSize === 0) {
      showToast('A equipe já está vazia!', 'warning');
      return;
    }

    showToast(
      'Tem certeza que deseja limpar a equipe?',
      'warning',
      'Limpar',
      async () => {
        try {
          await clearTeam();
          showToast('Equipe limpa com sucesso!', 'success');
        } catch (error) {
          showToast(
            error instanceof Error ? error.message : 'Erro ao limpar equipe',
            'error'
          );
        }
      }
    );
  }, [teamStats.teamSize, clearTeam, showToast]);

  const handleSaveTeam = useCallback(() => {
    if (teamStats.teamSize === 0) {
      showToast('Não é possível salvar uma equipe vazia!', 'warning');
      return;
    }
    setShowSaveModal(true);
  }, [teamStats.teamSize, showToast]);

  const confirmSaveTeam = useCallback(async () => {
    if (!teamName.trim()) {
      showToast('Digite um nome para a equipe!', 'error');
      return;
    }

    try {
      await saveTeam(teamName.trim());
      setShowSaveModal(false);
      setTeamName('');
      showToast('Equipe salva com sucesso!', 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Erro ao salvar equipe',
        'error'
      );
    }
  }, [teamName, saveTeam, showToast]);

  const handleGetRecommendations = useCallback(() => {
    if (!currentStrategy) {
      showToast(
        'Selecione uma estratégia primeiro!',
        'warning',
        'Escolher',
        () => setShowStrategySelector(true)
      );
      return;
    }

    const activePokemon = team.filter(p => p !== null) as Pokemon[];
    
    if (activePokemon.length === 0) {
      showToast(
        'Adicione pelo menos um Pokémon à equipe!',
        'warning',
        'Adicionar',
        () => navigation.navigate('Home')
      );
      return;
    }

    navigation.navigate('Recommendations', { 
      currentTeam: team 
    });
  }, [team, currentStrategy, navigation, showToast]);

  const handleStrategyChange = useCallback(async (strategy: any) => {
    try {
      await saveStrategy(strategy);
      showToast(`Estratégia alterada para ${strategy.name}!`, 'success');
    } catch (error) {
      showToast('Erro ao salvar estratégia', 'error');
    }
  }, [saveStrategy, showToast]);

  const renderTeamSlots = () => {
    const rows = [];
    for (let i = 0; i < 6; i += 3) {
      const row = (
        <View key={`row-${i}`} style={styles.slotsRow}>
          {[0, 1, 2].map(offset => {
            const slotIndex = i + offset;
            return (
              <TeamSlot
                key={slotIndex}
                pokemon={team[slotIndex]}
                slotIndex={slotIndex}
                onPress={() => handleSlotPress(slotIndex)}
                onLongPress={() => handleSlotLongPress(slotIndex)}
                showRemoveButton={team[slotIndex] !== null}
                onRemove={() => handleRemovePokemon(slotIndex)}
              />
            );
          })}
        </View>
      );
      rows.push(row);
    }
    return rows;
  };

  const renderStrategyAnalysis = () => {
    if (!strategyAnalysis || !currentStrategy) return null;

    return (
      <View style={[styles.strategyContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.strategyHeader}>
          <Ionicons name="analytics" size={20} color={colors.primary} />
          <Text style={[styles.strategyTitle, { color: colors.text }]}>
            Estratégia: {currentStrategy.name}
          </Text>
          <TouchableOpacity onPress={() => setShowStrategySelector(true)}>
            <Ionicons name="settings" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.coverageContainer}>
          <Text style={[styles.coverageLabel, { color: colors.textSecondary }]}>
            Adequação à Estratégia
          </Text>
          <View style={[styles.coverageBar, { backgroundColor: colors.border }]}>
            <View 
              style={[
                styles.coverageFill,
                { 
                  width: `${strategyAnalysis.coverage}%`,
                  backgroundColor: getCoverageColor(strategyAnalysis.coverage, colors)
                }
              ]} 
            />
          </View>
          <Text style={[styles.coverageText, { color: colors.text }]}>
            {strategyAnalysis.coverage}%
          </Text>
        </View>

        {strategyAnalysis.strengths.length > 0 && (
          <View style={styles.analysisSection}>
            <Text style={[styles.sectionTitle, { color: colors.success }]}>
              ✓ Pontos Fortes
            </Text>
            {strategyAnalysis.strengths.slice(0, 2).map((strength, index) => (
              <Text key={index} style={[styles.analysisItem, { color: colors.text }]}>
                • {strength}
              </Text>
            ))}
          </View>
        )}

        {strategyAnalysis.weaknesses.length > 0 && (
          <View style={styles.analysisSection}>
            <Text style={[styles.sectionTitle, { color: colors.error }]}>
              ⚠ Áreas de Melhoria
            </Text>
            {strategyAnalysis.weaknesses.slice(0, 2).map((weakness, index) => (
              <Text key={index} style={[styles.analysisItem, { color: colors.text }]}>
                • {weakness}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderTeamStats = () => {
    if (teamStats.teamSize === 0) return null;

    return (
      <View style={[styles.statsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.statsTitle, { color: colors.text }]}>Estatísticas da Equipe</Text>
        
        <View style={styles.statsGrid}>
          <View style={[styles.statItem, { backgroundColor: colors.background }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pokémon</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{teamStats.teamSize}/6</Text>
          </View>
          
          <View style={[styles.statItem, { backgroundColor: colors.background }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>HP Médio</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{teamStats.averageStats.hp}</Text>
          </View>
          
          <View style={[styles.statItem, { backgroundColor: colors.background }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Ataque Médio</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{teamStats.averageStats.attack}</Text>
          </View>
          
          <View style={[styles.statItem, { backgroundColor: colors.background }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Defesa Média</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{teamStats.averageStats.defense}</Text>
          </View>
        </View>

        {Object.keys(teamStats.typeDistribution).length > 0 && (
          <View style={styles.typesContainer}>
            <Text style={[styles.typesTitle, { color: colors.text }]}>Distribuição de Tipos:</Text>
            <View style={styles.typesList}>
              {Object.entries(teamStats.typeDistribution).map(([type, count]) => (
                <View key={type} style={[styles.typeItem, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.typeItemText, { color: colors.primary }]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}: {count}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  const getCoverageColor = (coverage: number, colors: any) => {
    if (coverage >= 80) return colors.success;
    if (coverage >= 60) return colors.warning;
    return colors.error;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <LinearGradient
        colors={isDark ? ['#1a1a1a', '#2a2a2a'] : ['#667eea', '#764ba2']}
        style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 10 : 20 }]}
      >
        <Text style={styles.headerTitle}>Minha Equipe</Text>
        <Text style={styles.headerSubtitle}>
          {teamStats.teamSize}/6 Pokémon
        </Text>
        {currentStrategy && (
          <Text style={styles.headerStrategy}>
            Estratégia: {currentStrategy.name}
          </Text>
        )}
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.teamContainer}>
          {renderTeamSlots()}
        </View>

        {renderStrategyAnalysis()}
        {renderTeamStats()}

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleGetRecommendations}
          >
            <Ionicons name="bulb" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>
              {currentStrategy ? `Recomendações ${currentStrategy.name}` : 'Recomendações'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.info, borderWidth: 1 }]}
            onPress={() => setShowStrategySelector(true)}
          >
            <Ionicons name="settings" size={20} color={colors.info} />
            <Text style={[styles.actionButtonText, { color: colors.info }]}>
              Escolher Estratégia
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.primary, borderWidth: 1 }]}
            onPress={handleSaveTeam}
            disabled={teamStats.teamSize === 0}
          >
            <Ionicons name="save" size={20} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>
              Salvar Equipe
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.error, borderWidth: 1 }]}
            onPress={handleClearTeam}
            disabled={teamStats.teamSize === 0}
          >
            <Ionicons name="trash" size={20} color={colors.error} />
            <Text style={[styles.actionButtonText, { color: colors.error }]}>
              Limpar Equipe
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showSaveModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Salvar Equipe</Text>
            
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="Nome da equipe..."
              placeholderTextColor={colors.textSecondary}
              value={teamName}
              onChangeText={setTeamName}
              autoFocus
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: colors.card }]}
                onPress={() => {
                  setShowSaveModal(false);
                  setTeamName('');
                }}
              >
                <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={confirmSaveTeam}
              >
                <Text style={styles.modalSaveText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <StrategySelector
        visible={showStrategySelector}
        currentStrategy={currentStrategy}
        onStrategySelect={handleStrategyChange}
        onClose={() => setShowStrategySelector(false)}
      />
      
      <ToastComponent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  headerStrategy: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  teamContainer: {
    padding: 20,
  },
  slotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  strategyContainer: {
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  strategyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  strategyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  coverageContainer: {
    marginBottom: 16,
  },
  coverageLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  coverageBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  coverageFill: {
    height: '100%',
    borderRadius: 4,
  },
  coverageText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  analysisSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  analysisItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  statsContainer: {
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    width: '48%',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  typesContainer: {
    marginTop: 8,
  },
  typesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  typesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeItemText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionsContainer: {
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalSaveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});