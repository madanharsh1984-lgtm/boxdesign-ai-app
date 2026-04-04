import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { colours } from '@/theme/colours';
import { spacing } from '@/theme/spacing';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('@/assets/animations/loading-box.json')}
        autoPlay
        loop
        style={styles.lottie}
      />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colours.background,
    padding: spacing.xl,
  },
  lottie: {
    width: 200,
    height: 200,
  },
  message: {
    marginTop: spacing.md,
    color: colours.text,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default LoadingSpinner;
