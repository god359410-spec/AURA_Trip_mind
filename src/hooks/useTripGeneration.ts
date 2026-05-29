import { useCallback } from 'react';
import { Trip } from '../types/trip.types';
import { useTripStore } from '../stores/tripStore';
import { useItineraryStore } from '../stores/itineraryStore';
import { useWeatherStore } from '../stores/weatherStore';
import { useUIStore } from '../stores/uiStore';
import { orchestrateTrip } from '../services/gemini/orchestrator';
import { analyzeWeatherAlerts } from '../services/weather/weatherService';

import { geocodeDestination } from '../services/geocoding/nominatim';

export function useTripGeneration() {
  const { setGenerating, setGenerationProgress, setAgentStatus, setGroupConstraints } = useTripStore();
  const { setItinerary, setHotels, setRestaurants, setPackingList } = useItineraryStore();
  const { setForecast, setAlerts } = useWeatherStore();
  const { addToast } = useUIStore();

  const generateTrip = useCallback(async (trip: Trip) => {
    setGenerating(true);
    setGenerationProgress(0);

    try {
      // 1. Geocode the destination using OpenStreetMap Nominatim
      const coordinates = await geocodeDestination(trip.destination, trip.country);
      if (coordinates) {
        trip.coordinates = coordinates;
      }

      // 2. Start Multi-Agent Orchestration
      const result = await orchestrateTrip(trip, (status, progress) => {
        setAgentStatus(status);
        setGenerationProgress(progress);
      });

      setGroupConstraints(result.groupConstraints);
      setItinerary(result.itinerary);
      setHotels(result.hotels);
      setRestaurants(result.restaurants);
      setPackingList(result.packingList);

      if (result.weatherForecast) {
        setForecast(result.weatherForecast);
        setAlerts(analyzeWeatherAlerts(result.weatherForecast));
      }

      addToast({ type: 'success', message: 'Your AI trip plan is ready! ✨' });
      return result;
    } catch (error) {
      console.error('Trip generation error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      addToast({ type: 'error', message: `Failed to generate trip: ${errorMessage}` });
      throw error;
    } finally {
      setGenerating(false);
    }
  }, [setGenerating, setGenerationProgress, setAgentStatus, setGroupConstraints, setItinerary, setHotels, setRestaurants, setPackingList, setForecast, setAlerts, addToast]);

  return { generateTrip };
}
