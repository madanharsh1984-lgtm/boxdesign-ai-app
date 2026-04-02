import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colours } from '@/theme/colours';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { useOrderStore } from '@/store/orderStore';

const MOCK_ORDERS = [
  { id: 'ORD-7721', status: 'Delivered', date: '28 Mar 2026', amount: '₹943', color: '#3498DB' },
  { id: 'ORD-7650', status: 'Approved', date: '25 Mar 2026', amount: '₹943', color: '#27AE60' },
  { id: 'ORD-7592', status: 'Delivered', date: '20 Mar 2026', amount: '₹1769', color: '#8E44AD' },
  { id: 'ORD-7401', status: 'Draft', date: '15 Mar 2026', amount: '₹0', color: '#F1C40F' },
  { id: 'ORD-7312', status: 'Delivered', date: '10 Mar 2026', amount: '₹353', color: '#E67E22' },
];

const FilterTabs = ['All', 'Draft', 'Approved', 'Delivered'];

const OrdersScreen = () => {
  const router = useRouter();
  const { orders } = useOrderStore();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const displayOrders = orders.length > 0 ? orders : MOCK_ORDERS;
  
  const filteredOrders = displayOrders.filter(order => {
    const matchesFilter = activeFilter === 'All' || order.status === activeFilter;
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const renderOrderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => router.push({ pathname: '/(design)/design-detail', params: { orderId: item.id } })}
    >
      <View style={[styles.thumbnail, { backgroundColor: item.color || colours.secondary }]} />
      <View style={styles.orderInfo}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.orderDate}>{item.date}</Text>
        <View style={styles.orderFooter}>
          <Text style={styles.orderAmount}>{item.amount}</Text>
          <View style={styles.actionRow}>
            {item.status === 'Delivered' && (
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="download-outline" size={18} color={colours.primary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.iconBtn, styles.reorderBtn]}>
              <Ionicons name="refresh-outline" size={18} color="#E67E22" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return '#27AE60';
      case 'Approved': return '#2E86C1';
      case 'Draft': return '#7F8C8D';
      default: return '#F39C12';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#7F8C8D" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by order ID or product"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FilterTabs.map(tab => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.filterTab, activeFilter === tab && styles.activeFilterTab]}
              onPress={() => setActiveFilter(tab)}
            >
              <Text style={[styles.filterText, activeFilter === tab && styles.activeFilterText]}>{tab}</Text>
              {activeFilter === tab && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={80} color="#E8ECF0" />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <TouchableOpacity 
              style={styles.createBtn}
              onPress={() => router.push('/(design)/step1-dimensions')}
            >
              <Text style={styles.createBtnText}>Create your first design</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3C6E',
  },
  searchContainer: {
    padding: spacing.m,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F4F8',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#2C3E50',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF0',
  },
  filterScroll: {
    paddingHorizontal: spacing.m,
  },
  filterTab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#E67E22',
    fontWeight: '700',
  },
  activeIndicator: {
    height: 3,
    backgroundColor: '#E67E22',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  listContent: {
    padding: spacing.m,
    paddingBottom: 40,
  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: spacing.m,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  orderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  orderDate: {
    fontSize: 12,
    color: '#BDC3C7',
    marginBottom: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A3C6E',
  },
  actionRow: {
    flexDirection: 'row',
  },
  iconBtn: {
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E8ECF0',
    marginLeft: 8,
  },
  reorderBtn: {
    borderColor: '#FEF9E7',
    backgroundColor: '#FEF9E7',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#7F8C8D',
    fontWeight: '600',
    marginVertical: 16,
  },
  createBtn: {
    backgroundColor: '#E67E22',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default OrdersScreen;
