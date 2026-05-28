import axios from 'axios';
import { WeatherData, WeatherForecast, ForecastDay, WeatherAlert } from '../../types/weather.types';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

interface CacheEntry {
  data: WeatherData | WeatherForecast;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_TTL;
}

export async function getCurrentWeather(city: string): Promise<WeatherData> {
  const cacheKey = `current:${city}`;
  const cached = cache.get(cacheKey);
  if (cached && isCacheValid(cached)) return cached.data as WeatherData;

  const response = await axios.get(`${BASE_URL}/weather`, {
    params: { q: city, appid: API_KEY, units: 'metric' },
  });

  const d = response.data;
  const data: WeatherData = {
    city: d.name,
    country: d.sys.country,
    temperature: Math.round(d.main.temp),
    feelsLike: Math.round(d.main.feels_like),
    humidity: d.main.humidity,
    windSpeed: Math.round(d.wind.speed * 3.6),
    visibility: Math.round((d.visibility || 10000) / 1000),
    condition: d.weather[0],
    sunrise: d.sys.sunrise,
    sunset: d.sys.sunset,
    timestamp: Date.now(),
  };

  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

export async function getWeatherForecast(city: string): Promise<WeatherForecast> {
  const cacheKey = `forecast:${city}`;
  const cached = cache.get(cacheKey);
  if (cached && isCacheValid(cached)) return cached.data as WeatherForecast;

  const response = await axios.get(`${BASE_URL}/forecast`, {
    params: { q: city, appid: API_KEY, units: 'metric', cnt: 40 },
  });

  const d = response.data;
  const dayMap = new Map<string, typeof d.list[0][]>();

  for (const item of d.list) {
    const date = item.dt_txt.split(' ')[0];
    if (!dayMap.has(date)) dayMap.set(date, []);
    dayMap.get(date)!.push(item);
  }

  const days: ForecastDay[] = Array.from(dayMap.entries()).slice(0, 5).map(([date, items]) => {
    const temps = items.map((i: { main: { temp: number } }) => i.main.temp);
    const precipProbs = items.map((i: { pop: number }) => i.pop || 0);
    const noon = items.find((i: { dt_txt: string }) => i.dt_txt.includes('12:00')) || items[Math.floor(items.length / 2)];
    const d = new Date(date + 'T12:00:00');

    return {
      date,
      dateFormatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      tempMin: Math.round(Math.min(...temps)),
      tempMax: Math.round(Math.max(...temps)),
      precipitationProbability: Math.round(Math.max(...precipProbs) * 100),
      condition: noon.weather[0],
      humidity: noon.main.humidity,
      windSpeed: Math.round(noon.wind.speed * 3.6),
    };
  });

  const forecast: WeatherForecast = {
    city: d.city.name,
    country: d.city.country,
    days,
    fetchedAt: Date.now(),
  };

  cache.set(cacheKey, { data: forecast, timestamp: Date.now() });
  return forecast;
}

export function analyzeWeatherAlerts(forecast: WeatherForecast): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];

  const rainyDays = forecast.days.filter(d => d.precipitationProbability > 70);
  if (rainyDays.length > 0) {
    alerts.push({
      type: 'rain',
      severity: rainyDays.length > 2 ? 'high' : 'medium',
      message: `High chance of rain on ${rainyDays.map(d => d.dayName).join(', ')}. Pack waterproof gear and check indoor alternatives.`,
      affectedDays: rainyDays.map(d => d.date),
    });
  }

  const hotDays = forecast.days.filter(d => d.tempMax > 35);
  if (hotDays.length > 0) {
    alerts.push({
      type: 'extreme_heat',
      severity: hotDays[0].tempMax > 40 ? 'high' : 'medium',
      message: `Extreme heat expected (up to ${Math.max(...hotDays.map(d => d.tempMax))}°C). Plan outdoor activities for early morning or evening.`,
      affectedDays: hotDays.map(d => d.date),
    });
  }

  const coldDays = forecast.days.filter(d => d.tempMin < 0);
  if (coldDays.length > 0) {
    alerts.push({
      type: 'extreme_cold',
      severity: 'medium',
      message: `Freezing temperatures expected. Pack thermal layers and consider heated indoor venues.`,
      affectedDays: coldDays.map(d => d.date),
    });
  }

  const windyDays = forecast.days.filter(d => d.windSpeed > 40);
  if (windyDays.length > 0) {
    alerts.push({
      type: 'wind',
      severity: 'medium',
      message: `High winds expected. Aerial or marine activities may be unsafe.`,
      affectedDays: windyDays.map(d => d.date),
    });
  }

  return alerts;
}

export function getWeatherIcon(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}
