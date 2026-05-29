export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
}

export type ActivityType = 'meal' | 'attraction' | 'transport' | 'accommodation' | 'leisure' | 'shopping' | 'tour' | 'rest';

export interface Activity {
  id: string;
  time: string; // e.g. '09:00'
  duration: string; // e.g. '2 hours'
  name: string;
  description: string;
  type: ActivityType;
  location?: GeoLocation;
  estimatedCostPerPerson: number;
  currency: string;
  accessibilityNote?: string;
  dietaryNote?: string;
  weatherAlternative?: string;
  bookingRequired?: boolean;
  tips?: string;
  isOptional?: boolean;
}

export interface DayPlan {
  dayNumber: number;
  date: string;
  theme: string;
  description: string;
  activities: Activity[];
  totalCostPerPerson: number;
  totalGroupCost: number;
  accessibilityScore: number;
  weatherNote?: string;
  imageSearchTerm: string;
}

export interface RouteOption {
  from: string;
  to: string;
  mode: 'walking' | 'bus' | 'train' | 'metro' | 'taxi' | 'bicycle' | 'flight' | 'other';
  duration: string;
  description: string;
  cost?: number;
  tips?: string;
}

export interface AlternativeLocation {
  name: string;
  description: string;
  distance: string;
  bestWayToGetThere: string;
  highlights: string[];
}

export interface Itinerary {
  id?: string;
  tripId?: string;
  destination: string;
  totalDays: number;
  days: DayPlan[];
  totalEstimatedCost: number;
  totalPerPersonCost: number;
  groupSize: number;
  generatedAt: string;
  aiSummary: string;
  highlights: string[];
  travelTips: string[];
  emergencyInfo: EmergencyInfo;
  budgetBreakdown: import('./trip.types').BudgetBreakdown;
  alternativeLocations?: AlternativeLocation[];
  routesAndTransit?: RouteOption[];
}

export interface EmergencyInfo {
  policeNumber: string;
  ambulanceNumber: string;
  fireNumber: string;
  touristHelpline?: string;
  nearestHospital?: string;
  embassyInfo?: string;
}

