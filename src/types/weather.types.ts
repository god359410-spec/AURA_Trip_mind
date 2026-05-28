export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  uvIndex?: number;
  visibility: number;
  condition: WeatherCondition;
  sunrise: number;
  sunset: number;
  timestamp: number;
}

export interface ForecastDay {
  date: string;
  dateFormatted: string;
  dayName: string;
  tempMin: number;
  tempMax: number;
  precipitationProbability: number;
  condition: WeatherCondition;
  humidity: number;
  windSpeed: number;
  uvIndex?: number;
}

export interface WeatherForecast {
  city: string;
  country: string;
  days: ForecastDay[];
  fetchedAt: number;
}

export type WeatherAlertType = 'rain' | 'extreme_heat' | 'extreme_cold' | 'wind' | 'uv' | 'none';

export interface WeatherAlert {
  type: WeatherAlertType;
  severity: 'low' | 'medium' | 'high';
  message: string;
  affectedDays: string[];
}
