import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colours } from '@/theme/colours';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { useAuthStore } from '@/store/authStore';

const ProfileScreen = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/onboarding');
          }
        },
      ]
    );
  };

  const initial = (user?.contactName || user?.profile?.contactName || 'B').charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Navy Top Section */}
        <View style={styles.topSection}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
              <Text style={styles.companyName}>{user?.companyName || user?.profile?.companyName || 'Acme Packaging'}</Text>
              <Text style={styles.contactName}>{user?.contactName || user?.profile?.contactName || 'John Doe'}</Text>
              <TouchableOpacity style={styles.editBtn}>
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Settings Sections */}
        <View style={styles.content}>
          <SectionHeader label="BRAND ASSETS" />
          <SettingsRow icon="🖼️" label="Logo" onPress={() => {}} showChevron />
          <SettingsRow icon="🎨" label="Colours" onPress={() => {}} showChevron />
          <SettingsRow icon="📐" label="Patterns" onPress={() => {}} showChevron />

          <SectionHeader label="SUBSCRIPTION" />
          <View style={styles.subscriptionCard}>
            <View>
              <Text style={styles.planStatus}>Free Trial</Text>
              <Text style={styles.planSubtext}>Ends in 5 days</Text>
            </View>
            <TouchableOpacity style={styles.upgradeBtn}>
              <Text style={styles.upgradeBtnText}>Upgrade</Text>
            </TouchableOpacity>
          </View>

          <SectionHeader label="PREFERENCES" />
          <SettingsRow 
            icon="🔔" 
            label="Notifications" 
            rightElement={
              <Switch 
                value={notificationsEnabled} 
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#D1D5DB', true: '#2E86C1' }}
              />
            } 
          />
          <SettingsRow icon="🌐" label="Language" value="English" onPress={() => {}} showChevron />

          <SectionHeader label="SUPPORT" />
          <SettingsRow icon="💬" label="Help & Support" onPress={() => {}} showChevron />
          <SettingsRow icon="⭐" label="Rate the App" onPress={() => {}} showChevron />
          <SettingsRow icon="ℹ️" label="About" onPress={() => {}} showChevron />

          <SectionHeader label="ACCOUNT" />
          <SettingsRow 
            icon="🚪" 
            label="Logout" 
            labelStyle={{ color: '#E74C3C' }} 
            onPress={handleLogout} 
          />

          <Text style={styles.version}>BoxDesign AI v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const SectionHeader = ({ label }: { label: string }) => (
  <Text style={styles.sectionHeader}>{label}</Text>
);

const SettingsRow = ({ 
  icon, 
  label, 
  value, 
  onPress, 
  showChevron, 
  rightElement,
  labelStyle 
}: any) => (
  <TouchableOpacity 
    style={styles.row} 
    onPress={onPress} 
    disabled={!onPress}
  >
    <View style={styles.rowLeft}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={[styles.rowLabel, labelStyle]}>{label}</Text>
    </View>
    <View style={styles.rowRight}>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {rightElement}
      {showChevron && <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSection: {
    backgroundColor: '#1A3C6E',
    height: 240,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  safeArea: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E67E22',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  companyName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  contactName: {
    fontSize: 14,
    color: '#AED6F1',
    marginTop: 4,
  },
  editBtn: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  editBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: spacing.m,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7F8C8D',
    marginTop: spacing.l,
    marginBottom: spacing.s,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F7',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 15,
    color: '#2C3E50',
    fontWeight: '500',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValue: {
    fontSize: 14,
    color: '#7F8C8D',
    marginRight: 8,
  },
  subscriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EBF5FB',
    padding: 16,
    borderRadius: 12,
    marginVertical: 4,
  },
  planStatus: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A3C6E',
  },
  planSubtext: {
    fontSize: 12,
    color: '#5DADE2',
    marginTop: 2,
  },
  upgradeBtn: {
    backgroundColor: '#E67E22',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  upgradeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  version: {
    textAlign: 'center',
    color: '#BDC3C7',
    fontSize: 12,
    marginTop: 40,
    marginBottom: 20,
  },
});

export default ProfileScreen;
