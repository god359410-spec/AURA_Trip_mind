import { useEffect, useCallback } from 'react';
import { useWeatherStore } from '../stores/weatherStore';
import { getCurrentWeather, getWeatherForecast, analyzeWeatherAlerts } from '../services/weather/weatherService';

export function useWeather(destination: string) {
  const { currentWeather, forecast, alerts, isLoading, error, setCurrentWeather, setForecast, setAlerts, setLoading, setError } = useWeatherStore();

  const fetchWeather = useCallback(async (dest: string) => {
    if (!dest) return;
    setLoading(true);
    setError(null);
    try {
      const [weather, fc] = await Promise.all([
        getCurrentWeather(dest),
        getWeatherForecast(dest),
      ]);
      setCurrentWeather(weather);
      setForecast(fc);
      setAlerts(analyzeWeatherAlerts(fc));
    } catch (err) {
      setError('Unable to fetch weather data. Please try again.');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [setCurrentWeather, setForecast, setAlerts, setLoading, setError]);

  useEffect(() => {
    if (destination) fetchWeather(destination);
  }, [destination, fetchWeather]);

  return { currentWeather, forecast, alerts, isLoading, error, refresh: () => fetchWeather(destination) };
}
