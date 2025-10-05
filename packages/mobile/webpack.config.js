const path = require('path');
const webpack = require('webpack');
const { createExpoWebpackConfigAsync } = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['@react-navigation', 'react-native-reanimated'],
      },
    },
    argv
  );

  // Customize the config
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    'react-native$': 'react-native-web',
    'react-native-svg': 'react-native-svg-web',
  };

  // Add path resolution
  config.resolve.alias['@'] = path.resolve(__dirname, 'src');
  config.resolve.alias['@/components'] = path.resolve(__dirname, 'src/components');
  config.resolve.alias['@/screens'] = path.resolve(__dirname, 'src/screens');
  config.resolve.alias['@/services'] = path.resolve(__dirname, 'src/services');
  config.resolve.alias['@/hooks'] = path.resolve(__dirname, 'src/hooks');
  config.resolve.alias['@/utils'] = path.resolve(__dirname, 'src/utils');
  config.resolve.alias['@/types'] = path.resolve(__dirname, 'src/types');
  config.resolve.alias['@/constants'] = path.resolve(__dirname, 'src/constants');
  config.resolve.alias['@/theme'] = path.resolve(__dirname, 'src/theme');

  // Add entry point
  config.entry = {
    main: './web/index.js',
  };

  // Modify output
  config.output = {
    ...config.output,
    path: path.resolve(__dirname, 'web/dist'),
    filename: 'bundle.js',
    publicPath: '/',
  };

  // Add plugins
  config.plugins = [
    ...config.plugins,
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(env.mode === 'development'),
    }),
  ];

  return config;
};