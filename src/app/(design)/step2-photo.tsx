import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colours } from '@/theme/colours';
import { useDesignStore } from '@/store/designStore';

const Step2Photo = () => {
  const updateRequest = useDesignStore((state) => state.updateRequest);
  
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [useWebImages, setUseWebImages] = useState(false);
  const [quality, setQuality] = useState<'good' | 'low' | 'blurry' | null>(null);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera permissions to make this work!');
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setPhotoUris([uri, ...photoUris]);
      setUseWebImages(false);
      mockQualityCheck();
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setPhotoUris([uri, ...photoUris]);
      setUseWebImages(false);
      mockQualityCheck();
    }
  };

  const mockQualityCheck = () => {
    const qualities: ('good' | 'low' | 'blurry')[] = ['good', 'low', 'blurry'];
    const random = qualities[Math.floor(Math.random() * qualities.length)];
    setQuality(random);
  };

  const handleNext = () => {
    if (photoUris.length === 0 && !useWebImages) {
      Alert.alert('Selection Required', 'Please take a photo or choose to use AI/Web images.');
      return;
    }
    updateRequest({ photoUris, useWebImages });
    router.push('/(design)/step3-brand');
  };

  const renderQualityPill = () => {
    if (!quality) return null;
    let config = { label: '✓ Good Quality', color: '#2ECC71' };
    if (quality === 'low') config = { label: '⚠ Low Light', color: '#E67E22' };
    if (quality === 'blurry') config = { label: '✗ Too Blurry', color: '#E74C3C' };

    return (
      <View style={[styles.qualityPill, { backgroundColor: config.color }]}>
        <Text style={styles.qualityPillText}>{config.label}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A3C6E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Design</Text>
        <Text style={styles.stepIndicator}>2/5</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress Dots */}
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4, 5].map((dot) => (
            <View
              key={dot}
              style={[
                styles.dot,
                dot === 2 ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Product Photo</Text>

        {/* Camera Viewfinder Area */}
        <TouchableOpacity
          style={styles.viewfinder}
          onPress={takePhoto}
          activeOpacity={0.7}
        >
          {photoUris.length > 0 ? (
            <Image source={{ uri: photoUris[0] }} style={styles.mainPhoto} />
          ) : (
            <View style={styles.viewfinderPlaceholder}>
              <Ionicons name="camera" size={48} color="#7F8C8D" />
              <Text style={styles.viewfinderText}>Tap to take photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {renderQualityPill()}

        {photoUris.length > 0 && (
          <View style={styles.enhancedPlaceholder}>
            <Text style={styles.enhancedLabel}>AI Enhanced</Text>
          </View>
        )}

        <View style={styles.orRow}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity
          style={[styles.outlineButton, { borderColor: '#2E86C1' }]}
          onPress={pickImage}
        >
          <Text style={[styles.outlineButtonText, { color: '#2E86C1' }]}>
            Choose from Gallery
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.outlineButton,
            { borderColor: '#E67E22', marginTop: 15 },
            useWebImages && styles.activeWebButton,
          ]}
          onPress={() => {
            setUseWebImages(true);
            setPhotoUris([]);
          }}
        >
          <Text
            style={[
              styles.outlineButtonText,
              { color: useWebImages ? '#FFFFFF' : '#E67E22' },
            ]}
          >
            Use AI / Web Image
          </Text>
        </TouchableOpacity>

        {/* Thumbnail Strip */}
        {photoUris.length > 0 && (
          <View style={styles.thumbnailContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {photoUris.map((uri, index) => (
                <Image key={index} source={{ uri }} style={styles.thumbnail} />
              ))}
              {photoUris.length < 5 && (
                <TouchableOpacity style={styles.addMoreButton} onPress={takePhoto}>
                  <Ionicons name="add" size={24} color="#7F8C8D" />
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        )}
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

export default Step2Photo;

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
  viewfinder: {
    height: 200,
    backgroundColor: '#E8ECF0',
    borderRadius: 15,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  mainPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  viewfinderPlaceholder: {
    alignItems: 'center',
  },
  viewfinderText: {
    marginTop: 10,
    color: '#7F8C8D',
    fontSize: 16,
    fontWeight: '500',
  },
  qualityPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 15,
  },
  qualityPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  enhancedPlaceholder: {
    height: 50,
    backgroundColor: '#EDF2F7',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
  },
  enhancedLabel: {
    color: '#4A5568',
    fontSize: 14,
    fontWeight: '600',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8ECF0',
  },
  orText: {
    marginHorizontal: 15,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  outlineButton: {
    height: 50,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  activeWebButton: {
    backgroundColor: '#E67E22',
    borderColor: '#E67E22',
  },
  thumbnailContainer: {
    marginTop: 25,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  addMoreButton: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E8ECF0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
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
