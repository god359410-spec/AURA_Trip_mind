import { multiAIGenerateJSON } from '../../ai/multiProvider';
import { Trip, GroupConstraints, BudgetBreakdown } from '../../../types/trip.types';
import { buildTripContext } from '../promptBuilder';

export async function analyzeBudget(trip: Trip, constraints: GroupConstraints): Promise<BudgetBreakdown> {
  const nights = Math.ceil(
    (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  const groupSize = trip.groupMembers.length || 1;

  const prompt = `You are a travel budget optimization AI. Create an optimized budget breakdown.

${buildTripContext(trip)}
Group has children: ${constraints.hasChildren}
Group has elderly: ${constraints.hasElderly}
Total nights: ${nights}

Return ONLY valid JSON with this exact structure (all values in ${trip.currency}, total must equal ${trip.totalBudget}):
{
  "accommodation": number,
  "food": number,
  "activities": number,
  "transport": number,
  "shopping": number,
  "emergency": number,
  "perPersonPerDay": number,
  "totalPerPerson": number
}

Rules:
- Emergency buffer = 3% (fixed, non-negotiable)
- If group includes children < 5: add 5% extra buffer to activities
- Accommodation style: ${trip.accommodationType}
- Trip style: ${trip.tripStyle} (luxury = more activities/food, budget = less)
- All 6 categories must sum to exactly ${trip.totalBudget}
- perPersonPerDay = total / groupSize / nights
- totalPerPerson = total / groupSize`;

  try {
    // Uses Groq (Llama 3.3 70B) for fast budget analysis
    const { result, provider } = await multiAIGenerateJSON<BudgetBreakdown>(prompt, 'budget_analysis');
    console.log(`[BudgetAgent] Powered by ${provider}`);
    // Normalize to ensure sum matches
    const sum = result.accommodation + result.food + result.activities + result.transport + result.shopping + result.emergency;
    if (Math.abs(sum - trip.totalBudget) > 1) {
      const scale = trip.totalBudget / sum;
      result.accommodation = Math.round(result.accommodation * scale);
      result.food = Math.round(result.food * scale);
      result.activities = Math.round(result.activities * scale);
      result.transport = Math.round(result.transport * scale);
      result.shopping = Math.round(result.shopping * scale);
      result.emergency = trip.totalBudget - result.accommodation - result.food - result.activities - result.transport - result.shopping;
    }
    result.perPersonPerDay = Math.round(trip.totalBudget / groupSize / nights);
    result.totalPerPerson = Math.round(trip.totalBudget / groupSize);
    return result;
  } catch {
    // Fallback calculation
    const emergency = Math.round(trip.totalBudget * 0.03);
    const remaining = trip.totalBudget - emergency;
    return {
      accommodation: Math.round(remaining * 0.36),
      food: Math.round(remaining * 0.26),
      activities: Math.round(remaining * 0.20),
      transport: Math.round(remaining * 0.10),
      shopping: Math.round(remaining * 0.08),
      emergency,
      perPersonPerDay: Math.round(trip.totalBudget / groupSize / nights),
      totalPerPerson: Math.round(trip.totalBudget / groupSize),
    };
  }
}
