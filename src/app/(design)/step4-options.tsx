import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colours } from '@/theme/colours';
import { useDesignStore } from '@/store/designStore';

const Step4Options = () => {
  const { currentRequest, updateRequest } = useDesignStore();
  
  const [useExistingPattern, setUseExistingPattern] = useState(false);
  const [includeCompetitorResearch, setIncludeCompetitorResearch] = useState(true);
  const [autoFillProductInfo, setAutoFillProductInfo] = useState(false);
  const [barcodeNumber, setBarcodeNumber] = useState('');
  const [includeQrCode, setIncludeQrCode] = useState(true);

  const handleGenerate = () => {
    updateRequest({
      useExistingPattern,
      includeCompetitorResearch,
      autoFillProductInfo,
      barcodeNumber,
      includeQrCode,
    });
    router.push('/(design)/generating');
  };

  const renderToggleRow = (
    label: string,
    subtitle: string,
    value: boolean,
    onValueChange: (val: boolean) => void
  ) => (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#D1D5DB', true: '#E67E22' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A3C6E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Design</Text>
        <Text style={styles.stepIndicator}>4/5</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress Dots */}
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4, 5].map((dot) => (
            <View
              key={dot}
              style={[
                styles.dot,
                dot === 4 ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Additional Options</Text>

        {/* Enhance Design Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Enhance Your Design</Text>
          {renderToggleRow(
            'Use existing brand pattern?',
            'Uses your uploaded brand pattern as style reference',
            useExistingPattern,
            setUseExistingPattern
          )}
          {renderToggleRow(
            'Research similar products?',
            'AI searches web for competitor packaging styles',
            includeCompetitorResearch,
            setIncludeCompetitorResearch
          )}
          {renderToggleRow(
            'Auto-fill product info?',
            'Pulls product details, certifications, warnings from web',
            autoFillProductInfo,
            setAutoFillProductInfo
          )}
        </View>

        {/* Print Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Print Details</Text>
          <Text style={styles.label}>Barcode / QR Code</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter EAN-13 or leave blank"
            value={barcodeNumber}
            onChangeText={setBarcodeNumber}
          />
          {renderToggleRow(
            'Include QR code?',
            'Generates a QR code for your product URL',
            includeQrCode,
            setIncludeQrCode
          )}
        </View>

        {/* Review Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Design Summary</Text>
          <View style={styles.summaryRow}>
            <Ionicons name="cube-outline" size={16} color="#2E86C1" />
            <Text style={styles.summaryText}>
              {currentRequest.dimensions?.style} | {currentRequest.dimensions?.length}x{currentRequest.dimensions?.width}x{currentRequest.dimensions?.height} {currentRequest.dimensions?.unit}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="image-outline" size={16} color="#2E86C1" />
            <Text style={styles.summaryText}>
              {currentRequest.photoUris?.length || 0} Photos Uploaded
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="business-outline" size={16} color="#2E86C1" />
            <Text style={styles.summaryText}>
              {currentRequest.brandName} ({currentRequest.category})
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="time-outline" size={16} color="#2E86C1" />
            <Text style={styles.summaryText}>Est. Generation Time: ~45 seconds</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.generateButton} onPress={handleGenerate}>
          <Text style={styles.generateButtonText}>Generate 10 Designs 🎨</Text>
        </TouchableOpacity>
        <Text style={styles.footerInfo}>Estimated time: 30–60 seconds</Text>
      </View>
    </SafeAreaView>
  );
};

export default Step4Options;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3C6E',
  },
  stepIndicator: {
    fontSize: 14,
    color: '#1A3C6E',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 150,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#E67E22',
  },
  inactiveDot: {
    borderWidth: 1,
    borderColor: '#7F8C8D',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A3C6E',
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 15,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
  },
  toggleSubtitle: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
    paddingRight: 20,
  },
  label: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8ECF0',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#E1F5FE',
    padding: 20,
    borderRadius: 15,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A3C6E',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    color: '#2C3E50',
    marginLeft: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  generateButton: {
    backgroundColor: '#E67E22',
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#E67E22',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  footerInfo: {
    marginTop: 8,
    fontSize: 12,
    color: '#7F8C8D',
  },
});
