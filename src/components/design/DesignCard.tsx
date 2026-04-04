import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { MotiView, MotiText } from 'moti';
import { colours } from '@/theme/colours';
import { spacing, borderRadius, shadow } from '@/theme/spacing';
import Card from '@/components/common/Card';
import * as Haptics from 'expo-haptics';

interface DesignCardProps {
  id: string;
  image: string;
  title: string;
  category: string;
  status: 'draft' | 'approved' | 'delivered';
  onPress: () => void;
  index?: number;
}

const DesignCard: React.FC<DesignCardProps> = ({
  id,
  image,
  title,
  category,
  status,
  onPress,
  index = 0,
}) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const getStatusColour = () => {
    switch (status) {
      case 'approved': return colours.approved;
      case 'delivered': return colours.delivered;
      case 'draft': return colours.draft;
      default: return colours.textSecondary;
    }
  };

  return (
    <Card animate={true} delay={index * 100} style={styles.cardContainer}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        <View style={styles.content}>
          <MotiText 
            from={{ opacity: 0, translateX: -10 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', duration: 300, delay: index * 100 + 200 }}
            style={styles.category}
          >
            {category}
          </MotiText>
          <MotiText 
            from={{ opacity: 0, translateX: -10 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', duration: 300, delay: index * 100 + 300 }}
            style={styles.title}
          >
            {title}
          </MotiText>
          <View style={styles.footer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColour() + '20' }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColour() }]} />
              <Text style={[styles.statusText, { color: getStatusColour() }]}>{status}</Text>
            </View>
            <Text style={styles.id}>#{id.slice(-6).toUpperCase()}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: spacing.m,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: colours.bgLight,
  },
  content: {
    padding: spacing.m,
  },
  category: {
    fontSize: 12,
    color: colours.accent,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colours.textPrimary,
    marginBottom: spacing.s,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.s,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  id: {
    fontSize: 12,
    color: colours.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

export default DesignCard;
