import { useEffect, useState } from "react";
import { BrowserRouter as Router } from 'react-router-dom'

import { formatDate, getWeekday } from "./utility/helper";
import { getLocation, fetchData } from "./utility/api";

import AppRouter from "./utility/AppRouter";

import WeeklyOverview from "./components/WeeklyOverview";
import Footer from "./components/Footer";
import Header from "./components/Header";


interface CurrentWeatherData {
    time: string;
    temperature: number;
}

interface WeatherData {
    current_weather: CurrentWeatherData;
    hourly: {
        temperature_2m: number[];
        weathercode: number[];
        windspeed_10m: number[];
        rain: number[];
        pressure_msl: number[];
        relativehumidity_2m: number[];
        visibility: number[];
    };
    daily: {
        // [key: string]:  number[];
        weathercode: number[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        rain_sum: number[];
        uv_index_max: number[];
        sunrise: number[];
        sunset: number[];
        time: string[];
    };
    hourly_units: {
        [key: string]: string;
    };
}

const App = () => {
    const [isLoading, setIsLoading] = useState(true);

    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [location, setLocation] = useState<string | null>(null);

    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);

    const handleSearchResult = (
        location: string,
        latitude: number,
        longitude: number
    ) => {
        setLatitude(latitude);
        setLongitude(longitude);
        setLocation(location);
    };

    const BASE_URL =
        "https://api.open-meteo.com/v1/forecast?current_weather=true&hourly=winddirection_10m,relativehumidity_2m,pressure_msl,visibility,rain,temperature_2m,apparent_temperature,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,rain_sum,showers_sum,snowfall_sum&windspeed_unit=ms&timezone=GMT";

    useEffect(() => {
        const fetchCurrentLocationWeatherData = async () => {
            try {
                const success = async (pos: GeolocationPosition) => {
                    const crd = pos.coords;
                    // Update the latitude and longitude state variables
                    setLatitude(crd.latitude);
                    setLongitude(crd.longitude);
                    getLocationData(crd.latitude, crd.longitude);
                };

                const error = (err: GeolocationPositionError) => {
                    //todo - if user does not allow location to be determined
                    console.warn(`ERROR(${err.code}): ${err.message}`);
                };

                navigator.geolocation.getCurrentPosition(success, error);
            } catch (error) {
                console.warn("Error while fetching weather data", error);
            }
        };
        // Fetch weather data when the component mounts
        fetchCurrentLocationWeatherData();
    }, []);

    const getLocationData = async (latitude: number, longitude: number) => {
        try {
            if (latitude !== null && longitude !== null) {
                const locationData = await getLocation(longitude, latitude);
                setLocation(locationData.city);
            }
        } catch (error) {
            console.warn("Error while fetching location data", error);
        }
    };
    useEffect(() => {
        // When latitude or longitude changes, fetch weather data
        if (latitude !== null && longitude !== null) {
            setIsLoading(true);

            const getWeatherData = async () => {
                try {
                    const url = `${BASE_URL}&latitude=${latitude}&longitude=${longitude}`;
                    const res = await fetchData(url);

                    if (res === undefined || res.status !== 200) {
                        throw new Error("Failed to fetch weather data");
                    }
                    setWeatherData(res.data);
                    console.log("weather data", res.data);
                } catch (error) {
                    console.warn("Error while fetching weather data", error);
                } finally {
                    setIsLoading(false);
                }
            };

            getWeatherData();
        }
    }, [latitude, longitude]);

    return (
        <Router>
            <Header onSearchResultClick={handleSearchResult} />

            <AppRouter />

                <div className="app-container">
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : weatherData && location ? (
                        <>
                            {/* {console.log(location)} */}
                            <div className="current-temp-overview">
                                <h2>
                                    {location}
                                    {/* {location.country} */}
                                </h2>
                                <p>
                                    {getWeekday(weatherData.current_weather.time)}{" "}
                                    {formatDate(weatherData.current_weather.time)}
                                </p>
                                <p>{weatherData.current_weather.temperature}°</p>
                            </div>
                            <WeeklyOverview forecast={weatherData} />
                        </>
                    ) : (
                        <p>No data available...</p>
                    )}
                </div>
                <Footer />
        </Router>
    );
};

export default App;
