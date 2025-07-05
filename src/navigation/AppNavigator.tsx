// src/navigation/AppNavigator.tsx - CORRIGIDO
import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { HomeScreen } from '../screens/HomeScreen';
import { EnhancedTeamScreen } from '../screens/EnhancedTeamScreen';
import { PokemonDetailScreen } from '../screens/PokemonDetailScreen';
import { EnhancedRecommendationsScreen } from '../screens/EnhancedRecommendationsScreen';
import type { Pokemon } from '../types/pokemon';

type RootStackParamList = {
  HomeMain: undefined;
  PokemonDetail: { pokemonId: number; pokemon?: Pokemon };
  Recommendations: { targetPokemon?: Pokemon; currentTeam: (Pokemon | null)[] };
  TeamMain: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Stack para Home/Pokédex
const HomeStack = () => {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen 
        name="PokemonDetail" 
        component={PokemonDetailScreen}
        options={{
          presentation: 'modal',
          cardOverlayEnabled: true,
          gestureEnabled: true,
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen 
        name="Recommendations" 
        component={EnhancedRecommendationsScreen}
        options={{
          presentation: 'modal',
          cardOverlayEnabled: true,
          gestureEnabled: true,
          animationTypeForReplace: 'push',
        }}
      />
    </Stack.Navigator>
  );
};

// Stack para Team
const TeamStack = () => {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="TeamMain" component={EnhancedTeamScreen} />
      <Stack.Screen 
        name="PokemonDetail" 
        component={PokemonDetailScreen}
        options={{
          presentation: 'modal',
          cardOverlayEnabled: true,
          gestureEnabled: true,
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen 
        name="Recommendations" 
        component={EnhancedRecommendationsScreen}
        options={{
          presentation: 'modal',
          cardOverlayEnabled: true,
          gestureEnabled: true,
          animationTypeForReplace: 'push',
        }}
      />
    </Stack.Navigator>
  );
};

// Tab Navigator principal
const TabNavigator = () => {
  const { colors, isDark } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Team') {
            iconName = focused ? 'people' : 'people-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
          elevation: 8,
          shadowColor: colors.shadow,
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3.84,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{
          tabBarLabel: 'Pokédex',
        }}
      />
      <Tab.Screen 
        name="Team" 
        component={TeamStack}
        options={{
          tabBarLabel: 'Minha Equipe',
        }}
      />
    </Tab.Navigator>
  );
};

// Navegador principal da aplicação
export const AppNavigator = () => {
  const { colors, isDark } = useTheme();
  
  const navigationTheme = {
    ...isDark ? DarkTheme : DefaultTheme,
    colors: {
      ...isDark ? DarkTheme.colors : DefaultTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.notification,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <TabNavigator />
    </NavigationContainer>
  );
};