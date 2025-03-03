const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Sample recipes with styles and health options
const recipes = [
  { name: 'Pasta', ingredients: ['pasta', 'sauce', 'cheese'], style: 'Italian', health: 'Regular' },
  { name: 'Salad', ingredients: ['lettuce', 'tomato', 'dressing'], style: 'Healthy', health: 'Low-Carb' },
  { name: 'Tacos', ingredients: ['tortillas', 'beef', 'salsa'], style: 'Mexican', health: 'Regular' },
  { name: 'Veggie Stir-Fry', ingredients: ['rice', 'broccoli', 'soy sauce'], style: 'Healthy', health: 'Vegetarian' }
];

const generateMealPlan = (nights, style, health) => {
  const mealPlan = [];
  for (let i = 0; i < nights; i++) {
    // Filter recipes based on style and health preferences
    const filteredRecipes = recipes.filter(recipe => 
      (style === 'Any' || recipe.style === style) && 
      (health === 'Any' || recipe.health === health)
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
    pasta: { name: 'Pasta', qty: 1, price: 1.50, link: 'https://www.walmart.com/search?q=pasta' },
    sauce: { name: 'Sauce', qty: 1, price: 2.00, link: 'https://www.walmart.com/search?q=sauce' },
    lettuce: { name: 'Lettuce', qty: 1, price: 1.00, link: 'https://www.walmart.com/search?q=lettuce' },
    tomato: { name: 'Tomato', qty: 1, price: 0.75, link: 'https://www.walmart.com/search?q=tomato' },
    dressing: { name: 'Dressing', qty: 1, price: 2.50, link: 'https://www.walmart.com/search?q=dressing' },
    tortillas: { name: 'Tortillas', qty: 1, price: 2.00, link: 'https://www.walmart.com/search?q=tortillas' },
    beef: { name: 'Beef', qty: 1, price: 5.00, link: 'https://www.walmart.com/search?q=beef' },
    salsa: { name: 'Salsa', qty: 1, price: 1.75, link: 'https://www.walmart.com/search?q=salsa' },
    rice: { name: 'Rice', qty: 1, price: 2.00, link: 'https://www.walmart.com/search?q=rice' },
    broccoli: { name: 'Broccoli', qty: 1, price: 1.50, link: 'https://www.walmart.com/search?q=broccoli' },
    'soy sauce': { name: 'Soy Sauce', qty: 1, price: 2.25, link: 'https://www.walmart.com/search?q=soy+sauce' }
  };
  res.json(products[ingredient] || { error: 'Not found in stock' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});