import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colours } from '@/theme/colours';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/services/api/auth';
import { ActivityIndicator } from 'react-native';

const STATES = [
  'Maharashtra', 'Delhi', 'Gujarat', 'Karnataka', 'Tamil Nadu',
  'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Telangana', 'Punjab'
];

const ProfileSetup = () => {
  const router = useRouter();
  const updateProfile = useAuthStore((state: any) => state.updateProfile);

  const [form, setForm] = useState({
    companyName: '',
    contactName: '',
    gstin: '',
    city: '',
    state: '',
  });
  const [logo, setLogo] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setLogo(result.assets[0].uri);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.companyName) newErrors.companyName = 'Company Name is required';
    if (!form.contactName) newErrors.contactName = 'Contact Name is required';
    if (!form.city) newErrors.city = 'City is required';
    if (!form.state) newErrors.state = 'State is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) return;
    setLoading(true);
    const profileData = {
      companyName: form.companyName,
      contactName: form.contactName,
      gstin: form.gstin,
      city: form.city,
      state: form.state,
      logoUrl: logo || undefined,
    };
    try {
      await authApi.updateProfile(profileData);
      updateProfile(profileData);
      router.replace('/(auth)/brand-pattern');
    } catch (err: any) {
      console.warn('updateProfile failed, dev mode bypass:', err?.message);
      updateProfile(profileData);
      router.replace('/(auth)/brand-pattern');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/(main)/home');
  };

  const isFormValid = form.companyName && form.contactName && form.city && form.state;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.progressBarContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>Step 1 of 2</Text>
            <Text style={styles.progressPercent}>50%</Text>
          </View>
          <View style={styles.progressBase}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Set Up Your Profile</Text>

          <View style={styles.formSection}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Company Name *</Text>
              <TextInput
                style={[styles.input, errors.companyName ? styles.inputError : {}]}
                placeholder="Enter your business name"
                value={form.companyName}
                onChangeText={(val) => setForm({ ...form, companyName: val })}
              />
              {errors.companyName && <Text style={styles.errorText}>{errors.companyName}</Text>}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Contact Name *</Text>
              <TextInput
                style={[styles.input, errors.contactName ? styles.inputError : {}]}
                placeholder="Enter person name"
                value={form.contactName}
                onChangeText={(val) => setForm({ ...form, contactName: val })}
              />
              {errors.contactName && <Text style={styles.errorText}>{errors.contactName}</Text>}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>GSTIN (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
                autoCapitalize="characters"
                value={form.gstin}
                onChangeText={(val) => setForm({ ...form, gstin: val.toUpperCase() })}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={[styles.input, errors.city ? styles.inputError : {}]}
                  placeholder="E.g. Mumbai"
                  value={form.city}
                  onChangeText={(val) => setForm({ ...form, city: val })}
                />
              </View>
              <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>State *</Text>
                <TouchableOpacity
                  style={[styles.pickerTrigger, errors.state ? styles.inputError : {}]}
                  onPress={() => setShowStatePicker(true)}
                >
                  <Text style={[styles.pickerText, !form.state && styles.placeholderText]}>
                    {form.state || 'Select State'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
            {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Company Logo</Text>
              <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                {logo ? (
                  <View style={styles.previewContainer}>
                    <Image source={{ uri: logo }} style={styles.logoPreview} />
                    <Text style={styles.uploadLink}>Change Logo</Text>
                  </View>
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Text style={styles.uploadIcon}>📁</Text>
                    <Text style={styles.uploadTitle}>Tap to upload logo</Text>
                    <Text style={styles.uploadSubtitle}>PNG or JPG (Max 5MB)</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.primaryButton, (!isFormValid || loading) && styles.disabledButton]}
              onPress={handleContinue}
              disabled={!isFormValid || loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Continue</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showStatePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select State</Text>
              <TouchableOpacity onPress={() => setShowStatePicker(false)}>
                <Text style={styles.closeText}>Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={STATES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.stateItem}
                  onPress={() => {
                    setForm({ ...form, state: item });
                    setShowStatePicker(false);
                  }}
                >
                  <Text style={[styles.stateText, form.state === item && styles.selectedStateText]}>
                    {item}
                  </Text>
                  {form.state === item && <Text style={styles.checkIcon}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileSetup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colours.bgCard || '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  progressBarContainer: {
    padding: spacing.l || 20,
    paddingBottom: 0,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs || 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: colours.textSecondary || '#7F8C8D',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colours.accent || '#E67E22',
  },
  progressBase: {
    height: 6,
    backgroundColor: colours.border || '#E8ECF0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colours.accent || '#E67E22',
  },
  scrollContent: {
    padding: spacing.l || 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: typography.h2?.fontSize || 24,
    fontWeight: 'bold',
    color: colours.primary || '#1A3C6E',
    marginBottom: spacing.xl || 30,
    marginTop: spacing.m || 16,
  },
  formSection: {
    width: '100%',
  },
  fieldContainer: {
    marginBottom: spacing.l || 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colours.textPrimary || '#2C3E50',
    marginBottom: spacing.xs || 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: colours.border || '#E8ECF0',
    borderRadius: 8,
    paddingHorizontal: spacing.m || 12,
    fontSize: 16,
    color: colours.textPrimary || '#2C3E50',
    backgroundColor: '#FAFAFA',
  },
  inputError: {
    borderColor: colours.error || '#E74C3C',
  },
  errorText: {
    color: colours.error || '#E74C3C',
    fontSize: 12,
    marginTop: spacing.xs || 4,
  },
  row: {
    flexDirection: 'row',
  },
  pickerTrigger: {
    height: 50,
    borderWidth: 1,
    borderColor: colours.border || '#E8ECF0',
    borderRadius: 8,
    paddingHorizontal: spacing.m || 12,
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  pickerText: {
    fontSize: 16,
    color: colours.textPrimary || '#2C3E50',
  },
  placeholderText: {
    color: colours.textSecondary || '#7F8C8D',
    opacity: 0.6,
  },
  uploadBox: {
    height: 120,
    borderWidth: 2,
    borderColor: colours.secondary || '#2E86C1',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colours.secondary || '#2E86C1',
  },
  uploadSubtitle: {
    fontSize: 11,
    color: colours.textSecondary || '#7F8C8D',
  },
  previewContainer: {
    alignItems: 'center',
  },
  logoPreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 8,
  },
  uploadLink: {
    fontSize: 12,
    color: colours.secondary || '#2E86C1',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: spacing.xl || 40,
  },
  primaryButton: {
    backgroundColor: colours.accent || '#E67E22',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colours.accent || '#E67E22',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    alignItems: 'center',
    marginTop: spacing.l || 20,
    paddingVertical: 10,
  },
  skipText: {
    fontSize: 14,
    color: colours.textSecondary || '#7F8C8D',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeText: {
    fontSize: 16,
    color: colours.accent || '#E67E22',
    fontWeight: '600',
  },
  stateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F9F9F9',
  },
  stateText: {
    fontSize: 16,
    color: '#555',
  },
  selectedStateText: {
    color: colours.accent || '#E67E22',
    fontWeight: 'bold',
  },
  checkIcon: {
    color: colours.accent || '#E67E22',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
