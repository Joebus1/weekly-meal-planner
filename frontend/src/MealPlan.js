import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MealPlan = () => {
  const [nights, setNights] = useState(1);
  const [mealStyle, setMealStyle] = useState('Any'); // Default to "Any" for random styles
  const [healthOption, setHealthOption] = useState('Any'); // Default to "Any" for random health options
  const [mealPlan, setMealPlan] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [showRecipeText, setShowRecipeText] = useState({}); // State for recipe text visibility per day-meal
  const [showIngredients, setShowIngredients] = useState({}); // State for ingredients visibility per day-meal

  // Days of the week, starting with Monday
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Initialize visibility states when mealPlan or nights changes
  useEffect(() => {
    console.log('Initializing visibility states:', { nights, mealPlan });
    const initialRecipeText = {};
    const initialIngredients = {};
    daysOfWeek.slice(0, Math.min(nights, 7)).forEach((day, dayIndex) => {
      if (mealPlan[day]) {
        mealPlan[day].forEach((meal, mealIndex) => {
          const key = `${day}-${mealIndex}`;
          initialRecipeText[key] = false; // Default to hidden
          initialIngredients[key] = false; // Default to hidden
        });
      }
    });
    setShowRecipeText(initialRecipeText);
    setShowIngredients(initialIngredients);
  }, [mealPlan, nights]); // Re-run when mealPlan or nights changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/generate-meal-plan', {
        nights,
        style: mealStyle,               // Send style preference (including "Any") to backend
        health: healthOption,           // Send health preference (including "Any") to backend
      });
      const meals = response.data;

      console.log('Meal Plan:', meals); // Log the meals data before distributing

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
        Object.keys(ingredientCount).map(async (ingredient) => {
          const response = await axios.get(`http://localhost:5000/api/products/${ingredient}`);
          const product = response.data;
          if (!product.error) {
            // Add units based on common grocery item assumptions (customize as needed)
            let unit = 'unit'; // Default unit
            if (ingredient === 'pasta' || ingredient === 'rice') unit = 'lbs';
            if (ingredient === 'sauce' || ingredient === 'dressing' || ingredient === 'salsa' || ingredient === 'soy sauce') unit = 'ozs';
            if (ingredient === 'beef' || ingredient === 'chicken') unit = 'lbs';
            if (ingredient === 'lettuce' || ingredient === 'tomato' || ingredient === 'broccoli' || ingredient === 'onion') unit = 'unit';

            return {
              name: product.name,
              qty: ingredientCount[ingredient], // Number of times the ingredient appears
              unit, // Add unit (e.g., lbs, ozs)
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

  // Toggle visibility for recipe text per day-meal
  const toggleRecipeText = (key) => {
    console.log('Toggling Recipe Text for key:', key, 'Current state:', showRecipeText[key]);
    setShowRecipeText(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Toggle visibility for ingredients per day-meal
  const toggleIngredients = (key) => {
    console.log('Toggling Ingredients for key:', key, 'Current state:', showIngredients[key]);
    setShowIngredients(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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
            <option value="Asian">Asian</option> {/* Added for variety */}
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
                  mealPlan[day].map((meal, mealIndex) => (
                    <div key={mealIndex} className="recipe-card">
                      <h4>{meal.name}</h4>
                      {/* Button to toggle recipe text visibility */}
                      <button 
                        onClick={() => toggleRecipeText(`${day}-${mealIndex}`)}
                        className="toggle-button"
                      >
                        {showRecipeText[`${day}-${mealIndex}`] ? 'Hide Recipe' : 'Show Recipe'}
                      </button>
                      {showRecipeText[`${day}-${mealIndex}`] && (
                        <p className={`recipe-text ${showRecipeText[`${day}-${mealIndex}`] ? 'expanded' : ''}`}>
                          {meal.recipeText}
                        </p>
                      )}
                      {/* Button to toggle ingredients visibility */}
                      <button 
                        onClick={() => toggleIngredients(`${day}-${mealIndex}`)}
                        className="toggle-button"
                      >
                        {showIngredients[`${day}-${mealIndex}`] ? 'Hide Ingredients' : 'Show Ingredients'}
                      </button>
                      {showIngredients[`${day}-${mealIndex}`] && (
                        <ul className={`ingredient-list ${showIngredients[`${day}-${mealIndex}`] ? 'expanded' : ''}`}>
                          {meal.ingredients.map((ingredient, i) => (
                            <li key={i}>{ingredient}</li>
                          ))}
                        </ul>
                      )}
                      {/* Link to recipe card */}
                      <a 
                        href={meal.recipeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="recipe-link"
                      >
                        View Recipe Card
                      </a>
                    </div>
                  ))
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