import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ViewStyle } from 'react-native';
import { colours } from '@/theme/colours';
import { spacing, borderRadius } from '@/theme/spacing';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showLabel?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  label,
  showLabel = true,
}) => {
  const progress = Math.min(Math.max(current / total, 0), 1);
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false, // Width animation doesn't support native driver
    }).start();
  }, [progress]);

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const percentage = Math.round(progress * 100);

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>
            {label || `Step ${current} of ${total}`}
          </Text>
          <Text style={styles.percentage}>{percentage}%</Text>
        </View>
      )}
      
      <View style={styles.track}>
        <Animated.View 
          style={[
            styles.fill, 
            { width: widthInterpolation } as any
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    color: colours.textSecondary,
    fontWeight: '500',
  },
  percentage: {
    fontSize: 12,
    color: colours.textSecondary,
  },
  track: {
    height: 6,
    backgroundColor: colours.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colours.accent,
    borderRadius: borderRadius.full,
  },
});

export default ProgressBar;
