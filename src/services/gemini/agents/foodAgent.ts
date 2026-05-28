import { multiAIGenerateJSON } from '../../ai/multiProvider';
import { Trip, GroupConstraints } from '../../../types/trip.types';
import { FoodRecommendation } from '../../../types/ai.types';
import { buildTripContext } from '../promptBuilder';

export async function recommendFood(
  trip: Trip,
  constraints: GroupConstraints
): Promise<FoodRecommendation[]> {
  const prompt = `You are a culinary travel expert. Recommend exactly 8 restaurants/food experiences for this group.

${buildTripContext(trip)}
Dietary restrictions ALL members must accommodate: ${constraints.dietaryRestrictions.join(', ') || 'none'}
Group has children: ${constraints.hasChildren}
Has elderly members: ${constraints.hasElderly}

Return ONLY a valid JSON array of exactly 8 food recommendation objects:
[
  {
    "id": "food_1",
    "name": string,
    "cuisineType": string,
    "priceRange": "$" | "$$" | "$$$" | "$$$$",
    "dietaryTags": string[] (dietary options available),
    "mustTryDishes": string[] (2-3 signature dishes),
    "openingHours": string,
    "location": { "lat": number, "lng": number, "address": string },
    "aiNote": string (why this suits the group),
    "reservationRequired": boolean,
    "address": string,
    "rating": number (3.5-5.0),
    "mealType": array of "breakfast"|"lunch"|"dinner"|"snack"|"any"
  }
]

Include a mix: 2 breakfast spots, 3 lunch spots, 3 dinner restaurants. Ensure at least 3 are family/group-friendly. Make all recommendations realistic and specific to ${trip.destination}.`;

  try {
    // Uses Mistral (Mistral Large) for excellent food/culture knowledge
    const { result: foods, provider } = await multiAIGenerateJSON<FoodRecommendation[]>(prompt, 'food_recommendations');
    console.log(`[FoodAgent] Powered by ${provider}`);
    return foods.map((f, i) => ({ ...f, id: f.id || `food_${i + 1}` }));
  } catch {
    return [];
  }
}
