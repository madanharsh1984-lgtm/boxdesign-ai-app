import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colours } from '@/theme/colours';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { useDesignStore } from '@/store/designStore';
import { PRICING_PLANS, PricingTier } from '@/types/order';
import { formatINR, calcGST } from '@/utils/formatters';

const PaymentScreen = () => {
  const router = useRouter();
  const { request } = useDesignStore();
  const [selectedTier, setSelectedTier] = useState<PricingTier>('standard');
  const [promoCode, setPromoCode] = useState('');

  const selectedPlan = PRICING_PLANS.find(p => p.tier === selectedTier) || PRICING_PLANS[1];
  const { gstAmount, totalAmount } = calcGST(selectedPlan.priceInr);

  const handlePay = () => {
    Alert.alert(
      'Payment Gateway',
      'Razorpay payment gateway — configure RAZORPAY_KEY_ID in .env to enable live payments',
      [
        {
          text: 'Mock Success',
          onPress: () => router.replace('/(design)/success'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colours.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Your Plan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Plan Cards */}
        <View style={styles.plansContainer}>
          {PRICING_PLANS.map((plan) => {
            const isSelected = selectedTier === plan.tier;
            return (
              <TouchableOpacity
                key={plan.tier}
                style={[
                  styles.planCard,
                  isSelected && styles.selectedPlanCard,
                ]}
                onPress={() => setSelectedTier(plan.tier as PricingTier)}
                activeOpacity={0.9}
              >
                <View style={styles.planHeader}>
                  <View>
                    <Text style={styles.planName}>{plan.label}</Text>
                    <Text style={styles.planPrice}>{formatINR(plan.priceInr)}<Text style={styles.planPer}>/design</Text></Text>
                  </View>
                  {plan.tier === 'standard' && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>Most Popular</Text>
                    </View>
                  )}
                </View>

                <View style={styles.chipRow}>
                  {plan.files.map(file => (
                    <View key={file} style={styles.fileChip}>
                      <Text style={styles.fileChipText}>{file.toUpperCase()}</Text>
                    </View>
                  ))}
                  <View style={[styles.revisionChip, { backgroundColor: colours.secondary }]}>
                    <Text style={styles.revisionChipText}>
                      {plan.revisions === 0 ? 'No Revisions' : `${plan.revisions} Revision${plan.revisions > 1 ? 's' : ''}`}
                    </Text>
                  </View>
                </View>

                <Text style={styles.planDescription}>{plan.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Design theme:</Text>
            <Text style={styles.summaryValue}>{request.theme?.name || 'Modern Minimal'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Plan:</Text>
            <Text style={styles.summaryValue}>{selectedPlan.label}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatINR(selectedPlan.priceInr)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>GST (18%)</Text>
            <Text style={styles.summaryValue}>{formatINR(gstAmount)}</Text>
          </View>
          <View style={[styles.summaryRow, { marginTop: 8 }]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatINR(totalAmount)}</Text>
          </View>
        </View>

        {/* Promo Code */}
        <View style={styles.promoContainer}>
          <TextInput
            style={styles.promoInput}
            placeholder="Promo Code"
            value={promoCode}
            onChangeText={setPromoCode}
          />
          <TouchableOpacity style={styles.applyButton}>
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>

        {/* Security Badges */}
        <View style={styles.securityRow}>
          <Text style={styles.securityText}>🔒 Secure Payment</Text>
          <Text style={styles.securitySeparator}>|</Text>
          <Text style={styles.securityText}>✓ Razorpay</Text>
        </View>

        {/* Pay Button */}
        <TouchableOpacity style={styles.payButton} onPress={handlePay}>
          <Text style={styles.payButtonText}>Pay {formatINR(totalAmount)} →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    ...typography.h3,
    color: '#2C3E50',
    fontWeight: '700',
  },
  scrollContent: {
    padding: spacing.m,
    paddingBottom: spacing.xl,
  },
  plansContainer: {
    marginBottom: spacing.l,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: '#E8ECF0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  selectedPlanCard: {
    borderColor: '#E67E22',
    borderWidth: 2,
    backgroundColor: '#FEF9E7',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.s,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3C6E',
  },
  planPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: '#E67E22',
    marginTop: 4,
  },
  planPer: {
    fontSize: 14,
    fontWeight: '400',
    color: '#7F8C8D',
  },
  popularBadge: {
    backgroundColor: '#E67E22',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: spacing.s,
  },
  fileChip: {
    backgroundColor: '#E8ECF0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  fileChipText: {
    fontSize: 10,
    color: '#2C3E50',
    fontWeight: '600',
  },
  revisionChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  revisionChipText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  planDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.m,
    marginBottom: spacing.l,
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  summaryTitle: {
    ...typography.h4,
    color: '#1A3C6E',
    fontWeight: '700',
    marginBottom: spacing.m,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#7F8C8D',
  },
  summaryValue: {
    color: '#2C3E50',
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E8ECF0',
    marginVertical: spacing.s,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A3C6E',
  },
  promoContainer: {
    flexDirection: 'row',
    marginBottom: spacing.l,
  },
  promoInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8ECF0',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  applyButton: {
    backgroundColor: '#1A3C6E',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  securityRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  securityText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  securitySeparator: {
    marginHorizontal: 10,
    color: '#E8ECF0',
  },
  payButton: {
    backgroundColor: '#E67E22',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default PaymentScreen;
