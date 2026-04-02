import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colours } from '@/theme/colours';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { useDesignStore } from '@/store/designStore';
import { DesignThemeResult } from '@/types/design';

const THEMES = [
  { name: 'Minimalist', color: '#ECF0F1' },
  { name: 'Bold', color: '#E74C3C' },
  { name: 'Premium', color: '#2C3E50' },
  { name: 'Earthy', color: '#A9771A' },
  { name: 'Industrial', color: '#7F8C8D' },
  { name: 'Playful', color: '#E91E63' },
  { name: 'Monochrome', color: '#34495E' },
  { name: 'Gradient', color: '#8E44AD' },
  { name: 'Pattern', color: '#16A085' },
  { name: 'Brand-matched', color: '#1A3C6E' },
];

const MOCK_DATA: DesignThemeResult[] = THEMES.map((t, index) => ({
  id: `design-${index}`,
  theme: t.name as any,
  themeName: t.name,
  thumbnailColor: t.color,
  thumbnailUrl: '',
  flatDesignUrl: '',
  imageUrl: '',
  isFavourite: false,
  prompt: `A ${t.name} box design`,
  colourPalette: ['#1A3C6E', '#2E86C1', '#E67E22', '#F8FAFC'],
  fonts: ['Inter Bold', 'Roboto Regular'],
  dimensions: '20x15x10 cm',
}));

export default function GalleryScreen() {
  const router = useRouter();
  const designStore = useDesignStore();
  const realDesigns = designStore.generatedDesigns?.designs ?? [];
  const displayData = realDesigns.length > 0 ? realDesigns : MOCK_DATA;

  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCompareMode, setIsCompareMode] = useState(false);

  const filteredData = useMemo(() => {
    if (selectedFilter === 'All') return displayData;
    return displayData.filter(item => item.themeName === selectedFilter);
  }, [selectedFilter, displayData]);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      if (selectedIds.length >= 4) {
        Alert.alert('Limit Reached', 'You can compare up to 4 designs.');
        return;
      }
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleRegenerate = () => {
    Alert.alert(
      'Regenerate All',
      `This will use 1 regeneration credit. You have ${designStore.regenerationsLeft} left.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            designStore.decrementRegens();
            // Trigger regeneration logic here
          } 
        }
      ]
    );
  };

  const handleRefinePrompt = () => {
    Alert.prompt(
      'Refine Prompt',
      'Enter new keywords for your design:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update', 
          onPress: (text) => designStore.updateRequest({ prompt: text || '' }) 
        }
      ]
    );
  };

  const renderDesignCard = ({ item }: { item: DesignThemeResult }) => {
    const isSelected = selectedIds.includes(item.id);
    const isFavourite = item.isFavourite;

    return (
      <View style={styles.card}>
        <TouchableOpacity 
          style={[styles.thumbnail, { backgroundColor: item.thumbnailColor || '#1A3C6E' }]}
          onPress={() => {
            if (isCompareMode) toggleSelect(item.id);
            else router.push({ pathname: '/(design)/design-detail', params: { designId: item.id } });
          }}
        >
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
              onError={() => {}}
            />
          ) : null}
          <View style={styles.themeBadge}>
            <Text style={styles.themeBadgeText}>{item.themeName}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.favouriteIcon}
            onPress={() => designStore.toggleFavourite(item.id)}
          >
            <Ionicons 
              name={isFavourite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavourite ? "#E74C3C" : "white"} 
            />
          </TouchableOpacity>

          {isCompareMode && (
            <View style={styles.checkboxContainer}>
              <Ionicons 
                name={isSelected ? "checkbox" : "square-outline"} 
                size={24} 
                color={colours.accent} 
              />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.outlineButton}
            onPress={() => router.push({ pathname: '/(design)/design-detail', params: { designId: item.id } })}
          >
            <Text style={styles.outlineButtonText}>View in 3D</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colours.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Your Designs</Text>
          <Text style={styles.headerSubtitle}>Choose your favourite</Text>
        </View>
        <TouchableOpacity onPress={() => setIsCompareMode(!isCompareMode)}>
          <Text style={[styles.headerAction, isCompareMode && { color: colours.accent }]}>
            {isCompareMode ? 'Done' : 'Compare'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {['All', ...THEMES.map(t => t.name)].map(filter => (
            <TouchableOpacity 
              key={filter} 
              style={[styles.chip, selectedFilter === filter && styles.chipActive]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[styles.chipText, selectedFilter === filter && styles.chipTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderDesignCard}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
      />

      {/* Bottom Action Bar */}
      {selectedIds.length > 0 && (
        <View style={styles.actionBar}>
          <TouchableOpacity 
            style={styles.compareBtn}
            onPress={() => router.push({ pathname: '/(design)/compare', params: { ids: selectedIds.join(',') } })}
          >
            <Text style={styles.actionBarText}>Compare Selected ({selectedIds.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.selectBtn}
            onPress={() => {
              const toSelect = displayData.find(d => d.id === selectedIds[0]);
              if (toSelect) {
                designStore.selectDesign(toSelect);
                router.push('/(design)/approval');
              }
            }}
          >
            <Text style={styles.actionBarText}>Select This Design</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* FAB & Regenerate */}
      {!isCompareMode && (
        <View style={styles.footerActions}>
          <TouchableOpacity style={styles.regenerateBtn} onPress={handleRegenerate}>
            <Ionicons name="refresh" size={20} color="white" />
            <Text style={styles.regenerateText}>Regenerate All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.fab} onPress={handleRefinePrompt}>
            <Ionicons name="create" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  headerAction: {
    fontWeight: '600',
    color: '#1A3C6E',
  },
  filterBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF0',
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E8ECF0',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#1A3C6E',
  },
  chipText: {
    color: '#2C3E50',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  gridContent: {
    padding: 8,
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  thumbnail: {
    height: 140,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  themeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  favouriteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  checkboxContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  cardActions: {
    padding: 8,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#1A3C6E',
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: '#1A3C6E',
    fontSize: 12,
    fontWeight: '600',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E8ECF0',
  },
  actionBarText: {
    color: 'white',
    fontWeight: 'bold',
  },
  compareBtn: {
    flex: 1,
    backgroundColor: '#2E86C1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  selectBtn: {
    flex: 1,
    backgroundColor: '#E67E22',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  footerActions: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  regenerateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A3C6E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
  },
  regenerateText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '600',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E67E22',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
