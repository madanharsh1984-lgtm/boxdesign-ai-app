import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';
import { colours } from '@/theme/colours';
import { spacing, borderRadius } from '@/theme/spacing';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onDismiss: () => void;
  visible: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, type, onDismiss, visible }) => {
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        onDismiss();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      Animated.timing(translateY, {
        toValue: -150,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const getBgColor = () => {
    switch (type) {
      case 'success': return colours.success;
      case 'error': return colours.error;
      case 'info': return colours.primary;
      case 'warning': return colours.accent;
      default: return colours.primary;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✗';
      case 'info': return 'ℹ';
      case 'warning': return '⚠';
      default: return 'ℹ';
    }
  };

  if (!visible && (translateY as any)._value === -150) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: getBgColor(), transform: [{ translateY }] },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{getIcon()}</Text>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: spacing.base,
    right: spacing.base,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    zIndex: 9999,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    color: colours.textLight,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: spacing.sm,
  },
  message: {
    flex: 1,
    color: colours.textLight,
    fontSize: 14,
    fontWeight: '500',
  },
  dismissButton: {
    padding: 4,
    marginLeft: spacing.sm,
  },
  dismissText: {
    color: colours.textLight,
    fontSize: 16,
    opacity: 0.8,
  },
});

export default Toast;
