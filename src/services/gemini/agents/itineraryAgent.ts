import { multiAIGenerateJSON } from '../../ai/multiProvider';
import { Trip, GroupConstraints, BudgetBreakdown } from '../../../types/trip.types';
import { Itinerary, DayPlan } from '../../../types/itinerary.types';
import { WeatherForecast } from '../../../types/weather.types';
import { buildFullContext } from '../promptBuilder';

// ─── FAMOUS LANDMARKS PER DESTINATION ───────────────────────────────────────
// Used as imageSearchTerms when AI doesn't provide a good one
const DESTINATION_LANDMARKS: Record<string, string[]> = {
  default: ['landmark', 'famous attraction', 'historic site', 'tourist spot', 'main square'],
};

function getImageSearchTerm(destination: string, dayIndex: number, theme: string): string {
  const key = Object.keys(DESTINATION_LANDMARKS).find(k =>
    destination.toLowerCase().includes(k.toLowerCase())
  );
  const list = DESTINATION_LANDMARKS[key || 'default'];
  return `${destination} ${theme || list[dayIndex % list.length]}`;
}

// ─── BATCH PROMPT ─────────────────────────────────────────────────────────────
function buildBatchPrompt(
  trip: Trip,
  constraints: GroupConstraints,
  budget: BudgetBreakdown,
  forecast: WeatherForecast | null,
  startDayNumber: number,
  batchDays: number,
  totalDays: number,
  activitiesPerDay: number,
  usedPlaces: string[]
): string {
  const startDate = new Date(trip.startDate);
  startDate.setDate(startDate.getDate() + startDayNumber - 1);

  const usedPlacesNote = usedPlaces.length > 0
    ? `\n\nDO NOT use these places again (already used in previous days): ${usedPlaces.slice(-30).join(', ')}`
    : '';

  const tripContext = buildFullContext(trip, forecast, constraints);

  return `You are an elite AI travel planner. Generate days ${startDayNumber} to ${startDayNumber + batchDays - 1} of a ${totalDays}-day trip to ${trip.destination}.

${tripContext}

Budget per person per day: ${trip.currency} ${budget.perPersonPerDay}
${usedPlacesNote}

Return ONLY a valid JSON array of exactly ${batchDays} day objects. Each object MUST follow this structure:
[
  {
    "dayNumber": ${startDayNumber},
    "date": "${startDate.toISOString().split('T')[0]}",
    "theme": "Catchy theme for the day",
    "description": "One sentence describing what makes this day special.",
    "imageSearchTerm": "Famous specific place or landmark visited this day (for image search)",
    "accessibilityScore": 8,
    "weatherNote": null,
    "totalCostPerPerson": ${budget.perPersonPerDay},
    "totalGroupCost": ${budget.perPersonPerDay * (trip.groupMembers.length || 1)},
    "activities": [
      {
        "id": "act_${startDayNumber}_1",
        "time": "09:00",
        "duration": "2 hours",
        "name": "Specific Real Place Name (e.g. Senso-ji Temple)",
        "description": "One sentence about the place.",
        "type": "attraction",
        "location": { "lat": 35.7148, "lng": 139.7967, "address": "Real address" },
        "estimatedCostPerPerson": 500,
        "currency": "${trip.currency}",
        "accessibilityNote": null,
        "dietaryNote": null,
        "weatherAlternative": null,
        "bookingRequired": false,
        "tips": "Useful tip.",
        "isOptional": false
      }
    ]
  }
]

CRITICAL RULES:
- Each day MUST have EXACTLY ${activitiesPerDay} activities (mix of meals, attractions, transport)
- Every place must be UNIQUE and NOT repeated across all days
- Use REAL, SPECIFIC place names — NO generic names like "City Tour" or "Sightseeing"
- Include breakfast, a midday meal, and dinner as activities with real restaurant names
- The imageSearchTerm should be the MOST FAMOUS place visited that day
- Activities must be age-appropriate for: ${constraints.ageRange ? `ages ${constraints.ageRange.min}-${constraints.ageRange.max}` : 'adults'}
- Respect dietary restrictions: ${constraints.dietaryRestrictions.join(', ') || 'none'}`;
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export async function generateItinerary(
  trip: Trip,
  constraints: GroupConstraints,
  budget: BudgetBreakdown,
  forecast: WeatherForecast | null
): Promise<Itinerary> {
  const nights = Math.ceil(
    (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalDays = nights + 1;
  const groupSize = trip.groupMembers.length || 1;

  // Scale activities per day to stay within token limits
  // 7 days × 5 activities = ~35 activities per batch = safe zone
  const activitiesPerDay = totalDays <= 7 ? 6 : totalDays <= 14 ? 5 : 4;
  const batchSize = 7; // Generate 7 days at a time

  const allDays: DayPlan[] = [];
  const usedPlaces: string[] = [];

  // Generate in batches of 7 days
  let batchStart = 1;
  while (batchStart <= totalDays) {
    const remaining = totalDays - batchStart + 1;
    const currentBatchSize = Math.min(batchSize, remaining);

    const prompt = buildBatchPrompt(
      trip,
      constraints,
      budget,
      forecast,
      batchStart,
      currentBatchSize,
      totalDays,
      activitiesPerDay,
      usedPlaces
    );

    try {
      console.log(`[ItineraryAgent] Generating days ${batchStart}–${batchStart + currentBatchSize - 1} of ${totalDays}...`);
      const { result: batchDays, provider } = await multiAIGenerateJSON<DayPlan[]>(prompt, 'itinerary', 0.7);
      console.log(`[ItineraryAgent] Batch ${batchStart}-${batchStart + currentBatchSize - 1} done via ${provider}`);

      if (Array.isArray(batchDays) && batchDays.length > 0) {
        // Track used places to avoid repetition
        batchDays.forEach(day => {
          day.activities?.forEach(act => {
            if (act.name) usedPlaces.push(act.name);
          });
          // Ensure imageSearchTerm always has a value
          if (!day.imageSearchTerm || day.imageSearchTerm.length < 4) {
            day.imageSearchTerm = getImageSearchTerm(trip.destination, allDays.length, day.theme);
          }
          // Ensure required fields
          if (!day.accessibilityScore) day.accessibilityScore = 8;
          if (!day.totalCostPerPerson) day.totalCostPerPerson = budget.perPersonPerDay;
          if (!day.totalGroupCost) day.totalGroupCost = budget.perPersonPerDay * groupSize;
        });
        allDays.push(...batchDays);
      } else {
        throw new Error('Batch returned invalid/empty days');
      }
    } catch (err) {
      console.error(`[ItineraryAgent] Batch ${batchStart}-${batchStart + currentBatchSize - 1} failed:`, err);
      // Add fallback days for this batch only
      for (let i = 0; i < currentBatchSize; i++) {
        const dayDate = new Date(trip.startDate);
        dayDate.setDate(dayDate.getDate() + batchStart + i - 1);
        const dayNum = batchStart + i;
        allDays.push(buildFallbackDay(dayNum, dayDate, trip, budget, groupSize));
      }
    }

    batchStart += currentBatchSize;
  }

  // Generate the overview separately (much smaller prompt)
  let aiSummary = `A ${totalDays}-day curated journey through ${trip.destination}, designed for ${groupSize} traveler${groupSize > 1 ? 's' : ''} with a ${trip.currency} ${budget.totalPerPerson.toLocaleString()} per-person budget.`;
  let highlights: string[] = ['Iconic landmarks', 'Local cuisine', 'Cultural experiences', 'Hidden gems', 'Unique experiences'];
  let travelTips: string[] = ['Keep a local SIM card', 'Respect local customs', 'Carry emergency cash', 'Stay hydrated', 'Book popular attractions in advance'];

  try {
    const overviewPrompt = `Write a 2-sentence compelling summary for a ${totalDays}-day trip to ${trip.destination} for ${groupSize} traveler${groupSize > 1 ? 's' : ''} with ${trip.currency} ${budget.totalPerPerson} per person. 
Also provide 5 unique highlights and 5 practical travel tips for ${trip.destination}.
Return ONLY JSON: {"aiSummary": string, "highlights": string[5], "travelTips": string[5]}`;
    const { result: overviewResult } = await multiAIGenerateJSON<{ aiSummary: string; highlights: string[]; travelTips: string[] }>(overviewPrompt, 'general', 0.6);
    if (overviewResult.aiSummary) aiSummary = overviewResult.aiSummary;
    if (overviewResult.highlights?.length) highlights = overviewResult.highlights;
    if (overviewResult.travelTips?.length) travelTips = overviewResult.travelTips;
  } catch (e) {
    console.warn('[ItineraryAgent] Overview generation failed, using defaults');
  }

  return {
    destination: trip.destination,
    totalDays,
    groupSize,
    generatedAt: new Date().toISOString(),
    totalEstimatedCost: budget.totalPerPerson * groupSize,
    totalPerPersonCost: budget.totalPerPerson,
    aiSummary,
    highlights,
    travelTips,
    emergencyInfo: {
      policeNumber: '112', ambulanceNumber: '112', fireNumber: '112',
      touristHelpline: undefined, nearestHospital: `Main hospital in ${trip.destination}`, embassyInfo: undefined,
    },
    budgetBreakdown: budget,
    alternativeLocations: [],
    routesAndTransit: [],
    days: allDays,
  };
}

// ─── FALLBACK DAY ─────────────────────────────────────────────────────────────
function buildFallbackDay(
  dayNum: number,
  date: Date,
  trip: Trip,
  budget: BudgetBreakdown,
  groupSize: number
): DayPlan {
  // Rich fallback with real-sounding place names based on destination
  const fallbackActivities = [
    { time: '08:00', name: `Morning at ${trip.destination} City Center`, type: 'leisure' as const, cost: 0 },
    { time: '10:00', name: `${trip.destination} Historical Museum`, type: 'attraction' as const, cost: Math.round(budget.activities / 4) },
    { time: '13:00', name: `Local ${trip.destination} Restaurant`, type: 'meal' as const, cost: Math.round(budget.food / 3) },
    { time: '15:00', name: `${trip.destination} Main Landmark Day ${dayNum}`, type: 'attraction' as const, cost: Math.round(budget.activities / 4) },
    { time: '19:00', name: `Dinner at ${trip.destination} Night Market`, type: 'meal' as const, cost: Math.round(budget.food / 3) },
  ];

  return {
    dayNumber: dayNum,
    date: date.toISOString().split('T')[0],
    theme: `Day ${dayNum}: Discovering ${trip.destination}`,
    description: `An immersive day exploring the best of ${trip.destination}.`,
    imageSearchTerm: `${trip.destination} tourism`,
    accessibilityScore: 8,
    weatherNote: undefined,
    totalCostPerPerson: budget.perPersonPerDay,
    totalGroupCost: budget.perPersonPerDay * groupSize,
    activities: fallbackActivities.map((act, j) => ({
      id: `act_${dayNum}_${j + 1}`,
      time: act.time,
      duration: '2 hours',
      name: act.name,
      description: `Enjoy ${act.name} during your stay in ${trip.destination}.`,
      type: act.type,
      location: { lat: 0, lng: 0, address: `${trip.destination}` },
      estimatedCostPerPerson: act.cost,
      currency: trip.currency,
      accessibilityNote: undefined,
      dietaryNote: undefined,
      weatherAlternative: undefined,
      bookingRequired: false,
      tips: undefined,
      isOptional: false,
    })),
  };
}
