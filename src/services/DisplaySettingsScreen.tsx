// src/screens/DisplaySettingsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaWrapper } from '../components/SafeAreaWrapper';
import { usePokemonPerformance } from '../hooks/usePokemon';

interface DisplaySettings {
  preferredDisplay: 'auto' | 'static' | 'animated' | '3d';
  autoFallback: boolean;
  showImageControls: boolean;
  enableHighQuality: boolean;
  preloadAssets: boolean;
  cacheTimeout: number; // em horas
}

const DEFAULT_SETTINGS: DisplaySettings = {
  preferredDisplay: 'auto',
  autoFallback: true,
  showImageControls: true,
  enableHighQuality: true,
  preloadAssets: false,
  cacheTimeout: 24
};

export const DisplaySettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { performanceData, clearCache } = usePokemonPerformance();
  const [settings, setSettings] = useState<DisplaySettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('@display_settings');
      if (savedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const saveSettings = async (newSettings: DisplaySettings) => {
    setSaving(true);
    try {
      await AsyncStorage.setItem('@display_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDisplayModeChange = (mode: DisplaySettings['preferredDisplay']) => {
    const newSettings = { ...settings, preferredDisplay: mode };
    saveSettings(newSettings);
  };

  const handleToggleSetting = (key: keyof DisplaySettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Limpar Cache',
      'Isso irá remover todos os dados em cache. Os Pokémon precisarão ser carregados novamente. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: () => {
            clearCache();
            Alert.alert('Sucesso', 'Cache limpo com sucesso!');
          }
        }
      ]
    );
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Restaurar Padrões',
      'Isso irá resetar todas as configurações para os valores padrão. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          onPress: () => saveSettings(DEFAULT_SETTINGS)
        }
      ]
    );
  };

  const renderDisplayModeSection = () => {
    const modes = [
      {
        key: 'auto' as const,
        title: 'Automático',
        description: 'Escolhe automaticamente a melhor opção',
        icon: 'sparkles',
        recommended: true
      },
      {
        key: '3d' as const,
        title: 'Modelos 3D',
        description: 'Prioriza modelos 3D quando disponíveis',
        icon: 'cube',
        premium: true
      },
      {
        key: 'animated' as const,
        title: 'Sprites Animados',
        description: 'Usa sprites GIF animados',
        icon: 'play-circle',
        balanced: true
      },
      {
        key: 'static' as const,
        title: 'Imagens Estáticas',
        description: 'Usa apenas imagens PNG estáticas',
        icon: 'image',
        performance: true
      }
    ];

    return (
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Modo de Exibição</Text>
        
        {modes.map(mode => (
          <TouchableOpacity
            key={mode.key}
            style={[
              styles.optionCard,
              {
                backgroundColor: settings.preferredDisplay === mode.key ? colors.primary + '20' : colors.background,
                borderColor: settings.preferredDisplay === mode.key ? colors.primary : colors.border
              }
            ]}
            onPress={() => handleDisplayModeChange(mode.key)}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionHeader}>
                <Ionicons
                  name={mode.icon as any}
                  size={24}
                  color={settings.preferredDisplay === mode.key ? colors.primary : colors.textSecondary}
                />
                <View style={styles.optionText}>
                  <Text style={[
                    styles.optionTitle,
                    { color: settings.preferredDisplay === mode.key ? colors.primary : colors.text }
                  ]}>
                    {mode.title}
                  </Text>
                  <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                    {mode.description}
                  </Text>
                </View>
              </View>
              
              <View style={styles.optionBadges}>
                {mode.recommended && (
                  <View style={[styles.badge, { backgroundColor: colors.success }]}>
                    <Text style={styles.badgeText}>Recomendado</Text>
                  </View>
                )}
                {mode.premium && (
                  <View style={[styles.badge, { backgroundColor: colors.warning }]}>
                    <Text style={styles.badgeText}>Premium</Text>
                  </View>
                )}
                {mode.balanced && (
                  <View style={[styles.badge, { backgroundColor: colors.info }]}>
                    <Text style={styles.badgeText}>Equilibrado</Text>
                  </View>
                )}
                {mode.performance && (
                  <View style={[styles.badge, { backgroundColor: colors.textSecondary }]}>
                    <Text style={styles.badgeText}>Performance</Text>
                  </View>
                )}
              </View>
            </View>
            
            {settings.preferredDisplay === mode.key && (
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderAdvancedSettings = () => {
    const advancedOptions = [
      {
        key: 'autoFallback' as keyof DisplaySettings,
        title: 'Fallback Automático',
        description: 'Usa imagem estática se 3D/animação falhar',
        icon: 'refresh',
        value: settings.autoFallback
      },
      {
        key: 'showImageControls' as keyof DisplaySettings,
        title: 'Controles de Imagem',
        description: 'Mostra botões para trocar modo de exibição',
        icon: 'options',
        value: settings.showImageControls
      },
      {
        key: 'enableHighQuality' as keyof DisplaySettings,
        title: 'Alta Qualidade',
        description: 'Prioriza imagens de maior resolução',
        icon: 'diamond',
        value: settings.enableHighQuality
      },
      {
        key: 'preloadAssets' as keyof DisplaySettings,
        title: 'Pré-carregar Assets',
        description: 'Carrega assets em segundo plano (usa mais dados)',
        icon: 'download',
        value: settings.preloadAssets
      }
    ];

    return (
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Configurações Avançadas</Text>
        
        {advancedOptions.map(option => (
          <View key={option.key} style={styles.switchOption}>
            <View style={styles.switchOptionContent}>
              <Ionicons name={option.icon as any} size={20} color={colors.textSecondary} />
              <View style={styles.switchOptionText}>
                <Text style={[styles.switchOptionTitle, { color: colors.text }]}>
                  {option.title}
                </Text>
                <Text style={[styles.switchOptionDescription, { color: colors.textSecondary }]}>
                  {option.description}
                </Text>
              </View>
            </View>
            <Switch
              value={option.value as boolean}
              onValueChange={(value) => handleToggleSetting(option.key, value)}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={option.value ? colors.primary : colors.textSecondary}
            />
          </View>
        ))}
      </View>
    );
  };

  const renderPerformanceSection = () => {
    return (
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance & Cache</Text>
        
        <View style={styles.performanceStats}>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Itens em Cache:</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{performanceData.cacheSize}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Tempo Médio de Carregamento:</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {performanceData.averageLoadTime > 0 ? `${performanceData.averageLoadTime.toFixed(1)}ms` : 'N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.cacheActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error }]}
            onPress={handleClearCache}
          >
            <Ionicons name="trash" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Limpar Cache</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.warning }]}
            onPress={resetToDefaults}
          >
            <Ionicons name="refresh" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Restaurar Padrões</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTipsSection = () => {
    const tips = [
      '💡 O modo "Automático" escolhe a melhor opção baseado na disponibilidade e conexão',
      '🎮 Modelos 3D oferecem a melhor experiência mas consomem mais dados',
      '⚡ Sprites animados são um bom equilíbrio entre qualidade e performance',
      '📱 Use imagens estáticas para economizar dados móveis',
      '🔄 O fallback automático garante que sempre haja uma imagem para exibir'
    ];

    return (
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Dicas</Text>
        
        {tips.map((tip, index) => (
          <Text key={index} style={[styles.tipText, { color: colors.textSecondary }]}>
            {tip}
          </Text>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaWrapper style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Configurações de Display</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderDisplayModeSection()}
        {renderAdvancedSettings()}
        {renderPerformanceSection()}
        {renderTipsSection()}
      </ScrollView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  optionContent: {
    flex: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionText: {
    marginLeft: 12,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  optionBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  switchOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  switchOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  switchOptionText: {
    marginLeft: 12,
    flex: 1,
  },
  switchOptionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  switchOptionDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  performanceStats: {
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  cacheActions: {
    flexDirection: 'row',
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
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
});