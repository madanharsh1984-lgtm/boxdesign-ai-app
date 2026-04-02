import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Animated,
  Easing, Dimensions, TouchableOpacity, Alert, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { useDesignStore } from '@/store/designStore';
import { designApi } from '@/services/api/design';

const { width } = Dimensions.get('window');

const FUN_FACTS = [
  "3mm bleed prevents white edges after cutting",
  "CMYK colour mode is required for offset printing",
  "Standard RSC boxes use ~15% more sheet than die-cut",
  "300 DPI minimum resolution ensures crisp print quality",
  "Box dielines include score lines for clean folding",
];

const FALLBACK_STEPS = [
  "Analyzing product photos...",
  "Searching market trends...",
  "Applying brand colors...",
  "Generating 3D die-lines...",
  "Finalizing design variations...",
];

const GeneratingScreen = () => {
  const { generationJobId, setGeneratedDesigns } = useDesignStore();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [progressPct, setProgressPct] = useState(0);
  const [currentStep, setCurrentStep] = useState('Starting generation...');

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const stepOpacity = useRef(new Animated.Value(1)).current;

  // Animate progress bar smoothly towards progressPct
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPct / 100,
      duration: 600,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [progressPct]);

  useEffect(() => {
    // Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true,
      })
    ).start();

    // Step text cycling
    const stepInterval = setInterval(() => {
      Animated.timing(stepOpacity, {
        toValue: 0, duration: 400, useNativeDriver: true,
      }).start(() => {
        setCurrentStepIndex(prev => (prev + 1) % FALLBACK_STEPS.length);
        Animated.timing(stepOpacity, {
          toValue: 1, duration: 400, useNativeDriver: true,
        }).start();
      });
    }, 3000);

    // Fun facts cycling
    const factInterval = setInterval(() => {
      setCurrentFactIndex(prev => (prev + 1) % FUN_FACTS.length);
    }, 5000);

    // Poll backend for job status
    let pollCount = 0;
    const MAX_POLLS = 60; // 120 seconds

    const pollInterval = setInterval(async () => {
      pollCount++;
      if (pollCount > MAX_POLLS) {
        clearInterval(pollInterval);
        Alert.alert('Generation Timeout', 'Please try again.', [
          { text: 'OK', onPress: () => router.replace('/(main)/home') },
        ]);
        return;
      }

      try {
        const jobId = generationJobId || useDesignStore.getState().generationJobId;
        if (!jobId) return;

        const res = await designApi.getStatus(jobId);
        const { status, progress, current_step, designs } = res.data;

        setProgressPct(progress ?? 0);
        if (current_step) setCurrentStep(current_step);

        if (status === 'complete' && designs && designs.length > 0) {
          clearInterval(pollInterval);
          // Map backend designs → DesignThemeResult shape for the store
          const mapped = designs.map((d: any, i: number) => ({
            id: d.id || `design-${i}`,
            themeName: d.theme,
            theme: d.theme,
            thumbnailColor: d.colour || d.color || '#1A3C6E',
            thumbnailUrl: d.image_url || '',
            flatDesignUrl: d.image_url || '',
            imageUrl: d.image_url || null,
            isFavourite: false,
            prompt: d.revised_prompt || '',
            palette: d.palette || ['#1A3C6E'],
            colourPalette: d.palette || ['#1A3C6E'],
            fonts: d.fonts || ['Inter'],
            dimensions: '',
          }));
          setGeneratedDesigns({ designs: mapped, jobId, generatedAt: new Date().toISOString() });
          router.replace('/(design)/gallery');
        } else if (status === 'failed') {
          clearInterval(pollInterval);
          Alert.alert('Generation Failed', 'Please try again.', [
            { text: 'OK', onPress: () => router.replace('/(main)/home') },
          ]);
        }
      } catch (err) {
        console.warn('Poll error:', err);
        // Continue polling on network errors
      }
    }, 2000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(factInterval);
      clearInterval(pollInterval);
    };
  }, [generationJobId]);

  const handleCancel = () => {
    Alert.alert(
      'Cancel Generation',
      'Are you sure you want to stop generating these designs?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: () => router.replace('/(main)/home') },
      ]
    );
  };

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.centerContent}>
        <Animated.View style={[styles.boxContainer, { transform: [{ rotateY: spin }, { rotateX: spin }] }]}>
          <View style={styles.boxFace} />
        </Animated.View>
        <Animated.Text style={[styles.stepText, { opacity: stepOpacity }]}>
          {currentStep || FALLBACK_STEPS[currentStepIndex]}
        </Animated.Text>
        <Text style={styles.subtitle}>{progressPct}% complete</Text>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>
      </View>
      <View style={styles.factCard}>
        <Text style={styles.factText}>{FUN_FACTS[currentFactIndex]}</Text>
      </View>
      <TouchableOpacity style={styles.cancelLink} onPress={handleCancel}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default GeneratingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A3C6E',
    justifyContent: 'space-between',
    paddingVertical: 50,
  },
  centerContent: {
    alignItems: 'center',
    marginTop: 100,
  },
  boxContainer: {
    width: 80,
    height: 80,
    marginBottom: 40,
  },
  boxFace: {
    width: 80,
    height: 80,
    backgroundColor: '#E67E22',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  stepText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  subtitle: {
    fontSize: 14,
    color: '#AED6F1',
    marginBottom: 40,
  },
  progressTrack: {
    width: width * 0.8,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#E67E22',
  },
  factCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 30,
    padding: 20,
    borderRadius: 15,
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  factText: {
    color: '#2C3E50',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
  cancelLink: {
    alignSelf: 'center',
  },
  cancelText: {
    color: '#FFFFFF',
    fontSize: 14,
    textDecorationLine: 'underline',
    opacity: 0.8,
  },
});
