import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { MotiView } from 'moti';
import { BlurView } from 'expo-blur';
import { colours } from '@/theme/colours';
import { spacing, borderRadius, shadow } from '@/theme/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'glass' | 'solid' | 'outline';
  animate?: boolean;
  delay?: number;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'solid',
  animate = true,
  delay = 0,
}) => {
  const Container = animate ? MotiView : View;
  
  const animationProps = animate ? {
    from: { opacity: 0, scale: 0.9, translateY: 10 },
    animate: { opacity: 1, scale: 1, translateY: 0 },
    transition: { type: 'timing', duration: 400, delay },
  } : {};

  const renderContent = () => (
    <View style={[styles.content, style]}>
      {children}
    </View>
  );

  if (variant === 'glass') {
    return (
      <Container {...animationProps} style={[styles.base, styles.glassContainer, style]}>
        <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
        {children}
      </Container>
    );
  }

  return (
    <Container
      {...animationProps}
      style={[
        styles.base,
        variant === 'solid' ? styles.solid : styles.outline,
        style,
      ]}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  solid: {
    backgroundColor: colours.bgCard,
    ...shadow.md,
  },
  outline: {
    borderWidth: 1,
    borderColor: colours.border,
  },
  glassContainer: {
    backgroundColor: Platform.select({
      ios: 'rgba(255, 255, 255, 0.5)',
      android: 'rgba(255, 255, 255, 0.8)',
    }),
    ...shadow.sm,
  },
  content: {
    padding: spacing.md,
  },
});

export default Card;
