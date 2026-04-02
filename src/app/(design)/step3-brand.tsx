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
import { Category, Market, FontStyle } from '@/types/design';
import { useDesignStore } from '@/store/designStore';

const CATEGORIES = ['Food', 'Electronics', 'FMCG', 'Pharma', 'E-commerce', 'Industrial', 'Other'];
const TARGET_MARKETS = ['Retail', 'Online', 'Export'];
const FONT_STYLES = ['Modern', 'Classic', 'Bold', 'Handwritten', 'Minimal'];
const SWATCHES = [
  { name: 'Navy', color: '#1A3C6E' },
  { name: 'Blue', color: '#2E86C1' },
  { name: 'Orange', color: '#E67E22' },
  { name: 'Green', color: '#2ECC71' },
  { name: 'Red', color: '#E74C3C' },
  { name: 'Purple', color: '#9B59B6' },
  { name: 'Black', color: '#2C3E50' },
  { name: 'Gold', color: '#D4AF37' },
];

const Step3Brand = () => {
  const updateRequest = useDesignStore((state) => state.updateRequest);
  
  const [brandName, setBrandName] = useState('');
  const [tagline, setTagline] = useState('');
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Food');
  const [targetMarket, setTargetMarket] = useState('Retail');
  const [fontStyle, setFontStyle] = useState('Modern');
  const [preferredColours, setPreferredColours] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleColour = (color: string) => {
    if (preferredColours.includes(color)) {
      setPreferredColours(preferredColours.filter((c) => c !== color));
    } else if (preferredColours.length < 3) {
      setPreferredColours([...preferredColours, color]);
    }
  };

  const handleNext = () => {
    const newErrors: Record<string, string> = {};
    if (!brandName.trim()) newErrors.brandName = 'Required';
    if (!productName.trim()) newErrors.productName = 'Required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateRequest({
      brandName,
      tagline,
      productName,
      category: category as Category,
      targetMarket: targetMarket as Market,
      fontStyle: fontStyle as FontStyle,
      preferredColours,
      prompt,
    });
    router.push('/(design)/step4-options');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A3C6E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Design</Text>
        <Text style={styles.stepIndicator}>3/5</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Progress Dots */}
          <View style={styles.progressContainer}>
            {[1, 2, 3, 4, 5].map((dot) => (
              <View
                key={dot}
                style={[
                  styles.dot,
                  dot === 3 ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>

          <Text style={styles.sectionTitle}>Brand & Product Details</Text>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <Text style={styles.label}>Brand Name *</Text>
            <TextInput
              style={[styles.input, errors.brandName ? styles.inputError : {}]}
              placeholder="Your Brand"
              value={brandName}
              onChangeText={setBrandName}
            />

            <Text style={styles.label}>Tagline (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Fresh From Farm"
              value={tagline}
              onChangeText={setTagline}
            />

            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={[styles.input, errors.productName ? styles.inputError : {}]}
              placeholder="e.g. Organic Milk"
              value={productName}
              onChangeText={setProductName}
            />

            <Text style={styles.label}>Product Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipContainer}
            >
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCategory(c)}
                  style={[
                    styles.chip,
                    category === c ? styles.activeChip : styles.inactiveChip,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      category === c ? styles.activeChipText : styles.inactiveChipText,
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Target Market</Text>
            <View style={styles.marketRow}>
              {TARGET_MARKETS.map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setTargetMarket(m)}
                  style={[
                    styles.marketButton,
                    targetMarket === m ? styles.activeMarket : styles.inactiveMarket,
                  ]}
                >
                  <Text
                    style={[
                      styles.marketText,
                      targetMarket === m ? styles.activeMarketText : styles.inactiveMarketText,
                    ]}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Font Style</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipContainer}
            >
              {FONT_STYLES.map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFontStyle(f)}
                  style={[
                    styles.chip,
                    fontStyle === f ? styles.activeChip : styles.inactiveChip,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      fontStyle === f ? styles.activeChipText : styles.inactiveChipText,
                    ]}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Preferred Colours (Max 3)</Text>
            <View style={styles.swatchRow}>
              {SWATCHES.map((swatch) => (
                <TouchableOpacity
                  key={swatch.color}
                  style={[styles.swatch, { backgroundColor: swatch.color }]}
                  onPress={() => toggleColour(swatch.color)}
                >
                  {preferredColours.includes(swatch.color) && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Prompt / Vision</Text>
            <View style={styles.promptContainer}>
              <TextInput
                style={styles.promptInput}
                placeholder="Describe your design vision, mood, special instructions..."
                multiline
                numberOfLines={4}
                maxLength={500}
                value={prompt}
                onChangeText={setPrompt}
                textAlignVertical="top"
              />
              <Text style={styles.counter}>{prompt.length}/500</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Step3Brand;

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
  formSection: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
    marginTop: 20,
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
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  chipContainer: {
    flexDirection: 'row',
    marginBottom: 10,
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
  marketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  marketButton: {
    flex: 0.3,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  activeMarket: {
    backgroundColor: '#E67E22',
    borderColor: '#E67E22',
  },
  inactiveMarket: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E8ECF0',
  },
  marketText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeMarketText: {
    color: '#FFFFFF',
  },
  inactiveMarketText: {
    color: '#7F8C8D',
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  swatch: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8ECF0',
    borderRadius: 8,
    padding: 12,
  },
  promptInput: {
    height: 100,
    fontSize: 16,
    color: '#2C3E50',
  },
  counter: {
    textAlign: 'right',
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 5,
  },
  footer: {
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
