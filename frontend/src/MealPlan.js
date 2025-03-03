import React, { useState } from 'react';
import axios from 'axios';

const MealPlan = () => {
  const [nights, setNights] = useState(1);
  const [mealStyle, setMealStyle] = useState('Italian'); // Default style
  const [healthOption, setHealthOption] = useState('Regular'); // Default health option
  const [mealPlan, setMealPlan] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);

  // Days of the week, starting with Monday
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/generate-meal-plan', {
        nights,
        style: mealStyle,               // Send style preference to backend
        health: healthOption,           // Send health preference to backend
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
    } catch (error) {
      console.error('Error:', error);
    }
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

        {/* Meal style selection */}
        <label style={{ marginRight: '10px' }}>
          Meal Style:
          <select
            value={mealStyle}
            onChange={(e) => setMealStyle(e.target.value)}
            style={{ marginLeft: '5px', padding: '5px' }}
          >
            <option value="Italian">Italian</option>
            <option value="Mexican">Mexican</option>
            <option value="Healthy">Healthy</option>
          </select>
        </label>

        {/* Health option selection */}
        <label>
          Health Option:
          <select
            value={healthOption}
            onChange={(e) => setHealthOption(e.target.value)}
            style={{ marginLeft: '5px', padding: '5px' }}
          >
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
          <ul>
            {shoppingList.map((item, index) => (
              <li key={index}>
                {item.error ? `${item.error}` : `${item.name} - Qty: ${item.qty}, Price: $${item.price}, Link: `}
                {!item.error && (
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="App-link"
                  >
                    Buy
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MealPlan;