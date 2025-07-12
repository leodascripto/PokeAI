// src/components/EnhancedPokemonImage.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Text
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { Pokemon } from '../types/pokemon';
import { pokemonApi } from '../services/pokemonApi';
import { useTheme } from '../context/ThemeContext';

interface EnhancedPokemonImageProps {
  pokemon: Pokemon;
  width?: number;
  height?: number;
  style?: any;
  showControls?: boolean;
  defaultView?: 'static' | 'animated' | '3d';
  onViewChange?: (view: 'static' | 'animated' | '3d') => void;
}

export const EnhancedPokemonImage: React.FC<EnhancedPokemonImageProps> = ({
  pokemon,
  width = 120,
  height = 120,
  style,
  showControls = true,
  defaultView = 'animated',
  onViewChange
}) => {
  const { colors } = useTheme();
  const [currentView, setCurrentView] = useState<'static' | 'animated' | '3d'>(defaultView);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [webViewError, setWebViewError] = useState(false);

  // Determinar view inicial baseado nos assets disponíveis
  useEffect(() => {
    if (pokemon.assets) {
      if (defaultView === '3d' && !pokemon.assets.has3D) {
        const newView = pokemon.assets.hasAnimated ? 'animated' : 'static';
        setCurrentView(newView);
      } else if (defaultView === 'animated' && !pokemon.assets.hasAnimated) {
        const newView = pokemon.assets.has3D ? '3d' : 'static';
        setCurrentView(newView);
      }
    }
  }, [pokemon.assets, defaultView]);

  const handleViewChange = (newView: 'static' | 'animated' | '3d') => {
    // Verificar se a view é suportada
    if (newView === '3d' && !pokemon.assets?.has3D) return;
    if (newView === 'animated' && !pokemon.assets?.hasAnimated) return;
    
    setCurrentView(newView);
    setImageError(false);
    setWebViewError(false);
    onViewChange?.(newView);
  };

  const getCurrentImageUrl = (): string => {
    // Map '3d' to 'high_quality' for compatibility with getBestSpriteUrl
    const spritePreference: 'static' | 'animated' | 'high_quality' | undefined =
      currentView === '3d' ? 'high_quality' : currentView;
    return pokemonApi.getBestSpriteUrl(pokemon, spritePreference);
  };

  const renderStaticImage = () => (
    <Image
      source={{ uri: getCurrentImageUrl() }}
      style={[styles.image, { width, height }]}
      resizeMode="contain"
      onLoadStart={() => setLoading(true)}
      onLoadEnd={() => setLoading(false)}
      onError={() => {
        setImageError(true);
        setLoading(false);
      }}
    />
  );

  const renderAnimatedImage = () => {
    const animatedUrl = pokemon.sprites.animated?.front_default;
    
    if (!animatedUrl) {
      return renderStaticImage();
    }

    return (
      <Image
        source={{ uri: animatedUrl }}
        style={[styles.image, { width, height }]}
        resizeMode="contain"
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setImageError(true);
          setLoading(false);
          // Fallback para imagem estática
          setCurrentView('static');
        }}
      />
    );
  };

  const render3DModel = () => {
    const model3DUrl = pokemon.sprites.model3d?.viewer_url;
    
    if (!model3DUrl || webViewError) {
      return renderAnimatedImage();
    }

    const webViewHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              margin: 0;
              padding: 0;
              background: transparent;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              overflow: hidden;
            }
            .model-container {
              width: 100%;
              height: 100%;
              max-width: ${width}px;
              max-height: ${height}px;
            }
            iframe {
              width: 100%;
              height: 100%;
              border: none;
              background: transparent;
            }
          </style>
        </head>
        <body>
          <div class="model-container">
            <iframe src="${model3DUrl}" allowfullscreen></iframe>
          </div>
        </body>
      </html>
    `;

    return (
      <WebView
        source={{ html: webViewHtml }}
        style={[styles.webView, { width, height }]}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setWebViewError(true);
          setLoading(false);
          // Fallback para imagem animada
          setCurrentView('animated');
        }}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        bounces={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
      />
    );
  };

  const renderCurrentView = () => {
    if (imageError && currentView !== 'static') {
      // Fallback final para sprite oficial
      return (
        <Image
          source={{ 
            uri: pokemon.sprites.other['official-artwork'].front_default || 
                 pokemon.sprites.front_default 
          }}
          style={[styles.image, { width, height }]}
          resizeMode="contain"
        />
      );
    }

    switch (currentView) {
      case '3d':
        return render3DModel();
      case 'animated':
        return renderAnimatedImage();
      case 'static':
      default:
        return renderStaticImage();
    }
  };

  const renderControls = () => {
    if (!showControls) return null;

    const controlButtons: {
      key: 'static' | 'animated' | '3d';
      icon: React.ComponentProps<typeof Ionicons>['name'];
      available: boolean;
      label: string;
    }[] = [
      {
        key: 'static',
        icon: 'image-outline',
        available: true,
        label: 'Estático'
      },
      {
        key: 'animated',
        icon: 'play-circle-outline',
        available: pokemon.assets?.hasAnimated ?? false,
        label: 'Animado'
      },
      {
        key: '3d',
        icon: 'cube-outline',
        available: pokemon.assets?.has3D ?? false,
        label: '3D'
      }
    ];

    return (
      <View style={styles.controls}>
        {controlButtons.map(button => (
          <TouchableOpacity
            key={button.key}
            style={[
              styles.controlButton,
              {
                backgroundColor: currentView === button.key ? colors.primary : colors.card,
                opacity: button.available ? 1 : 0.3
              }
            ]}
            onPress={() => button.available && handleViewChange(button.key)}
            disabled={!button.available}
          >
            <Ionicons
              name={button.icon}
              size={16}
              color={currentView === button.key ? '#FFFFFF' : colors.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderQualityBadge = () => {
    if (!pokemon.assets) return null;

    const qualityColors = {
      high: colors.success,
      medium: colors.warning,
      low: colors.textSecondary
    };

    const qualityLabels = {
      high: '3D',
      medium: 'GIF',
      low: 'PNG'
    };

    return (
      <View style={[styles.qualityBadge, { backgroundColor: qualityColors[pokemon.assets.quality] }]}>
        <Text style={styles.qualityText}>
          {qualityLabels[pokemon.assets.quality]}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.imageContainer, { width, height }]}>
        {renderCurrentView()}
        
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
        
        {renderQualityBadge()}
      </View>
      
      {renderControls()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    borderRadius: 8,
  },
  webView: {
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
  },
  qualityBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
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
  controls: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 4,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
  },
});