const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configurações essenciais para assets 3D
config.resolver.assetExts.push(
  'db', 'mp3', 'ttf', 'obj', 'png', 'jpg', 'jpeg', 'gif', 'webp',
  // Assets 3D obrigatórios
  'glb', 'gltf', 'mtl', 'dae', 'fbx', '3ds', 'ply', 'stl'
);

// Extensões de source para Three.js
config.resolver.sourceExts.push('js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs');

// Configurações para melhorar performance e reduzir warnings
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Configurações para melhorar o bundling
config.transformer.minifierConfig = {
  keep_classnames: true,
  keep_fnames: true,
  mangle: {
    keep_classnames: true,
    keep_fnames: true,
  },
};

// Resolver configuração para Three.js
config.resolver.alias = {
  'three': 'three',
  'three/examples/jsm': 'three/examples/jsm'
};

// Ignorar warnings específicos durante o bundling
config.resolver.blacklistRE = /(node_modules.*react[\\\/]dist.*)|(website\\.*)|(__tests__.*)/;

module.exports = config;