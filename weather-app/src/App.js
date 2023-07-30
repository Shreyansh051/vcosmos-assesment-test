import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_KEY = '6dc5f8c3e47d8292970c1f3895145668';

const WeatherApp = () => {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  const searchWeather = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${API_KEY}&units=metric`
      );
      setWeather(response.data);
      setError(null);
    } catch (error) {
      setError('Location not found. Please enter a valid location.');
      setWeather(null);
    }
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
          <p>Temperature: {weather.main.temp}°C</p>
          <p>Condition: {weather.weather[0].main}</p>
          <p>Wind Speed: {weather.wind.speed} m/s</p>
          <p>Humidity: {weather.main.humidity}%</p>
        </div>
      ) : (
        <p className="error">{error}</p>
      )}
    </div>
  );
};

export default WeatherApp;
