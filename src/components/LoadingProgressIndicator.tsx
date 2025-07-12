// src/components/LoadingProgressIndicator.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

interface LoadingProgressProps {
  visible: boolean;
  current: number;
  total: number;
  phase: 'loading' | 'enhancing' | 'complete';
  assetsStats?: {
    total: number;
    with3D: number;
    withAnimated: number;
    staticOnly: number;
  };
}

const { width } = Dimensions.get('window');

export const LoadingProgressIndicator: React.FC<LoadingProgressProps> = ({
  visible,
  current,
  total,
  phase,
  assetsStats
}) => {
  const { colors, isDark } = useTheme();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const percentage = Math.round((current / total) * 100);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: percentage / 100,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    if (phase !== 'complete') {
      pulse.start();
    } else {
      pulse.stop();
      pulseAnim.setValue(0);
    }

    return () => pulse.stop();
  }, [phase]);

  const getPhaseInfo = () => {
    switch (phase) {
      case 'loading':
        return {
          title: 'Carregando Pokédex...',
          description: 'Buscando informações dos Pokémon',
          icon: 'download',
          color: colors.primary
        };
      case 'enhancing':
        return {
          title: 'Enriquecendo com Assets 3D...',
          description: 'Adicionando modelos 3D e sprites animados',
          icon: 'cube',
          color: colors.success
        };
      case 'complete':
        return {
          title: 'Concluído!',
          description: 'Pokédex carregada com sucesso',
          icon: 'checkmark-circle',
          color: colors.success
        };
      default:
        return {
          title: 'Carregando...',
          description: 'Processando dados',
          icon: 'hourglass',
          color: colors.primary
        };
    }
  };

  const renderAssetsStats = () => {
    if (!assetsStats || phase !== 'complete') return null;

    const stats = [
      {
        label: '3D Models',
        value: assetsStats.with3D,
        icon: 'cube',
        color: colors.success,
        percentage: Math.round((assetsStats.with3D / assetsStats.total) * 100)
      },
      {
        label: 'Animated',
        value: assetsStats.withAnimated,
        icon: 'play-circle',
        color: colors.warning,
        percentage: Math.round((assetsStats.withAnimated / assetsStats.total) * 100)
      },
      {
        label: 'Static Only',
        value: assetsStats.staticOnly,
        icon: 'image',
        color: colors.textSecondary,
        percentage: Math.round((assetsStats.staticOnly / assetsStats.total) * 100)
      }
    ];

    return (
      <View style={styles.statsContainer}>
        <Text style={[styles.statsTitle, { color: colors.text }]}>
          Assets Carregados
        </Text>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={[styles.statCard, { backgroundColor: colors.card }]}>
              <View style={styles.statHeader}>
                <Ionicons name={stat.icon as any} size={16} color={stat.color} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stat.value}
                </Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {stat.label}
              </Text>
              <Text style={[styles.statPercentage, { color: stat.color }]}>
                {stat.percentage}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const phaseInfo = getPhaseInfo();

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <View style={styles.container}>
        <LinearGradient
          colors={isDark ? ['#1a1a1a', '#2a2a2a'] : ['#667eea', '#764ba2']}
          style={styles.content}
        >
          {/* Header */}
          <View style={styles.header}>
            <Animated.View 
              style={[
                styles.iconContainer,
                {
                  transform: [{
                    scale: pulseAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2]
                    })
                  }]
                }
              ]}
            >
              <Ionicons name={phaseInfo.icon as any} size={48} color="#FFFFFF" />
            </Animated.View>
            
            <Text style={styles.title}>{phaseInfo.title}</Text>
            <Text style={styles.description}>{phaseInfo.description}</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                {current} / {total} Pokémon
              </Text>
              <Text style={styles.percentageText}>
                {percentage}%
              </Text>
            </View>
            
            <View style={[styles.progressBar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    }),
                    backgroundColor: phaseInfo.color
                  }
                ]}
              />
            </View>
          </View>

          {/* Assets Statistics */}
          {renderAssetsStats()}

          {/* Loading Animation */}
          <View style={styles.loadingAnimation}>
            <View style={styles.loadingDots}>
              {[0, 1, 2].map(index => (
                <Animated.View
                  key={index}
                  style={[
                    styles.loadingDot,
                    {
                      opacity: pulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1]
                      }),
                      transform: [{
                        translateY: pulseAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -10]
                        })
                      }]
                    }
                  ]}
                />
              ))}
            </View>
          </View>
        </LinearGradient>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  container: {
    width: width * 0.85,
    maxWidth: 400,
  },
  content: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
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
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  progressSection: {
    width: '100%',
    marginBottom: 24,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '500',
  },
  percentageText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 2,
  },
  statPercentage: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingAnimation: {
    marginTop: 16,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
});