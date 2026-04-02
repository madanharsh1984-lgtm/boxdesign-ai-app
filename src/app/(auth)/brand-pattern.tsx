import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colours } from '@/theme/colours';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { useAuthStore } from '@/store/authStore';

const { width } = Dimensions.get('window');

const BrandPattern = () => {
  const router = useRouter();
  const updateProfile = useAuthStore((state: any) => state.updateProfile);
  
  const [file, setFile] = useState<{ uri: string; name: string; type?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setFile({
          uri: asset.uri,
          name: asset.fileName || 'brand_pattern.png',
          type: asset.type,
        });
      }
    } catch (error) {
      console.error('Error picking file:', error);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Mock upload - just save local URI for now
      if (file) {
        await updateProfile({ brandPattern: file.uri });
      }
      router.replace('/(main)/home');
    } catch (error) {
      console.error('Save failed', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.replace('/(main)/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>Step 2 of 2</Text>
          <Text style={styles.progressPercent}>100%</Text>
        </View>
        <View style={styles.progressBase}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Brand Pattern</Text>
          <Text style={styles.subtitle}>
            Upload an existing packaging design so we can match your brand style (optional)
          </Text>
        </View>

        {!file ? (
          <TouchableOpacity 
            style={styles.uploadArea} 
            onPress={handleUpload}
            activeOpacity={0.7}
          >
            <View style={styles.uploadContent}>
              <Text style={styles.uploadIcon}>📁</Text>
              <Text style={styles.uploadTitle}>Tap to upload or drag your file here</Text>
              <Text style={styles.uploadSupport}>Supports: PNG, PDF, JPG</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewLabel}>Selected File</Text>
              <TouchableOpacity onPress={removeFile} style={styles.removeButton}>
                <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.fileInfo}>
              {file.type === 'image' || file.name.match(/\.(jpg|jpeg|png)$/i) ? (
                <Image source={{ uri: file.uri }} style={styles.imagePreview} />
              ) : (
                <View style={styles.fileIconPlaceholder}>
                  <Text style={styles.fileIconText}>📄</Text>
                </View>
              )}
              <View style={styles.fileDetails}>
                <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                <Text style={styles.fileSize}>Ready to upload</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.primaryButton, loading && styles.disabledButton]} 
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save & Continue'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip} disabled={loading}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BrandPattern;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colours.bgCard || '#FFFFFF',
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
    flexGrow: 1,
  },
  header: {
    marginTop: spacing.xl || 30,
    marginBottom: spacing.xxl || 40,
  },
  title: {
    fontSize: typography.h2?.fontSize || 24,
    fontWeight: 'bold',
    color: colours.primary || '#1A3C6E',
    marginBottom: spacing.s || 10,
  },
  subtitle: {
    fontSize: 15,
    color: colours.textSecondary || '#7F8C8D',
    lineHeight: 22,
  },
  uploadArea: {
    height: 220,
    width: '100%',
    borderWidth: 2,
    borderColor: colours.secondary || '#2E86C1',
    borderStyle: 'dashed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
  },
  uploadContent: {
    alignItems: 'center',
    padding: spacing.l || 20,
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: spacing.m || 16,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colours.secondary || '#2E86C1',
    textAlign: 'center',
    marginBottom: spacing.xs || 8,
  },
  uploadSupport: {
    fontSize: 12,
    color: colours.textSecondary || '#7F8C8D',
  },
  previewCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colours.border || '#E8ECF0',
    padding: spacing.m || 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m || 16,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colours.textPrimary || '#2C3E50',
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FDECEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: colours.error || '#E74C3C',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  fileIconPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F1F3F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileIconText: {
    fontSize: 24,
  },
  fileDetails: {
    flex: 1,
    marginLeft: spacing.m || 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: colours.textPrimary || '#2C3E50',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: colours.success || '#27AE60',
    fontWeight: '500',
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: spacing.xl || 40,
  },
  primaryButton: {
    backgroundColor: colours.accent || '#E67E22',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m || 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipText: {
    fontSize: 15,
    color: colours.textSecondary || '#7F8C8D',
    fontWeight: '500',
  },
});
