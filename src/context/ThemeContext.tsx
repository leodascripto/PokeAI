import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  notification: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  overlay: string;
  shadow: string;
}

interface ThemeContextData {
  theme: Theme;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const lightColors: ThemeColors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1C1C1E',
  textSecondary: '#6C6C70',
  border: '#E1E8ED',
  notification: '#FF3B30',
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
  info: '#007AFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: '#000000'
};

const darkColors: ThemeColors = {
  primary: '#0A84FF',
  secondary: '#5E5CE6',
  background: '#000000',
  surface: '#1C1C1E',
  card: '#2C2C2E',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#38383A',
  notification: '#FF453A',
  success: '#30D158',
  error: '#FF453A',
  warning: '#FF9F0A',
  info: '#64D2FF',
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: '#000000'
};

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('system');
  const systemColorScheme = useColorScheme();

  const isDark = theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');
  const colors = isDark ? darkColors : lightColors;

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@theme');
      if (savedTheme) {
        setTheme(savedTheme as Theme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const saveTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem('@theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
    saveTheme(newTheme);
  };

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    saveTheme(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        colors,
        toggleTheme,
        setTheme: handleSetTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};