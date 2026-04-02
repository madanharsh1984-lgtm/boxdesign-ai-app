import React, { useState, useEffect } from 'react';
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
import { colours } from '@/theme/colours';
import { useDesignStore } from '@/store/designStore';

const THEME_COLORS: Record<string, string> = {
  'Minimalist': '#ECF0F1',
  'Bold': '#E74C3C',
  'Premium': '#2C3E50',
  'Earthy': '#A9771A',
  'Industrial': '#7F8C8D',
  'Playful': '#E91E63',
  'Monochrome': '#34495E',
  'Gradient': '#8E44AD',
  'Pattern': '#16A085',
  'Brand-matched': '#1A3C6E',
};

export default function CompareScreen() {
  const { ids } = useLocalSearchParams();
  const router = useRouter();
  const designStore = useDesignStore();
  const [selectedDesigns, setSelectedDesigns] = useState<any[]>([]);

  useEffect(() => {
    if (ids) {
      const idArray = (ids as string).split(',');
      // Mocking fetching designs by ID
      const designs = idArray.map(id => ({
        id,
        themeName: id.includes('0') ? 'Minimalist' : id.includes('1') ? 'Bold' : id.includes('2') ? 'Premium' : 'Industrial',
      }));
      setSelectedDesigns(designs);
    }
  }, [ids]);

  const handleSwap = (index: number) => {
    Alert.alert(
      'Swap Design',
      'Select a theme to replace this one:',
      Object.keys(THEME_COLORS).map(theme => ({
        text: theme,
        onPress: () => {
          const newDesigns = [...selectedDesigns];
          newDesigns[index] = { ...newDesigns[index], themeName: theme };
          setSelectedDesigns(newDesigns);
        }
      })).concat([{ text: 'Cancel', style: 'cancel' } as any])
    );
  };

  const handleSelect = (designId: string) => {
    designStore.selectDesign(designId);
    router.push('/(design)/approval');
  };

  const renderCell = (design: any, index: number) => {
    const bgColor = THEME_COLORS[design.themeName] || '#FFFFFF';
    const isSingleColumn = selectedDesigns.length <= 2;

    return (
      <View key={design.id} style={[styles.cell, isSingleColumn && styles.cellLarge]}>
        <View style={[styles.placeholder, { backgroundColor: bgColor }]}>
          <TouchableOpacity 
            style={styles.swapBtn}
            onPress={() => handleSwap(index)}
          >
            <Ionicons name="swap-horizontal" size={16} color="#7F8C8D" />
          </TouchableOpacity>
        </View>
        <View style={styles.cellContent}>
          <Text style={styles.themeName}>{design.themeName}</Text>
          <TouchableOpacity 
            style={styles.selectBtn}
            onPress={() => handleSelect(design.id)}
          >
            <Text style={styles.selectBtnText}>Select</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Compare Designs</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color="#2C3E50" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {selectedDesigns.map((design, index) => renderCell(design, index))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>Done</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
  },
  scrollContent: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cell: {
    width: '48%',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8ECF0',
    overflow: 'hidden',
    elevation: 2,
  },
  cellLarge: {
    width: '100%',
    marginBottom: 24,
  },
  placeholder: {
    height: 160,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 8,
  },
  swapBtn: {
    backgroundColor: 'white',
    padding: 6,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cellContent: {
    padding: 12,
    alignItems: 'center',
  },
  themeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A3C6E',
    marginBottom: 8,
  },
  selectBtn: {
    backgroundColor: '#E67E22',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
  },
  selectBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8ECF0',
  },
  doneBtn: {
    backgroundColor: '#1A3C6E',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
