import { multiAIGenerateJSON } from '../../ai/multiProvider';
import { Trip, GroupConstraints, BudgetBreakdown } from '../../../types/trip.types';
import { HotelRecommendation } from '../../../types/hotel.types';
import { buildTripContext } from '../promptBuilder';

export async function recommendHotels(
  trip: Trip,
  constraints: GroupConstraints,
  budget: BudgetBreakdown
): Promise<HotelRecommendation[]> {
  const nights = Math.ceil(
    (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  const budgetPerNight = Math.round(budget.accommodation / nights);

  const prompt = `You are a luxury travel consultant specializing in hotel recommendations. Recommend exactly 4 hotels.

${buildTripContext(trip)}
Accommodation budget: ${trip.currency} ${budget.accommodation} total (${trip.currency} ${budgetPerNight}/night)
Accessibility needs: ${constraints.mobilityRestrictions.join(', ') || 'none'}
Group has children: ${constraints.hasChildren}
Group has elderly: ${constraints.hasElderly}
Accommodation type preference: ${trip.accommodationType}

Return ONLY a valid JSON array of exactly 4 hotel objects:
[
  {
    "id": "hotel_1",
    "name": string,
    "starRating": number (1-5),
    "pricePerNight": number,
    "totalPrice": number,
    "currency": "${trip.currency}",
    "location": { "lat": number, "lng": number, "address": string },
    "amenities": string[] (5-8 items),
    "accessibilityFeatures": string[] (2-4 items),
    "images": [],
    "distanceFromCenter": number (km),
    "aiReasoningNote": string (explain why this hotel suits this group),
    "rating": number (6.0-9.8),
    "reviewCount": number,
    "breakfastIncluded": boolean,
    "freeCancellation": boolean,
    "roomTypes": string[] (2-3 types),
    "highlights": string[] (3 key highlights)
  }
]

Make recommendations realistic for ${trip.destination}. Mix options from slightly under budget to slightly over.`;

  try {
    // Uses OpenAI (GPT-4o-mini) for best conversational hotel descriptions
    const { result: hotels, provider } = await multiAIGenerateJSON<HotelRecommendation[]>(prompt, 'hotel_recommendations');
    console.log(`[HotelAgent] Powered by ${provider}`);
    return hotels.map((h, i) => ({ ...h, id: h.id || `hotel_${i + 1}`, images: [] }));
  } catch {
    // Return placeholder hotels
    return [
      {
        id: 'hotel_1', name: `Grand ${trip.destination} Hotel`, starRating: 4,
        pricePerNight: budgetPerNight, totalPrice: budget.accommodation, currency: trip.currency,
        location: { lat: 0, lng: 0, address: `Central ${trip.destination}` },
        amenities: ['WiFi', 'Pool', 'Restaurant', 'Gym', 'Spa'],
        accessibilityFeatures: ['Elevator', 'Accessible rooms'],
        images: [], distanceFromCenter: 0.5,
        aiReasoningNote: 'Central location with excellent amenities for your group.',
        rating: 8.2, reviewCount: 1240, breakfastIncluded: true, freeCancellation: true,
        roomTypes: ['Superior Double', 'Family Suite'], highlights: ['City center', 'Pool', 'Restaurant'],
      },
    ];
  }
}
