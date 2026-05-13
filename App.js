import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, Modal, ActivityIndicator
} from 'react-native';

const BUILTIN_RECIPES = [
  {
    id: 1, name: 'Chicken Cacciatore', time: '45 min', difficulty: 'Medium', keywords: ['chicken'],
    ingredients: [
      {name: 'Chicken Thigh', quantity: 2, unit: 'lb', prep: null},
      {name: 'Crushed Tomato', quantity: 1, unit: null, prep: null},
      {name: 'Yellow Onion', quantity: 1, unit: null, prep: 'diced'},
      {name: 'Garlic', quantity: 3, unit: null, prep: 'minced'},
      {name: 'Chicken Broth', quantity: 1, unit: 'cup', prep: null},
      {name: 'Oregano', quantity: 1, unit: 'tsp', prep: null},
    ],
    steps: ['Season chicken with salt and pepper.','Brown chicken in olive oil over medium-high heat, 4 min per side. Remove and set aside.','Sauté onion and garlic in same pan until soft, about 3 minutes.','Add tomatoes, broth, and oregano. Stir to combine.','Return chicken to pan. Simmer covered for 30 minutes until cooked through.','Serve over pasta or crusty bread.'],
  },
  {
    id: 99, name: 'Shopping List Display Test', time: '60 min', difficulty: 'Hard', keywords: [],
    ingredients: [
      {name: 'Roma Tomato', quantity: 4, unit: null, prep: null},
      {name: 'Pineapple', quantity: 1, unit: null, prep: 'sliced'},
      {name: 'Red Grapes', quantity: 2, unit: 'cup', prep: null},
      {name: 'Cilantro', quantity: 4, unit: 'tbsp', prep: 'chopped'},
      {name: 'Cherry Tomato', quantity: 1, unit: 'cup', prep: null},
      {name: 'Black Bean', quantity: 2, unit: null, prep: null},
      {name: 'Chicken Broth', quantity: 1, unit: null, prep: null},
      {name: 'Instant Rice', quantity: 1, unit: 'box', prep: null},
      {name: 'Olive Oil', quantity: 3, unit: 'tbsp', prep: null},
      {name: 'Butter', quantity: 0.5, unit: 'cup', prep: null},
      {name: 'Chicken Thigh', quantity: 1.5, unit: 'lb', prep: null},
      {name: 'Parmesan', quantity: 0.5, unit: 'cup', prep: 'grated'},
      {name: 'Frozen Peas', quantity: 1, unit: 'cup', prep: null},
      {name: 'Garlic', quantity: 4, unit: null, prep: 'minced'},
      {name: 'Yellow Onion', quantity: 1, unit: null, prep: 'diced'},
    ],
    steps: ['This recipe is just for testing the shopping list display.'],
  },
  {
    id: 2, name: 'Chicken Stir Fry', time: '20 min', difficulty: 'Easy', keywords: ['chicken', 'cabbage'],
    ingredients: [
      {name: 'Chicken Breast', quantity: 1, unit: 'lb', prep: 'sliced thin'},
      {name: 'Green Cabbage', quantity: 2, unit: 'cup', prep: 'shredded'},
      {name: 'Soy Sauce', quantity: 2, unit: 'tbsp', prep: null},
      {name: 'Sesame Oil', quantity: 1, unit: 'tbsp', prep: null},
      {name: 'Garlic', quantity: 3, unit: null, prep: 'minced'},
    ],
    steps: ['Heat oil in a wok or large pan over high heat.','Add chicken and cook until golden, about 4 minutes. Remove and set aside.','Add garlic and ginger, stir 30 seconds.','Add cabbage and stir fry 3 minutes until slightly wilted.','Return chicken to pan. Add soy sauce and sesame oil.','Toss everything together and serve over rice.'],
  },
  {
    id: 3, name: 'Coleslaw', time: '15 min', difficulty: 'Easy', keywords: ['cabbage'],
    ingredients: [
      {name: 'Green Cabbage', quantity: 4, unit: 'cup', prep: 'shredded'},
      {name: 'Mayonnaise', quantity: 1, unit: 'cup', prep: null},
      {name: 'Apple Cider Vinegar', quantity: 2, unit: 'tbsp', prep: null},
      {name: 'Sugar', quantity: 1, unit: 'tbsp', prep: null},
    ],
    steps: ['Shred cabbage finely and place in a large bowl.','Whisk together mayo, vinegar, sugar, and celery seed.','Pour dressing over cabbage and toss to coat.','Refrigerate at least 30 minutes before serving.'],
  },
  {
    id: 4, name: 'Whipped Cream Pavlova', time: '1 hr 30 min', difficulty: 'Hard', keywords: ['cream', 'eggs', 'raspberries'],
    ingredients: [
      {name: 'Egg White', quantity: 4, unit: null, prep: null},
      {name: 'Sugar', quantity: 1, unit: 'cup', prep: null},
      {name: 'Heavy Whipping Cream', quantity: 2, unit: 'cup', prep: null},
      {name: 'Raspberry', quantity: 1, unit: 'cup', prep: null},
    ],
    steps: ['Preheat oven to 275°F.','Beat egg whites until stiff peaks form. Gradually add sugar, beating until glossy.','Spread meringue onto circle, making edges slightly higher than center.','Bake 1 hour 15 minutes. Cool completely in oven.','Whip cream to soft peaks. Spread over cooled meringue.','Top with raspberries and serve immediately.'],
  },
  {
    id: 5, name: 'Raspberry Fool', time: '15 min', difficulty: 'Easy', keywords: ['raspberries', 'cream'],
    ingredients: [
      {name: 'Raspberry', quantity: 2, unit: 'cup', prep: null},
      {name: 'Heavy Whipping Cream', quantity: 2, unit: 'cup', prep: null},
      {name: 'Powdered Sugar', quantity: 3, unit: 'tbsp', prep: null},
    ],
    steps: ['Crush half the raspberries with a fork.','Whip cream with powdered sugar and vanilla to soft peaks.','Fold crushed raspberries into cream.','Top with whole raspberries and serve.'],
  },
  {
    id: 6, name: 'French Omelette', time: '10 min', difficulty: 'Medium', keywords: ['eggs'],
    ingredients: [
      {name: 'Egg', quantity: 3, unit: null, prep: null},
      {name: 'Butter', quantity: 1, unit: 'tbsp', prep: null},
      {name: 'Milk', quantity: 2, unit: 'tbsp', prep: null},
    ],
    steps: ['Crack eggs into a bowl, add milk, salt and pepper. Whisk until combined.','Melt butter in a non-stick pan over medium heat.','Pour in egg mixture. Let set slightly on bottom.','Gently push cooked edges toward center while tilting pan.','When mostly set, fold in thirds and serve.'],
  },
  {
    id: 7, name: 'Spring Mix Salad with Creamy Dressing', time: '10 min', difficulty: 'Easy', keywords: ['spring mix', 'cream'],
    ingredients: [
      {name: 'Spring Mix', quantity: 4, unit: 'cup', prep: null},
      {name: 'Heavy Cream', quantity: 0.25, unit: 'cup', prep: null},
      {name: 'Lemon Juice', quantity: 2, unit: 'tbsp', prep: null},
      {name: 'Dijon Mustard', quantity: 1, unit: 'tsp', prep: null},
    ],
    steps: ['Whisk together cream, lemon juice, mustard, and garlic.','Season dressing with salt and pepper.','Toss spring mix with dressing and serve immediately.'],
  },
  {
    id: 8, name: 'Elote (Mexican Street Corn)', time: '20 min', difficulty: 'Easy', keywords: ['corn'],
    ingredients: [
      {name: 'Corn on the Cob', quantity: 4, unit: null, prep: null},
      {name: 'Mayonnaise', quantity: 0.25, unit: 'cup', prep: null},
      {name: 'Cotija Cheese', quantity: 0.5, unit: 'cup', prep: 'crumbled'},
      {name: 'Chili Powder', quantity: 1, unit: 'tsp', prep: null},
      {name: 'Lime', quantity: 1, unit: null, prep: 'juiced'},
    ],
    steps: ['Grill or roast corn until charred in spots, about 10 minutes.','Brush corn with mayo mixture while still hot.','Sprinkle with cotija cheese and chili powder.','Squeeze lime juice over everything and serve.'],
  },
  {
    id: 9, name: 'Yogurt Parfait', time: '5 min', difficulty: 'Easy', keywords: ['yogurt', 'raspberries'],
    ingredients: [
      {name: 'Strawberry Yogurt', quantity: 2, unit: 'cup', prep: null},
      {name: 'Raspberry', quantity: 1, unit: 'cup', prep: null},
      {name: 'Granola', quantity: 0.5, unit: 'cup', prep: null},
      {name: 'Honey', quantity: 2, unit: 'tbsp', prep: null},
    ],
    steps: ['Layer yogurt, granola, and raspberries in glasses.','Finish with a drizzle of honey and serve.'],
  },
  {
    id: 10, name: 'Rotisserie Chicken Tacos', time: '15 min', difficulty: 'Easy', keywords: ['chicken', 'rotisserie'],
    ingredients: [
      {name: 'Rotisserie Chicken', quantity: 2, unit: 'cup', prep: 'shredded'},
      {name: 'Corn Tortilla', quantity: 8, unit: null, prep: null},
      {name: 'Sour Cream', quantity: 0.5, unit: 'cup', prep: null},
      {name: 'Lime', quantity: 1, unit: null, prep: 'juiced'},
    ],
    steps: ['Warm tortillas in a dry pan.','Mix sour cream with lime juice and cumin.','Assemble tacos with chicken, greens, and crema.','Finish with hot sauce and serve.'],
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

const CATEGORIES = ['Bakery', 'Produce', 'Meat', 'Dairy', 'Deli', 'Nuts & Dried Fruit', 'Pantry', 'Frozen', 'Beverages', 'Other'];
const STORAGE_KEY = 'myCucina_inventory';
const FAVORITES_KEY = 'myCucina_favorites';
const CUSTOM_RECIPES_KEY = 'myCucina_custom_recipes';
const SHOPPING_LIST_KEY = 'myCucina_shopping_list';
const PI_SERVER = 'http://192.168.50.202:5002';

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

function getRecipesForItem(itemName, allRecipes) {
  const lower = itemName.toLowerCase();
  return allRecipes.filter(recipe =>
    recipe.keywords && recipe.keywords.some(keyword => lower.includes(keyword))
  );
}

const FRACTIONS = [
  [1, '1'], [0.75, '¾'], [0.667, '⅔'], [0.5, '½'],
  [0.333, '⅓'], [0.25, '¼'], [0.125, '⅛'],
];
const IMPERIAL_UNITS = ['tsp', 'tbsp', 'cup', 'fl_oz'];
const METRIC_UNITS = ['g', 'kg', 'ml', 'l'];

function formatQuantity(qty, unit) {
  if (!qty) return '—';
  const isImperial = IMPERIAL_UNITS.includes(unit);
  const whole = Math.floor(qty);
  const decimal = qty - whole;
  if (isImperial && decimal > 0) {
    const frac = FRACTIONS.reduce((best, [val, sym]) =>
      Math.abs(val - decimal) < Math.abs(best[0] - decimal) ? [val, sym] : best
    );
    const wholeStr = whole > 0 ? `${whole} ` : '';
    return `${wholeStr}${frac[1]}`;
  }
  if (METRIC_UNITS.includes(unit)) {
    return qty % 1 === 0 ? String(qty) : qty.toFixed(1);
  }
  return qty % 1 === 0 ? String(qty) : qty.toFixed(1);
}

function IngredientRow({ ing }) {
  if (typeof ing === 'string') {
    return (
      <View style={styles.ingRow}>
        <Text style={styles.ingQty}>—</Text>
        <Text style={styles.ingName}>{ing}</Text>
      </View>
    );
  }
  const qtyStr = formatQuantity(ing.quantity, ing.unit);
  const unit = ing.unit ? ` ${ing.unit}` : '';
  const prep = ing.prep ? `, ${ing.prep}` : '';
  return (
    <View style={styles.ingRow}>
      <Text style={styles.ingQty}>{qtyStr}{unit}</Text>
      <Text style={styles.ingName}>{ing.name}{prep}</Text>
    </View>
  );
}

function normalizeIngredientName(name) {
  return name.toLowerCase().trim()
    .replace(/\b(fresh|dried|frozen|canned|cooked|raw|boneless|skinless|whole|ground|sliced|diced|chopped|minced|shredded|grated|peeled|pitted|husked)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function checkInventoryMatch(ingredientName, inventory) {
  const normalized = normalizeIngredientName(ingredientName);
  const ingWords = normalized.split(' ').filter(w => w.length > 2);
  for (const item of inventory) {
    const itemNormalized = normalizeIngredientName(item.name);
    const itemWords = itemNormalized.split(' ').filter(w => w.length > 2);
    // Require ALL inventory item words to appear in the ingredient name
    const allItemWordsMatch = itemWords.every(w => ingWords.includes(w));
    // AND at least half the ingredient words match the inventory item
    const matchingIngWords = ingWords.filter(w => itemWords.includes(w));
    const overlapRatio = ingWords.length > 0 ? matchingIngWords.length / ingWords.length : 0;
    if (allItemWordsMatch && overlapRatio >= 0.5) {
      const days = getDaysUntilExpiry(item.expiryDate);
      return { match: true, item, days };
    }
  }
  return { match: false };
}

function addRecipeToShoppingList(recipe, currentList) {
  const newList = [...currentList];
  recipe.ingredients.forEach(ing => {
    const ingName = typeof ing === 'string' ? ing : ing.name;
    const normalized = normalizeIngredientName(ingName);
    const existing = newList.find(i => normalizeIngredientName(i.name) === normalized);
    if (existing) {
      if (ing.quantity && existing.quantity) {
        existing.quantity += ing.quantity;
      }
      if (!existing.recipes.includes(recipe.name)) {
        existing.recipes.push(recipe.name);
      }
    } else {
      newList.push({
        id: `${Date.now()}_${Math.random()}`,
        name: ingName,
        quantity: typeof ing === 'string' ? null : ing.quantity,
        unit: typeof ing === 'string' ? null : ing.unit,
        prep: typeof ing === 'string' ? null : ing.prep,
        recipes: [recipe.name],
        checked: false,
      });
    }
  });
  return newList;
}

const DIFFICULTY_COLORS = { 'Easy': '#34C759', 'Medium': '#FF9500', 'Hard': '#FF3B30' };

// ── SHOPPING LIST SCREEN ───────────────────────────────────
const INGREDIENT_CATEGORIES = {
  Bakery: [
    'corn tortilla', 'flour tortilla', 'whole wheat tortilla', 'spinach tortilla',
    'tortilla', 'bread', 'sourdough', 'baguette', 'ciabatta', 'focaccia',
    'pita', 'naan', 'flatbread', 'lavash', 'wrap', 'pita bread',
    'bagel', 'english muffin', 'croissant', 'roll', 'dinner roll', 'bun',
    'hamburger bun', 'hot dog bun', 'brioche', 'challah', 'rye bread',
    'white bread', 'wheat bread', 'multigrain bread', 'sandwich bread',
    'muffin', 'scone', 'biscuit', 'cornbread', 'banana bread',
    'pie crust', 'pizza dough', 'puff pastry', 'phyllo dough',
    'breadcrumb', 'panko', 'crouton', 'stuffing', 'waffle', 'pancake mix',
  ],
  'Nuts & Dried Fruit': [
  'almond', 'brazil nut', 'candied pecan', 'candied walnut', 'cashew',
  'chestnut', 'chia seed', 'coconut flake', 'dried apricot', 'dried cherry',
  'dried cranberry', 'dried date', 'dried fig', 'dried mango', 'dried pineapple',
  'flax seed', 'hazelnut', 'macadamia nut', 'mixed nut', 'peanut', 'pecan',
  'pine nut', 'pistachio', 'poppy seed', 'pumpkin seed', 'raisin',
  'sesame seed', 'sunflower seed', 'trail mix', 'walnut',
  ],
  Frozen: [
    'frozen pea', 'frozen corn', 'frozen carrot', 'frozen mirepoix',
    'frozen spinach', 'frozen broccoli', 'frozen edamame', 'frozen berry',
    'frozen fruit', 'frozen vegetable', 'frozen meal', 'frozen pizza',
    'tater tot', 'frozen waffle', 'ice cream', 'sorbet', 'frozen',
  ],
  Meat: [
    'chicken thigh', 'chicken breast', 'chicken wing', 'chicken drumstick',
    'chicken leg', 'whole chicken', 'rotisserie chicken', 'ground chicken',
    'ground beef', 'ground turkey', 'ground pork', 'ground lamb',
    'beef tenderloin', 'beef brisket', 'beef chuck', 'beef rib',
    'skirt steak', 'flank steak', 'ribeye', 'sirloin', 'strip steak', 'filet mignon',
    'pork chop', 'pork loin', 'pork shoulder', 'pork belly', 'pork tenderloin',
    'baby back rib', 'spare rib',
    'lamb chop', 'lamb shank', 'rack of lamb', 'leg of lamb',
    'turkey breast', 'duck breast', 'duck leg',
    'bacon', 'pancetta', 'prosciutto', 'salami', 'pepperoni', 'chorizo',
    'sausage', 'italian sausage', 'bratwurst', 'kielbasa', 'hot dog',
    'ham', 'deli meat', 'lunch meat',
    'shrimp', 'salmon', 'tuna', 'cod', 'tilapia', 'halibut', 'mahi mahi',
    'sea bass', 'trout', 'swordfish', 'snapper', 'flounder',
    'scallop', 'crab', 'lobster', 'clam', 'mussel', 'oyster',
    'anchovy', 'sardine', 'fish fillet', 'fish',
    'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'veal', 'bison', 'venison',
  ],
  Dairy: [
  '1% milk', '2% milk','almond milk', 'buttermilk','coconut milk beverage', 'condensed milk','egg','evaporated milk','ghee',
  'half and half', 'heavy cream', 'heavy whipping cream','kefir','light cream','milk','oat milk','plain yogurt',
  'sour cream', 'soy milk', 'strawberry yogurt','vanilla yogurt','whipped cream', 'whole milk', 'yogurt',
  ],
  Deli: [
    'american cheese', 'asiago',
    'blue cheese', 'brie',
    'camembert', 'cheddar', 'cheese', 'colby jack', 'cotija cheese', 'cream cheese',
    'deli meat', 'deli turkey', 'deli chicken', 'deli ham',
    'feta', 'fontina', 'fresh mozzarella',
    'goat cheese', 'gouda', 'gruyere',
    'havarti', 'hummus',
    'manchego', 'mascarpone', 'monterey jack', 'mozzarella',
    'parmesan', 'parmigiano', 'pepper jack', 'provolone',
    'ricotta cheese', 'roquefort',
    'salami', 'shredded mozzarella', 'smoked gouda', 'swiss cheese',
    'white cheddar',
  ],
  Produce: [
    'romaine lettuce', 'iceberg lettuce', 'butter lettuce', 'spring mix', 'mixed greens',
    'baby spinach', 'spinach', 'kale', 'arugula', 'swiss chard', 'collard green',
    'green cabbage', 'red cabbage', 'napa cabbage', 'bok choy', 'brussels sprout',
    'broccoli', 'broccolini', 'cauliflower', 'broccoli rabe',
    'roma tomato', 'cherry tomato', 'grape tomato', 'heirloom tomato', 'beefsteak tomato',
    'yellow onion', 'red onion', 'white onion', 'sweet onion', 'pearl onion',
    'green onion', 'scallion', 'shallot', 'leek', 'chive',
    'garlic clove', 'garlic head', 'garlic',
    'russet potato', 'red potato', 'yukon gold potato', 'sweet potato', 'yam', 'potato',
    'jalapeño pepper', 'jalapeño', 'bell pepper', 'red pepper', 'green pepper',
    'yellow pepper', 'orange pepper', 'serrano pepper', 'habanero', 'poblano',
    'english cucumber', 'persian cucumber', 'cucumber',
    'zucchini', 'yellow squash', 'butternut squash', 'acorn squash', 'spaghetti squash',
    'eggplant', 'mushroom', 'portobello', 'cremini', 'shiitake', 'oyster mushroom',
    'corn on the cob', 'corn',
    'asparagus', 'green bean', 'snap pea', 'snow pea', 'edamame', 'pea',
    'carrot', 'celery', 'beet', 'radish', 'turnip', 'parsnip', 'fennel',
    'artichoke', 'kohlrabi', 'okra', 'tomatillo', 'jicama',
    'avocado', 'lemon', 'lime', 'orange', 'grapefruit', 'blood orange',
    'apple', 'pear', 'peach', 'nectarine', 'plum', 'apricot', 'cherry',
    'banana', 'mango', 'pineapple', 'papaya', 'passion fruit', 'guava',
    'strawberry', 'blueberry', 'raspberry', 'blackberry', 'cranberry',
    'grape', 'watermelon', 'cantaloupe', 'honeydew',
    'fresh ginger', 'ginger root', 'ginger', 'turmeric root',
    'fresh cilantro', 'cilantro', 'fresh parsley', 'parsley',
    'fresh basil', 'basil', 'fresh thyme', 'thyme', 'fresh rosemary', 'rosemary',
    'fresh sage', 'sage', 'fresh mint', 'mint', 'fresh dill', 'dill',
    'jalapeño', 'tomato', 'pepper', 'lettuce', 'herb',
  ],
  Pantry: [
    'all purpose flour', 'bread flour', 'whole wheat flour', 'almond flour', 'coconut flour',
    'granulated sugar', 'brown sugar', 'powdered sugar', 'confectioners sugar',
    'olive oil', 'vegetable oil', 'canola oil', 'coconut oil', 'sesame oil', 'avocado oil',
    'red wine vinegar', 'white wine vinegar', 'apple cider vinegar', 'balsamic vinegar', 'rice vinegar',
    'soy sauce', 'tamari', 'coconut aminos', 'fish sauce', 'oyster sauce', 'hoisin sauce', 'worcestershire',
    'tomato paste', 'tomato sauce', 'marinara', 'pasta sauce', 'diced tomato', 'crushed tomato',
    'chicken broth', 'beef broth', 'vegetable broth', 'chicken stock', 'beef stock',
    'coconut milk', 'evaporated milk', 'condensed milk',
    'black bean', 'pinto bean', 'kidney bean', 'cannellini bean', 'chickpea', 'lentil',
    'white rice', 'brown rice', 'basmati rice', 'jasmine rice', 'instant rice', 'arborio rice',
    'spaghetti', 'penne', 'rigatoni', 'fettuccine', 'linguine', 'farfalle', 'orzo', 'pasta',
    'panko breadcrumb', 'breadcrumb',
    'sesame seed','chia seed', 'flax seed',
    'peanut butter', 'almond butter', 'tahini',
    'honey', 'maple syrup', 'agave', 'molasses',
    'dijon mustard', 'yellow mustard', 'whole grain mustard', 'mustard',
    'mayonnaise', 'ketchup', 'hot sauce', 'sriracha', 'tabasco',
    'pickle', 'olive', 'caper', 'sun dried tomato',
    'kosher salt', 'sea salt', 'black pepper', 'white pepper', 'red pepper flake',
    'garlic powder', 'onion powder', 'paprika', 'smoked paprika', 'cumin', 'coriander',
    'turmeric', 'curry powder', 'garam masala', 'chili powder', 'cayenne', 'oregano',
    'italian seasoning', 'bay leaf', 'cinnamon', 'nutmeg', 'cardamom', 'clove',
    'vanilla extract', 'almond extract', 'baking powder', 'baking soda', 'yeast',
    'cocoa powder', 'chocolate chip', 'dark chocolate', 'milk chocolate', 'white chocolate',
    'granola', 'oat', 'rolled oat', 'quick oat',
    'flour', 'sugar', 'salt', 'oil', 'vinegar', 'sauce', 'broth', 'stock', 'rice', 'macaroni', 'bean',
  ],
  Beverages: [
    'orange juice', 'apple juice', 'grape juice', 'cranberry juice', 'lemon juice', 'lime juice',
    'sparkling water', 'club soda', 'tonic water',
    'coffee', 'espresso', 'cold brew',
    'green tea', 'black tea', 'herbal tea',
    'kombucha', 'kefir drink',
    'white wine', 'red wine', 'rosé', 'champagne', 'prosecco',
    'beer', 'lager', 'ale', 'stout',
    'vodka', 'gin', 'rum', 'tequila', 'whiskey', 'bourbon',
    'juice', 'water', 'soda', 'wine', 'tea', 'coffee',
  ],
  Other: [],
};

function matchesKeyword(ingredientName, keyword) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escaped}\\b`, 'i');
  return regex.test(ingredientName);
}

function categorizeIngredient(name) {
  const lower = name.toLowerCase();
  let bestCategory = 'Other';
  let bestKeywordLength = 0;

  for (const [category, keywords] of Object.entries(INGREDIENT_CATEGORIES)) {
    if (category === 'Other') continue;
    for (const keyword of keywords) {
      if (matchesKeyword(lower, keyword) && keyword.length > bestKeywordLength) {
        bestCategory = category;
        bestKeywordLength = keyword.length;
      }
    }
  }
  return bestCategory;
}
const COUNTABLE_UNITS = ['can', 'cans', 'box', 'boxes', 'bag', 'bags', 'jar', 'jars', 'bottle', 'bottles', 'package', 'pkg', 'bunch', 'head', 'loaf', 'loaves', 'dozen', 'pint', 'quart', 'gallon'];

const CANNED_BOXED_KEYWORDS = ['bean', 'chickpea', 'lentil', 'tomato sauce', 'tomato paste', 'diced tomato', 'coconut milk', 'broth', 'stock', 'soup', 'tuna', 'sardine', 'anchovy', 'pumpkin puree', 'instant rice', 'pasta', 'rice', 'cereal', 'cracker', 'chip'];

function formatShoppingQuantity(name, quantity, unit) {
  if (!quantity && !unit) return null;
  const lower = name.toLowerCase();
  const qty = quantity ? formatQuantity(quantity, unit) : '';

  // Explicit container units
  if (unit && COUNTABLE_UNITS.includes(unit.toLowerCase())) {
    return `${qty} ${unit}`;
  }

  // Canned/boxed pantry items with no unit
  if (!unit && CANNED_BOXED_KEYWORDS.some(k => lower.includes(k))) {
    return quantity === 1 ? '1 can' : `${quantity} cans`;
  }

  // Has a volume/weight unit
  if (unit) {
    return `${qty} ${unit}`;
  }

  // Countable with no unit — just the number
  return `${qty}`;
}
function ShoppingListScreen({ shoppingList, inventory, onToggleItem, onClearList, onAddManualItem }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualQty, setManualQty] = useState('');
  const [manualUnit, setManualUnit] = useState('');

  const enriched = shoppingList.map(item => {
    const match = checkInventoryMatch(item.name, inventory);
    const category = item.category || categorizeIngredient(item.name);
    return { ...item, inventoryMatch: match, category };
  });

  const needToBuy = enriched.filter(i => !i.inventoryMatch.match && !i.checked);
  const runningLow = enriched.filter(i => i.inventoryMatch.match && i.inventoryMatch.days <= 5 && !i.checked);
  const alreadyHave = enriched.filter(i => i.inventoryMatch.match && i.inventoryMatch.days > 5 && !i.checked);
  const checkedItems = enriched.filter(i => i.checked);

  const CATEGORY_ORDER = ['Bakery', 'Produce', 'Meat', 'Dairy', 'Deli', 'Nuts & Dried Fruit', 'Pantry', 'Frozen', 'Beverages', 'Other'];

  function groupByCategory(items) {
  const groups = {};
  for (const item of items) {
    const cat = item.category || 'Other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  }
  return CATEGORY_ORDER
    .filter(c => groups[c]?.length > 0)
    .map(c => ({
      category: c,
      items: groups[c].sort((a, b) => a.name.localeCompare(b.name)),
    }));
}

  function renderItem(item, tint) {
    const qtyDisplay = formatShoppingQuantity(item.name, item.quantity, item.unit);
    const recipes = item.recipes?.length > 1 ? item.recipes.join(', ') : item.recipes?.[0] || 'Manual';
    return (
      <TouchableOpacity key={item.id} style={[styles.shopRow, item.checked && styles.shopRowChecked]} onPress={() => onToggleItem(item.id)}>
        <View style={[styles.shopCheck, item.checked && styles.shopCheckDone]}>
          {item.checked && <Text style={styles.shopCheckMark}>✓</Text>}
        </View>
        <View style={styles.shopInfo}>
          <View style={styles.shopNameRow}>
            <Text style={[styles.shopName, item.checked && styles.shopNameChecked]}>{item.name}</Text>
            {qtyDisplay && (
              <Text style={[styles.shopQty, item.checked && styles.shopNameChecked]}>{qtyDisplay}</Text>
            )}
          </View>
          <Text style={styles.shopRecipe}>{recipes}</Text>
          {item.inventoryMatch.match && !item.checked && (
            <Text style={[styles.shopInventoryNote, { color: tint }]}>
              {item.inventoryMatch.days <= 5
                ? `${item.inventoryMatch.item.name} in pantry, expires in ${item.inventoryMatch.days} days`
                : `${item.inventoryMatch.item.name} in pantry`}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  function renderSection(title, items, tint) {
    if (items.length === 0) return null;
    const groups = groupByCategory(items);
    return (
      <View>
        <Text style={styles.sectionHeader}>{title}</Text>
        {groups.map(({ category, items: groupItems }) => (
          <View key={category}>
            <Text style={styles.categorySubheader}>{category}</Text>
            {groupItems.map(item => renderItem(item, tint))}
          </View>
        ))}
      </View>
    );
  }

  function renderCheckedSection() {
    if (checkedItems.length === 0) return null;
    const groups = groupByCategory(checkedItems);
    return (
      <View>
        <Text style={styles.sectionHeader}>In Cart</Text>
        {groups.map(({ category, items: groupItems }) => (
          <View key={category}>
            <Text style={styles.categorySubheader}>{category}</Text>
            {groupItems.map(item => renderItem(item, '#8E8E93'))}
          </View>
        ))}
      </View>
    );
  }

  function handleManualAdd() {
    if (!manualName.trim()) return;
    const qty = manualQty ? parseFloat(manualQty) : null;
    const unit = manualUnit.trim() || null;
    onAddManualItem(manualName.trim(), qty, unit);
    setManualName('');
    setManualQty('');
    setManualUnit('');
    setShowAddModal(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { flexDirection: 'column', alignItems: 'flex-start' }]}>
        <Text style={styles.headerTitle}>myCucina</Text>
        <Text style={styles.headerSubtitle}>Shopping List</Text>
      </View>

      <TouchableOpacity style={styles.addItemButton} onPress={() => setShowAddModal(true)}>
        <Text style={styles.addItemButtonText}>+ Add Item</Text>
        </TouchableOpacity> 

      {shoppingList.length === 0 ? (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>🛒</Text>
          <Text style={styles.placeholderLabel}>Your list is empty</Text>
          <Text style={styles.placeholderSub}>Tap "Add to List" on any recipe or type above</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {renderSection('Need to Buy', needToBuy, '#8E8E93')}
          {renderSection('Running Low', runningLow, '#FF9500')}
          {renderSection('Already Have', alreadyHave, '#34C759')}
          {renderCheckedSection()}
          <TouchableOpacity style={styles.clearButton} onPress={onClearList}>
            <Text style={styles.clearButtonText}>Clear List</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Item</Text>
            <TouchableOpacity onPress={handleManualAdd}>
              <Text style={styles.modalDone}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.addItemForm}>
            <Text style={styles.inputLabel}>Item Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Potatoes, Toilet Paper, Water"
              placeholderTextColor="#C7C7CC"
              value={manualName}
              onChangeText={setManualName}
              autoFocus
            />

            <Text style={styles.inputLabel}>Quantity (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 5, 1, 2"
              placeholderTextColor="#C7C7CC"
              value={manualQty}
              onChangeText={setManualQty}
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputLabel}>Unit (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. pack, case, bag, lbs, cups"
              placeholderTextColor="#C7C7CC"
              value={manualUnit}
              onChangeText={setManualUnit}
            />

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoryGrid}>
              {['Bakery','Beverages','Dairy','Deli','Frozen','Meat','Nuts & Dried Fruit','Other','Pantry','Produce'].map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, manualName && categorizeIngredient(manualName) === cat && styles.categoryChipActive]}
                  onPress={() => {}}
                >
                  <Text style={[styles.categoryChipText, manualName && categorizeIngredient(manualName) === cat && styles.categoryChipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.inputHelper}>Category is auto-detected from the item name</Text>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ── IMPORT RECIPE MODAL ────────────────────────────────────
function ImportRecipeModal({ visible, onClose, onSave }) {
  const [step, setStep] = useState('paste');
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState(null);

  function reset() { setStep('paste'); setRawText(''); setParsed(null); setError(null); }

  async function handleParse() {
    if (!rawText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const response = await fetch(`${PI_SERVER}/scan-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await response.json();
      if (data.success) { setParsed(data.recipe); setStep('review'); }
      else { setError('Could not parse recipe. Try again.'); }
    } catch (e) {
      setError('Connection error. Check your network.');
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    if (!parsed) return;
    onSave({ ...parsed, id: Date.now(), keywords: [], isImported: true });
    reset();
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => { reset(); onClose(); }}><Text style={styles.modalCancel}>Cancel</Text></TouchableOpacity>
          <Text style={styles.modalTitle}>Import Recipe</Text>
          {step === 'review' ? <TouchableOpacity onPress={handleSave}><Text style={styles.modalSave}>Save</Text></TouchableOpacity> : <View style={{ width: 50 }} />}
        </View>
        {step === 'paste' && (
          <ScrollView style={styles.modalBody}>
            <Text style={styles.inputLabel}>Paste Recipe Text</Text>
            <Text style={styles.importHint}>Copy the full recipe text from any website and paste it below.</Text>
            <TextInput style={[styles.textInput, { height: 300, textAlignVertical: 'top', paddingTop: 14 }]} placeholder="Paste recipe text here..." value={rawText} onChangeText={setRawText} multiline autoFocus />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <TouchableOpacity style={[styles.addButton, (!rawText.trim() || loading) && { backgroundColor: '#C7C7CC' }]} onPress={handleParse} disabled={!rawText.trim() || loading}>
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.addButtonText}>Parse Recipe</Text>}
            </TouchableOpacity>
          </ScrollView>
        )}
        {step === 'review' && parsed && (
          <ScrollView style={styles.modalBody}>
            <Text style={styles.importHint}>Review the parsed recipe before saving.</Text>
            <Text style={styles.inputLabel}>Name</Text>
            <View style={styles.reviewBox}><Text style={styles.reviewText}>{parsed.name}</Text></View>
            <Text style={styles.inputLabel}>Details</Text>
            <View style={styles.reviewBox}><Text style={styles.reviewText}>⏱ {parsed.time} · {parsed.difficulty}</Text></View>
            <Text style={styles.inputLabel}>Ingredients ({parsed.ingredients?.length})</Text>
            <View style={styles.card}>
              {parsed.ingredients?.map((ing, i) => (
                <View key={i} style={[styles.ingRow, i < parsed.ingredients.length - 1 && styles.ingredientBorder]}>
                  <IngredientRow ing={ing} />
                </View>
              ))}
            </View>
            <Text style={styles.inputLabel}>Steps ({parsed.steps?.length})</Text>
            <View style={styles.card}>
              {parsed.steps?.map((step, i) => (
                <View key={i} style={[styles.stepRow, i < parsed.steps.length - 1 && styles.ingredientBorder]}>
                  <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{i + 1}</Text></View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

// ── TONIGHT MODAL ──────────────────────────────────────────
function TonightModal({ visible, onClose, inventory }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState(null);

  async function handleAsk() {
    setLoading(true);
    setError(null);
    setSuggestions(null);
    try {
      const itemList = inventory.map(item => ({ name: item.name, daysLeft: Math.max(0, getDaysUntilExpiry(item.expiryDate)) }));
      const response = await fetch(`${PI_SERVER}/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventory: itemList }),
      });
      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (e) {
      setError(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}><Text style={styles.modalCancel}>Close</Text></TouchableOpacity>
          <Text style={styles.modalTitle}>Tonight</Text>
          <View style={{ width: 50 }} />
        </View>
        <ScrollView style={styles.modalBody}>
          <View style={styles.tonightHero}>
            <Text style={styles.tonightEmoji}>🍽</Text>
            <Text style={styles.tonightHeroTitle}>What can I make tonight?</Text>
            <Text style={styles.tonightHeroSub}>We'll look at what's in your kitchen and find the best options before anything goes to waste.</Text>
            <TouchableOpacity style={[styles.tonightButton, loading && styles.tonightButtonDisabled]} onPress={handleAsk} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.tonightButtonText}>{suggestions ? 'Refresh suggestions' : 'Show me what I can make'}</Text>}
            </TouchableOpacity>
          </View>
          {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}
          {suggestions && (
            <View>
              <Text style={styles.sectionHeader}>Based on your kitchen right now</Text>
              {suggestions.map((s, i) => (
                <View key={i} style={styles.suggestionCard}>
                  <View style={styles.suggestionCardTop}>
                    <Text style={styles.suggestionCardName}>{s.name}</Text>
                    <View style={styles.suggestionCardMeta}>
                      <Text style={styles.recipeCardMeta}>⏱ {s.time}</Text>
                      <Text style={[styles.recipeCardMeta, { color: DIFFICULTY_COLORS[s.difficulty] || '#8E8E93' }]}>● {s.difficulty}</Text>
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
    </Modal>
  );
}

// ── RECIPE DETAIL SCREEN ───────────────────────────────────
function RecipeDetailScreen({ route, navigation, favorites, onToggleFavorite, onAddToList }) {
  const { recipe } = route.params;
  const isFavorited = favorites.includes(recipe.id);
  const [added, setAdded] = useState(false);

  function handleAddToList() {
    onAddToList(recipe);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backButton}>‹ Back</Text></TouchableOpacity>
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
            <Text style={[styles.recipeMetaText, { color: DIFFICULTY_COLORS[recipe.difficulty] }]}>● {recipe.difficulty}</Text>
          </View>
          {recipe.isImported && <Text style={[styles.recipeMetaText, { marginTop: 4, color: '#007AFF' }]}>Imported recipe</Text>}
          <TouchableOpacity style={[styles.addToListButton, added && styles.addToListButtonDone]} onPress={handleAddToList}>
            <Text style={styles.addToListButtonText}>{added ? '✓ Added to List' : '+ Add to Shopping List'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionHeader}>Ingredients</Text>
        <View style={styles.card}>
          {recipe.ingredients?.map((ing, i) => (
            <View key={i} style={[{ paddingVertical: 4 }, i < recipe.ingredients.length - 1 && styles.ingredientBorder]}>
              <IngredientRow ing={ing} />
            </View>
          ))}
        </View>
        <Text style={styles.sectionHeader}>Instructions</Text>
        <View style={styles.card}>
          {recipe.steps?.map((step, i) => (
            <View key={i} style={[styles.stepRow, i < recipe.steps.length - 1 && styles.ingredientBorder]}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{i + 1}</Text></View>
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
function SuggestionsScreen({ route, navigation, favorites, onToggleFavorite, allRecipes, onAddToList }) {
  const { item } = route.params;
  const days = getDaysUntilExpiry(item.expiryDate);
  const color = getUrgencyColor(days);
  const recipes = getRecipesForItem(item.name, allRecipes);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backButton}>‹ Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>myCucina</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.suggestionHero}>
          <View style={[styles.urgencyBadge, { backgroundColor: color }]}>
            <Text style={styles.urgencyBadgeText}>{days <= 0 ? 'Expired' : days === 1 ? '1 day left' : `${days} days left`}</Text>
          </View>
          <Text style={styles.suggestionItemName}>{item.name}</Text>
          <Text style={styles.suggestionSubtitle}>Use it in one of these recipes</Text>
        </View>
        {recipes.length === 0 ? (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>🤔</Text>
            <Text style={styles.placeholderLabel}>No recipes found</Text>
            <Text style={styles.placeholderSub}>Import a recipe that uses this ingredient</Text>
          </View>
        ) : (
          recipes.map(recipe => (
            <TouchableOpacity key={recipe.id} style={styles.recipeCard} onPress={() => navigation.navigate('RecipeDetail', { recipe })}>
              <View style={styles.recipeCardInfo}>
                <Text style={styles.recipeCardName}>{recipe.name}</Text>
                <View style={styles.recipeCardMetaRow}>
                  <Text style={styles.recipeCardMeta}>⏱ {recipe.time}</Text>
                  <Text style={[styles.recipeCardMeta, { color: DIFFICULTY_COLORS[recipe.difficulty] }]}>● {recipe.difficulty}</Text>
                </View>
              </View>
              <Text style={{ fontSize: 20 }}>{favorites.includes(recipe.id) ? '⭐️' : '☆'}</Text>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── RECIPE LIST SCREEN ─────────────────────────────────────
function RecipeListScreen({ navigation, favorites, onToggleFavorite, allRecipes, onImportSave, inventory }) {
  const [search, setSearch] = useState('');
  const [importVisible, setImportVisible] = useState(false);
  const [tonightVisible, setTonightVisible] = useState(false);

  const filtered = allRecipes.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
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
        <TextInput style={styles.searchInput} placeholder="🔍  Search recipes..." value={search} onChangeText={setSearch} clearButtonMode="while-editing" />
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.recipeActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setTonightVisible(true)}>
            <Text style={styles.actionButtonText}>🍽 What can I make tonight?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]} onPress={() => setImportVisible(true)}>
            <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>+ Import Recipe</Text>
          </TouchableOpacity>
        </View>

        {filtered.length === 0 ? (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>🍽</Text>
            <Text style={styles.placeholderLabel}>No recipes found</Text>
            <Text style={styles.placeholderSub}>Try a different search or import one</Text>
          </View>
        ) : (
          sections.map(section => (
            <View key={section.title}>
              <Text style={styles.sectionHeader}>{section.title}</Text>
              {section.data.map(recipe => (
                <TouchableOpacity key={recipe.id} style={styles.recipeCard} onPress={() => navigation.navigate('RecipeDetail', { recipe })}>
                  <View style={styles.recipeCardInfo}>
                    <Text style={styles.recipeCardName}>{recipe.name}</Text>
                    <View style={styles.recipeCardMetaRow}>
                      <Text style={styles.recipeCardMeta}>⏱ {recipe.time}</Text>
                      <Text style={[styles.recipeCardMeta, { color: DIFFICULTY_COLORS[recipe.difficulty] }]}>● {recipe.difficulty}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 20 }}>{favorites.includes(recipe.id) ? '⭐️' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      <ImportRecipeModal visible={importVisible} onClose={() => setImportVisible(false)} onSave={onImportSave} />
      <TonightModal visible={tonightVisible} onClose={() => setTonightVisible(false)} inventory={inventory} />
    </SafeAreaView>
  );
}

// ── FAVORITES SCREEN ───────────────────────────────────────
function FavoritesScreen({ navigation, favorites, onToggleFavorite, allRecipes, onAddToList }) {
  const favoriteRecipes = allRecipes.filter(r => favorites.includes(r.id));
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
            <TouchableOpacity key={recipe.id} style={styles.recipeCard} onPress={() => navigation.navigate('FavRecipeDetail', { recipe })}>
              <View style={styles.recipeCardInfo}>
                <Text style={styles.recipeCardName}>{recipe.name}</Text>
                <View style={styles.recipeCardMetaRow}>
                  <Text style={styles.recipeCardMeta}>⏱ {recipe.time}</Text>
                  <Text style={[styles.recipeCardMeta, { color: DIFFICULTY_COLORS[recipe.difficulty] }]}>● {recipe.difficulty}</Text>
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
    if (item) { setName(item.name); setCategory(item.category); setDays(String(Math.max(0, getDaysUntilExpiry(item.expiryDate)))); }
    else { setName(''); setCategory('Produce'); setDays('7'); }
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
          <TouchableOpacity onPress={onClose}><Text style={styles.modalCancel}>Cancel</Text></TouchableOpacity>
          <Text style={styles.modalTitle}>{isEditing ? 'Edit Item' : 'Add Item'}</Text>
          <TouchableOpacity onPress={handleSave}><Text style={styles.modalSave}>Save</Text></TouchableOpacity>
        </View>
        <ScrollView style={styles.modalBody}>
          <Text style={styles.inputLabel}>Item Name</Text>
          <TextInput style={styles.textInput} placeholder="e.g. Chicken Thighs" value={name} onChangeText={setName} autoFocus={!isEditing} />
          <Text style={styles.inputLabel}>Days Until Expiry</Text>
          <TextInput style={styles.textInput} placeholder="7" value={days} onChangeText={setDays} keyboardType="number-pad" />
          <Text style={styles.inputLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity key={cat} style={[styles.categoryChip, category === cat && styles.categoryChipActive]} onPress={() => setCategory(cat)}>
                <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>{cat}</Text>
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
            <TouchableOpacity key={item.id} style={styles.itemRow} onPress={() => navigation.navigate('Suggestions', { item })}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.expiryDate}>{formatExpiryDate(item.expiryDate)}</Text>
                <Text style={[styles.daysLeft, { color }]}>{days <= 0 ? 'Expired' : days === 1 ? '1 day left' : `${days} days left`}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── INVENTORY SCREEN ───────────────────────────────────────
function ReceiptScanModal({ visible, onClose, onAddItems }) {
  const [step, setStep] = useState('scan');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scannedItems, setScannedItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editingIndex, setEditingIndex] = useState(null);

  function reset() {
    setStep('scan');
    setLoading(false);
    setError(null);
    setScannedItems([]);
    setSelectedIds(new Set());
    setEditingIndex(null);
  }

  async function handleScan(useCamera) {
    setError(null);
    const permissionResult = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      setError('Permission denied. Please allow access in Settings.');
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.7 });

    if (result.canceled) return;

    setLoading(true);
    try {
      const base64 = result.assets[0].base64;
      const response = await fetch(`${PI_SERVER}/scan-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      setScannedItems(data.items);
      setSelectedIds(new Set(data.items.map((_, i) => i)));
      setStep('review');
    } catch (e) {
      setError(`Scan failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  function toggleItem(index) {
    if (editingIndex === index) return;
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  function updateItem(index, field, value) {
    setScannedItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }

  function handleConfirm() {
    const toAdd = scannedItems
      .filter((_, i) => selectedIds.has(i))
      .map(item => ({
        ...item,
        id: Date.now() + Math.random(),
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }));
    onAddItems(toAdd);
    reset();
    onClose();
  }

  function renderReviewItem(item, i) {
    const isEditing = editingIndex === i;
    const isSelected = selectedIds.has(i);

    return (
      <View key={i} style={[styles.scanItem, !isSelected && !isEditing && styles.scanItemDeselected]}>
        <TouchableOpacity
          style={[styles.shopCheck, isSelected && styles.shopCheckDone]}
          onPress={() => toggleItem(i)}
        >
          {isSelected && <Text style={styles.shopCheckMark}>✓</Text>}
        </TouchableOpacity>

        <View style={styles.shopInfo}>
          {isEditing ? (
            <View style={styles.scanEditForm}>
              <TextInput
                style={styles.scanEditInput}
                value={item.name}
                onChangeText={v => updateItem(i, 'name', v)}
                placeholder="Item name"
                autoFocus
              />
              <View style={styles.scanEditRow}>
                <TextInput
                  style={[styles.scanEditInput, { flex: 1 }]}
                  value={item.quantity ? String(item.quantity) : ''}
                  onChangeText={v => updateItem(i, 'quantity', v ? parseFloat(v) : null)}
                  placeholder="Qty"
                  keyboardType="decimal-pad"
                />
                <TextInput
                  style={[styles.scanEditInput, { flex: 1 }]}
                  value={item.unit || ''}
                  onChangeText={v => updateItem(i, 'unit', v || null)}
                  placeholder="Unit"
                />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {['Produce','Meat','Dairy','Deli','Bakery','Frozen','Pantry','Beverages','Nuts & Dried Fruit','Other'].map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.scanCategoryChip, item.category === cat && styles.scanCategoryChipActive]}
                      onPress={() => updateItem(i, 'category', cat)}
                    >
                      <Text style={[styles.scanCategoryChipText, item.category === cat && styles.scanCategoryChipTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <TouchableOpacity style={styles.scanEditDone} onPress={() => setEditingIndex(null)}>
                <Text style={styles.scanEditDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setEditingIndex(i)} style={{ flex: 1 }}>
              <Text style={[styles.shopName, !isSelected && styles.shopNameChecked]}>{item.name}</Text>
              <Text style={styles.shopRecipe}>
                {item.category}{item.quantity ? ` · ${item.quantity}${item.unit ? ' ' + item.unit : ''}` : ''} · tap to edit
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => { reset(); onClose(); }}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Scan Receipt</Text>
          {step === 'review'
            ? <TouchableOpacity onPress={handleConfirm}>
                <Text style={styles.modalDone}>Add {selectedIds.size}</Text>
              </TouchableOpacity>
            : <View style={{ width: 60 }} />
          }
        </View>

        {step === 'scan' && (
          <View style={styles.scanContainer}>
            {loading ? (
              <View style={styles.scanLoading}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.scanLoadingText}>Reading your receipt...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.scanHero}>📷</Text>
                <Text style={styles.scanTitle}>Scan a Receipt</Text>
                <Text style={styles.scanSub}>Take a photo or choose from your library. Claude will extract your grocery items automatically.</Text>
                {error && <Text style={styles.scanError}>{error}</Text>}
                <TouchableOpacity style={styles.scanButton} onPress={() => handleScan(true)}>
                  <Text style={styles.scanButtonText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.scanButtonSecondary} onPress={() => handleScan(false)}>
                  <Text style={styles.scanButtonSecondaryText}>Choose from Library</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {step === 'review' && (
          <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
            <Text style={styles.scanReviewHeader}>
              Found {scannedItems.length} items — tap an item to edit, tap the circle to deselect
            </Text>
            {scannedItems.map((item, i) => renderReviewItem(item, i))}
            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}
function InventoryScreen({ inventory, onAdd, onEdit, onDelete, onScanAdd }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [scanModalVisible, setScanModalVisible] = useState(false);

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = inventory.filter(i => i.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  function openAdd() { setSelectedItem(null); setModalVisible(true); }
  function openEdit(item) { setSelectedItem(item); setModalVisible(true); }
  function handleSave(data) {
    if (selectedItem) { onEdit({ ...selectedItem, ...data }); } else { onAdd(data); }
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
                    <Text style={[styles.itemCategory, { color }]}>{days <= 0 ? 'Expired' : days === 1 ? '1 day left' : `${days} days left`}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
      <View style={styles.fabRow}>
        <TouchableOpacity style={[styles.fab, styles.fabSecondary]} onPress={() => setScanModalVisible(true)}>
          <Text style={styles.fabText}>📷 Scan Receipt</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fab} onPress={openAdd}>
          <Text style={styles.fabText}>+ Add Item</Text>
        </TouchableOpacity>
      </View>
      <ReceiptScanModal
        visible={scanModalVisible}
        onClose={() => setScanModalVisible(false)}
        onAddItems={onScanAdd}
      />
      <ItemModal visible={modalVisible} item={selectedItem} onSave={handleSave} onDelete={handleDelete} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
}

// ── NAVIGATION ─────────────────────────────────────────────
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function UseSoonStack({ inventory, favorites, onToggleFavorite, allRecipes, onAddToList }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UseSoonMain">{({ navigation }) => <UseSoonScreen inventory={inventory} navigation={navigation} />}</Stack.Screen>
      <Stack.Screen name="Suggestions">{({ route, navigation }) => <SuggestionsScreen route={route} navigation={navigation} favorites={favorites} onToggleFavorite={onToggleFavorite} allRecipes={allRecipes} onAddToList={onAddToList} />}</Stack.Screen>
      <Stack.Screen name="RecipeDetail">{({ route, navigation }) => <RecipeDetailScreen route={route} navigation={navigation} favorites={favorites} onToggleFavorite={onToggleFavorite} onAddToList={onAddToList} />}</Stack.Screen>
    </Stack.Navigator>
  );
}

function RecipesStack({ favorites, onToggleFavorite, allRecipes, onImportSave, onAddToList, inventory }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RecipeListMain">{({ navigation }) => <RecipeListScreen navigation={navigation} favorites={favorites} onToggleFavorite={onToggleFavorite} allRecipes={allRecipes} onImportSave={onImportSave} inventory={inventory} />}</Stack.Screen>
      <Stack.Screen name="RecipeDetail">{({ route, navigation }) => <RecipeDetailScreen route={route} navigation={navigation} favorites={favorites} onToggleFavorite={onToggleFavorite} onAddToList={onAddToList} />}</Stack.Screen>
    </Stack.Navigator>
  );
}

function FavoritesStack({ favorites, onToggleFavorite, allRecipes, onAddToList }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FavoritesMain">{({ navigation }) => <FavoritesScreen navigation={navigation} favorites={favorites} onToggleFavorite={onToggleFavorite} allRecipes={allRecipes} onAddToList={onAddToList} />}</Stack.Screen>
      <Stack.Screen name="FavRecipeDetail">{({ route, navigation }) => <RecipeDetailScreen route={route} navigation={navigation} favorites={favorites} onToggleFavorite={onToggleFavorite} onAddToList={onAddToList} />}</Stack.Screen>
    </Stack.Navigator>
  );
}

export default function App() {
  const [inventory, setInventory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [customRecipes, setCustomRecipes] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const allRecipes = [...BUILTIN_RECIPES, ...customRecipes];

  useEffect(() => {
    async function loadData() {
      try {
        const [storedInventory, storedFavorites, storedCustom, storedShopping] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(FAVORITES_KEY),
          AsyncStorage.getItem(CUSTOM_RECIPES_KEY),
          AsyncStorage.getItem(SHOPPING_LIST_KEY),
        ]);
        setInventory(storedInventory ? JSON.parse(storedInventory) : INITIAL_INVENTORY);
        setFavorites(storedFavorites ? JSON.parse(storedFavorites) : []);
        setCustomRecipes(storedCustom ? JSON.parse(storedCustom) : []);
        setShoppingList(storedShopping ? JSON.parse(storedShopping) : []);
      } catch (e) {
        setInventory(INITIAL_INVENTORY);
        setFavorites([]);
        setCustomRecipes([]);
        setShoppingList([]);
      } finally {
        setLoaded(true);
      }
    }
    loadData();
  }, []);

  useEffect(() => { if (loaded) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(inventory)); }, [inventory, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)); }, [favorites, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem(CUSTOM_RECIPES_KEY, JSON.stringify(customRecipes)); }, [customRecipes, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(shoppingList)); }, [shoppingList, loaded]);

  function handleAdd(item) { setInventory(prev => [...prev, { ...item, id: Date.now() }]); }
  function handleEdit(updated) { setInventory(prev => prev.map(i => i.id === updated.id ? updated : i)); }
  function handleDelete(id) { setInventory(prev => prev.filter(i => i.id !== id)); }
  function handleToggleFavorite(recipeId) { setFavorites(prev => prev.includes(recipeId) ? prev.filter(id => id !== recipeId) : [...prev, recipeId]); }
  function handleImportSave(recipe) { setCustomRecipes(prev => [...prev, recipe]); }
  function handleAddToList(recipe) { setShoppingList(prev => addRecipeToShoppingList(recipe, prev)); }
  function handleToggleShoppingItem(id) { setShoppingList(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i)); }
  function handleClearList() { setShoppingList([]); }

  if (!loaded) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#007AFF" /></View>;
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#007AFF', tabBarInactiveTintColor: '#8E8E93', tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E5E5EA' } }}>

        <Tab.Screen name="Shopping" options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>🛒</Text> }}>
          {() => <ShoppingListScreen shoppingList={shoppingList} inventory={inventory} onToggleItem={handleToggleShoppingItem} onClearList={handleClearList} onAddManualItem={(name, quantity, unit) => {
            const category = categorizeIngredient(name);
                setShoppingList(prev => [...prev, {
                  id: Date.now().toString(),
                  name,
                  quantity: quantity || null,
                  unit: unit ||null,
                  recipes: ['Manual'],
                  checked: false,
                  category,
                }]);
          }} />}
        </Tab.Screen>
        <Tab.Screen name="Use Soon" options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>⚠️</Text> }}>
          {() => <UseSoonStack inventory={inventory} favorites={favorites} onToggleFavorite={handleToggleFavorite} allRecipes={allRecipes} onAddToList={handleAddToList} />}
        </Tab.Screen>
        <Tab.Screen name="Inventory" options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>🥦</Text> }}>
          {() => <InventoryScreen inventory={inventory} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} onScanAdd={(items) => setInventory(prev => [...prev, ...items])} />}
        </Tab.Screen>
        <Tab.Screen name="Recipes" options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>🍳</Text> }}>
          {() => <RecipesStack favorites={favorites} onToggleFavorite={handleToggleFavorite} allRecipes={allRecipes} onImportSave={handleImportSave} onAddToList={handleAddToList} inventory={inventory} />}
        </Tab.Screen>
        <Tab.Screen name="Favorites" options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>⭐️</Text> }}>
          {() => <FavoritesStack favorites={favorites} onToggleFavorite={handleToggleFavorite} allRecipes={allRecipes} onAddToList={handleAddToList} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E5E5EA', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 13, fontWeight: '600', color: '#007AFF', textTransform: 'uppercase', letterSpacing: 1, flex: 1, textAlign: 'center' },
  headerSubtitle: { fontSize: 28, fontWeight: '700', color: '#1C1C1E', marginTop: 2 },
  backButton: { fontSize: 17, color: '#007AFF', fontWeight: '500' },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  searchInput: { backgroundColor: '#F2F2F7', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: '#1C1C1E' },
  scrollView: { flex: 1, paddingTop: 12 },
  sectionHeader: { fontSize: 13, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 20, paddingVertical: 8 },
  itemRow: { backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 14 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '500', color: '#1C1C1E' },
  itemCategory: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  itemRight: { alignItems: 'flex-end' },
  expiryDate: { fontSize: 14, fontWeight: '500', color: '#1C1C1E' },
  daysLeft: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  chevron: { fontSize: 20, color: '#C7C7CC', marginLeft: 8 },
  fab: { flex: 1, backgroundColor: '#007AFF', borderRadius: 28, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  fabText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  recipeActions: { marginHorizontal: 16, marginBottom: 8, gap: 8 },
  actionButton: { backgroundColor: '#007AFF', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  actionButtonSecondary: { backgroundColor: '#F0F7FF', borderWidth: 1, borderColor: '#007AFF' },
  actionButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
  actionButtonTextSecondary: { color: '#007AFF' },
  modalContainer: { flex: 1, backgroundColor: '#F2F2F7' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  modalCancel: { fontSize: 16, color: '#8E8E93' },
  modalSave: { fontSize: 16, color: '#007AFF', fontWeight: '600' },
  modalBody: { padding: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 20, marginBottom: 8 },
  importHint: { fontSize: 14, color: '#8E8E93', lineHeight: 20, marginBottom: 8 },
  textInput: { backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1C1C1E' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5EA' },
  categoryChipActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  categoryChipText: { fontSize: 14, color: '#1C1C1E' },
  categoryChipTextActive: { color: '#FFFFFF', fontWeight: '600' },
  deleteButton: { backgroundColor: '#FFF2F2', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 32, borderWidth: 1, borderColor: '#FFD0D0' },
  deleteButtonText: { color: '#FF3B30', fontSize: 16, fontWeight: '600' },
  addButton: { backgroundColor: '#007AFF', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 32 },
  addButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  addToListButton: { marginTop: 14, backgroundColor: '#007AFF', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center' },
  addToListButtonDone: { backgroundColor: '#34C759' },
  addToListButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  reviewBox: { backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 4 },
  reviewText: { fontSize: 16, color: '#1C1C1E' },
  errorText: { color: '#FF3B30', fontSize: 14, marginTop: 12, textAlign: 'center' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  placeholderText: { fontSize: 60, marginBottom: 12 },
  placeholderLabel: { fontSize: 18, fontWeight: '600', color: '#1C1C1E' },
  placeholderSub: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
  suggestionHero: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 8 },
  urgencyBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 10 },
  urgencyBadgeText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  suggestionItemName: { fontSize: 22, fontWeight: '700', color: '#1C1C1E', textAlign: 'center', marginBottom: 4 },
  suggestionSubtitle: { fontSize: 14, color: '#8E8E93' },
  recipeCard: { backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  recipeCardInfo: { flex: 1 },
  recipeCardName: { fontSize: 16, fontWeight: '600', color: '#1C1C1E' },
  recipeCardMetaRow: { flexDirection: 'row', gap: 12, marginTop: 3 },
  recipeCardMeta: { fontSize: 13, color: '#8E8E93' },
  recipeHero: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 20, marginBottom: 8 },
  recipeName: { fontSize: 24, fontWeight: '700', color: '#1C1C1E', marginBottom: 10 },
  recipeMeta: { flexDirection: 'row', gap: 16 },
  recipeMetaText: { fontSize: 14, color: '#8E8E93', fontWeight: '500' },
  card: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 8, borderRadius: 12, overflow: 'hidden' },
  ingredientRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, alignItems: 'flex-start' },
  ingredientBorder: { borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  ingredientDot: { fontSize: 16, color: '#007AFF', marginRight: 10, marginTop: 1 },
  ingredientText: { fontSize: 15, color: '#1C1C1E', flex: 1 },
  ingRow: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 10 },
  ingQty: { fontSize: 14, color: '#8E8E93', width: 80, textAlign: 'left', marginRight: 16, paddingTop: 1 },
  ingName: { fontSize: 15, color: '#1C1C1E', flex: 1 },
  stepRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14, alignItems: 'flex-start' },
  stepNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 1, flexShrink: 0 },
  stepNumberText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  stepText: { fontSize: 15, color: '#1C1C1E', flex: 1, lineHeight: 22 },
  tonightHero: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 8 },
  tonightEmoji: { fontSize: 48, marginBottom: 12 },
  tonightHeroTitle: { fontSize: 20, fontWeight: '700', color: '#1C1C1E', textAlign: 'center', marginBottom: 8 },
  tonightHeroSub: { fontSize: 14, color: '#8E8E93', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  tonightButton: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30, minWidth: 220, alignItems: 'center' },
  tonightButtonDisabled: { backgroundColor: '#C7C7CC' },
  tonightButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  suggestionCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  suggestionCardTop: { marginBottom: 8 },
  suggestionCardName: { fontSize: 17, fontWeight: '600', color: '#1C1C1E', marginBottom: 4 },
  suggestionCardMeta: { flexDirection: 'row', gap: 12 },
  suggestionReason: { fontSize: 14, color: '#8E8E93', lineHeight: 20 },
  errorBox: { backgroundColor: '#FFF2F2', marginHorizontal: 16, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#FFD0D0' },
  shopRow: { backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 14, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  shopRowChecked: { opacity: 0.5 },
  shopCheck: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#C7C7CC', marginRight: 14, marginTop: 1, alignItems: 'center', justifyContent: 'center' },
  shopCheckDone: { backgroundColor: '#34C759', borderColor: '#34C759' },
  shopCheckMark: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  shopInfo: { flex: 1 },
  shopNameRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  shopQty: { fontSize: 14, color: '#8E8E93', fontWeight: '400' }, 
  shopName: { fontSize: 16, fontWeight: '500', color: '#1C1C1E' },
  shopNameChecked: { textDecorationLine: 'line-through', color: '#711c1c' },
  shopRecipe: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  shopInventoryNote: { fontSize: 12, marginTop: 3, fontWeight: '500' },
  clearButton: { marginHorizontal: 16, marginTop: 8, backgroundColor: '#FFF2F2', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#FFD0D0' },
  clearButtonText: { color: '#FF3B30', fontWeight: '600', fontSize: 15 },
  addItemButton: { marginHorizontal: 16, marginVertical: 8, backgroundColor: '#F2F2F7', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#007AFF' },
  addItemButtonText: { color: '#007AFF', fontWeight: '600', fontSize: 16 },
  addItemForm: { paddingHorizontal: 16, paddingTop: 16 }, 
  fabRow: { position: 'absolute', bottom: 24, left: 16, right: 16, flexDirection: 'row', gap: 12, justifyContent: 'center' },
  fabSecondary: { backgroundColor: '#007AFF', borderWidth: 1.5, borderColor: '#007AFF' },
  scanContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  scanLoading: { alignItems: 'center', gap: 16 },
  scanLoadingText: { fontSize: 16, color: '#8E8E93' },
  scanHero: { fontSize: 64, marginBottom: 16 },
  scanTitle: { fontSize: 24, fontWeight: '700', color: '#1C1C1E', marginBottom: 8, textAlign: 'center' },
  scanSub: { fontSize: 15, color: '#8E8E93', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  scanError: { color: '#FF3B30', fontSize: 14, marginBottom: 16, textAlign: 'center' },
  scanButton: { backgroundColor: '#007AFF', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, width: '100%', alignItems: 'center', marginBottom: 12 },
  scanButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
  scanButtonSecondary: { backgroundColor: '#F2F2F7', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, width: '100%', alignItems: 'center', borderWidth: 1.5, borderColor: '#007AFF' },
  scanButtonSecondaryText: { color: '#007AFF', fontWeight: '600', fontSize: 16 },
  scanReviewHeader: { fontSize: 14, color: '#8E8E93', paddingHorizontal: 16, paddingVertical: 12 },
  scanItem: { backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  scanItemDeselected: { opacity: 0.4 },
  scanEditForm: { flex: 1, gap: 6 },
  scanEditRow: { flexDirection: 'row', gap: 8 },
  scanEditInput: { backgroundColor: '#F2F2F7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, fontSize: 15, color: '#1C1C1E' },
  scanEditDone: { alignSelf: 'flex-start', marginTop: 6, paddingVertical: 4, paddingHorizontal: 12, backgroundColor: '#007AFF', borderRadius: 8 },
  scanEditDoneText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  scanCategoryChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, backgroundColor: '#F2F2F7', borderWidth: 1, borderColor: '#E5E5EA' },
  scanCategoryChipActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  scanCategoryChipText: { fontSize: 12, color: '#8E8E93', fontWeight: '500' },
  scanCategoryChipTextActive: { color: '#FFFFFF' },
})