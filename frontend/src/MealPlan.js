import React, { useState } from 'react';
import axios from 'axios';

const MealPlan = () => {
  const [nights, setNights] = useState(1);
  const [adults, setAdults] = useState(1); // New state for number of adults
  const [kids, setKids] = useState(0); // New state for number of kids
  const [mealPlan, setMealPlan] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);

  // Days of the week, starting with Monday
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/generate-meal-plan', {
        nights,
        adults, // Send number of adults to backend
        kids,   // Send number of kids to backend
        style: 'Any', // Ignore for now
        health: 'Any' // Ignore for now
      });
      const meals = response.data;

      // Distribute meals across days (up to 7 days max)
      const weeklyPlan = {};
      const totalDays = Math.min(nights, 7); // Limit to 7 days
      const mealsPerDay = Math.floor(meals.length / totalDays) || 1; // Ensure at least 1 meal per day

      for (let i = 0; i < totalDays; i++) {
        const dayIndex = i; // Use the day index directly for simplicity
        weeklyPlan[daysOfWeek[dayIndex]] = meals.slice(i * mealsPerDay, (i + 1) * mealsPerDay);
      }

      setMealPlan(weeklyPlan);

      // Fetch product data for ingredients and aggregate quantities
      const allIngredients = meals.flatMap(meal => 
        meal.ingredients.map(ing => ing) // Extract raw ingredients (e.g., "2 chicken")
      );
      const ingredientCount = {}; // Track quantity of each ingredient
      allIngredients.forEach(ingredient => {
        const [qty, ...rest] = ingredient.split(' '); // Split to get quantity and name
        const name = rest.join(' ').toLowerCase().trim();
        ingredientCount[name] = (ingredientCount[name] || 0) + (parseFloat(qty) || 1); // Sum quantities
      });

      // Fetch product details and add units
      const shoppingListData = await Promise.all(
        Object.keys(ingredientCount).map(async (ingredient) => {
          const response = await axios.get(`http://localhost:5000/api/products/${ingredient}`);
          const product = response.data;
          if (!product.error) {
            return {
              name: product.name,
              qty: ingredientCount[ingredient], // Use summed quantity
              unit: product.unit, // Use unit from products
              price: product.price * ingredientCount[ingredient], // Total price for this ingredient
              link: product.link
            };
          }
          return { error: `Not found in stock: ${ingredient}` }; // Added semicolon
        })
      );
      setShoppingList(shoppingListData.filter(item => item)); // Remove any undefined items
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Calculate total price for the week
  const totalPrice = shoppingList.reduce((total, item) => {
    return item.error ? total : total + (item.price || 0);
  }, 0);

  // Handle button click to open recipe link in a new tab
  const handleRecipeClick = (url) => {
    window.open(url, '_blank'); // Open recipe link in a new tab
  };

  // Handle button click to open Walmart link in a new tab
  const handleBuyClick = (link) => {
    window.open(link, '_blank'); // Open Walmart link in a new tab
  };

  return (
    <div className="App">
      <h1>Weekly Meal Plan</h1>
      {/* Main form for number of nights, adults, and kids */}
      <form onSubmit={handleSubmit}>
        <label style={{ marginRight: '10px' }}>
          Number of nights:
          <input
            type="number"
            value={nights}
            onChange={(e) => setNights(e.target.value)}
            min="1"
            style={{ marginLeft: '5px' }}
          />
        </label>

        {/* Number of adults selection */}
        <label style={{ marginRight: '10px' }}>
          Number of Adults:
          <select
            value={adults}
            onChange={(e) => setAdults(parseInt(e.target.value))}
            style={{ marginLeft: '5px', padding: '5px' }}
          >
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </label>

        {/* Number of kids selection */}
        <label style={{ marginRight: '10px' }}>
          Number of Kids:
          <select
            value={kids}
            onChange={(e) => setKids(parseInt(e.target.value))}
            style={{ marginLeft: '5px', padding: '5px' }}
          >
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </label>

        {/* Meal style and health options (ignored for now, but kept for future use) */}
        <label style={{ marginRight: '10px' }}>
          Meal Style:
          <select
            value={'Any'}
            disabled // Disable for now
            style={{ marginLeft: '5px', padding: '5px', opacity: 0.6 }}
          >
            <option value="Any">Any</option>
            <option value="Italian">Italian</option>
            <option value="Mexican">Mexican</option>
            <option value="Healthy">Healthy</option>
          </select>
        </label>

        <label>
          Health Option:
          <select
            value={'Any'}
            disabled // Disable for now
            style={{ marginLeft: '5px', padding: '5px', opacity: 0.6 }}
          >
            <option value="Any">Any</option>
            <option value="Regular">Regular</option>
            <option value="Low-Carb">Low-Carb</option>
            <option value="Vegetarian">Vegetarian</option>
          </select>
        </label>

        <button type="submit">Generate Meal Plan</button>
      </form>

      {Object.keys(mealPlan).length > 0 && (
        <div>
          <h2>Your Meal Plan:</h2>
          <div className="meal-calendar">
            {daysOfWeek.slice(0, Math.min(nights, 7)).map((day, index) => (
              <div key={day} className="meal-day">
                <h3>{day}</h3>
                {mealPlan[day] && mealPlan[day].length > 0 ? (
                  <div>
                    <h4 className="meal-title">{mealPlan[day][0].name}</h4>
                    <ul className="meal-ingredients">
                      {mealPlan[day][0].ingredients.map((ingredient, ingIndex) => {
                        const [qty, ...rest] = ingredient.split(' '); // Parse quantity and name
                        const name = rest.join(' ');
                        return (
                          <li key={ingIndex} className="ingredient-item">
                            {qty} {name}
                          </li>
                        );
                      })}
                    </ul>
                    <div className="recipe-buttons">
                      <button 
                        onClick={() => handleRecipeClick(mealPlan[day][0].recipeUrlMain)}
                        className="recipe-button"
                      >
                        Main Dish Recipe
                      </button>
                      {mealPlan[day][0].recipeUrlSide && (
                        <button 
                          onClick={() => handleRecipeClick(mealPlan[day][0].recipeUrlSide)}
                          className="recipe-button"
                          style={{ marginLeft: '10px' }}
                        >
                          Side Dish Recipe
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <p>No meal planned for this day.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {shoppingList.length > 0 && (
        <div>
          <h2>Shopping List:</h2>
          <ul className="shopping-list">
            {shoppingList.map((item, index) => (
              <li key={index}>
                {item.error ? (
                  <span className="error-message">{item.error}</span>
                ) : (
                  <>
                    {item.qty} {item.unit} {item.name} - Price: ${item.price.toFixed(2)}, 
                    <button 
                      onClick={() => handleBuyClick(item.link)} // Trigger opening Walmart link on click
                      className="buy-button" // Use a class for styling
                    >
                      Buy
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
          <div className="total-price">
            <h3>Total Price for the Week: ${totalPrice.toFixed(2)}</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlan;