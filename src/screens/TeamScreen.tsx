import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { Pokemon } from '../types/pokemon';
import { useTeam } from '../hooks/useTeam';
import { TeamSlot } from '../components/TeamSlot';

interface TeamScreenProps {
  navigation: any;
}

export const TeamScreen: React.FC<TeamScreenProps> = ({ navigation }) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

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

  const teamStats = getTeamStats();

    useFocusEffect(
    useCallback(() => {
      reloadTeam();
    }, [reloadTeam])
  );

  const handleSlotPress = useCallback((slotIndex: number) => {
    const pokemon = team[slotIndex];
    
    if (pokemon) {
      // Se há um Pokémon no slot, navegar para detalhes
      navigation.navigate('PokemonDetail', { 
        pokemonId: pokemon.id,
        pokemon: pokemon 
      });
    } else {
      // Se slot vazio, navegar para seleção de Pokémon
      navigation.navigate('Home');
    }
  }, [team, navigation]);

  const handleSlotLongPress = useCallback((slotIndex: number) => {
    const pokemon = team[slotIndex];
    
    if (pokemon) {
      setSelectedSlot(slotIndex);
      Alert.alert(
        pokemon.name,
        'O que deseja fazer?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Ver Detalhes', 
            onPress: () => navigation.navigate('PokemonDetail', { 
              pokemonId: pokemon.id,
              pokemon: pokemon 
            })
          },
          { 
            text: 'Remover', 
            style: 'destructive',
            onPress: () => handleRemovePokemon(slotIndex)
          }
        ]
      );
    }
  }, [team, navigation]);

  const handleRemovePokemon = useCallback(async (slotIndex: number) => {
    const pokemon = team[slotIndex];
    if (!pokemon) return;

    Alert.alert(
      'Remover Pokémon',
      `Tem certeza que deseja remover ${pokemon.name} da equipe?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: async () => {
            try {
              await removePokemonFromTeam(slotIndex);
              Alert.alert('Sucesso', `${pokemon.name} foi removido da equipe!`);
            } catch (error) {
              Alert.alert(
                'Erro',
                error instanceof Error ? error.message : 'Erro ao remover Pokémon'
              );
            }
          }
        }
      ]
    );
  }, [team, removePokemonFromTeam]);

  const handleClearTeam = useCallback(() => {
    if (teamStats.teamSize === 0) {
      Alert.alert('Aviso', 'A equipe já está vazia!');
      return;
    }

    Alert.alert(
      'Limpar Equipe',
      'Tem certeza que deseja remover todos os Pokémon da equipe?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await clearTeam();
              Alert.alert('Sucesso', 'Equipe foi limpa!');
            } catch (error) {
              Alert.alert(
                'Erro',
                error instanceof Error ? error.message : 'Erro ao limpar equipe'
              );
            }
          }
        }
      ]
    );
  }, [teamStats.teamSize, clearTeam]);

  const handleSaveTeam = useCallback(() => {
    if (teamStats.teamSize === 0) {
      Alert.alert('Aviso', 'Não é possível salvar uma equipe vazia!');
      return;
    }
    setShowSaveModal(true);
  }, [teamStats.teamSize]);

  const confirmSaveTeam = useCallback(async () => {
    if (!teamName.trim()) {
      Alert.alert('Erro', 'Digite um nome para a equipe!');
      return;
    }

    try {
      await saveTeam(teamName.trim());
      setShowSaveModal(false);
      setTeamName('');
      Alert.alert('Sucesso', 'Equipe salva com sucesso!');
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao salvar equipe'
      );
    }
  }, [teamName, saveTeam]);

  const handleGetRecommendations = useCallback(() => {
    const activePokemon = team.filter(p => p !== null) as Pokemon[];
    
    if (activePokemon.length === 0) {
      Alert.alert(
        'Aviso', 
        'Adicione pelo menos um Pokémon à equipe para receber recomendações!'
      );
      return;
    }

    // Usar o primeiro Pokémon como base para recomendações
    const targetPokemon = activePokemon[0];
    navigation.navigate('Recommendations', { 
      targetPokemon,
      currentTeam: team 
    });
  }, [team, navigation]);

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

  const renderTeamStats = () => {
    if (teamStats.teamSize === 0) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Estatísticas da Equipe</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Pokémon</Text>
            <Text style={styles.statValue}>{teamStats.teamSize}/6</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>HP Médio</Text>
            <Text style={styles.statValue}>{teamStats.averageStats.hp}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Ataque Médio</Text>
            <Text style={styles.statValue}>{teamStats.averageStats.attack}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Defesa Média</Text>
            <Text style={styles.statValue}>{teamStats.averageStats.defense}</Text>
          </View>
        </View>

        {Object.keys(teamStats.typeDistribution).length > 0 && (
          <View style={styles.typesContainer}>
            <Text style={styles.typesTitle}>Distribuição de Tipos:</Text>
            <View style={styles.typesList}>
              {Object.entries(teamStats.typeDistribution).map(([type, count]) => (
                <View key={type} style={styles.typeItem}>
                  <Text style={styles.typeItemText}>
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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Minha Equipe</Text>
        <Text style={styles.headerSubtitle}>
          {teamStats.teamSize}/6 Pokémon
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.teamContainer}>
          {renderTeamSlots()}
        </View>

        {renderTeamStats()}

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleGetRecommendations}
            disabled={teamStats.teamSize === 0}
          >
            <Ionicons name="bulb" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Recomendações</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleSaveTeam}
            disabled={teamStats.teamSize === 0}
          >
            <Ionicons name="save" size={20} color="#007AFF" />
            <Text style={[styles.actionButtonText, { color: '#007AFF' }]}>
              Salvar Equipe
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleClearTeam}
            disabled={teamStats.teamSize === 0}
          >
            <Ionicons name="trash" size={20} color="#FF3B30" />
            <Text style={[styles.actionButtonText, { color: '#FF3B30' }]}>
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Salvar Equipe</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Nome da equipe..."
              value={teamName}
              onChangeText={setTeamName}
              autoFocus
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowSaveModal(false);
                  setTeamName('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={confirmSaveTeam}
              >
                <Text style={styles.modalSaveText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  content: {
    flex: 1,
  },
  teamContainer: {
    padding: 20,
  },
  slotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statsContainer: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
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
    color: '#333',
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
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  typesContainer: {
    marginTop: 8,
  },
  typesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  typesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeItem: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeItemText: {
    fontSize: 12,
    color: '#1976d2',
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
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  dangerButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF3B30',
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
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
  modalCancelButton: {
    backgroundColor: '#f8f9fa',
  },
  modalSaveButton: {
    backgroundColor: '#007AFF',
  },
  modalCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSaveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});