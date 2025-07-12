// src/components/Pokemon3DViewer.tsx
import React, { Suspense, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, Alert } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { useGLTF, OrbitControls } from '@react-three/drei/native';
import { useTheme } from '../context/ThemeContext';
import { Pokemon } from '../types/pokemon';

interface Pokemon3DViewerProps {
  pokemon: Pokemon;
  width?: number;
  height?: number;
  enableControls?: boolean;
  autoRotate?: boolean;
  style?: any;
}

// Componente interno para carregar modelo 3D
function PokemonModel({ 
  pokemonId, 
  onLoad, 
  onError 
}: { 
  pokemonId: number; 
  onLoad: () => void; 
  onError: (error: any) => void; 
}) {
  try {
    const gltf = useGLTF(
      `https://raw.githubusercontent.com/Sudhanshu-Ambastha/Pokemon-3D/main/models/glb/regular/${pokemonId}.glb`
    );
    
    useEffect(() => {
      if (gltf && gltf.scene) {
        // Otimizações para dispositivos móveis
        gltf.scene.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = false;
            child.receiveShadow = false;
            if (child.material) {
              child.material.precision = 'mediump';
            }
          }
        });
        onLoad();
      }
    }, [gltf, onLoad]);
    
    if (!gltf || !gltf.scene) {
      throw new Error('Modelo não carregado');
    }
    
    return (
      <primitive 
        object={gltf.scene} 
        scale={1.5} 
        position={[0, -1, 0]}
        rotation={[0, 0, 0]}
      />
    );
  } catch (error) {
    onError(error);
    return null;
  }
}

// Componente de loading customizado
function LoadingFallback() {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.loadingText, { color: colors.text }]}>
        Carregando modelo 3D...
      </Text>
    </View>
  );
}

// Componente de erro
function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
      <Text style={[styles.errorText, { color: colors.error }]}>
        Erro ao carregar modelo 3D
      </Text>
      <Text style={[styles.errorSubtext, { color: colors.textSecondary }]}>
        {Platform.OS === 'ios' && __DEV__ ? 
          'Modelos 3D requerem dispositivo físico' : 
          'Verifique sua conexão'}
      </Text>
    </View>
  );
}

export const Pokemon3DViewer: React.FC<Pokemon3DViewerProps> = ({
  pokemon,
  width = 200,
  height = 200,
  enableControls = true,
  autoRotate = false,
  style
}) => {
  const { colors } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controlsRef = useRef<any>();

  // Verificação de suporte para Three.js
  useEffect(() => {
    if (Platform.OS !== 'web' && __DEV__) {
      const isEmulator = Platform.OS === 'ios' ? 
        Platform.isPad === undefined : 
        Platform.Version === 10000;
        
      if (isEmulator) {
        Alert.alert(
          'Aviso de Desenvolvimento',
          'Modelos 3D funcionam apenas em dispositivos físicos. Em emuladores, você verá apenas o fallback.',
          [{ text: 'OK' }]
        );
      }
    }
  }, []);

  const handleLoad = () => {
    setLoaded(true);
    setError(null);
  };

  const handleError = (err: any) => {
    console.error('Erro ao carregar modelo 3D:', err);
    setError(err.message || 'Erro desconhecido');
    setLoaded(false);
  };

  const handleRetry = () => {
    setError(null);
    setLoaded(false);
  };

  // Fallback para emuladores ou erro
  if (error || (Platform.OS !== 'web' && __DEV__ && !loaded)) {
    return (
      <View style={[styles.container, { width, height }, style]}>
        {error ? (
          <ErrorFallback onRetry={handleRetry} />
        ) : (
          <LoadingFallback />
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { width, height }, style]}>
      <Canvas
        style={styles.canvas}
        dpr={Math.min(Platform.OS === 'web' ? window.devicePixelRatio : 2, 2)}
        gl={{ 
          antialias: false, // Desabilitar para performance
          powerPreference: 'high-performance',
          precision: 'mediump'
        }}
        camera={{ 
          position: [0, 0, 5], 
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        frameloop="demand" // Renderizar apenas quando necessário
      >
        {/* Iluminação otimizada */}
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={0.8} 
          castShadow={false}
        />
        
        {/* Modelo 3D com Suspense */}
        <Suspense fallback={null}>
          <PokemonModel 
            pokemonId={pokemon.id}
            onLoad={handleLoad}
            onError={handleError}
          />
        </Suspense>
        
        {/* Controles de órbita */}
        {enableControls && (
          <OrbitControls
            ref={controlsRef}
            enableZoom={true}
            enablePan={false}
            enableRotate={true}
            autoRotate={autoRotate}
            autoRotateSpeed={1}
            minDistance={2}
            maxDistance={10}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI - Math.PI / 4}
          />
        )}
      </Canvas>
      
      {/* Overlay de loading */}
      {!loaded && !error && (
        <View style={styles.loadingOverlay}>
          <LoadingFallback />
        </View>
      )}
      
      {/* Indicador de qualidade */}
      {loaded && (
        <View style={[styles.qualityBadge, { backgroundColor: colors.success }]}>
          <Text style={styles.qualityText}>3D</Text>
        </View>
      )}
    </View>
  );
};

// Pré-carregamento de modelos populares
export const preloadPopularPokemon = () => {
  const popularIds = [25, 1, 4, 7, 150, 151]; // Pikachu, Bulbasaur, Charmander, Squirtle, Mewtwo, Mew
  
  popularIds.forEach(id => {
    try {
      useGLTF.preload(
        `https://raw.githubusercontent.com/Sudhanshu-Ambastha/Pokemon-3D/main/models/glb/regular/${id}.glb`
      );
    } catch (error) {
      console.warn(`Falha ao pré-carregar Pokémon ${id}:`, error);
    }
  });
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  canvas: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  qualityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  qualityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});