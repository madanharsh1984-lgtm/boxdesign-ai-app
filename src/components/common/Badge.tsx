import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colours } from '@/theme/colours';
import { borderRadius } from '@/theme/spacing';

type BadgeStatus = 'draft' | 'approved' | 'delivered' | 'processing' | 'paid' | 'failed' | 'info';

interface BadgeProps {
  label: string;
  status: BadgeStatus;
  size?: 'sm' | 'md';
}

const STATUS_COLOURS: Record<BadgeStatus, string> = {
  draft: '#F39C12',
  approved: '#27AE60',
  delivered: '#2E86C1',
  processing: '#9B59B6',
  paid: '#27AE60',
  failed: '#E74C3C',
  info: '#7F8C8D',
};

const Badge: React.FC<BadgeProps> = ({ label, status, size = 'md' }) => {
  const isSm = size === 'sm';

  return (
    <View 
      style={[
        styles.container, 
        { backgroundColor: STATUS_COLOURS[status] },
        isSm ? styles.smContainer : styles.mdContainer
      ]}
    >
      <Text style={[styles.text, isSm ? styles.smText : styles.mdText]}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  mdContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  text: {
    color: colours.textLight,
    fontWeight: 'bold',
  },
  smText: {
    fontSize: 9,
  },
  mdText: {
    fontSize: 11,
  },
});

export default Badge;
