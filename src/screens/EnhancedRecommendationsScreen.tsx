// src/screens/EnhancedRecommendationsScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Pokemon } from '../types/pokemon';
import { PokemonRecommendation } from '../types/team';
import { useTeam } from '../hooks/useTeam';
import { useTeamStrategy, useStrategyAnalysis } from '../hooks/useTeamStrategy';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import { RecommendationCard } from '../components/RecommendationCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SafeAreaWrapper } from '../components/SafeAreaWrapper';
import { StrategySelector } from '../components/StrategySelector';
import { getTypeGradient } from '../utils/typeColors';

interface EnhancedRecommendationsScreenProps {
  navigation: any;
  route: {
    params: {
      targetPokemon?: Pokemon;
      currentTeam: (Pokemon | null)[];
    };
  };
}

export const EnhancedRecommendationsScreen: React.FC<EnhancedRecommendationsScreenProps> = ({
  navigation,
  route
}) => {
  const { currentTeam } = route.params;
  const [refreshing, setRefreshing] = useState(false);
  const [showStrategySelector, setShowStrategySelector] = useState(false);
  
  const { colors, isDark } = useTheme();
  const { showToast, ToastComponent } = useToast();
  
  const {
    currentStrategy,
    strategyResults,
    loading,
    error,
    saveStrategy,
    getStrategyRecommendations,
    clearResults
  } = useTeamStrategy();

  const strategyAnalysis = useStrategyAnalysis(currentTeam, currentStrategy);
  
  const {
    addPokemonToTeam,
    isPokemonInTeam,
    isTeamFull
  } = useTeam();

  useEffect(() => {
    if (currentStrategy) {
      loadRecommendations();
    }
    
    return () => {
      clearResults();
    };
  }, [currentStrategy]);

  const loadRecommendations = useCallback(async () => {
    if (!currentStrategy) return;
    await getStrategyRecommendations(currentTeam);
  }, [currentStrategy, currentTeam, getStrategyRecommendations]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadRecommendations();
      showToast('Recomendações atualizadas!', 'success');
    } catch (error) {
      showToast('Erro ao atualizar recomendações', 'error');
    } finally {
      setRefreshing(false);
    }
  }, [loadRecommendations, showToast]);

  const handleStrategyChange = useCallback(async (strategy: any) => {
    try {
      await saveStrategy(strategy);
      showToast(`Estratégia alterada para ${strategy.name}!`, 'success');
      // As recomendações serão recarregadas automaticamente pelo useEffect
    } catch (error) {
      showToast('Erro ao salvar estratégia', 'error');
    }
  }, [saveStrategy, showToast]);

  const handleRecommendationPress = useCallback((recommendation: PokemonRecommendation) => {
    navigation.navigate('PokemonDetail', {
      pokemonId: recommendation.pokemon.id,
      pokemon: recommendation.pokemon
    });
  }, [navigation]);

  const handleAddToTeam = useCallback(async (recommendation: PokemonRecommendation) => {
    const pokemon = recommendation.pokemon;
    
    if (isPokemonInTeam(pokemon.id)) {
      showToast(`${pokemon.name} já está na equipe!`, 'warning');
      return;
    }

    if (isTeamFull()) {
      showToast(
        'Equipe cheia! Remova um Pokémon primeiro.',
        'warning',
        'Ver Equipe',
        () => navigation.navigate('Team')
      );
      return;
    }

    try {
      await addPokemonToTeam(pokemon);
      showToast(
        `${pokemon.name} adicionado à equipe!`,
        'success',
        'Ver Equipe',
        () => navigation.navigate('Team')
      );
      // Recarregar recomendações após adicionar
      await loadRecommendations();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Erro ao adicionar Pokémon',
        'error'
      );
    }
  }, [isPokemonInTeam, isTeamFull, addPokemonToTeam, navigation, showToast, loadRecommendations]);

  const renderRecommendation = ({ item }: { item: PokemonRecommendation }) => (
    <RecommendationCard
      recommendation={item}
      onPress={() => handleRecommendationPress(item)}
      onAddToTeam={() => handleAddToTeam(item)}
    />
  );

  const renderStrategyAnalysis = () => {
    if (!strategyAnalysis || !currentStrategy) return null;

    return (
      <View style={[styles.analysisContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.analysisHeader}>
          <Ionicons name="analytics" size={20} color={colors.primary} />
          <Text style={[styles.analysisTitle, { color: colors.text }]}>
            Análise da Estratégia: {currentStrategy.name}
          </Text>
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
                  backgroundColor: getCoverageColor(strategyAnalysis.coverage)
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
            {strategyAnalysis.strengths.map((strength, index) => (
              <Text key={index} style={[styles.analysisItem, { color: colors.text }]}>
                • {strength}
              </Text>
            ))}
          </View>
        )}

        {strategyAnalysis.weaknesses.length > 0 && (
          <View style={styles.analysisSection}>
            <Text style={[styles.sectionTitle, { color: colors.error }]}>
              ⚠ Pontos Fracos
            </Text>
            {strategyAnalysis.weaknesses.map((weakness, index) => (
              <Text key={index} style={[styles.analysisItem, { color: colors.text }]}>
                • {weakness}
              </Text>
            ))}
          </View>
        )}

        {strategyAnalysis.recommendations.length > 0 && (
          <View style={styles.analysisSection}>
            <Text style={[styles.sectionTitle, { color: colors.warning }]}>
              💡 Recomendações
            </Text>
            {strategyAnalysis.recommendations.map((rec, index) => (
              <Text key={index} style={[styles.analysisItem, { color: colors.text }]}>
                • {rec}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderStrategyWarnings = () => {
    if (!strategyResults?.warnings || strategyResults.warnings.length === 0) return null;

    return (
      <View style={[styles.warningsContainer, { backgroundColor: colors.error + '20', borderColor: colors.error }]}>
        <View style={styles.warningsHeader}>
          <Ionicons name="warning" size={20} color={colors.error} />
          <Text style={[styles.warningsTitle, { color: colors.error }]}>
            Avisos Importantes
          </Text>
        </View>
        {strategyResults.warnings.map((warning, index) => (
          <Text key={index} style={[styles.warningItem, { color: colors.error }]}>
            • {warning}
          </Text>
        ))}
      </View>
    );
  };

  const renderStrategyTips = () => {
    if (!strategyResults?.strategyTips || strategyResults.strategyTips.length === 0) return null;

    return (
      <View style={[styles.tipsContainer, { backgroundColor: colors.info + '20', borderColor: colors.info }]}>
        <View style={styles.tipsHeader}>
          <Ionicons name="bulb" size={20} color={colors.info} />
          <Text style={[styles.tipsTitle, { color: colors.info }]}>
            Dicas Estratégicas
          </Text>
        </View>
        {strategyResults.strategyTips.map((tip, index) => (
          <Text key={index} style={[styles.tipItem, { color: colors.text }]}>
            • {tip}
          </Text>
        ))}
      </View>
    );
  };

  const renderHeader = () => {
    const teamPokemon = currentTeam.filter(p => p !== null) as Pokemon[];
    const gradient = teamPokemon.length > 0 
      ? getTypeGradient(teamPokemon[0].types[0].type.name)
      : ['#667eea', '#764ba2'];

    return (
      <LinearGradient
        colors={gradient}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Recomendações</Text>
          
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={loading}
          >
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.strategyButton}
          onPress={() => setShowStrategySelector(true)}
        >
          <View style={styles.strategyButtonContent}>
            <Ionicons name="settings" size={20} color="#fff" />
            <Text style={styles.strategyButtonText}>
              Estratégia: {currentStrategy?.name || 'Selecionar'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
      </LinearGradient>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bulb-outline" size={64} color={colors.textSecondary} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          Nenhuma recomendação encontrada
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Tente uma estratégia diferente ou adicione mais Pokémon à sua equipe.
        </Text>
        <TouchableOpacity 
          style={[styles.emptyButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowStrategySelector(true)}
        >
          <Text style={styles.emptyButtonText}>Escolher Estratégia</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (loading) return <LoadingSpinner style={styles.footerLoader} />;
    
    if (strategyResults?.recommendations && strategyResults.recommendations.length > 0) {
      return (
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text }]}>
            {strategyResults.recommendations.length} recomendação{strategyResults.recommendations.length !== 1 ? 'ões' : ''} 
            para estratégia {currentStrategy?.name}
          </Text>
        </View>
      );
    }
    
    return null;
  };

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 80) return colors.success;
    if (coverage >= 60) return colors.warning;
    return colors.error;
  };

  if (error) {
    return (
      <SafeAreaWrapper style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={64} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Erro ao carregar recomendações</Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.error }]}
            onPress={handleRefresh}
          >
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
        <ToastComponent />
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      
      <FlatList
        data={strategyResults?.recommendations || []}
        renderItem={renderRecommendation}
        keyExtractor={(item) => item.pokemon.id.toString()}
        ListHeaderComponent={() => (
          <View>
            {renderHeader()}
            {renderStrategyAnalysis()}
            {renderStrategyWarnings()}
            {renderStrategyTips()}
          </View>
        )}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContainer}
        style={{ backgroundColor: colors.background }}
      />

      <StrategySelector
        visible={showStrategySelector}
        currentStrategy={currentStrategy}
        onStrategySelect={handleStrategyChange}
        onClose={() => setShowStrategySelector(false)}
      />
      
      <ToastComponent />
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
  },
  strategyButton: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 12,
  },
  strategyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  strategyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  analysisContainer: {
    margin: 20,
    borderRadius: 16,
    padding: 20,
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
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
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
  warningsContainer: {
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  warningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  warningsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  warningItem: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  tipsContainer: {
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tipItem: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  footerLoader: {
    marginVertical: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});