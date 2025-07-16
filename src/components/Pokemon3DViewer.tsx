// src/components/Pokemon3DViewer.tsx
import React, { Suspense, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, Alert, Image } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
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

// Componente alternativo usando GLView do Expo
function NativePokemon3D({ 
  pokemon, 
  onLoad, 
  onError 
}: { 
  pokemon: Pokemon; 
  onLoad: () => void; 
  onError: (error: any) => void; 
}) {
  const [gl, setGL] = useState<any>(null);
  const [renderer, setRenderer] = useState<any>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const cubeRef = useRef<THREE.Mesh>();

  const onContextCreate = async (gl: any) => {
    try {
      setGL(gl);
      
      // Configurar renderer
      const renderer = new Renderer({ gl });
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      setRenderer(renderer);

      // Criar cena
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0f0f0);
      sceneRef.current = scene;

      // Criar câmera
      const camera = new THREE.PerspectiveCamera(
        75,
        gl.drawingBufferWidth / gl.drawingBufferHeight,
        0.1,
        1000
      );
      camera.position.z = 5;
      cameraRef.current = camera;

      // Criar geometria simples (cubo como placeholder)
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      const material = new THREE.MeshPhongMaterial({ 
        color: getPokemonColor(pokemon.types[0].type.name),
        shininess: 100
      });
      const cube = new THREE.Mesh(geometry, material);
      cubeRef.current = cube;
      scene.add(cube);

      // Adicionar luzes
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);

      onLoad();

      // Loop de animação
      const animate = () => {
        requestAnimationFrame(animate);
        
        if (cubeRef.current) {
          cubeRef.current.rotation.x += 0.01;
          cubeRef.current.rotation.y += 0.01;
        }

        renderer.render(scene, camera);
        gl.endFrameEXP();
      };
      
      animate();
    } catch (error) {
      console.error('Erro ao configurar 3D:', error);
      onError(error);
    }
  };

  const getPokemonColor = (type: string): number => {
    const typeColors: { [key: string]: number } = {
      fire: 0xff6b6b,
      water: 0x4dabf7,
      grass: 0x51cf66,
      electric: 0xffd43b,
      psychic: 0xe64980,
      ice: 0x74c0fc,
      dragon: 0x845ef7,
      dark: 0x495057,
      fairy: 0xf783ac,
      normal: 0xa8a8a8,
      fighting: 0xc92a2a,
      poison: 0x8a1ac1,
      ground: 0xe67700,
      flying: 0x7950f2,
      bug: 0x92cc41,
      rock: 0x868e96,
      ghost: 0x705cb8,
      steel: 0x868e96
    };
    return typeColors[type] || 0xa8a8a8;
  };

  return (
    <GLView
      style={styles.glView}
      onContextCreate={onContextCreate}
    />
  );
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

// Componente de erro com fallback para imagem
function ErrorFallback({ pokemon, onRetry }: { pokemon: Pokemon; onRetry: () => void }) {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
      <Image 
        source={{ uri: pokemon.sprites.front_default }}
        style={styles.fallbackImage}
        resizeMode="contain"
      />
      <Text style={[styles.errorText, { color: colors.textSecondary }]}>
        Modo 2D (dispositivo não compatível)
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
  const [isSupported, setIsSupported] = useState(true);

  // Verificação de suporte para OpenGL
  useEffect(() => {
    if (Platform.OS !== 'web') {
      // Verificar se o dispositivo suporta OpenGL ES
      const checkSupport = async () => {
        try {
          // Em desenvolvimento ou emulador, usar fallback
          const versionNumber = typeof Platform.Version === 'string' ? parseInt(Platform.Version, 10) : Platform.Version;
          if (__DEV__ || versionNumber < 21) {
            setIsSupported(false);
            return;
          }
          setIsSupported(true);
        } catch {
          setIsSupported(false);
        }
      };
      
      checkSupport();
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
    setIsSupported(false);
  };

  const handleRetry = () => {
    setError(null);
    setLoaded(false);
  };

  // Fallback para dispositivos não suportados
  if (!isSupported || error) {
    return (
      <View style={[styles.container, { width, height }, style]}>
        <ErrorFallback pokemon={pokemon} onRetry={handleRetry} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { width, height }, style]}>
      {Platform.OS === 'web' ? (
        // Para web, usar imagem como fallback por enquanto
        <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
          <Image 
            source={{ uri: pokemon.sprites.front_default }}
            style={styles.fallbackImage}
            resizeMode="contain"
          />
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            Visualização 2D
          </Text>
        </View>
      ) : (
        <>
          <Suspense fallback={<LoadingFallback />}>
            <NativePokemon3D 
              pokemon={pokemon}
              onLoad={handleLoad}
              onError={handleError}
            />
          </Suspense>
          
          {/* Overlay de loading */}
          {!loaded && !error && (
            <View style={styles.loadingOverlay}>
              <LoadingFallback />
            </View>
          )}
        </>
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

// Função para pré-carregamento (simplificada)
export const preloadPopularPokemon = () => {
  console.log('Pré-carregamento de modelos 3D preparado');
  // Por enquanto, apenas log - implementar quando os modelos estiverem funcionando
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  glView: {
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
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  fallbackImage: {
    width: 80,
    height: 80,
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