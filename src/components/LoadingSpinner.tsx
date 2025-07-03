import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = 'Carregando...',
  size = 'large',
  color,
  style
}) => {
  const { colors } = useTheme();
  const spinnerColor = color || colors.primary;
  
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={spinnerColor} />
      {text && <Text style={[styles.text, { color: colors.text }]}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
});