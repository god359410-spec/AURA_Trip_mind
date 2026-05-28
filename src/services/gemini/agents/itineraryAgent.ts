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
      "description": string (1-2 sentences),
      "accessibilityScore": number (1-10),
      "weatherNote": string or null,
      "totalCostPerPerson": number,
      "totalGroupCost": number,
      "activities": [
        {
          "id": string,
          "time": string (HH:MM 24h format),
          "duration": string (e.g. "2 hours"),
          "name": string,
          "description": string (2-3 sentences),
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

IMPORTANT RULES:
1. Each day should have 5-8 activities including breakfast, lunch, and dinner
2. All activities must be REAL and SPECIFIC to ${trip.destination}
3. Respect ALL accessibility needs: ${constraints.mobilityRestrictions.join(', ') || 'none'}
4. Respect ALL dietary restrictions: ${constraints.dietaryRestrictions.join(', ') || 'none'}
5. If weather shows rain > 70% on any day, include indoor alternatives
6. Pace appropriate for: ${constraints.pacePreference} pace preference
7. If group has children: include kid-friendly activities
8. Generate 3-5 alternative locations and 3-6 important transit routes.`;

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
          theme: `Day ${i + 1} in ${trip.destination}`,
          description: "Discovering the highlights of the city.",
          accessibilityScore: 10,
          weatherNote: undefined,
          totalCostPerPerson: budget.perPersonPerDay,
          totalGroupCost: budget.perPersonPerDay * groupSize,
          activities: [
            {
              id: `act_${i}_1`, time: "10:00", duration: "2 hours", name: "City Tour",
              description: "Guided tour of the main sights.", type: "tour",
              location: { lat: 0, lng: 0, address: "City Center" },
              estimatedCostPerPerson: Math.round(budget.activities / 3), currency: trip.currency,
              accessibilityNote: undefined, dietaryNote: undefined, weatherAlternative: undefined, bookingRequired: false, tips: undefined, isOptional: false
            }
          ]
        };
      })
    };
  }
}
