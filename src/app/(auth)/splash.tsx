// ─── SCR-01: Splash Screen ────────────────────────────────────────────────────
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { colours } from '@/theme/colours';
import { fontSize, fontWeight } from '@/theme/typography';

export default function SplashScreen() {
  const { isAuthenticated } = useAuthStore();
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const logoScale    = useRef(new Animated.Value(0.7)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate logo in
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity,  { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.spring(logoScale,    { toValue: 1, useNativeDriver: true }),
      ]),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    // Navigate after 2.5s
    const timer = setTimeout(() => {
      router.replace(isAuthenticated ? '/(main)/home' : '/(auth)/onboarding');
    }, 2500);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colours.bgDark} />

      <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        {/* Replace with actual SVG logo */}
        <View style={styles.logoBox}>
          <Text style={styles.logoLetter}>B</Text>
        </View>
        <Text style={styles.appName}>BoxDesign AI</Text>
      </Animated.View>

      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Design. Preview. Print.
      </Animated.Text>

      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colours.bgDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colours.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoLetter: {
    fontSize: 44,
    fontWeight: fontWeight.black,
    color: colours.textLight,
  },
  appName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colours.textLight,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: fontSize.md,
    color: colours.bgLight,
    letterSpacing: 2,
    marginTop: 8,
  },
  version: {
    position: 'absolute',
    bottom: 32,
    fontSize: fontSize.xs,
    color: colours.textMuted,
  },
});
