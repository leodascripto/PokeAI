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

// Configuração global do THREE.js
if (!global.THREE) {
  global.THREE = THREE;
}

// Configuração adicional para dispositivos físicos
if (Platform.OS !== 'web') {
  // Polyfills necessários para Three.js
  if (!global.self) global.self = global;
  if (!global.window) global.window = global;
  if (!global.document) global.document = {};
  
  // Configuração de performance
  if (!global.performance) {
    global.performance = {
      now: () => Date.now()
    };
  }

  // Configurações adicionais para React Three Fiber
  if (!global.requestAnimationFrame) {
    global.requestAnimationFrame = (callback: FrameRequestCallback) => {
      return setTimeout(callback, 16);
    };
  }

  if (!global.cancelAnimationFrame) {
    global.cancelAnimationFrame = (id: number) => {
      clearTimeout(id);
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
  // Warnings do React Three Fiber
  'Warning: useLayoutEffect does nothing on the server',
  'THREE.WebGLRenderer: Image in RGBA format',
  // Warnings do Expo Three
  'Expo.GLView',
  'ExpoTHREE',
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