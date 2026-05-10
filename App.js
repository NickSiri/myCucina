import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, Modal, ActivityIndicator
} from 'react-native';

// ── MOCK DATA ──────────────────────────────────────────────
const INITIAL_INVENTORY = [
  { id: 1, name: 'Boneless Skinless Chicken Thighs', expiryDate: new Date(2026, 4, 8), category: 'Meat' },
  { id: 2, name: 'Green Cabbage', expiryDate: new Date(2026, 4, 9), category: 'Produce' },
  { id: 3, name: 'Heavy Whipping Cream', expiryDate: new Date(2026, 4, 12), category: 'Dairy' },
  { id: 4, name: 'Raspberries', expiryDate: new Date(2026, 4, 12), category: 'Produce' },
  { id: 5, name: 'Eggs', expiryDate: new Date(2026, 4, 14), category: 'Dairy' },
  { id: 6, name: 'Spring Mix', expiryDate: new Date(2026, 4, 14), category: 'Produce' },
  { id: 7, name: '2% Milk', expiryDate: new Date(2026, 4, 14), category: 'Dairy' },
  { id: 8, name: 'Rotisserie Chicken', expiryDate: new Date(2026, 4, 19), category: 'Meat' },
  { id: 9, name: 'Corn on the Cob', expiryDate: new Date(2026, 4, 20), category: 'Produce' },
  { id: 10, name: 'Strawberry Yogurt', expiryDate: new Date(2026, 4, 21), category: 'Dairy' },
];

const CATEGORIES = ['Produce', 'Meat', 'Dairy', 'Pantry', 'Frozen', 'Other'];
const STORAGE_KEY = 'myCucina_inventory';

// ── HELPERS ────────────────────────────────────────────────
function getDaysUntilExpiry(expiryDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(expiryDate) - today) / (1000 * 60 * 60 * 24));
}

function getUrgencyColor(days) {
  if (days <= 2) return '#FF3B30';
  if (days <= 5) return '#FF9500';
  if (days <= 10) return '#FFCC00';
  return '#34C759';
}

function formatExpiryDate(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── ITEM MODAL ─────────────────────────────────────────────
function ItemModal({ visible, item, onSave, onDelete, onClose }) {
  const isEditing = item !== null;
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Produce');
  const [days, setDays] = useState('7');

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setDays(String(Math.max(0, getDaysUntilExpiry(item.expiryDate))));
    } else {
      setName('');
      setCategory('Produce');
      setDays('7');
    }
  }, [item]);

  function handleSave() {
    if (!name.trim()) return;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(days || '1'));
    onSave({ name: name.trim(), category, expiryDate });
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{isEditing ? 'Edit Item' : 'Add Item'}</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.modalSave}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalBody}>
          <Text style={styles.inputLabel}>Item Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Chicken Thighs"
            value={name}
            onChangeText={setName}
            autoFocus={!isEditing}
          />

          <Text style={styles.inputLabel}>Days Until Expiry</Text>
          <TextInput
            style={styles.textInput}
            placeholder="7"
            value={days}
            onChangeText={setDays}
            keyboardType="number-pad"
          />

          <Text style={styles.inputLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {isEditing && (
            <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(item.id)}>
              <Text style={styles.deleteButtonText}>Delete Item</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ── USE SOON SCREEN ────────────────────────────────────────
function UseSoonScreen({ inventory }) {
  const sorted = [...inventory].sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>myCucina</Text>
        <Text style={styles.headerSubtitle}>Use Soon</Text>
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {sorted.map((item) => {
          const days = getDaysUntilExpiry(item.expiryDate);
          const color = getUrgencyColor(days);
          return (
            <TouchableOpacity key={item.id} style={styles.itemRow}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.expiryDate}>{formatExpiryDate(item.expiryDate)}</Text>
                <Text style={[styles.daysLeft, { color }]}>
                  {days <= 0 ? 'Expired' : days === 1 ? '1 day left' : `${days} days left`}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── INVENTORY SCREEN ───────────────────────────────────────
function InventoryScreen({ inventory, onAdd, onEdit, onDelete }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = inventory.filter(i => i.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  function openAdd() {
    setSelectedItem(null);
    setModalVisible(true);
  }

  function openEdit(item) {
    setSelectedItem(item);
    setModalVisible(true);
  }

  function handleSave(data) {
    if (selectedItem) {
      onEdit({ ...selectedItem, ...data });
    } else {
      onAdd(data);
    }
    setModalVisible(false);
  }

  function handleDelete(id) {
    onDelete(id);
    setModalVisible(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>myCucina</Text>
        <Text style={styles.headerSubtitle}>Inventory</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {Object.entries(grouped).map(([cat, items]) => (
          <View key={cat}>
            <Text style={styles.sectionHeader}>{cat}</Text>
            {items.map(item => {
              const days = getDaysUntilExpiry(item.expiryDate);
              const color = getUrgencyColor(days);
              return (
                <TouchableOpacity key={item.id} style={styles.itemRow} onPress={() => openEdit(item)}>
                  <View style={[styles.dot, { backgroundColor: color }]} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={[styles.itemCategory, { color }]}>
                      {days <= 0 ? 'Expired' : days === 1 ? '1 day left' : `${days} days left`}
                    </Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={openAdd}>
        <Text style={styles.fabText}>+ Add Item</Text>
      </TouchableOpacity>

      <ItemModal
        visible={modalVisible}
        item={selectedItem}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

// ── PLACEHOLDER SCREENS ────────────────────────────────────
function RecipeListScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>myCucina</Text>
        <Text style={styles.headerSubtitle}>Recipes</Text>
      </View>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>🍳</Text>
        <Text style={styles.placeholderLabel}>Your recipe list lives here</Text>
        <Text style={styles.placeholderSub}>Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

function ScanScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>myCucina</Text>
        <Text style={styles.headerSubtitle}>Scan Receipt</Text>
      </View>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>📷</Text>
        <Text style={styles.placeholderLabel}>Receipt scanner lives here</Text>
        <Text style={styles.placeholderSub}>Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

function FavoritesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>myCucina</Text>
        <Text style={styles.headerSubtitle}>Favorites</Text>
      </View>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>⭐️</Text>
        <Text style={styles.placeholderLabel}>Your favorite recipes live here</Text>
        <Text style={styles.placeholderSub}>Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

// ── NAVIGATION ─────────────────────────────────────────────
const Tab = createBottomTabNavigator();

export default function App() {
  const [inventory, setInventory] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Load inventory from storage on app open
  useEffect(() => {
    async function loadInventory() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setInventory(JSON.parse(stored));
        } else {
          setInventory(INITIAL_INVENTORY);
        }
      } catch (e) {
        setInventory(INITIAL_INVENTORY);
      } finally {
        setLoaded(true);
      }
    }
    loadInventory();
  }, []);

  // Save inventory to storage whenever it changes
  useEffect(() => {
    if (!loaded) return;
    async function saveInventory() {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
      } catch (e) {
        console.log('Save error', e);
      }
    }
    saveInventory();
  }, [inventory, loaded]);

  function handleAdd(item) {
    setInventory(prev => [...prev, { ...item, id: Date.now() }]);
  }

  function handleEdit(updated) {
    setInventory(prev => prev.map(i => i.id === updated.id ? updated : i));
  }

  function handleDelete(id) {
    setInventory(prev => prev.filter(i => i.id !== id));
  }

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E5E5EA' },
        }}
      >
        <Tab.Screen
          name="Use Soon"
          options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>⚠️</Text> }}
        >
          {() => <UseSoonScreen inventory={inventory} />}
        </Tab.Screen>
        <Tab.Screen
          name="Inventory"
          options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>🥦</Text> }}
        >
          {() => <InventoryScreen inventory={inventory} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} />}
        </Tab.Screen>
        <Tab.Screen
          name="Scan"
          component={ScanScreen}
          options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>📷</Text> }}
        />
        <Tab.Screen
          name="Recipes"
          component={RecipeListScreen}
          options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>🍳</Text> }}
        />
        <Tab.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>⭐️</Text> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ── STYLES ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 2,
  },
  scrollView: { flex: 1, paddingTop: 12 },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  itemRow: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 14 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '500', color: '#1C1C1E' },
  itemCategory: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  itemRight: { alignItems: 'flex-end' },
  expiryDate: { fontSize: 14, fontWeight: '500', color: '#1C1C1E' },
  daysLeft: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  chevron: { fontSize: 20, color: '#C7C7CC', marginLeft: 8 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  modalContainer: { flex: 1, backgroundColor: '#F2F2F7' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  modalCancel: { fontSize: 16, color: '#8E8E93' },
  modalSave: { fontSize: 16, color: '#007AFF', fontWeight: '600' },
  modalBody: { padding: 20 },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1C1C1E',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryChipText: { fontSize: 14, color: '#1C1C1E' },
  categoryChipTextActive: { color: '#FFFFFF', fontWeight: '600' },
  deleteButton: {
    backgroundColor: '#FFF2F2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
    borderWidth: 1,
    borderColor: '#FFD0D0',
  },
  deleteButtonText: { color: '#FF3B30', fontSize: 16, fontWeight: '600' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 60, marginBottom: 12 },
  placeholderLabel: { fontSize: 18, fontWeight: '600', color: '#1C1C1E' },
  placeholderSub: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
});