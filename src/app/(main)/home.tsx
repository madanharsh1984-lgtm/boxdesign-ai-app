// ─── SCR-05: Home Dashboard ───────────────────────────────────────────────────
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, SafeAreaView, FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore }  from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore';
import { colours }       from '@/theme/colours';
import { fontSize, fontWeight } from '@/theme/typography';
import { spacing, borderRadius, shadow } from '@/theme/spacing';
import { formatINR, timeAgo } from '@/utils/formatters';
import type { Order } from '@/types/order';

const STATUS_COLOUR: Record<string, string> = {
  draft:      colours.draft,
  approved:   colours.approved,
  delivered:  colours.delivered,
  processing: colours.info,
  paid:       colours.success,
  failed:     colours.error,
};

function OrderCard({ order }: { order: Order }) {
  return (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push({ pathname: '/(design)/design-detail', params: { orderId: order.id } })}
    >
      {/* Placeholder thumbnail */}
      <View style={styles.thumbnail} />
      <View style={styles.orderInfo}>
        <Text style={styles.orderId} numberOfLines={1}>#{order.id.slice(-8)}</Text>
        <View style={[styles.badge, { backgroundColor: STATUS_COLOUR[order.status] ?? colours.info }]}>
          <Text style={styles.badgeText}>{order.status.toUpperCase()}</Text>
        </View>
        <Text style={styles.orderDate}>{timeAgo(order.createdAt)}</Text>
        <Text style={styles.orderAmount}>{formatINR(order.totalAmountInr)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { user }   = useAuthStore();
  const { orders } = useOrderStore();

  const totalDesigns   = orders.length;
  const approvedCount  = orders.filter((o) => o.status === 'approved' || o.status === 'delivered').length;
  const pendingCount   = orders.filter((o) => o.status === 'draft' || o.status === 'processing').length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colours.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hello, {user?.profile?.contactName ?? 'there'} 👋
          </Text>
          <Text style={styles.company}>
            {user?.profile?.companyName ?? 'Your Company'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => router.push('/(main)/profile')}
        >
          <Text style={styles.avatarText}>
            {(user?.profile?.contactName ?? 'U')[0].toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total Designs', value: totalDesigns },
            { label: 'Approved',      value: approvedCount },
            { label: 'Pending',       value: pendingCount  },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* New Design CTA */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/(design)/step1-dimensions')}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaIcon}>＋</Text>
          <Text style={styles.ctaText}>Create New Design</Text>
        </TouchableOpacity>

        {/* Recent Designs */}
        <Text style={styles.sectionTitle}>Recent Designs</Text>
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No designs yet.</Text>
            <Text style={styles.emptySubtext}>Tap "Create New Design" to get started!</Text>
          </View>
        ) : (
          <FlatList
            data={orders.slice(0, 10)}
            keyExtractor={(o) => o.id}
            renderItem={({ item }) => <OrderCard order={item} />}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.base }}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colours.bg },
  header: {
    backgroundColor: colours.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  greeting: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colours.textLight },
  company:  { fontSize: fontSize.sm, color: colours.bgLight, marginTop: 2 },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colours.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colours.textLight },
  body: { flex: 1, paddingHorizontal: spacing.base },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.base,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colours.bgCard,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadow.sm,
  },
  statValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colours.primary },
  statLabel: { fontSize: fontSize.xs, color: colours.textSecondary, marginTop: 2 },
  ctaButton: {
    backgroundColor: colours.accent,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.base,
    marginTop: spacing.base,
    ...shadow.md,
  },
  ctaIcon: { fontSize: fontSize.xl, color: colours.textLight, marginRight: spacing.sm },
  ctaText: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colours.textLight },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colours.textPrimary,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  orderCard: {
    width: 160,
    backgroundColor: colours.bgCard,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
    marginBottom: spacing.base,
    overflow: 'hidden',
    ...shadow.sm,
  },
  thumbnail: { width: '100%', height: 100, backgroundColor: colours.bgLight },
  orderInfo: { padding: spacing.sm },
  orderId:   { fontSize: fontSize.xs, color: colours.textSecondary },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.sm,
    paddingHorizontal: 6, paddingVertical: 2,
    marginTop: 4,
  },
  badgeText:   { fontSize: 9, fontWeight: fontWeight.bold, color: colours.textLight },
  orderDate:   { fontSize: fontSize.xs, color: colours.textSecondary, marginTop: 4 },
  orderAmount: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colours.primary, marginTop: 2 },
  emptyState:  { alignItems: 'center', paddingVertical: spacing.xxxl },
  emptyIcon:   { fontSize: 48, marginBottom: spacing.md },
  emptyText:   { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colours.textPrimary },
  emptySubtext:{ fontSize: fontSize.sm, color: colours.textSecondary, marginTop: spacing.xs, textAlign: 'center' },
});
