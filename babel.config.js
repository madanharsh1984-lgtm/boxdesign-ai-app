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
      // 'expo-router/babel' is removed as it's deprecated in SDK 50
      'react-native-reanimated/plugin',
    ],
  };
};
