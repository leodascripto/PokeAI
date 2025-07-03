import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { TeamScreen } from '../screens/TeamScreen';
import { PokemonDetailScreen } from '../screens/PokemonDetailScreen';
import { RecommendationsScreen } from '../screens/RecommendationsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen 
      name="PokemonDetail" 
      component={PokemonDetailScreen}
      options={{
        presentation: 'modal',
      }}
    />
    <Stack.Screen 
      name="Recommendations" 
      component={RecommendationsScreen}
      options={{
        presentation: 'modal',
      }}
    />
  </Stack.Navigator>
);

const TeamStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="TeamMain" component={TeamScreen} />
    <Stack.Screen 
      name="PokemonDetail" 
      component={PokemonDetailScreen}
      options={{
        presentation: 'modal',
      }}
    />
    <Stack.Screen 
      name="Recommendations" 
      component={RecommendationsScreen}
      options={{
        presentation: 'modal',
      }}
    />
  </Stack.Navigator>
);

const TabNavigator = () => (
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
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: '#8E8E93',
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E1E1E1',
        paddingBottom: 8,
        paddingTop: 8,
        height: 60,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
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

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
};