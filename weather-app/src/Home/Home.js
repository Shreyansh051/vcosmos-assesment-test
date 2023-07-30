import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import FontAwesomeIcon from ""
import '../Css/Home.css';

const API_KEY = '6dc5f8c3e47d8292970c1f3895145668';

const WeatherApp = () => {
    const [query, setQuery] = useState('');
    const [weather, setWeather] = useState(null);
    const [error, setError] = useState(null);
    const [unit, setUnit] = useState('metric'); // 'metric' for Celsius, 'imperial' for Fahrenheit
    const [forecast, setForecast] = useState([]);



    const getForecast = useCallback(async (lat, lon) => {
        try {
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly&appid=${API_KEY}&units=${unit}`
            );
            setForecast(response.data.daily.slice(1));
        } catch (error) {
            setError('Error fetching forecast data.');
            setForecast([]);
        }
    }, [unit]);

    const getWeatherByCoords = useCallback(async (latitude, longitude) => {
        try {
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${unit}`
            );
            console.log('Weather Data:', response.data);
            setWeather(response.data);
            setError(null);
            getForecast(response.data.coord.lat, response.data.coord.lon);
        } catch (error) {
            setError('Unable to fetch weather for your current location.');
            setWeather(null);
            setForecast([]);
        }
    }, [unit, getForecast]);
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoords(latitude, longitude);
            });
        }
    }, [getWeatherByCoords]);


    const searchWeather = useCallback(async (e) => {
        e.preventDefault();
        try {
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${API_KEY}&units=${unit}`
            );
            console.log('Weather Data:', response.data);
            setWeather(response.data);
            setError(null);
            getForecast(response.data.coord.lat, response.data.coord.lon);
        } catch (error) {
            setError('Location not found. Please enter a valid location.');
            setWeather(null);
            setForecast([]);
        }
    }, [query, unit, getForecast]);

    const toggleUnit = useCallback(() => {
        setUnit((prevUnit) => (prevUnit === 'metric' ? 'imperial' : 'metric'));
    }, []);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };


    return (
        <div className="weather-app">
            <h1 className="heading">Weather App</h1>
            
            <form onSubmit={searchWeather}>
                <input
                className='searchbar'
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter City Name"
                />
                <button type="submit">Search</button>
            </form>
            {weather ? (
                <div className="weather-info">
                    <div className='flexdiv'>
                    <h2 className='heading2'>{weather.name}</h2>
                    <button className='unit-toggle' onClick={toggleUnit}>
                     {unit === 'metric' ? ' ° F' : ' ° C'}
                </button>
                    </div>
                    <div className='items-div'>
                    <p><FontAwesomeIcon icon="fa-solid fa-temperature-quarter" />Temperature: {weather.main.temp} °   {unit === 'metric' ? 'C' : 'F'}</p>
                    <p>Condition: {weather.weather[0].main }</p>
                    <p>feels_like: {weather.main.feels_like}  ° {unit === 'metric' ? 'C' : 'F'}</p>
                    <p>Wind Speed: {weather.wind.speed}  m/s</p>
                    <p>Humidity: {weather.main.humidity} %</p>
                    </div>
                </div>
            ) : (
                <p className="error">{error}</p>
            )}
           
            {forecast.length > 0 && (
                <div className="forecast">
                    <h2>5-Day Forecast</h2>
                    <div className="forecast-container">
                        {forecast.slice(0, 5).map((day) => (
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


        </div>
    );
};

export default WeatherApp;
