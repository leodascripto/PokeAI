import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { LogBox } from 'react-native';

// Suprimir warnings conhecidos durante desenvolvimento
LogBox.ignoreLogs([
  'Warning: Cannot update a component',
  'Warning: Failed prop type',
  'source.uri should not be an empty string',
  'Looks like you\'re passing an inline function for \'component\' prop',
  'A navigator can only contain \'Screen\', \'Group\' or \'React.Fragment\' as its direct children',
]);

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <StatusBar style="auto" />
            <AppNavigator />
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}