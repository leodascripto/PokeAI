// src/components/DiagnosticPanel.tsx - Painel de diagnóstico para debug
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { pokemonApi } from '../services/pokemonApi';
import { pokemon3DService } from '../services/pokemon3DService';
import { useTheme } from '../context/ThemeContext';

interface DiagnosticInfo {
  environment: string;
  enhancementMode: string;
  connectivity: any;
  cacheSize: number;
  recommendedSettings: {
    preferredDisplay: 'animated' | 'static';
    enableHighQuality: boolean;
    batchSize: number;
  };
}

export const DiagnosticPanel: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const [diagnostic, setDiagnostic] = useState<DiagnosticInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoMode, setAutoMode] = useState(true);

  useEffect(() => {
    if (visible) {
      loadDiagnostic();
    }
  }, [visible]);

  const loadDiagnostic = async () => {
    setLoading(true);
    try {
      const info = await pokemonApi.getDiagnosticInfo();
      setDiagnostic(info);
    } catch (error) {
      console.error('Erro ao carregar diagnóstico:', error);
      Alert.alert('Erro', 'Falha ao carregar informações de diagnóstico');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAssets = async () => {
    setLoading(true);
    try {
      await pokemonApi.refreshAssets();
      await loadDiagnostic();
      Alert.alert('Sucesso', 'Assets atualizados com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao atualizar assets');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Limpar Cache',
      'Isso irá remover todos os dados em cache. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          onPress: async () => {
            pokemonApi.clearCache();
            await loadDiagnostic();
            Alert.alert('Sucesso', 'Cache limpo!');
          }
        }
      ]
    );
  };

  const handleModeChange = (mode: 'full' | 'conservative' | 'minimal') => {
    pokemonApi.setEnhancementMode(mode);
    setAutoMode(false);
    loadDiagnostic();
  };

  const getStatusIcon = (status: boolean) => {
    return status ? '✅' : '❌';
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'good': return colors.success;
      case 'poor': return colors.warning;
      case 'offline': return colors.error;
      default: return colors.textSecondary;
    }
  };

  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
      <View style={[styles.panel, { backgroundColor: colors.surface }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Diagnóstico de Conectividade
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.text }]}>
                Carregando diagnóstico...
              </Text>
            </View>
          ) : diagnostic ? (
            <>
              {/* Informações do Ambiente */}
              <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Ambiente
                </Text>
                <View style={styles.infoRow}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    Plataforma:
                  </Text>
                  <Text style={[styles.value, { color: colors.text }]}>
                    {diagnostic.environment}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    Modo Enhancement:
                  </Text>
                  <Text style={[styles.value, { color: colors.text }]}>
                    {diagnostic.enhancementMode}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    Cache Size:
                  </Text>
                  <Text style={[styles.value, { color: colors.text }]}>
                    {diagnostic.cacheSize} itens
                  </Text>
                </View>
              </View>

              {/* Status de Conectividade */}
              {diagnostic.connectivity && (
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Conectividade
                  </Text>
                  <View style={styles.connectivityGrid}>
                    <View style={styles.connectivityItem}>
                      <Text style={[styles.connectivityLabel, { color: colors.textSecondary }]}>
                        GitHub Raw
                      </Text>
                      <Text style={styles.connectivityStatus}>
                        {getStatusIcon(diagnostic.connectivity.githubRaw)}
                      </Text>
                    </View>
                    <View style={styles.connectivityItem}>
                      <Text style={[styles.connectivityLabel, { color: colors.textSecondary }]}>
                        Pokémon API CDN
                      </Text>
                      <Text style={styles.connectivityStatus}>
                        {getStatusIcon(diagnostic.connectivity.pokemonApiCDN)}
                      </Text>
                    </View>
                    <View style={styles.connectivityItem}>
                      <Text style={[styles.connectivityLabel, { color: colors.textSecondary }]}>
                        Pokémon DB
                      </Text>
                      <Text style={styles.connectivityStatus}>
                        {getStatusIcon(diagnostic.connectivity.pokemonDB)}
                      </Text>
                    </View>
                    <View style={styles.connectivityItem}>
                      <Text style={[styles.connectivityLabel, { color: colors.textSecondary }]}>
                        Qualidade da Rede
                      </Text>
                      <Text style={[
                        styles.networkQuality,
                        { color: getQualityColor(diagnostic.connectivity.networkQuality) }
                      ]}>
                        {diagnostic.connectivity.networkQuality.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Configurações Recomendadas */}
              <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Configurações Recomendadas
                </Text>
                <View style={styles.infoRow}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    Display Preferido:
                  </Text>
                  <Text style={[styles.value, { color: colors.text }]}>
                    {diagnostic.recommendedSettings.preferredDisplay}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    Alta Qualidade:
                  </Text>
                  <Text style={[styles.value, { color: colors.text }]}>
                    {diagnostic.recommendedSettings.enableHighQuality ? 'Habilitado' : 'Desabilitado'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    Tamanho do Lote:
                  </Text>
                  <Text style={[styles.value, { color: colors.text }]}>
                    {diagnostic.recommendedSettings.batchSize} por lote
                  </Text>
                </View>
              </View>

              {/* Controles Manuais */}
              <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Controles Manuais
                </Text>
                
                <View style={styles.controlRow}>
                  <Text style={[styles.controlLabel, { color: colors.text }]}>
                    Modo Automático
                  </Text>
                  <Switch
                    value={autoMode}
                    onValueChange={setAutoMode}
                    trackColor={{ false: colors.border, true: colors.primary + '40' }}
                    thumbColor={autoMode ? colors.primary : colors.textSecondary}
                  />
                </View>

                {!autoMode && (
                  <View style={styles.modeButtons}>
                    <TouchableOpacity
                      style={[
                        styles.modeButton,
                        { 
                          backgroundColor: diagnostic.enhancementMode === 'minimal' ? colors.primary : colors.background,
                          borderColor: colors.border,
                          borderWidth: 1
                        }
                      ]}
                      onPress={() => handleModeChange('minimal')}
                    >
                      <Text style={[
                        styles.modeButtonText,
                        { color: diagnostic.enhancementMode === 'minimal' ? '#fff' : colors.text }
                      ]}>
                        Minimal
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.modeButton,
                        { 
                          backgroundColor: diagnostic.enhancementMode === 'conservative' ? colors.primary : colors.background,
                          borderColor: colors.border,
                          borderWidth: 1
                        }
                      ]}
                      onPress={() => handleModeChange('conservative')}
                    >
                      <Text style={[
                        styles.modeButtonText,
                        { color: diagnostic.enhancementMode === 'conservative' ? '#fff' : colors.text }
                      ]}>
                        Conservative
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.modeButton,
                        { 
                          backgroundColor: diagnostic.enhancementMode === 'full' ? colors.primary : colors.background,
                          borderColor: colors.border,
                          borderWidth: 1
                        }
                      ]}
                      onPress={() => handleModeChange('full')}
                    >
                      <Text style={[
                        styles.modeButtonText,
                        { color: diagnostic.enhancementMode === 'full' ? '#fff' : colors.text }
                      ]}>
                        Full
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: colors.error }]}>
                Erro ao carregar diagnóstico
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={loadDiagnostic}
            disabled={loading}
          >
            <Ionicons name="refresh" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Atualizar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.warning }]}
            onPress={handleRefreshAssets}
            disabled={loading}
          >
            <Ionicons name="download" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Refresh Assets</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error }]}
            onPress={handleClearCache}
            disabled={loading}
          >
            <Ionicons name="trash" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Limpar Cache</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  panel: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6.68,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  connectivityGrid: {
    gap: 12,
  },
  connectivityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectivityLabel: {
    fontSize: 14,
  },
  connectivityStatus: {
    fontSize: 16,
  },
  networkQuality: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  modeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});