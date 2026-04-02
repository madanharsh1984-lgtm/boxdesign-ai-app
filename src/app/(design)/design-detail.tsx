import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { colours } from '@/theme/colours';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { useDesignStore } from '@/store/designStore';

const { width } = Dimensions.get('window');

const HTML_3D_BOX = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #F8FAFC; }
    .scene { width: 200px; height: 200px; perspective: 600px; }
    .cube { width: 100%; height: 100%; position: relative; transform-style: preserve-3d; animation: rotate 10s infinite linear; }
    @keyframes rotate { from { transform: rotateY(0deg) rotateX(45deg); } to { transform: rotateY(360deg) rotateX(45deg); } }
    .face { position: absolute; width: 200px; height: 200px; border: 2px solid #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; color: white; opacity: 0.9; }
    .front  { transform: rotateY(0deg) translateZ(100px); background: #E67E22; }
    .back   { transform: rotateY(180deg) translateZ(100px); background: #D35400; }
    .right  { transform: rotateY(90deg) translateZ(100px); background: #E67E22; }
    .left   { transform: rotateY(-90deg) translateZ(100px); background: #D35400; }
    .top    { transform: rotateX(90deg) translateZ(100px); background: #F39C12; }
    .bottom { transform: rotateX(-90deg) translateZ(100px); background: #A04000; }
  </style>
</head>
<body>
  <div class="scene">
    <div class="cube">
      <div class="face front">Front</div>
      <div class="face back">Back</div>
      <div class="face right">Right</div>
      <div class="face left">Left</div>
      <div class="face top">Top</div>
      <div class="face bottom">Bottom</div>
    </div>
  </div>
</body>
</html>
`;

export default function DesignDetailScreen() {
  const { designId } = useLocalSearchParams();
  const router = useRouter();
  const designStore = useDesignStore();
  const [activeTab, setActiveTab] = useState<'Flat' | '3D' | 'AR'>('Flat');

  // Find design from store or use mock
  const design = {
    id: designId,
    themeName: 'Premium',
    thumbnailColor: '#2C3E50',
    palette: ['#1A3C6E', '#2E86C1', '#E67E22', '#F8FAFC'],
    fonts: 'Inter Bold, Roboto Regular',
    dimensions: '20x15x10 cm',
    brandName: 'Brand AI',
    tagline: 'Future of Packaging'
  };

  const handleEditText = () => {
    Alert.prompt(
      'Edit Design Text',
      'Change brand name and tagline:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Save', 
          onPress: (text) => {
            console.log('Update text:', text);
          } 
        }
      ],
      'plain-text',
      design.brandName
    );
  };

  const handleSelect = () => {
    designStore.selectDesign(designId as string);
    router.push('/(design)/approval');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Flat':
        return (
          <ScrollView 
            maximumZoomScale={3} 
            minimumZoomScale={1} 
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.previewContainer, { backgroundColor: design.thumbnailColor }]}>
              <Text style={styles.previewText}>{design.brandName}</Text>
              <Text style={styles.previewTagline}>{design.tagline}</Text>
            </View>

            <View style={styles.detailsCard}>
              <Text style={styles.sectionTitle}>Design Details</Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.label}>Theme:</Text>
                <Text style={styles.value}>{design.themeName}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Dimensions:</Text>
                <Text style={styles.value}>{design.dimensions}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Fonts:</Text>
                <Text style={styles.value}>{design.fonts}</Text>
              </View>

              <View style={styles.paletteContainer}>
                <Text style={styles.label}>Colour Palette:</Text>
                <View style={styles.swatchRow}>
                  {design.palette.map((color, idx) => (
                    <View key={idx} style={[styles.swatch, { backgroundColor: color }]} />
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.editBtn} onPress={handleEditText}>
                <Ionicons name="pencil" size={18} color={colours.primary} />
                <Text style={styles.editBtnText}>Edit Text</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );
      case '3D':
        return (
          <View style={styles.webContainer}>
            <WebView 
              originWhitelist={['*']}
              source={{ html: HTML_3D_BOX }}
              style={styles.webView}
            />
            <Text style={styles.hintText}>Touch to rotate</Text>
          </View>
        );
      case 'AR':
        return (
          <View style={styles.arPlaceholder}>
            <Ionicons name="camera" size={64} color="#7F8C8D" />
            <Text style={styles.arTitle}>AR View — Coming Soon in Beta</Text>
            <Text style={styles.arSubtitle}>Point your camera at a flat surface</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{design.themeName} Theme</Text>
        <TouchableOpacity style={styles.selectPill} onPress={handleSelect}>
          <Text style={styles.selectPillText}>Select</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(['Flat', '3D', 'AR'] as const).map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'Flat' ? 'Flat View' : tab === '3D' ? '3D View' : 'AR View'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flex: 1 }}>
        {renderTabContent()}
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.shareBtn}>
          <Ionicons name="share-outline" size={20} color={colours.primary} />
          <Text style={styles.shareBtnText}>Share Preview</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fullSelectBtn} onPress={handleSelect}>
          <Text style={styles.fullSelectBtnText}>Select This Design</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  selectPill: {
    backgroundColor: '#E67E22',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  selectPillText: {
    color: 'white',
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#E67E22',
  },
  tabText: {
    color: '#7F8C8D',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#1A3C6E',
  },
  previewContainer: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  previewTagline: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
  },
  detailsCard: {
    margin: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2C3E50',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
    color: '#7F8C8D',
    width: 100,
  },
  value: {
    color: '#2C3E50',
    flex: 1,
  },
  paletteContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  swatchRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#E8ECF0',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1A3C6E',
    paddingVertical: 8,
    borderRadius: 8,
  },
  editBtnText: {
    color: '#1A3C6E',
    fontWeight: '600',
    marginLeft: 8,
  },
  webContainer: {
    flex: 1,
    height: 400,
  },
  webView: {
    backgroundColor: 'transparent',
  },
  hintText: {
    textAlign: 'center',
    color: '#7F8C8D',
    padding: 10,
  },
  arPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 400,
  },
  arTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 16,
  },
  arSubtitle: {
    color: '#7F8C8D',
    marginTop: 4,
  },
  bottomActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8ECF0',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1A3C6E',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  shareBtnText: {
    color: '#1A3C6E',
    fontWeight: '600',
    marginLeft: 8,
  },
  fullSelectBtn: {
    backgroundColor: '#E67E22',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  fullSelectBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
