import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { LogBox, Platform } from 'react-native';

// CONFIGURAÇÃO CRÍTICA PARA THREE.JS EM REACT NATIVE
import { THREE } from 'expo-three';
global.THREE = global.THREE || THREE;

// Configuração adicional para dispositivos físicos
if (Platform.OS !== 'web') {
  // Polyfills necessários para Three.js
  global.self = global.self || global;
  global.window = global.window || global;
  global.document = global.document || {};
  
  // Configuração de performance
  if (global.performance === undefined) {
    global.performance = {
      now: () => Date.now()
    };
  }
}

// Suprimir warnings conhecidos durante desenvolvimento
LogBox.ignoreLogs([
  'Warning: Cannot update a component',
  'Warning: Failed prop type',
  'source.uri should not be an empty string',
  'Looks like you\'re passing an inline function for \'component\' prop',
  'A navigator can only contain \'Screen\', \'Group\' or \'React.Fragment\' as its direct children',
  // Warnings específicos do Three.js
  'THREE.WebGLRenderer: Context Lost',
  'THREE.WebGLProgram: gl.getProgramInfoLog()',
  'Non-serializable values were found in the navigation state',
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