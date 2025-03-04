import React, { useState } from 'react';
import axios from 'axios';

const MealPlan = () => {
  const [nights, setNights] = useState(1);
  const [mealStyle, setMealStyle] = useState('Any'); // Default to "Any" for random styles
  const [healthOption, setHealthOption] = useState('Any'); // Default to "Any" for random health options
  const [mealPlan, setMealPlan] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);

  // Days of the week, starting with Monday
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/generate-meal-plan', {
        nights,
        style: mealStyle,               // Send style preference (including "Any") to backend
        health: healthOption,           // Send health preference (including "Any") to backend
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
      const allIngredients = meals.flatMap(meal => meal.ingredients);
      const ingredientCount = {}; // Track quantity of each ingredient
      allIngredients.forEach(ingredient => {
        ingredientCount[ingredient] = (ingredientCount[ingredient] || 0) + 1; // Increment count
      });

      // Fetch product details and add units
      const shoppingListData = await Promise.all(
        Object.keys(ingredientCount).map(async ingredient => {
          const response = await axios.get(`http://localhost:5000/api/products/${ingredient}`);
          const product = response.data;
          if (!product.error) {
            // Add units based on common grocery item assumptions (customize as needed)
            let unit = 'unit'; // Default unit
            if (ingredient === 'pasta' || ingredient === 'rice') unit = 'lbs';
            if (ingredient === 'sauce' || ingredient === 'dressing' || ingredient === 'salsa' || ingredient === 'soy sauce') unit = 'ozs';
            if (ingredient === 'beef') unit = 'lbs';
            if (ingredient === 'lettuce' || ingredient === 'tomato' || ingredient === 'broccoli') unit = 'unit';

            return {
              name: product.name,
              qty: ingredientCount[ingredient], // Number of times the ingredient appears
              unit, // Add unit (e.g., lbs, ozs)
              price: product.price * ingredientCount[ingredient], // Total price for this ingredient
              link: product.link
            };
          }
          return { error: `Not found in stock: ${ingredient}` };
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

  return (
    <div className="App">
      <h1>Weekly Meal Plan</h1>
      {/* Main form for number of nights and preferences */}
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

        {/* Meal style selection with "Any" option */}
        <label style={{ marginRight: '10px' }}>
          Meal Style:
          <select
            value={mealStyle}
            onChange={(e) => setMealStyle(e.target.value)}
            style={{ marginLeft: '5px', padding: '5px' }}
          >
            <option value="Any">Any</option>    {/* Added "Any" option for random styles */}
            <option value="Italian">Italian</option>
            <option value="Mexican">Mexican</option>
            <option value="Healthy">Healthy</option>
          </select>
        </label>

        {/* Health option selection with "Any" option */}
        <label>
          Health Option:
          <select
            value={healthOption}
            onChange={(e) => setHealthOption(e.target.value)}
            style={{ marginLeft: '5px', padding: '5px' }}
          >
            <option value="Any">Any</option>    {/* Added "Any" option for random health options */}
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
                  <ul>
                    {mealPlan[day].map((meal, mealIndex) => (
                      <li key={mealIndex}>
                        {meal.name} - Ingredients: {meal.ingredients.join(', ')} - Style: {meal.style}
                        {/* Placeholder for future recipe link */}
                        <a href="#" className="recipe-link" onClick={(e) => e.preventDefault()}>
                          [Link to Recipe - Coming Soon]
                        </a>
                      </li>
                    ))}
                  </ul>
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
                    {item.qty} {item.unit} {item.name} - Price: $${item.price.toFixed(2)}, 
                    <a 
                      href={item.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="App-link"
                    >
                      Buy
                    </a>
                  </>
                )}
              </li>
            ))}
          </ul>
          <div className="total-price">
            <h3>Total Price for the Week: $${totalPrice.toFixed(2)}</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlan;