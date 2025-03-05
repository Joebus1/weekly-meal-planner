const express = require('express');
const cors = require('cors');
const axios = require('axios'); // Already installed
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Spoonacular API key (replace with your actual key)
const SPOONACULAR_API_KEY = 'YOUR_API_KEY'; // Replace with your Spoonacular API key

// Function to fetch dinner recipes from Spoonacular (main + side for each day)
const fetchDinnerRecipes = async (days, adults, kids) => {
  const mealPlan = [];
  for (let i = 0; i < Math.min(days, 7); i++) { // Limit to 7 days
    try {
      // Fetch a random dinner recipe (main dish)
      const mainResponse = await axios.get(`https://api.spoonacular.com/recipes/random?apiKey=${SPOONACULAR_API_KEY}&number=1&tags=dinner`);
      const mainRecipe = mainResponse.data.recipes[0];
      
      // Fetch a random side dish
      const sideResponse = await axios.get(`https://api.spoonacular.com/recipes/random?apiKey=${SPOONACULAR_API_KEY}&number=1&tags=side`);
      const sideRecipe = sideResponse.data.recipes[0];

      // Combine main and side into a single dinner
      const dinner = {
        name: `${mainRecipe.title} with ${sideRecipe.title}`,
        ingredients: [
          ...mainRecipe.extendedIngredients.map(ing => ing.name),
          ...sideRecipe.extendedIngredients.map(ing => ing.name)
        ],
        style: 'Any', // Default style (ignored for now)
        health: 'Any', // Default health (ignored for now)
        recipeUrlMain: mainRecipe.sourceUrl, // URL for main dish
        recipeUrlSide: sideRecipe.sourceUrl, // URL for side dish
        recipeTextMain: mainRecipe.instructions, // Instructions for main
        recipeTextSide: sideRecipe.instructions // Instructions for side
      };

      // Adjust ingredient quantities based on adults and kids (simplified scaling)
      const totalPeople = adults + kids;
      if (totalPeople > 1) {
        dinner.ingredients = dinner.ingredients.map(ing => {
          // Simulate scaling ingredients (e.g., double for 2+ people, adjust as needed)
          const baseQty = 1; // Assume 1 unit per ingredient per person
          const scaledQty = baseQty * totalPeople;
          return `${scaledQty} ${ing}`; // Return scaled quantity with ingredient name
        });
      }

      // Normalize ingredient names to match Walmart keys (simplified mapping)
      const normalizedIngredients = dinner.ingredients.map(ing => {
        const [qty, ...rest] = ing.split(' ');
        const name = rest.join(' ').toLowerCase().replace(/[^a-zA-Z\s]/g, '').trim();
        // Map Spoonacular names to Walmart names (basic mapping—expand as needed)
        const walmartName = normalizeIngredient(name);
        return `${qty} ${walmartName}`;
      });

      dinner.ingredients = normalizedIngredients;

      mealPlan.push(dinner);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      return []; // Fallback if API fails
    }
  }
  return mealPlan;
};

// Helper function to normalize Spoonacular ingredients to match Walmart keys
function normalizeIngredient(ingredient) {
  const mappings = {
    'chicken breast': 'chicken',
    'white rice': 'rice',
    'broccoli florets': 'broccoli',
    'tomato': 'tomato',
    'pasta': 'pasta',
    'beef': 'beef',
    'tortilla': 'tortillas',
    'salsa': 'salsa',
    'lettuce': 'lettuce',
    'soy sauce': 'soy sauce',
    'onion': 'onion'
    // Add more mappings as needed based on Spoonacular responses
  };
  return mappings[ingredient] || ingredient; // Default to original if no mapping exists
}

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.get('/api/meals', (req, res) => {
  res.json({ message: 'Sample meal data' });
});

app.post('/api/generate-meal-plan', async (req, res) => {
  const { nights, style = 'Any', health = 'Any', adults = 1, kids = 0 } = req.body; // Default to 1 adult, 0 kids
  const mealPlan = await fetchDinnerRecipes(nights, adults, kids);
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