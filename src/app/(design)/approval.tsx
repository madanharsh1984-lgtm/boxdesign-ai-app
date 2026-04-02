import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colours } from '@/theme/colours';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { useDesignStore } from '@/store/designStore';
import { useAuthStore } from '@/store/authStore';

const ApprovalScreen = () => {
  const router = useRouter();
  const { request, updateRequest: setRequest } = useDesignStore();
  const { user } = useAuthStore();

  const [isModalVisible, setModalVisible] = useState(false);
  const [tempBrandName, setTempBrandName] = useState(request.brandName || '');
  const [tempTagline, setTempTagline] = useState(request.tagline || '');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const timestamp = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleUpdateText = () => {
    setRequest({ ...request, brandName: tempBrandName, tagline: tempTagline });
    setModalVisible(false);
  };

  const handleShare = (platform: 'WhatsApp' | 'Email') => {
    Alert.alert('Share Design', `Preparing to share design via ${platform}...`);
  };

  const handleProceed = () => {
    if (!isConfirmed) {
      Alert.alert('Action Required', 'Please confirm that the design is ready for printing.');
      return;
    }
    router.push('/(design)/payment');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colours.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Design</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Design Preview */}
        <View style={[styles.previewCard, { backgroundColor: colours.secondary }]}>
          <View style={styles.previewOverlay}>
            <Text style={styles.themeName}>{request.dimensions?.style || 'Modern Minimal'}</Text>
          </View>
        </View>

        {/* Design Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Design Details</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text style={styles.editLink}>Edit Text</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.detailsCard}>
            <DetailRow label="Brand Name" value={request.brandName || 'N/A'} />
            <DetailRow label="Tagline" value={request.tagline || 'N/A'} />
            <DetailRow label="Box Style" value={request.boxStyle || 'Standard Carton'} />
            <DetailRow 
              label="Dimensions" 
              value={`${request.dimensions?.length || 0} x ${request.dimensions?.width || 0} x ${request.dimensions?.height || 0} ${request.dimensions?.unit || 'cm'}`} 
            />
          </View>
        </View>

        {/* Share Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share for Approval</Text>
          <View style={styles.shareRow}>
            <TouchableOpacity 
              style={[styles.shareButton, styles.whatsappButton]} 
              onPress={() => handleShare('WhatsApp')}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
              <Text style={[styles.shareText, { color: '#25D366' }]}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.shareButton, styles.emailButton]} 
              onPress={() => handleShare('Email')}
            >
              <Ionicons name="mail-outline" size={20} color={colours.secondary} />
              <Text style={[styles.shareText, { color: colours.secondary }]}>Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Digital Sign-off */}
        <View style={styles.signOffCard}>
          <TouchableOpacity 
            style={styles.checkboxRow} 
            onPress={() => setIsConfirmed(!isConfirmed)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isConfirmed ? "checkbox" : "square-outline"} 
              size={24} 
              color={isConfirmed ? colours.success : colours.textSecondary} 
            />
            <Text style={styles.checkboxLabel}>I confirm this design is ready for printing</Text>
          </TouchableOpacity>

          <View style={styles.signOffInfo}>
            <View style={styles.infoField}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{user?.contactName || 'Guest User'}</Text>
            </View>
            <View style={styles.infoField}>
              <Text style={styles.infoLabel}>Timestamp</Text>
              <Text style={styles.infoValue}>{timestamp}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.proceedButton, !isConfirmed && styles.disabledButton]} 
          onPress={handleProceed}
          disabled={!isConfirmed}
        >
          <Text style={styles.proceedButtonText}>Proceed to Payment →</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Design Text</Text>
            <Text style={styles.inputLabel}>Brand Name</Text>
            <TextInput
              style={styles.input}
              value={tempBrandName}
              onChangeText={setTempBrandName}
              placeholder="Enter brand name"
            />
            <Text style={styles.inputLabel}>Tagline</Text>
            <TextInput
              style={styles.input}
              value={tempTagline}
              onChangeText={setTempTagline}
              placeholder="Enter tagline"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateText}>
                <Text style={styles.saveButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    ...typography.h3,
    color: '#2C3E50',
    fontWeight: '700',
  },
  scrollContent: {
    padding: spacing.m,
    paddingBottom: spacing.xl,
  },
  previewCard: {
    height: 180,
    borderRadius: 12,
    marginBottom: spacing.l,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  previewOverlay: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: spacing.m,
  },
  themeName: {
    ...typography.h4,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.l,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  sectionTitle: {
    ...typography.h4,
    color: '#2C3E50',
    fontWeight: '600',
  },
  editLink: {
    color: '#2E86C1',
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.m,
    borderWidth: 1,
    borderBottomColor: '#E8ECF0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.s,
  },
  detailLabel: {
    color: '#7F8C8D',
  },
  detailValue: {
    color: '#2C3E50',
    fontWeight: '500',
  },
  shareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.s,
  },
  shareButton: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  whatsappButton: {
    borderColor: '#25D366',
  },
  emailButton: {
    borderColor: '#2E86C1',
  },
  shareText: {
    marginLeft: 8,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#E8ECF0',
    marginVertical: spacing.l,
  },
  signOffCard: {
    backgroundColor: '#EBF5FB',
    borderRadius: 12,
    padding: spacing.m,
    marginBottom: spacing.l,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  checkboxLabel: {
    marginLeft: 12,
    color: '#2C3E50',
    fontWeight: '500',
    flex: 1,
  },
  signOffInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoField: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  infoValue: {
    color: '#2C3E50',
    fontWeight: '600',
  },
  proceedButton: {
    backgroundColor: '#E67E22',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.l,
  },
  modalTitle: {
    ...typography.h3,
    marginBottom: spacing.l,
    textAlign: 'center',
  },
  inputLabel: {
    marginBottom: 8,
    color: '#2C3E50',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8ECF0',
    borderRadius: 8,
    padding: 12,
    marginBottom: spacing.m,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.m,
  },
  cancelButton: {
    flex: 0.45,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#7F8C8D',
    fontWeight: '600',
  },
  saveButton: {
    flex: 0.45,
    backgroundColor: '#1A3C6E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ApprovalScreen;
