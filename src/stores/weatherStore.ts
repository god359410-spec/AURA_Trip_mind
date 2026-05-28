import { create } from 'zustand';
import { WeatherData, WeatherForecast, WeatherAlert } from '../types/weather.types';

interface WeatherState {
  currentWeather: WeatherData | null;
  forecast: WeatherForecast | null;
  alerts: WeatherAlert[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;

  setCurrentWeather: (weather: WeatherData | null) => void;
  setForecast: (forecast: WeatherForecast | null) => void;
  setAlerts: (alerts: WeatherAlert[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearWeather: () => void;
}

export const useWeatherStore = create<WeatherState>()((set) => ({
  currentWeather: null,
  forecast: null,
  alerts: [],
  isLoading: false,
  error: null,
  lastFetched: null,

  setCurrentWeather: (currentWeather) => set({ currentWeather, lastFetched: Date.now() }),
  setForecast: (forecast) => set({ forecast }),
  setAlerts: (alerts) => set({ alerts }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearWeather: () => set({ currentWeather: null, forecast: null, alerts: [], error: null, lastFetched: null }),
}));
