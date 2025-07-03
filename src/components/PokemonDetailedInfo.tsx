import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Pokemon } from '../types/pokemon';
import { useTheme } from '../context/ThemeContext';
import { getTypeColor } from '../utils/typeColors';

interface PokemonDetailedInfoProps {
  pokemon: Pokemon;
}

export const PokemonDetailedInfo: React.FC<PokemonDetailedInfoProps> = ({ pokemon }) => {
  const { colors } = useTheme();

  const getBaseStatTotal = () => {
    return pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0);
  };

  const getStatGrade = (baseStat: number) => {
    if (baseStat >= 120) return 'S';
    if (baseStat >= 100) return 'A';
    if (baseStat >= 80) return 'B';
    if (baseStat >= 60) return 'C';
    if (baseStat >= 40) return 'D';
    return 'F';
  };

  const getStatGradeColor = (grade: string) => {
    switch (grade) {
      case 'S': return '#FF6B6B';
      case 'A': return '#4ECDC4';
      case 'B': return '#45B7D1';
      case 'C': return '#F7DC6F';
      case 'D': return '#F8C471';
      case 'F': return '#BDC3C7';
      default: return colors.textSecondary;
    }
  };

  const getGrowthRate = () => {
    const growthRates = ['slow', 'medium-slow', 'medium', 'medium-fast', 'fast', 'fluctuating'];
    return growthRates[pokemon.id % growthRates.length];
  };

  const getEggGroups = () => {
    const eggGroups: Record<string, string[]> = {
      'fire': ['Field', 'Dragon'],
      'water': ['Water 1', 'Water 2'],
      'grass': ['Grass', 'Monster'],
      'electric': ['Field', 'Fairy'],
      'psychic': ['Human-Like', 'Psychic'],
      'fighting': ['Human-Like', 'Field'],
      'poison': ['Grass', 'Dragon'],
      'ground': ['Field', 'Mineral'],
      'flying': ['Flying', 'Field'],
      'bug': ['Bug', 'Grass'],
      'rock': ['Mineral', 'Monster'],
      'ghost': ['Amorphous', 'Psychic'],
      'dragon': ['Dragon', 'Monster'],
      'dark': ['Field', 'Human-Like'],
      'steel': ['Mineral', 'Human-Like'],
      'fairy': ['Fairy', 'Field'],
      'ice': ['Field', 'Monster'],
      'normal': ['Field', 'Normal']
    };
    
    const primaryType = pokemon.types[0]?.type?.name || 'normal';
    return eggGroups[primaryType] || ['Field', 'Normal'];
  };

  const getCaptureRate = () => {
    const baseRate = Math.max(3, Math.min(255, 300 - pokemon.id * 2));
    return baseRate;
  };

  const getBaseHappiness = () => {
    return pokemon.types.some(t => t.type.name === 'fairy') ? 140 : 70;
  };

  const renderStatAnalysis = () => {
    const stats = pokemon.stats;
    const total = getBaseStatTotal();
    
    return (
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="bar-chart" size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Análise de Stats</Text>
        </View>
        
        <View style={styles.statAnalysisContainer}>
          <View style={styles.statAnalysisRow}>
            <View style={styles.statAnalysisItem}>
              <Text style={[styles.statAnalysisLabel, { color: colors.textSecondary }]}>Total</Text>
              <Text style={[styles.statAnalysisValue, { color: colors.text }]}>{total}</Text>
            </View>
            <View style={styles.statAnalysisItem}>
              <Text style={[styles.statAnalysisLabel, { color: colors.textSecondary }]}>Média</Text>
              <Text style={[styles.statAnalysisValue, { color: colors.text }]}>{Math.round(total / 6)}</Text>
            </View>
          </View>
          
          <View style={styles.statGradesContainer}>
            {stats.map((stat, index) => {
              const grade = getStatGrade(stat.base_stat);
              const gradeColor = getStatGradeColor(grade);
              
              return (
                <View key={index} style={styles.statGradeItem}>
                  <Text style={[styles.statGradeName, { color: colors.textSecondary }]}>
                    {stat.stat.name.replace('-', ' ').toUpperCase()}
                  </Text>
                  <View style={[styles.statGradeBadge, { backgroundColor: gradeColor }]}>
                    <Text style={styles.statGradeText}>{grade}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  const renderPhysicalInfo = () => {
    const height = pokemon.height ? pokemon.height / 10 : 0;
    const weight = pokemon.weight ? pokemon.weight / 10 : 0;
    const bmi = weight > 0 && height > 0 ? weight / Math.pow(height, 2) : 0;
    
    return (
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="fitness" size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Informações Físicas</Text>
        </View>
        
        <View style={styles.physicalInfoContainer}>
          <View style={styles.physicalInfoRow}>
            <View style={styles.physicalInfoItem}>
              <Ionicons name="resize" size={16} color={colors.textSecondary} />
              <Text style={[styles.physicalInfoLabel, { color: colors.textSecondary }]}>Altura</Text>
              <Text style={[styles.physicalInfoValue, { color: colors.text }]}>
                {height.toFixed(1)} m
              </Text>
            </View>
            
            <View style={styles.physicalInfoItem}>
              <Ionicons name="barbell" size={16} color={colors.textSecondary} />
              <Text style={[styles.physicalInfoLabel, { color: colors.textSecondary }]}>Peso</Text>
              <Text style={[styles.physicalInfoValue, { color: colors.text }]}>
                {weight.toFixed(1)} kg
              </Text>
            </View>
          </View>
          
          <View style={styles.physicalInfoRow}>
            <View style={styles.physicalInfoItem}>
              <Ionicons name="speedometer" size={16} color={colors.textSecondary} />
              <Text style={[styles.physicalInfoLabel, { color: colors.textSecondary }]}>IMC</Text>
              <Text style={[styles.physicalInfoValue, { color: colors.text }]}>
                {bmi > 0 ? bmi.toFixed(1) : 'N/A'}
              </Text>
            </View>
            
            <View style={styles.physicalInfoItem}>
              <Ionicons name="trophy" size={16} color={colors.textSecondary} />
              <Text style={[styles.physicalInfoLabel, { color: colors.textSecondary }]}>Raridade</Text>
              <Text style={[styles.physicalInfoValue, { color: colors.text }]}>
                {pokemon.id <= 150 ? 'Comum' : 'Raro'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderGameInfo = () => {
    const captureRate = getCaptureRate();
    const baseHappiness = getBaseHappiness();
    const growthRate = getGrowthRate();
    const eggGroups = getEggGroups();
    
    return (
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="game-controller" size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Informações de Jogo</Text>
        </View>
        
        <View style={styles.gameInfoContainer}>
          <View style={styles.gameInfoRow}>
            <Text style={[styles.gameInfoLabel, { color: colors.textSecondary }]}>Taxa de Captura:</Text>
            <Text style={[styles.gameInfoValue, { color: colors.text }]}>{captureRate}/255</Text>
          </View>
          
          <View style={styles.gameInfoRow}>
            <Text style={[styles.gameInfoLabel, { color: colors.textSecondary }]}>Felicidade Base:</Text>
            <Text style={[styles.gameInfoValue, { color: colors.text }]}>{baseHappiness}</Text>
          </View>
          
          <View style={styles.gameInfoRow}>
            <Text style={[styles.gameInfoLabel, { color: colors.textSecondary }]}>Taxa de Crescimento:</Text>
            <Text style={[styles.gameInfoValue, { color: colors.text }]}>{growthRate}</Text>
          </View>
          
          <View style={styles.gameInfoRow}>
            <Text style={[styles.gameInfoLabel, { color: colors.textSecondary }]}>Grupos de Ovos:</Text>
            <Text style={[styles.gameInfoValue, { color: colors.text }]}>{eggGroups.join(', ')}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderAbilitiesDetailed = () => {
    return (
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="flash" size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Habilidades</Text>
        </View>
        
        <View style={styles.abilitiesContainer}>
          {pokemon.abilities?.map((ability, index) => (
            <View key={index} style={[styles.abilityCard, { backgroundColor: colors.background }]}>
              <View style={styles.abilityHeader}>
                <Text style={[styles.abilityName, { color: colors.text }]}>
                  {ability.ability.name.replace('-', ' ').split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </Text>
                {ability.is_hidden && (
                  <View style={[styles.hiddenBadge, { backgroundColor: colors.warning }]}>
                    <Text style={styles.hiddenBadgeText}>Oculta</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.abilityDescription, { color: colors.textSecondary }]}>
                {ability.is_hidden 
                  ? 'Habilidade especial que só pode ser obtida através de métodos específicos.'
                  : 'Habilidade normal que pode ser encontrada naturalmente.'}
              </Text>
            </View>
          )) || []}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {renderStatAnalysis()}
      {renderPhysicalInfo()}
      {renderGameInfo()}
      {renderAbilitiesDetailed()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    borderRadius: 16,
    padding: 20,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  statAnalysisContainer: {
    gap: 16,
  },
  statAnalysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statAnalysisItem: {
    alignItems: 'center',
  },
  statAnalysisLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  statAnalysisValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statGradesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statGradeItem: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
  },
  statGradeName: {
    fontSize: 10,
    marginBottom: 4,
    textAlign: 'center',
  },
  statGradeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statGradeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  physicalInfoContainer: {
    gap: 16,
  },
  physicalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  physicalInfoItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  physicalInfoLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  physicalInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  gameInfoContainer: {
    gap: 12,
  },
  gameInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameInfoLabel: {
    fontSize: 14,
    flex: 1,
  },
  gameInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
  },
  abilitiesContainer: {
    gap: 12,
  },
  abilityCard: {
    borderRadius: 12,
    padding: 12,
  },
  abilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  abilityName: {
    fontSize: 16,
    fontWeight: '600',
  },
  hiddenBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  hiddenBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  abilityDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
});