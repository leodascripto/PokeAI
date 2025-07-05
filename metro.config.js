const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configurações para melhorar performance e reduzir warnings
config.resolver.assetExts.push('db', 'mp3', 'ttf', 'obj', 'png', 'jpg');

// Configurações para resolver módulos de forma mais eficiente
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

// Ignorar warnings específicos durante o bundling
config.resolver.blacklistRE = /(node_modules.*react[\\\/]dist.*)|(website\\.*)|(__tests__.*)/;

module.exports = config;