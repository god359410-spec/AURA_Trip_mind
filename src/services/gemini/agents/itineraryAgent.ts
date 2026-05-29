import { multiAIGenerateJSON } from '../../ai/multiProvider';
import { Trip, GroupConstraints, BudgetBreakdown } from '../../../types/trip.types';
import { Itinerary } from '../../../types/itinerary.types';
import { WeatherForecast } from '../../../types/weather.types';
import { buildFullContext } from '../promptBuilder';

export async function generateItinerary(
  trip: Trip,
  constraints: GroupConstraints,
  budget: BudgetBreakdown,
  forecast: WeatherForecast | null
): Promise<Itinerary> {
  const nights = Math.ceil(
    (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  const days = nights + 1;
  const groupSize = trip.groupMembers.length || 1;
  const budgetPerPersonPerDay = budget.perPersonPerDay;

  const prompt = `You are an elite AI travel planner. Create a detailed ${days}-day itinerary for this group.

${buildFullContext(trip, forecast, constraints)}

Budget per person per day (for activities + food): ${trip.currency} ${budgetPerPersonPerDay}

Return ONLY a valid JSON object with this EXACT structure:
{
  "destination": "${trip.destination}",
  "totalDays": ${days},
  "groupSize": ${groupSize},
  "generatedAt": "${new Date().toISOString()}",
  "totalEstimatedCost": number,
  "totalPerPersonCost": number,
  "aiSummary": string (2-3 sentences describing the trip plan),
  "highlights": string[] (5 top highlights),
  "travelTips": string[] (5 practical tips for this destination),
  "emergencyInfo": {
    "policeNumber": string,
    "ambulanceNumber": string,
    "fireNumber": string,
    "touristHelpline": string or null,
    "nearestHospital": string,
    "embassyInfo": string or null
  },
  "budgetBreakdown": {
    "accommodation": ${budget.accommodation},
    "food": ${budget.food},
    "activities": ${budget.activities},
    "transport": ${budget.transport},
    "shopping": ${budget.shopping},
    "emergency": ${budget.emergency},
    "perPersonPerDay": ${budget.perPersonPerDay},
    "totalPerPerson": ${budget.totalPerPerson}
  },
  "days": [
    {
      "dayNumber": number,
      "date": string (YYYY-MM-DD),
      "theme": string (catchy day theme),
      "description": string (1 short sentence),
      "imageSearchTerm": string (A highly specific, famous landmark or place visited this day for Wikipedia image search, e.g. "Eiffel Tower" or "Cubbon Park"),
      "accessibilityScore": number (1-10),
      "weatherNote": string or null,
      "totalCostPerPerson": number,
      "totalGroupCost": number,
      "activities": [
        {
          "id": string,
          "time": string (HH:MM 24h format),
          "duration": string (e.g. "2 hours"),
          "name": string (Specific place name, e.g., "Lalbagh Botanical Garden" NOT "City Tour"),
          "description": string (1 short sentence),
          "type": "meal" | "attraction" | "transport" | "leisure" | "shopping" | "tour" | "rest",
          "location": { "lat": number, "lng": number, "address": string },
          "estimatedCostPerPerson": number,
          "currency": "${trip.currency}",
          "accessibilityNote": string or null,
          "dietaryNote": string or null,
          "weatherAlternative": string or null,
          "bookingRequired": boolean,
          "tips": string or null,
          "isOptional": boolean
        }
      ]
    }
  ],
  "alternativeLocations": [
    {
      "name": "Alternative/Side-trip destination name",
      "description": "Why this location is a great place to travel",
      "distance": "Distance and typical travel time",
      "bestWayToGetThere": "Explanation of the best way/transport mode",
      "highlights": ["highlight 1", "highlight 2"]
    }
  ],
  "routesAndTransit": [
    {
      "from": "Starting hub",
      "to": "Destination",
      "mode": "walking" | "bus" | "train" | "metro" | "taxi" | "bicycle" | "flight" | "other",
      "duration": "Duration",
      "description": "Clear step-by-step route directions",
      "cost": number,
      "tips": "Tips for this route"
    }
  ]
}

IMPORTANT RULES — READ CAREFULLY:
1. ⚠️ DESTINATION FOCUS: Every single activity, restaurant, hotel, attraction and landmark MUST be physically located in ${trip.destination}, ${trip.country}. DO NOT include anything from the starting location (${trip.startingLocation || 'unknown'}) in the day-by-day plan.
2. ✈️ STARTING LOCATION USAGE: The starting location "${trip.startingLocation || 'unknown'}" should ONLY appear in the "routesAndTransit" section — to describe how to travel FROM there TO ${trip.destination} (e.g., flight duration, airport, visa requirements).
3. 🏙️ REAL PLACES: Every activity name must be a real, specific place that exists in ${trip.destination}. Do NOT use placeholders like "Sector 1 Tour" or "Local Highlights". Use real place names like "Belur Math" or "Halebid Temple".
4. 📅 UNIQUE DAYS: Each day must have 3–${Math.min(6, Math.max(3, Math.floor(60/days)))} activities. Give completely different, unique places for EVERY single day — no repeats.
5. ♿ ACCESSIBILITY: Respect all accessibility needs: ${constraints.mobilityRestrictions.join(', ') || 'none'}
6. 🍽️ DIETARY: Respect all dietary restrictions: ${constraints.dietaryRestrictions.join(', ') || 'none'}
7. 🌧️ WEATHER: If weather shows rain > 70% on any day, include indoor alternatives
8. 🚶 PACE: Pace activities appropriately for: ${constraints.pacePreference} pace preference
9. 👶 CHILDREN: If group has children, include kid-friendly activities
10. 🗺️ ROUTES: Generate 3–5 alternative nearby locations and 3–6 transit routes (the first route MUST be from ${trip.startingLocation || 'origin'} to ${trip.destination} by the most logical transport mode).`;

  try {
    // Gemini 2.5 Flash is highly capable of generating massive JSON structures reliably
    const { result, provider } = await multiAIGenerateJSON<Itinerary>(prompt, 'itinerary', 0.5);
    console.log(`[ItineraryAgent] Powered by ${provider}`);
    if (!result || !result.days || !Array.isArray(result.days) || result.days.length === 0) {
      throw new Error("Invalid itinerary structure returned from AI.");
    }
    result.budgetBreakdown = budget;
    return result;
  } catch (error) {
    console.error("Itinerary generation failed, using fallback:", error);
    // Return a valid fallback
    return {
      destination: trip.destination,
      totalDays: days,
      groupSize,
      generatedAt: new Date().toISOString(),
      totalEstimatedCost: budget.totalPerPerson * groupSize,
      totalPerPersonCost: budget.totalPerPerson,
      aiSummary: `A customized ${days}-day trip to ${trip.destination}.`,
      highlights: ["Exploring local culture", "Trying regional cuisine", "Visiting main attractions"],
      travelTips: ["Stay hydrated", "Keep your belongings safe", "Respect local customs"],
      emergencyInfo: {
        policeNumber: "112", ambulanceNumber: "112", fireNumber: "112",
        touristHelpline: undefined, nearestHospital: "City Hospital", embassyInfo: undefined
      },
      budgetBreakdown: budget,
      alternativeLocations: [
        {
          name: `Explore Nearby Areas`,
          description: `Great day trip options surrounding ${trip.destination}.`,
          distance: "Varies",
          bestWayToGetThere: "Local public transport",
          highlights: ["Scenic viewpoints", "Cultural landmarks"]
        }
      ],
      routesAndTransit: [
        {
          from: "Airport",
          to: "City Center",
          mode: "train",
          duration: "45 mins",
          description: "Take the direct express train to the central station.",
          cost: 15,
          tips: "Purchase tickets online."
        }
      ],
      days: Array.from({ length: days }).map((_, i) => {
        const date = new Date(trip.startDate);
        date.setDate(date.getDate() + i);
        return {
          dayNumber: i + 1,
          date: date.toISOString().split('T')[0],
          theme: `Day ${i + 1}: Exploring ${trip.destination}`,
          description: `Discovering the unique highlights of ${trip.destination} on day ${i + 1}.`,
          accessibilityScore: 10,
          weatherNote: undefined,
          imageSearchTerm: trip.destination + " landmark",
          totalCostPerPerson: budget.perPersonPerDay,
          totalGroupCost: budget.perPersonPerDay * groupSize,
          activities: [
            {
              id: `act_${i}_1`, time: "10:00", duration: "3 hours", name: `Highlight Tour ${i + 1}`,
              description: `Visiting the top sights in sector ${i + 1}.`, type: "tour",
              location: { lat: 0, lng: 0, address: "Central Hub" },
              estimatedCostPerPerson: Math.round(budget.activities / 3), currency: trip.currency,
              accessibilityNote: undefined, dietaryNote: undefined, weatherAlternative: undefined, bookingRequired: false, tips: undefined, isOptional: false
            }
          ]
        };
      })
    };
  }
}
