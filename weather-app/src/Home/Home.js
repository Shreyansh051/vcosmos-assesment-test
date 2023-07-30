import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Css/Home.css';

const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';

const WeatherApp = () => {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('metric'); // 'metric' for Celsius, 'imperial' for Fahrenheit

  const searchWeather = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${API_KEY}&units=${unit}`
      );
      setWeather(response.data);
      setError(null);
    } catch (error) {
      setError('Location not found. Please enter a valid location.');
      setWeather(null);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        getWeatherByCoords(latitude, longitude);
      });
    }
  }, []);

  const getWeatherByCoords = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${unit}`
      );
      setWeather(response.data);
      setError(null);
    } catch (error) {
      setError('Unable to fetch weather for your current location.');
      setWeather(null);
    }
  };

  const toggleUnit = () => {
    setUnit(unit === 'metric' ? 'imperial' : 'metric');
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="weather-app">
      <h1>Weather App</h1>
      <form onSubmit={searchWeather}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter location"
        />
        <button type="submit">Search</button>
      </form>
      {weather ? (
        <div className="weather-info">
          <h2>{weather.name}</h2>
          <p>Temperature: {weather.main.temp}°{unit === 'metric' ? 'C' : 'F'}</p>
          <p>Condition: {weather.weather[0].main}</p>
          <p>Wind Speed: {weather.wind.speed} m/s</p>
          <p>Humidity: {weather.main.humidity}%</p>
        </div>
      ) : (
        <p className="error">{error}</p>
      )}

      {weather && weather.daily && (
        <div className="forecast">
          <h2>5-Day Forecast</h2>
          <div className="forecast-container">
            {weather.daily.slice(1).map((day) => (
              <div className="forecast-day" key={day.dt}>
                <p className="day">{formatDate(day.dt)}</p>
                <p className="temp">
                  {day.temp.day}°{unit === 'metric' ? 'C' : 'F'}
                </p>
                <p className="condition">{day.weather[0].main}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="unit-toggle">
        <button onClick={toggleUnit}>
          Toggle {unit === 'metric' ? 'Fahrenheit' : 'Celsius'}
        </button>
      </div>
    </div>
  );
};

export default WeatherApp;
