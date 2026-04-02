import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colours } from '@/theme/colours';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { useDesignStore } from '@/store/designStore';

const BOX_STYLES = ['RSC', 'Die-cut', 'Tuck-end', 'Mailer', 'Custom'];
const UNITS = ['mm', 'cm', 'inches'];

const Step1Dimensions = () => {
  const updateRequest = useDesignStore((state) => state.updateRequest);
  
  const [style, setStyle] = useState('RSC');
  const [unit, setUnit] = useState('cm');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [productWeightKg, setProductWeightKg] = useState('');
  const [quantity, setQuantity] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!length || parseFloat(length) <= 0) newErrors.length = 'Required';
    if (!width || parseFloat(width) <= 0) newErrors.width = 'Required';
    if (!height || parseFloat(height) <= 0) newErrors.height = 'Required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      updateRequest({
        dimensions: {
          length: parseFloat(length),
          width: parseFloat(width),
          height: parseFloat(height),
          unit: unit as any,
          style: style as any,
          productWeightKg: parseFloat(productWeightKg) || 0,
        },
        quantity: parseInt(quantity, 10) || 0,
      });
      router.push('/(design)/step2-photo');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A3C6E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Design</Text>
        <Text style={styles.stepIndicator}>1/5</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress Dots */}
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4, 5].map((dot) => (
            <View
              key={dot}
              style={[
                styles.dot,
                dot === 1 ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Box Dimensions</Text>

        {/* Box Style Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipContainer}
        >
          {BOX_STYLES.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setStyle(s)}
              style={[
                styles.chip,
                style === s ? styles.activeChip : styles.inactiveChip,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  style === s ? styles.activeChipText : styles.inactiveChipText,
                ]}
              >
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Dimension Inputs */}
        <View style={styles.dimensionsRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Length</Text>
            <TextInput
              style={[styles.input, errors.length && styles.inputError]}
              keyboardType="numeric"
              value={length}
              onChangeText={setLength}
              placeholder="0"
            />
            <Text style={styles.unitText}>{unit}</Text>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Width</Text>
            <TextInput
              style={[styles.input, errors.width && styles.inputError]}
              keyboardType="numeric"
              value={width}
              onChangeText={setWidth}
              placeholder="0"
            />
            <Text style={styles.unitText}>{unit}</Text>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Height</Text>
            <TextInput
              style={[styles.input, errors.height && styles.inputError]}
              keyboardType="numeric"
              value={height}
              onChangeText={setHeight}
              placeholder="0"
            />
            <Text style={styles.unitText}>{unit}</Text>
          </View>
        </View>

        {/* Unit Toggle */}
        <View style={styles.unitToggleContainer}>
          {UNITS.map((u) => (
            <TouchableOpacity
              key={u}
              onPress={() => setUnit(u)}
              style={[
                styles.unitPill,
                unit === u ? styles.activeUnitPill : styles.inactiveUnitPill,
              ]}
            >
              <Text
                style={[
                  styles.unitPillText,
                  unit === u ? styles.activeUnitPillText : styles.inactiveUnitPillText,
                ]}
              >
                {u}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Product Weight & Quantity */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Product Weight (kg)</Text>
          <TextInput
            style={styles.fullInput}
            keyboardType="numeric"
            value={productWeightKg}
            onChangeText={setProductWeightKg}
            placeholder="e.g. 1.5"
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Print Quantity (approx.)</Text>
          <TextInput
            style={styles.fullInput}
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
            placeholder="e.g. 500"
          />
        </View>

        {/* Tip Box */}
        <View style={styles.tipBox}>
          <Text style={styles.tipText}>
            💡 Tip: Standard RSC is the most common box style for shipping products.
          </Text>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Step1Dimensions;

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
    paddingBottom: 100,
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
  chipContainer: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  activeChip: {
    backgroundColor: '#E67E22',
    borderColor: '#E67E22',
  },
  inactiveChip: {
    backgroundColor: '#FFFFFF',
    borderColor: '#1A3C6E',
  },
  chipText: {
    fontWeight: '600',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  inactiveChipText: {
    color: '#1A3C6E',
  },
  dimensionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  inputGroup: {
    flex: 0.3,
    alignItems: 'center',
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
    textAlign: 'center',
    fontSize: 16,
    color: '#2C3E50',
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  unitText: {
    marginTop: 4,
    fontSize: 12,
    color: '#7F8C8D',
  },
  unitToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  unitPill: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  activeUnitPill: {
    backgroundColor: '#E67E22',
    borderColor: '#E67E22',
  },
  inactiveUnitPill: {
    backgroundColor: '#FFFFFF',
  },
  unitPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeUnitPillText: {
    color: '#FFFFFF',
  },
  inactiveUnitPillText: {
    color: '#7F8C8D',
  },
  formSection: {
    marginBottom: 25,
  },
  fullInput: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8ECF0',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#2C3E50',
  },
  tipBox: {
    backgroundColor: '#E1F5FE',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  tipText: {
    color: '#0288D1',
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  nextButton: {
    backgroundColor: '#E67E22',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
