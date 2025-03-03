const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Sample recipes with styles, health options, and Walmart-available ingredients
const recipes = [
  { 
    name: 'Pasta Primavera', 
    ingredients: ['pasta', 'broccoli', 'tomato', 'sauce'], 
    style: 'Healthy', 
    health: 'Vegetarian', 
    recipeText: 'Cook pasta according to package instructions. Sauté broccoli and tomatoes in olive oil, add sauce, and mix with pasta. Serve warm.', 
    recipeUrl: 'https://www.example.com/pasta-primavera' // Simulated recipe card link
  },
  { 
    name: 'Beef Tacos', 
    ingredients: ['tortillas', 'beef', 'salsa', 'lettuce'], 
    style: 'Mexican', 
    health: 'Regular', 
    recipeText: 'Brown beef in a skillet, season with garlic salt. Warm tortillas, fill with beef, salsa, and lettuce. Serve with a side of rice.', 
    recipeUrl: 'https://www.example.com/beef-tacos'
  },
  { 
    name: 'Chicken Fried Rice', 
    ingredients: ['rice', 'chicken', 'soy sauce', 'onion'], 
    style: 'Asian', 
    health: 'Regular', 
    recipeText: 'Cook rice and set aside. Sauté chicken and onions, add rice and soy sauce, stir-fry until heated through.', 
    recipeUrl: 'https://www.example.com/chicken-fried-rice'
  }
];

// Walmart-available ingredients (simplified from your products)
const walmartIngredients = {
  pasta: true, sauce: true, broccoli: true, tomato: true, tortillas: true, 
  beef: true, salsa: true, lettuce: true, rice: true, chicken: true, 
  'soy sauce': true, onion: true
};

const generateMealPlan = (nights, style, health) => {
  const mealPlan = [];
  for (let i = 0; i < nights; i++) {
    // Filter recipes based on style, health, and Walmart availability
    const filteredRecipes = recipes.filter(recipe => 
      (style === 'Any' || recipe.style === style) && 
      (health === 'Any' || recipe.health === health) &&
      recipe.ingredients.every(ingredient => walmartIngredients[ingredient] || walmartIngredients[ingredient.replace(' ', '+')])
    );
    if (filteredRecipes.length === 0) {
      return []; // No recipes match the criteria
    }
    const randomIndex = Math.floor(Math.random() * filteredRecipes.length);
    mealPlan.push(filteredRecipes[randomIndex]);
  }
  return mealPlan;
};

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.get('/api/meals', (req, res) => {
  res.json({ message: 'Sample meal data' });
});

app.post('/api/generate-meal-plan', (req, res) => {
  const { nights, style = 'Any', health = 'Any' } = req.body; // Default to 'Any' if not specified
  const mealPlan = generateMealPlan(nights, style, health);
  res.json(mealPlan);
});

app.get('/api/products/:ingredient', (req, res) => {
  const { ingredient } = req.params;
  const products = {
    pasta: { name: 'Pasta', qty: 1, price: 1.50, link: 'https://www.walmart.com/search?q=pasta', unit: 'lbs' },
    sauce: { name: 'Sauce', qty: 1, price: 2.00, link: 'https://www.walmart.com/search?q=sauce', unit: 'ozs' },
    broccoli: { name: 'Broccoli', qty: 1, price: 1.50, link: 'https://www.walmart.com/search?q=broccoli', unit: 'unit' },
    tomato: { name: 'Tomato', qty: 1, price: 0.75, link: 'https://www.walmart.com/search?q=tomato', unit: 'unit' },
    tortillas: { name: 'Tortillas', qty: 1, price: 2.00, link: 'https://www.walmart.com/search?q=tortillas', unit: 'unit' },
    beef: { name: 'Beef', qty: 1, price: 5.00, link: 'https://www.walmart.com/search?q=beef', unit: 'lbs' },
    salsa: { name: 'Salsa', qty: 1, price: 1.75, link: 'https://www.walmart.com/search?q=salsa', unit: 'ozs' },
    lettuce: { name: 'Lettuce', qty: 1, price: 1.00, link: 'https://www.walmart.com/search?q=lettuce', unit: 'unit' },
    rice: { name: 'Rice', qty: 1, price: 2.00, link: 'https://www.walmart.com/search?q=rice', unit: 'lbs' },
    chicken: { name: 'Chicken', qty: 1, price: 4.50, link: 'https://www.walmart.com/search?q=chicken', unit: 'lbs' },
    'soy sauce': { name: 'Soy Sauce', qty: 1, price: 2.25, link: 'https://www.walmart.com/search?q=soy+sauce', unit: 'ozs' },
    onion: { name: 'Onion', qty: 1, price: 0.50, link: 'https://www.walmart.com/search?q=onion', unit: 'unit' }
  };
  res.json(products[ingredient] || { error: 'Not found in stock' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});