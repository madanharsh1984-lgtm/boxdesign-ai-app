module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Path aliases — must match tsconfig paths
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@services': './src/services',
            '@store': './src/store',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@theme': './src/theme',
          },
        },
      ],
      // Required for Expo Router
      'expo-router/babel',
      // Required for React Native Reanimated (must be last)
      'react-native-reanimated/plugin',
    ],
  };
};
