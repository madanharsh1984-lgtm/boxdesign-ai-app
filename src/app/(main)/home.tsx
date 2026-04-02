// ─── SCR-05: Home Dashboard ───────────────────────────────────────────────────
import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, SafeAreaView, FlatList,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
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
  generating: colours.info,
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
  const orderStore = useOrderStore();
  const { orders, stats, isLoading } = orderStore;

  useEffect(() => {
    orderStore.fetchOrders();
    orderStore.fetchStats();
  }, []);

  const totalDesigns   = stats?.total ?? orders.length;
  const approvedCount  = (stats?.approved ?? 0) + (stats?.delivered ?? 0) || orders.filter((o) => o.status === 'approved' || o.status === 'delivered').length;
  const pendingCount   = (stats?.pending ?? 0) + (stats?.draft ?? 0) || orders.filter((o) => o.status === 'draft' || o.status === 'generating').length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colours.primary} />

      {/* Header */}
      <LinearGradient
        colors={['#1A3C6E', '#295493']}
        style={styles.header}
      >
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
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total Designs', value: totalDesigns },
            { label: 'Approved',      value: approvedCount },
            { label: 'Pending',       value: pendingCount  },
          ].map((s, index) => (
            <MotiView 
              key={s.label} 
              style={styles.statCard}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 100 * (index + 1) }}
            >
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </MotiView>
          ))}
        </View>

        {/* New Design CTA */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(design)/step1-dimensions');
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaIcon}>＋</Text>
          <Text style={styles.ctaText}>Create New Design</Text>
        </TouchableOpacity>

        {/* Recent Designs */}
        <Text style={styles.sectionTitle}>Recent Designs</Text>
        
        {isLoading && orders.length === 0 ? (
          <View style={{ paddingVertical: spacing.xxxl }}>
            <ActivityIndicator size="large" color={colours.primary} />
          </View>
        ) : orders.length === 0 ? (
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
            contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: spacing.base }}
            scrollEnabled={true}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colours.bg },
  header: {
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
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadow.md,
    borderWidth: 1,
    borderColor: '#f0f0f0',
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
