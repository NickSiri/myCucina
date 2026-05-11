import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, Modal, ActivityIndicator
} from 'react-native';

// ── RECIPE DATABASE ────────────────────────────────────────
const RECIPES = [
  {
    id: 1,
    name: 'Chicken Cacciatore',
    time: '45 min',
    difficulty: 'Medium',
    keywords: ['chicken'],
    ingredients: [
      '2 lbs chicken thighs',
      '1 can crushed tomatoes',
      '1 onion, diced',
      '3 cloves garlic',
      '1 cup chicken broth',
      '1 tsp oregano',
      'Salt and pepper',
    ],
    steps: [
      'Season chicken with salt and pepper.',
      'Brown chicken in olive oil over medium-high heat, 4 min per side. Remove and set aside.',
      'Sauté onion and garlic in same pan until soft, about 3 minutes.',
      'Add tomatoes, broth, and oregano. Stir to combine.',
      'Return chicken to pan. Simmer covered for 30 minutes until cooked through.',
      'Serve over pasta or crusty bread.',
    ],
  },
  {
    id: 2,
    name: 'Chicken Stir Fry',
    time: '20 min',
    difficulty: 'Easy',
    keywords: ['chicken', 'cabbage'],
    ingredients: [
      '1 lb chicken breast, sliced thin',
      '2 cups cabbage, shredded',
      '2 tbsp soy sauce',
      '1 tbsp sesame oil',
      '3 cloves garlic',
      '1 tsp ginger',
      '2 tbsp vegetable oil',
    ],
    steps: [
      'Heat oil in a wok or large pan over high heat.',
      'Add chicken and cook until golden, about 4 minutes. Remove and set aside.',
      'Add garlic and ginger, stir 30 seconds.',
      'Add cabbage and stir fry 3 minutes until slightly wilted.',
      'Return chicken to pan. Add soy sauce and sesame oil.',
      'Toss everything together and serve over rice.',
    ],
  },
  {
    id: 3,
    name: 'Coleslaw',
    time: '15 min',
    difficulty: 'Easy',
    keywords: ['cabbage'],
    ingredients: [
      '4 cups green cabbage, shredded',
      '1 cup mayonnaise',
      '2 tbsp apple cider vinegar',
      '1 tbsp sugar',
      '1 tsp celery seed',
      'Salt and pepper to taste',
    ],
    steps: [
      'Shred cabbage finely and place in a large bowl.',
      'In a separate bowl, whisk together mayo, vinegar, sugar, and celery seed.',
      'Pour dressing over cabbage and toss to coat.',
      'Season with salt and pepper.',
      'Refrigerate at least 30 minutes before serving for best flavor.',
    ],
  },
  {
    id: 4,
    name: 'Whipped Cream Pavlova',
    time: '1 hr 30 min',
    difficulty: 'Hard',
    keywords: ['cream', 'eggs', 'raspberries'],
    ingredients: [
      '4 egg whites',
      '1 cup sugar',
      '1 tsp vanilla extract',
      '1 tsp white vinegar',
      '2 cups heavy whipping cream',
      '1 cup raspberries',
    ],
    steps: [
      'Preheat oven to 275°F. Draw a 9-inch circle on parchment paper.',
      'Beat egg whites until stiff peaks form. Gradually add sugar, beating until glossy.',
      'Fold in vanilla and vinegar.',
      'Spread meringue onto circle, making edges slightly higher than center.',
      'Bake 1 hour 15 minutes until dry to the touch. Cool completely in oven.',
      'Whip cream to soft peaks. Spread over cooled meringue.',
      'Top with raspberries and serve immediately.',
    ],
  },
  {
    id: 5,
    name: 'Raspberry Fool',
    time: '15 min',
    difficulty: 'Easy',
    keywords: ['raspberries', 'cream'],
    ingredients: [
      '2 cups raspberries',
      '2 cups heavy whipping cream',
      '3 tbsp powdered sugar',
      '1 tsp vanilla extract',
    ],
    steps: [
      'Crush half the raspberries with a fork. Leave the rest whole.',
      'Whip cream with powdered sugar and vanilla to soft peaks.',
      'Gently fold crushed raspberries into cream to create a swirl.',
      'Spoon into glasses and top with whole raspberries.',
      'Serve immediately or chill up to 2 hours.',
    ],
  },
  {
    id: 6,
    name: 'French Omelette',
    time: '10 min',
    difficulty: 'Medium',
    keywords: ['eggs'],
    ingredients: [
      '3 large eggs',
      '1 tbsp butter',
      '2 tbsp milk',
      'Salt and pepper',
      'Fresh herbs (optional)',
    ],
    steps: [
      'Crack eggs into a bowl, add milk, salt and pepper. Whisk until combined.',
      'Melt butter in a non-stick pan over medium heat.',
      'Pour in egg mixture. Let set slightly on bottom.',
      'Using a spatula, gently push cooked edges toward center while tilting pan.',
      'When mostly set but still slightly wet on top, fold in thirds.',
      'Slide onto plate and serve immediately.',
    ],
  },
  {
    id: 7,
    name: 'Spring Mix Salad with Creamy Dressing',
    time: '10 min',
    difficulty: 'Easy',
    keywords: ['spring mix', 'cream'],
    ingredients: [
      '4 cups spring mix',
      '1/4 cup heavy cream',
      '2 tbsp lemon juice',
      '1 tsp dijon mustard',
      '1 clove garlic, minced',
      'Salt and pepper',
      'Shaved parmesan (optional)',
    ],
    steps: [
      'Whisk together cream, lemon juice, mustard, and garlic.',
      'Season dressing with salt and pepper.',
      'Place spring mix in a large bowl.',
      'Drizzle dressing over greens and toss gently.',
      'Top with shaved parmesan if using and serve immediately.',
    ],
  },
  {
    id: 8,
    name: 'Elote (Mexican Street Corn)',
    time: '20 min',
    difficulty: 'Easy',
    keywords: ['corn'],
    ingredients: [
      '4 ears corn on the cob',
      '1/4 cup mayonnaise',
      '1/4 cup sour cream',
      '1/2 cup cotija cheese, crumbled',
      '1 tsp chili powder',
      '1 lime, juiced',
      'Fresh cilantro',
    ],
    steps: [
      'Grill or roast corn until charred in spots, about 10 minutes.',
      'Mix mayonnaise and sour cream together.',
      'Brush corn with mayo mixture while still hot.',
      'Sprinkle with cotija cheese and chili powder.',
      'Squeeze lime juice over everything.',
      'Garnish with cilantro and serve immediately.',
    ],
  },
  {
    id: 9,
    name: 'Yogurt Parfait',
    time: '5 min',
    difficulty: 'Easy',
    keywords: ['yogurt', 'raspberries'],
    ingredients: [
      '2 cups strawberry yogurt',
      '1 cup raspberries',
      '1/2 cup granola',
      '2 tbsp honey',
    ],
    steps: [
      'Spoon half the yogurt into two glasses or bowls.',
      'Add a layer of granola.',
      'Add a layer of raspberries.',
      'Top with remaining yogurt.',
      'Finish with more granola, raspberries, and a drizzle of honey.',
    ],
  },
  {
    id: 10,
    name: 'Rotisserie Chicken Tacos',
    time: '15 min',
    difficulty: 'Easy',
    keywords: ['chicken', 'rotisserie'],
    ingredients: [
      '2 cups rotisserie chicken, shredded',
      '8 small corn tortillas',
      '1 cup spring mix or cabbage, shredded',
      '1/2 cup sour cream',
      '1 lime, juiced',
      '1 tsp cumin',
      'Hot sauce to taste',
    ],
    steps: [
      'Warm tortillas in a dry pan or directly over a gas flame.',
      'Mix sour cream with lime juice and cumin.',
      'Shred chicken and warm in a pan with a splash of water.',
      'Assemble tacos: chicken, greens, crema.',
      'Finish with hot sauce and serve immediately.',
    ],
  },
];

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
const FAVORITES_KEY = 'myCucina_favorites';

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

function getRecipesForItem(itemName) {
  const lower = itemName.toLowerCase();
  return RECIPES.filter(recipe =>
    recipe.keywords.some(keyword => lower.includes(keyword))
  );
}

const DIFFICULTY_COLORS = {
  'Easy': '#34C759',
  'Medium': '#FF9500',
  'Hard': '#FF3B30',
};

// ── CLAUDE API ─────────────────────────────────────────────
async function getSuggestionsFromClaude(inventory) {
  const itemList = inventory.map(item => ({
    name: item.name,
    daysLeft: Math.max(0, getDaysUntilExpiry(item.expiryDate))
  }));

  const response = await fetch('http://192.168.50.202:5002/suggest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inventory: itemList }),
  });

  const data = await response.json();
  return data.suggestions;
}

// ── TONIGHT SCREEN ─────────────────────────────────────────
function TonightScreen({ inventory, navigation }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState(null);

  async function handleAsk() {
    setLoading(true);
    setError(null);
    setSuggestions(null);
   try {
      const results = await getSuggestionsFromClaude(inventory);
      setSuggestions(results);
    } catch (e) {
      setError(e.message || JSON.stringify(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { flexDirection: 'column', alignItems: 'flex-start' }]}>
        <Text style={styles.headerTitle}>myCucina</Text>
        <Text style={styles.headerSubtitle}>Tonight</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.tonightHero}>
          <Text style={styles.tonightEmoji}>🍽</Text>
          <Text style={styles.tonightHeroTitle}>What can I make tonight?</Text>
          <Text style={styles.tonightHeroSub}>
            We'll look at what's in your kitchen and find the best options before anything goes to waste.
          </Text>
          <TouchableOpacity
            style={[styles.tonightButton, loading && styles.tonightButtonDisabled]}
            onPress={handleAsk}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.tonightButtonText}>
                {suggestions ? 'Refresh suggestions' : 'Show me what I can make'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {suggestions && (
          <View>
            <Text style={styles.sectionHeader}>Based on your kitchen right now</Text>
            {suggestions.map((s, i) => (
              <View key={i} style={styles.suggestionCard}>
                <View style={styles.suggestionCardTop}>
                  <Text style={styles.suggestionCardName}>{s.name}</Text>
                  <View style={styles.suggestionCardMeta}>
                    <Text style={styles.recipeCardMeta}>⏱ {s.time}</Text>
                    <Text style={[styles.recipeCardMeta, { color: DIFFICULTY_COLORS[s.difficulty] || '#8E8E93' }]}>
                      ● {s.difficulty}
                    </Text>
                  </View>
                </View>
                <Text style={styles.suggestionReason}>{s.reason}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── RECIPE DETAIL SCREEN ───────────────────────────────────
function RecipeDetailScreen({ route, navigation, favorites, onToggleFavorite }) {
  const { recipe } = route.params;
  const isFavorited = favorites.includes(recipe.id);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>myCucina</Text>
        <TouchableOpacity onPress={() => onToggleFavorite(recipe.id)}>
          <Text style={{ fontSize: 24 }}>{isFavorited ? '⭐️' : '☆'}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.recipeHero}>
          <Text style={styles.recipeName}>{recipe.name}</Text>
          <View style={styles.recipeMeta}>
            <Text style={styles.recipeMetaText}>⏱ {recipe.time}</Text>
            <Text style={[styles.recipeMetaText, { color: DIFFICULTY_COLORS[recipe.difficulty] }]}>
              ● {recipe.difficulty}
            </Text>
          </View>
        </View>
        <Text style={styles.sectionHeader}>Ingredients</Text>
        <View style={styles.card}>
          {recipe.ingredients.map((ing, i) => (
            <View key={i} style={[styles.ingredientRow, i < recipe.ingredients.length - 1 && styles.ingredientBorder]}>
              <Text style={styles.ingredientDot}>•</Text>
              <Text style={styles.ingredientText}>{ing}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.sectionHeader}>Instructions</Text>
        <View style={styles.card}>
          {recipe.steps.map((step, i) => (
            <View key={i} style={[styles.stepRow, i < recipe.steps.length - 1 && styles.ingredientBorder]}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── ITEM SUGGESTIONS SCREEN ────────────────────────────────
function SuggestionsScreen({ route, navigation, favorites, onToggleFavorite }) {
  const { item } = route.params;
  const days = getDaysUntilExpiry(item.expiryDate);
  const color = getUrgencyColor(days);
  const recipes = getRecipesForItem(item.name);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>myCucina</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.suggestionHero}>
          <View style={[styles.urgencyBadge, { backgroundColor: color }]}>
            <Text style={styles.urgencyBadgeText}>
              {days <= 0 ? 'Expired' : days === 1 ? '1 day left' : `${days} days left`}
            </Text>
          </View>
          <Text style={styles.suggestionItemName}>{item.name}</Text>
          <Text style={styles.suggestionSubtitle}>Use it in one of these recipes</Text>
        </View>
        {recipes.length === 0 ? (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>🤔</Text>
            <Text style={styles.placeholderLabel}>No recipes found</Text>
            <Text style={styles.placeholderSub}>We'll add more recipes soon</Text>
          </View>
        ) : (
          recipes.map(recipe => (
            <TouchableOpacity
              key={recipe.id}
              style={styles.recipeCard}
              onPress={() => navigation.navigate('RecipeDetail', { recipe })}
            >
              <View style={styles.recipeCardInfo}>
                <Text style={styles.recipeCardName}>{recipe.name}</Text>
                <View style={styles.recipeCardMetaRow}>
                  <Text style={styles.recipeCardMeta}>⏱ {recipe.time}</Text>
                  <Text style={[styles.recipeCardMeta, { color: DIFFICULTY_COLORS[recipe.difficulty] }]}>
                    ● {recipe.difficulty}
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 20 }}>
                {favorites.includes(recipe.id) ? '⭐️' : '☆'}
              </Text>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── RECIPE LIST SCREEN ─────────────────────────────────────
function RecipeListScreen({ navigation, favorites, onToggleFavorite }) {
  const [search, setSearch] = useState('');
  const filtered = RECIPES.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.keywords.some(k => k.toLowerCase().includes(search.toLowerCase()))
  );
  const sections = [
    { title: 'Easy', data: filtered.filter(r => r.difficulty === 'Easy') },
    { title: 'Medium', data: filtered.filter(r => r.difficulty === 'Medium') },
    { title: 'Hard', data: filtered.filter(r => r.difficulty === 'Hard') },
  ].filter(s => s.data.length > 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { flexDirection: 'column', alignItems: 'flex-start' }]}>
        <Text style={styles.headerTitle}>myCucina</Text>
        <Text style={styles.headerSubtitle}>Recipes</Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍  Search recipes..."
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>🍽</Text>
            <Text style={styles.placeholderLabel}>No recipes found</Text>
            <Text style={styles.placeholderSub}>Try a different search</Text>
          </View>
        ) : (
          sections.map(section => (
            <View key={section.title}>
              <Text style={styles.sectionHeader}>{section.title}</Text>
              {section.data.map(recipe => (
                <TouchableOpacity
                  key={recipe.id}
                  style={styles.recipeCard}
                  onPress={() => navigation.navigate('RecipeDetail', { recipe })}
                >
                  <View style={styles.recipeCardInfo}>
                    <Text style={styles.recipeCardName}>{recipe.name}</Text>
                    <View style={styles.recipeCardMetaRow}>
                      <Text style={styles.recipeCardMeta}>⏱ {recipe.time}</Text>
                      <Text style={[styles.recipeCardMeta, { color: DIFFICULTY_COLORS[recipe.difficulty] }]}>
                        ● {recipe.difficulty}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 20 }}>
                    {favorites.includes(recipe.id) ? '⭐️' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── FAVORITES SCREEN ───────────────────────────────────────
function FavoritesScreen({ navigation, favorites, onToggleFavorite }) {
  const favoriteRecipes = RECIPES.filter(r => favorites.includes(r.id));
  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { flexDirection: 'column', alignItems: 'flex-start' }]}>
        <Text style={styles.headerTitle}>myCucina</Text>
        <Text style={styles.headerSubtitle}>Favorites</Text>
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {favoriteRecipes.length === 0 ? (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>⭐️</Text>
            <Text style={styles.placeholderLabel}>No favorites yet</Text>
            <Text style={styles.placeholderSub}>Tap ☆ on any recipe to save it here</Text>
          </View>
        ) : (
          favoriteRecipes.map(recipe => (
            <TouchableOpacity
              key={recipe.id}
              style={styles.recipeCard}
              onPress={() => navigation.navigate('FavRecipeDetail', { recipe })}
            >
              <View style={styles.recipeCardInfo}>
                <Text style={styles.recipeCardName}>{recipe.name}</Text>
                <View style={styles.recipeCardMetaRow}>
                  <Text style={styles.recipeCardMeta}>⏱ {recipe.time}</Text>
                  <Text style={[styles.recipeCardMeta, { color: DIFFICULTY_COLORS[recipe.difficulty] }]}>
                    ● {recipe.difficulty}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => onToggleFavorite(recipe.id)}>
                <Text style={{ fontSize: 20 }}>⭐️</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
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
function UseSoonScreen({ inventory, navigation }) {
  const sorted = [...inventory].sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { flexDirection: 'column', alignItems: 'flex-start' }]}>
        <Text style={styles.headerTitle}>myCucina</Text>
        <Text style={styles.headerSubtitle}>Use Soon</Text>
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {sorted.map((item) => {
          const days = getDaysUntilExpiry(item.expiryDate);
          const color = getUrgencyColor(days);
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.itemRow}
              onPress={() => navigation.navigate('Suggestions', { item })}
            >
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

  function openAdd() { setSelectedItem(null); setModalVisible(true); }
  function openEdit(item) { setSelectedItem(item); setModalVisible(true); }
  function handleSave(data) {
    if (selectedItem) { onEdit({ ...selectedItem, ...data }); }
    else { onAdd(data); }
    setModalVisible(false);
  }
  function handleDelete(id) { onDelete(id); setModalVisible(false); }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { flexDirection: 'column', alignItems: 'flex-start' }]}>
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

// ── SCAN SCREEN ────────────────────────────────────────────
function ScanScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { flexDirection: 'column', alignItems: 'flex-start' }]}>
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

// ── NAVIGATION ─────────────────────────────────────────────
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function UseSoonStack({ inventory, favorites, onToggleFavorite }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UseSoonMain">
        {({ navigation }) => <UseSoonScreen inventory={inventory} navigation={navigation} />}
      </Stack.Screen>
      <Stack.Screen name="Suggestions">
        {({ route, navigation }) => (
          <SuggestionsScreen route={route} navigation={navigation} favorites={favorites} onToggleFavorite={onToggleFavorite} />
        )}
      </Stack.Screen>
      <Stack.Screen name="RecipeDetail">
        {({ route, navigation }) => (
          <RecipeDetailScreen route={route} navigation={navigation} favorites={favorites} onToggleFavorite={onToggleFavorite} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function RecipesStack({ favorites, onToggleFavorite }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RecipeListMain">
        {({ navigation }) => (
          <RecipeListScreen navigation={navigation} favorites={favorites} onToggleFavorite={onToggleFavorite} />
        )}
      </Stack.Screen>
      <Stack.Screen name="RecipeDetail">
        {({ route, navigation }) => (
          <RecipeDetailScreen route={route} navigation={navigation} favorites={favorites} onToggleFavorite={onToggleFavorite} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function FavoritesStack({ favorites, onToggleFavorite }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FavoritesMain">
        {({ navigation }) => (
          <FavoritesScreen navigation={navigation} favorites={favorites} onToggleFavorite={onToggleFavorite} />
        )}
      </Stack.Screen>
      <Stack.Screen name="FavRecipeDetail">
        {({ route, navigation }) => (
          <RecipeDetailScreen route={route} navigation={navigation} favorites={favorites} onToggleFavorite={onToggleFavorite} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function TonightStack({ inventory }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TonightMain">
        {({ navigation }) => <TonightScreen inventory={inventory} navigation={navigation} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default function App() {
  const [inventory, setInventory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const storedInventory = await AsyncStorage.getItem(STORAGE_KEY);
        const storedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
        setInventory(storedInventory ? JSON.parse(storedInventory) : INITIAL_INVENTORY);
        setFavorites(storedFavorites ? JSON.parse(storedFavorites) : []);
      } catch (e) {
        setInventory(INITIAL_INVENTORY);
        setFavorites([]);
      } finally {
        setLoaded(true);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
  }, [inventory, loaded]);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites, loaded]);

  function handleAdd(item) { setInventory(prev => [...prev, { ...item, id: Date.now() }]); }
  function handleEdit(updated) { setInventory(prev => prev.map(i => i.id === updated.id ? updated : i)); }
  function handleDelete(id) { setInventory(prev => prev.filter(i => i.id !== id)); }
  function handleToggleFavorite(recipeId) {
    setFavorites(prev =>
      prev.includes(recipeId) ? prev.filter(id => id !== recipeId) : [...prev, recipeId]
    );
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
        <Tab.Screen name="Tonight" options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>🍽</Text> }}>
          {() => <TonightStack inventory={inventory} />}
        </Tab.Screen>
        <Tab.Screen name="Use Soon" options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>⚠️</Text> }}>
          {() => <UseSoonStack inventory={inventory} favorites={favorites} onToggleFavorite={handleToggleFavorite} />}
        </Tab.Screen>
        <Tab.Screen name="Inventory" options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>🥦</Text> }}>
          {() => <InventoryScreen inventory={inventory} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} />}
        </Tab.Screen>
        <Tab.Screen name="Recipes" options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>🍳</Text> }}>
          {() => <RecipesStack favorites={favorites} onToggleFavorite={handleToggleFavorite} />}
        </Tab.Screen>
        <Tab.Screen name="Favorites" options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>⭐️</Text> }}>
          {() => <FavoritesStack favorites={favorites} onToggleFavorite={handleToggleFavorite} />}
        </Tab.Screen>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    flex: 1,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 2,
  },
  backButton: { fontSize: 17, color: '#007AFF', fontWeight: '500' },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  searchInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1C1C1E',
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
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  categoryChipActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
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
  suggestionHero: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 8,
  },
  urgencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  urgencyBadgeText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  suggestionItemName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 4,
  },
  suggestionSubtitle: { fontSize: 14, color: '#8E8E93' },
  recipeCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  recipeCardInfo: { flex: 1 },
  recipeCardName: { fontSize: 16, fontWeight: '600', color: '#1C1C1E' },
  recipeCardMetaRow: { flexDirection: 'row', gap: 12, marginTop: 3 },
  recipeCardMeta: { fontSize: 13, color: '#8E8E93' },
  recipeHero: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
  },
  recipeName: { fontSize: 24, fontWeight: '700', color: '#1C1C1E', marginBottom: 10 },
  recipeMeta: { flexDirection: 'row', gap: 16 },
  recipeMetaText: { fontSize: 14, color: '#8E8E93', fontWeight: '500' },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  ingredientRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  ingredientBorder: { borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  ingredientDot: { fontSize: 16, color: '#007AFF', marginRight: 10, marginTop: 1 },
  ingredientText: { fontSize: 15, color: '#1C1C1E', flex: 1 },
  stepRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
    flexShrink: 0,
  },
  stepNumberText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  stepText: { fontSize: 15, color: '#1C1C1E', flex: 1, lineHeight: 22 },
  tonightHero: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 8,
  },
  tonightEmoji: { fontSize: 48, marginBottom: 12 },
  tonightHeroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 8,
  },
  tonightHeroSub: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  tonightButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    minWidth: 220,
    alignItems: 'center',
  },
  tonightButtonDisabled: { backgroundColor: '#C7C7CC' },
  tonightButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  suggestionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  suggestionCardTop: { marginBottom: 8 },
  suggestionCardName: { fontSize: 17, fontWeight: '600', color: '#1C1C1E', marginBottom: 4 },
  suggestionCardMeta: { flexDirection: 'row', gap: 12 },
  suggestionReason: { fontSize: 14, color: '#8E8E93', lineHeight: 20 },
  errorBox: {
    backgroundColor: '#FFF2F2',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFD0D0',
  },
  errorText: { color: '#FF3B30', fontSize: 14, textAlign: 'center' },
});