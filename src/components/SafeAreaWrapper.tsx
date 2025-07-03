import React, { ReactNode } from 'react';
import { View, StyleSheet, Platform, StatusBar as RNStatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

interface SafeAreaWrapperProps {
  children: ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  style?: any;
}

export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({ 
  children, 
  edges = ['top', 'left', 'right'], 
  style 
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Para Android, precisamos adicionar o statusBar height manualmente
  const topPadding = Platform.OS === 'android' 
    ? (RNStatusBar.currentHeight || 0) + 10 
    : insets.top;

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.background,
          paddingTop: edges.includes('top') ? topPadding : 0,
          paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
          paddingLeft: edges.includes('left') ? insets.left : 0,
          paddingRight: edges.includes('right') ? insets.right : 0,
        },
        style
      ]}
      edges={[]} // Desabilitar edges automáticas do SafeAreaView
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});