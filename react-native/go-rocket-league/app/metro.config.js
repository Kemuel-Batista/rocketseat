const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('gz');

  // React Native já tem WebSocket global; o Colyseus SDK faz require('ws') que puxa módulos Node (stream).
  // Redirecionamos "ws" para um stub que exporta globalThis.WebSocket.
  // h3-js: forçar build browser (evita Buffer/Node) e usar polyfill TextDecoder utf-16le no app.
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === 'ws' || moduleName === 'ws/') {
      return {
        filePath: path.resolve(__dirname, 'lib/colyseus/ws-polyfill.js'),
        type: 'sourceFile',
      };
    }
    if (moduleName === 'h3-js' || moduleName === 'h3-js/dist/h3-js.es.js') {
      const browserEs = path.resolve(
        __dirname,
        'node_modules/h3-js/dist/browser/h3-js.es.js'
      );
      return { filePath: browserEs, type: 'sourceFile' };
    }
    return context.resolveRequest(context, moduleName, platform);
  };

module.exports = config;
