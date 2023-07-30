import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import 'weather-icons/css/weather-icons.css';
import '../Css/Home.css';

const API_KEY = '6dc5f8c3e47d8292970c1f3895145668';

const WeatherApp = () => {
    const [query, setQuery] = useState('');
    const [weather, setWeather] = useState(null);
    const [error, setError] = useState(null);
    const [unit, setUnit] = useState('metric'); // 'metric' for Celsius, 'imperial' for Fahrenheit
    const [forecast, setForecast] = useState([]);

    // Function to get the 5-day forecast data
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

    // Function to get weather data by latitude and longitude
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

    // UseEffect to get weather data for user's current location when the component mounts
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoords(latitude, longitude);
            });
        }
    }, [getWeatherByCoords]);

    // Function to search weather data for the provided city
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

    // Function to toggle temperature units between Celsius and Fahrenheit
    const toggleUnit = useCallback(() => {
        setUnit((prevUnit) => (prevUnit === 'metric' ? 'imperial' : 'metric'));
    }, []);

    // Function to format the date for display
    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    // Function to get the appropriate weather icon based on weather conditions
    const getWeatherIcon = (weatherCondition) => {
        switch (weatherCondition) {
            case 'Clear':
                return 'wi-day-sunny';
            case 'Clouds':
                return 'wi-cloudy';
            case 'Rain':
                return 'wi-rain';
            case 'Snow':
                return 'wi-snow';
            case 'Thunderstorm':
                return 'wi-thunderstorm';
            default:
                return 'wi-day-cloudy';
        }
    };

    return (
        <div className="weather-app">
            <h1 className="heading">Weather App</h1>

            {/* Search form to search weather by city name */}
            <form onSubmit={searchWeather}>
                <input
                    className='searchbar'
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter City Name"
                />
                <button type="submit"> Search <i className="fa fa-search" aria-hidden="true" /></button>
            </form>

            {/* Display weather info if available, otherwise show an error message */}
            {weather ? (
                <div className="weather-info show"> {/* Use 'show' class to animate the display */}
                    <div className='flexdiv'>
                        <h2 className='heading2'>{weather.name}</h2>
                        <button className='unit-toggle' onClick={toggleUnit}>
                            {unit === 'metric' ? ' ° F' : ' ° C'}
                        </button>
                    </div>
                    <div className='items-div'>
                        {/* Icons for each weather data */}
                        <p>
                            <i className="fa fa-thermometer-half" style={{ color: 'orange', fontSize: '1.2em', marginRight: '5px' }} />
                            Temperature: {weather.main.temp} ° {unit === 'metric' ? 'C' : 'F'}
                        </p>
                        <p>
                            <i className="fa fa-cloud" style={{ color: 'orange', fontSize: '1.2em', marginRight: '5px' }} />
                            Condition: {weather.weather[0].main}
                        </p>
                        <p>
                            <i className="fa fa-thermometer-three-quarters" style={{ color: 'orange', fontSize: '1.2em', marginRight: '5px' }} />
                            Feels-like: {weather.main.feels_like} ° {unit === 'metric' ? 'C' : 'F'}
                        </p>
                        <p>
                            <i className="fa fa-wind" style={{ color: 'orange', fontSize: '1.2em', marginRight: '5px' }} />
                            Wind Speed: {weather.wind.speed} m/s
                        </p>
                        <p>
                            <i className="fa fa-tint" style={{ color: 'orange', fontSize: '1.2em', marginRight: '5px' }} />
                            Humidity: {weather.main.humidity} %
                        </p>
                    </div>
                </div>
            ) : (
                <p className="error">{error}</p>
            )}

            {/* Display the 5-day forecast if available */}
            {forecast.length > 0 && (
                <div className="forecast show"> {/* Use 'show' class to animate the display */}
                    <h2>5-Day Forecast</h2>
                    <div className="forecast-container">
                        {/* Map through forecast data and display each forecast day */}
                        {forecast.slice(0, 5).map((day) => (
                            <div className="forecast-day" key={day.dt}>
                                <p className="day">{formatDate(day.dt)}</p>
                                <i className={`wi ${getWeatherIcon(day.weather[0].main)}`} style={{ color: 'orange', fontSize: '1.2em', marginRight: '5px' }} />
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
