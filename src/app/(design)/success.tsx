import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colours } from '@/theme/colours';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { useDesignStore } from '@/store/designStore';
import { useOrderStore } from '@/store/orderStore';

const SuccessScreen = () => {
  const router = useRouter();
  const { request, resetRequest } = useDesignStore();
  const orderStore = useOrderStore();
  const { activeOrder } = orderStore;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // Real file data from store
  const fileLinks = [
    { type: 'PDF', url: activeOrder?.pdfUrl || null, icon: 'document-text' as const },
    { type: 'PNG', url: activeOrder?.pngUrl || null, icon: 'image' as const },
    { type: 'CDR/SVG', url: activeOrder?.cdrUrl || null, icon: 'document' as const },
  ];
  const isGenerating = activeOrder?.status === 'generating';

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Refresh if generating
    if (isGenerating && activeOrder?.id) {
      const timer = setInterval(() => {
        orderStore.fetchActiveOrder(activeOrder.id);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [isGenerating, activeOrder?.id]);

  const handleDownload = (url: string | null, type: string) => {
    if (!url) {
      Alert.alert('Coming Soon', `Your ${type} file is being generated. Check back in a moment.`);
      return;
    }
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open file.'));
  };

  const handleShareToPrinter = () => {
    Alert.alert('Share', 'Sharing CDR file to printer via WhatsApp...');
  };

  const handleNewDesign = () => {
    resetRequest();
    router.replace('/(main)/home');
  };

  const [rating, setRating] = React.useState(0);

  return (
    <View style={styles.container}>
      {/* Navy Header */}
      <View style={styles.navyHeader}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <Animated.View style={[styles.checkCircle, { transform: [{ scale: scaleAnim }] }]}>
              <Ionicons name="checkmark" size={60} color={colours.success} />
            </Animated.View>
            <Text style={styles.title}>Your design is ready!</Text>
            <Text style={styles.subtitle}>Files sent to your email</Text>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Overlapping Card */}
        <View style={styles.downloadCard}>
          <Text style={styles.cardTitle}>Download Your Files</Text>
          
          {fileLinks.map((f) => (
            <View key={f.type} style={styles.fileRow}>
              <View style={styles.fileInfo}>
                <Ionicons name={f.icon} size={24} color={colours.primary} />
                <View style={styles.fileTextContainer}>
                  <Text style={styles.fileLabel}>{f.type} File</Text>
                  <Text style={styles.fileSize}>{f.url ? 'Ready' : isGenerating ? 'Generating...' : 'Pending'}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.downloadBtn, !f.url && { opacity: 0.5 }]}
                onPress={() => handleDownload(f.url, f.type)}
              >
                <Text style={styles.downloadBtnText}>{f.url ? 'Download' : '...'}</Text>
              </TouchableOpacity>
            </View>
          ))}

          {isGenerating && (
            <TouchableOpacity onPress={() => activeOrder?.id && orderStore.fetchActiveOrder(activeOrder.id)}>
              <Text style={{ textAlign: 'center', color: colours.secondary, marginTop: 12, fontWeight: '600' }}>
                Refresh Status
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.sharePrinterBtn}
            onPress={handleShareToPrinter}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
            <Text style={styles.sharePrinterText}>Share CDR to Printer</Text>
          </TouchableOpacity>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingLabel}>Rate this design</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons 
                  name={star <= rating ? "star" : "star-outline"} 
                  size={32} 
                  color="#E67E22" 
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom Buttons */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity 
            style={styles.secondaryBtn}
            onPress={() => router.replace('/(main)/orders')}
          >
            <Text style={styles.secondaryBtnText}>Go to My Orders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.primaryBtn}
            onPress={handleNewDesign}
          >
            <Text style={styles.primaryBtnText}>Start New Design</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navyHeader: {
    backgroundColor: '#1A3C6E',
    height: '40%',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  headerContent: {
    alignItems: 'center',
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.l,
  },
  title: {
    ...typography.h2,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#AED6F1',
  },
  scrollContent: {
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.xl,
  },
  downloadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.l,
    marginTop: -40,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: spacing.l,
  },
  cardTitle: {
    ...typography.h4,
    color: '#1A3C6E',
    fontWeight: '700',
    marginBottom: spacing.m,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F7',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileTextContainer: {
    marginLeft: 12,
  },
  fileLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  fileSize: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  downloadBtn: {
    borderWidth: 1,
    borderColor: '#1A3C6E',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  downloadBtnText: {
    color: '#1A3C6E',
    fontSize: 12,
    fontWeight: '600',
  },
  sharePrinterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#25D366',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: spacing.l,
  },
  sharePrinterText: {
    marginLeft: 8,
    color: '#25D366',
    fontWeight: '600',
  },
  ratingSection: {
    alignItems: 'center',
    marginVertical: spacing.l,
  },
  ratingLabel: {
    ...typography.body,
    color: '#7F8C8D',
    marginBottom: spacing.s,
  },
  starsRow: {
    flexDirection: 'row',
  },
  bottomButtons: {
    marginTop: spacing.m,
  },
  primaryBtn: {
    backgroundColor: '#E67E22',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.m,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#1A3C6E',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#1A3C6E',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SuccessScreen;
