import { GroupConstraints, BudgetBreakdown } from './trip.types';

export interface AgentStatus {
  groupAnalyzer: 'idle' | 'running' | 'done' | 'error';
  weather: 'idle' | 'running' | 'done' | 'error';
  budget: 'idle' | 'running' | 'done' | 'error';
  hotel: 'idle' | 'running' | 'done' | 'error';
  food: 'idle' | 'running' | 'done' | 'error';
  packing: 'idle' | 'running' | 'done' | 'error';
  itinerary: 'idle' | 'running' | 'done' | 'error';
}

export interface OrchestratorResult {
  groupConstraints: GroupConstraints;
  budgetBreakdown: BudgetBreakdown;
  hotels: import('./hotel.types').HotelRecommendation[];
  restaurants: FoodRecommendation[];
  packingList: PackingList;
  itinerary: import('./itinerary.types').Itinerary;
}

export interface FoodRecommendation {
  id: string;
  name: string;
  cuisineType: string;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  dietaryTags: string[];
  mustTryDishes: string[];
  openingHours: string;
  location?: import('./itinerary.types').GeoLocation;
  aiNote: string;
  reservationRequired: boolean;
  address: string;
  rating?: number;
  mealType: ('breakfast' | 'lunch' | 'dinner' | 'snack' | 'any')[];
}

export interface PackingItem {
  id: string;
  name: string;
  quantity?: number;
  essential: boolean;
  packed?: boolean;
  notes?: string;
}

export interface PackingCategory {
  id: string;
  name: string;
  icon: string;
  items: PackingItem[];
}

export interface PackingList {
  categories: PackingCategory[];
  weatherNote: string;
  destinationNote: string;
  generatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  provider?: string;
  isStreaming?: boolean;
}
