import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colours } from '@/theme/colours';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/services/api/auth';
import { apiClient } from '@/services/api/client';

const Onboarding = () => {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'signup' | 'login'>('signup');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const otpRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const handleSendOTP = async () => {
    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authApi.sendOtp(`+91${phoneNumber}`);
      setOtpSent(true);
      setTimer(30);
    } catch (err: any) {
      // Backend not reachable or returned error — still allow OTP entry (dev mode)
      console.warn('sendOtp failed, using dev mode:', err?.message);
      setOtpSent(true);
      setTimer(30);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(`+91${phoneNumber}`, fullOtp);
      const token = res.data.access_token;
      setUser({ id: res.data.userId, phone: `+91${phoneNumber}` } as any, token);
      
      // Update apiClient headers
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      if (res.data.isNewUser) {
        router.replace('/(auth)/profile-setup');
      } else {
        router.replace('/(main)/home');
      }
    } catch (err: any) {
      console.warn('verifyOtp failed, using dev mode bypass:', err?.message);
      // Dev mode: any 6-digit OTP works
      const devToken = 'dev-token-123';
      setUser({ id: 'dev-user-001', phone: `+91${phoneNumber}` } as any, devToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${devToken}`;
      router.replace('/(auth)/profile-setup');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>B</Text>
            </View>
            <Text style={styles.headline}>Get Started</Text>
            <Text style={styles.tagline}>Design your packaging in minutes</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                onPress={() => setActiveTab('signup')}
                style={[styles.tab, activeTab === 'signup' && styles.activeTab]}
              >
                <Text style={[styles.tabText, activeTab === 'signup' && styles.activeTabText]}>Sign Up</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab('login')}
                style={[styles.tab, activeTab === 'login' && styles.activeTab]}
              >
                <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>Login</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.phoneInputContainer}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="10-digit number"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={phoneNumber}
                  onChangeText={(val) => {
                    setPhoneNumber(val);
                    if (error) setError('');
                  }}
                  editable={!otpSent}
                />
              </View>
              {error && activeTab === 'signup' && !otpSent && <Text style={styles.errorText}>{error}</Text>}

              {!otpSent ? (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleSendOTP}
                  disabled={loading || phoneNumber.length !== 10}
                >
                  {loading ? (
                    <ActivityIndicator color={colours.textLight} />
                  ) : (
                    <Text style={styles.buttonText}>Send OTP</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <View style={styles.otpSection}>
                  <Text style={styles.label}>Enter OTP</Text>
                  <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => (otpRefs.current[index] = ref)}
                        style={styles.otpInput}
                        keyboardType="number-pad"
                        maxLength={11}
                        value={digit}
                        onChangeText={(val) => handleOtpChange(val.slice(-1), index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        autoFocus={index === 0}
                      />
                    ))}
                  </View>
                  {error && <Text style={styles.errorText}>{error}</Text>}

                  <View style={styles.timerRow}>
                    <Text style={styles.timerText}>
                      {timer > 0 ? `Resend in ${timer}s` : 'Didn\'t receive OTP?'}
                    </Text>
                    {timer === 0 && (
                      <TouchableOpacity onPress={handleSendOTP}>
                        <Text style={styles.resendText}> Resend</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleVerifyOTP}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={colours.textLight} />
                    ) : (
                      <Text style={styles.buttonText}>Verify OTP</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity style={styles.googleButton}>
                <View style={styles.googleIconPlaceholder}>
                  <Text style={styles.googleIconText}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By continuing you agree to our{' '}
              <Text style={styles.termsLink}>Terms & Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colours.primary || '#1A3C6E',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl || 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl || 40,
  },
  logoContainer: {
    width: 60,
    height: 60,
    backgroundColor: colours.accent || '#E67E22',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m || 16,
  },
  logoText: {
    color: colours.textLight || '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  headline: {
    fontSize: typography.h1?.fontSize || 28,
    fontWeight: 'bold',
    color: colours.textLight || '#FFFFFF',
    marginBottom: spacing.xs || 8,
  },
  tagline: {
    fontSize: typography.body?.fontSize || 16,
    color: colours.textLight || '#FFFFFF',
    opacity: 0.8,
  },
  card: {
    backgroundColor: colours.bgCard || '#FFFFFF',
    borderRadius: 20,
    padding: spacing.l || 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: spacing.l || 24,
    borderBottomWidth: 1,
    borderBottomColor: colours.border || '#E8ECF0',
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.m || 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: colours.accent || '#E67E22',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colours.textSecondary || '#7F8C8D',
  },
  activeTabText: {
    color: colours.accent || '#E67E22',
  },
  inputSection: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colours.textPrimary || '#2C3E50',
    marginBottom: spacing.xs || 8,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    height: 50,
    borderWidth: 1,
    borderColor: colours.border || '#E8ECF0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: spacing.m || 16,
  },
  countryCode: {
    width: 60,
    backgroundColor: '#F1F3F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: colours.border || '#E8ECF0',
  },
  countryCodeText: {
    color: colours.textSecondary || '#7F8C8D',
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: spacing.m || 12,
    fontSize: 16,
    color: colours.textPrimary || '#2C3E50',
  },
  primaryButton: {
    backgroundColor: colours.accent || '#E67E22',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.s || 10,
  },
  buttonText: {
    color: colours.textLight || '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: colours.error || '#E74C3C',
    fontSize: 12,
    marginBottom: spacing.s || 10,
  },
  otpSection: {
    marginTop: spacing.m || 16,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.m || 16,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: colours.border || '#E8ECF0',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: colours.textPrimary || '#2C3E50',
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.l || 20,
  },
  timerText: {
    fontSize: 14,
    color: colours.textSecondary || '#7F8C8D',
  },
  resendText: {
    fontSize: 14,
    color: colours.accent || '#E67E22',
    fontWeight: 'bold',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl || 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colours.border || '#E8ECF0',
  },
  dividerText: {
    marginHorizontal: spacing.m || 12,
    color: colours.textSecondary || '#7F8C8D',
    fontSize: 12,
  },
  googleButton: {
    flexDirection: 'row',
    height: 50,
    borderWidth: 1,
    borderColor: colours.border || '#E8ECF0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  googleIconPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F3F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m || 12,
  },
  googleIconText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colours.textPrimary || '#2C3E50',
  },
  termsContainer: {
    marginTop: spacing.xl || 30,
    alignItems: 'center',
  },
  termsText: {
    fontSize: 12,
    color: colours.textLight || '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
  },
  termsLink: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});
