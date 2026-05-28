import { Trip, GroupConstraints, BudgetBreakdown } from '../../types/trip.types';
import { Itinerary } from '../../types/itinerary.types';
import { HotelRecommendation } from '../../types/hotel.types';
import { FoodRecommendation, PackingList, AgentStatus } from '../../types/ai.types';
import { WeatherForecast } from '../../types/weather.types';
import { analyzeGroup } from './agents/groupAnalyzerAgent';
import { analyzeBudget } from './agents/budgetAgent';
import { recommendHotels } from './agents/hotelAgent';
import { recommendFood } from './agents/foodAgent';
import { generatePackingList } from './agents/packingAgent';
import { generateItinerary } from './agents/itineraryAgent';
import { getWeatherForecast } from '../weather/weatherService';

export interface OrchestrationResult {
  groupConstraints: GroupConstraints;
  budgetBreakdown: BudgetBreakdown;
  hotels: HotelRecommendation[];
  restaurants: FoodRecommendation[];
  packingList: PackingList;
  itinerary: Itinerary;
  weatherForecast: WeatherForecast | null;
}

export type ProgressCallback = (status: AgentStatus, progress: number) => void;

export async function orchestrateTrip(
  trip: Trip,
  onProgress: ProgressCallback
): Promise<OrchestrationResult> {
  const status: AgentStatus = {
    groupAnalyzer: 'idle', weather: 'idle', budget: 'idle',
    hotel: 'idle', food: 'idle', packing: 'idle', itinerary: 'idle',
  };

  const update = (updates: Partial<AgentStatus>, progress: number) => {
    Object.assign(status, updates);
    onProgress({ ...status }, progress);
  };

  // STEP 1: Run group analyzer + weather fetch in parallel
  update({ groupAnalyzer: 'running', weather: 'running' }, 5);

  const [groupConstraints, weatherForecast] = await Promise.allSettled([
    analyzeGroup(trip.groupMembers),
    getWeatherForecast(trip.destination).catch(() => null),
  ]).then(results => [
    results[0].status === 'fulfilled' ? results[0].value : getDefaultConstraints(trip),
    results[1].status === 'fulfilled' ? results[1].value : null,
  ] as [GroupConstraints, WeatherForecast | null]);

  update({ groupAnalyzer: 'done', weather: weatherForecast ? 'done' : 'error' }, 20);

  // STEP 2: Run budget first (needed by hotels), then hotel, food, packing in parallel
  update({ budget: 'running' }, 25);

  let budgetBreakdown: BudgetBreakdown;
  try {
    budgetBreakdown = await analyzeBudget(trip, groupConstraints);
  } catch {
    budgetBreakdown = getDefaultBudget(trip);
  }
  update({ budget: 'done' }, 35);

  update({ hotel: 'running', food: 'running', packing: 'running' }, 40);

  const [hotels, restaurants, packingList] = await Promise.allSettled([
    recommendHotels(trip, groupConstraints, budgetBreakdown),
    recommendFood(trip, groupConstraints),
    generatePackingList(trip, groupConstraints, weatherForecast),
  ]).then(results => [
    results[0].status === 'fulfilled' ? results[0].value : [],
    results[1].status === 'fulfilled' ? results[1].value : [],
    results[2].status === 'fulfilled' ? results[2].value : getDefaultPackingList(),
  ] as [HotelRecommendation[], FoodRecommendation[], PackingList]);

  update({ hotel: 'done', food: 'done', packing: 'done' }, 65);

  // STEP 3: Generate the main itinerary (uses all previous outputs)
  update({ itinerary: 'running' }, 70);

  const itinerary = await generateItinerary(trip, groupConstraints, budgetBreakdown, weatherForecast);

  update({ itinerary: 'done' }, 100);

  return { groupConstraints, budgetBreakdown, hotels, restaurants, packingList, itinerary, weatherForecast };
}

function getDefaultConstraints(trip: Trip): GroupConstraints {
  const ages = trip.groupMembers.map(m => m.age);
  return {
    mobilityRestrictions: [], dietaryRestrictions: [],
    ageRange: ages.length ? { min: Math.min(...ages), max: Math.max(...ages) } : { min: 25, max: 35 },
    hasChildren: ages.some(a => a < 13), hasElderly: ages.some(a => a >= 70), hasInfants: ages.some(a => a < 5),
    pacePreference: 'moderate', conflictVectors: [], accessibilityScore: 10, commonInterests: ['sightseeing', 'food'],
  };
}

function getDefaultBudget(trip: Trip): BudgetBreakdown {
  const nights = Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000);
  const g = trip.groupMembers.length || 1;
  const e = Math.round(trip.totalBudget * 0.03);
  const r = trip.totalBudget - e;
  return {
    accommodation: Math.round(r * 0.36), food: Math.round(r * 0.26),
    activities: Math.round(r * 0.20), transport: Math.round(r * 0.10),
    shopping: Math.round(r * 0.05), emergency: e,
    perPersonPerDay: Math.round(trip.totalBudget / g / nights),
    totalPerPerson: Math.round(trip.totalBudget / g),
  };
}

function getDefaultPackingList(): PackingList {
  return {
    categories: [
      { id: 'essentials', name: 'Essentials', icon: '✅', items: [
        { id: 'p1', name: 'Passport', essential: true, packed: false },
        { id: 'p2', name: 'Travel insurance', essential: true, packed: false },
      ]},
    ],
    weatherNote: 'Pack for the season.',
    destinationNote: 'Check local customs before arrival.',
    generatedAt: new Date().toISOString(),
  };
}
