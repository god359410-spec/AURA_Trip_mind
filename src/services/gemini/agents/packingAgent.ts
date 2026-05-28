import { multiAIGenerateJSON } from '../../ai/multiProvider';
import { Trip, GroupConstraints } from '../../../types/trip.types';
import { PackingList, PackingCategory } from '../../../types/ai.types';
import { WeatherForecast } from '../../../types/weather.types';
import { buildWeatherContext } from '../promptBuilder';

export async function generatePackingList(
  trip: Trip,
  constraints: GroupConstraints,
  forecast: WeatherForecast | null
): Promise<PackingList> {
  const prompt = `You are a professional travel packing expert. Generate a comprehensive packing list.

Destination: ${trip.destination}, ${trip.country}
Trip Style: ${trip.tripStyle}
Dates: ${trip.startDate} to ${trip.endDate}
${buildWeatherContext(forecast)}
Group includes infants: ${constraints.hasInfants}
Group includes children: ${constraints.hasChildren}
Group includes elderly: ${constraints.hasElderly}
Accessibility needs: ${constraints.mobilityRestrictions.join(', ') || 'none'}

Return ONLY valid JSON with this structure:
{
  "weatherNote": string (1-2 sentences about weather-based packing),
  "destinationNote": string (cultural/destination-specific note),
  "generatedAt": "${new Date().toISOString()}",
  "categories": [
    {
      "id": string,
      "name": string,
      "icon": string (single emoji),
      "items": [
        {
          "id": string,
          "name": string,
          "quantity": number or null,
          "essential": boolean,
          "packed": false,
          "notes": string or null
        }
      ]
    }
  ]
}

Include these categories: Clothing, Footwear, Toiletries & Personal Care, Documents & Finance, Electronics & Charging, Medical & Health, Destination-Specific Items.
Add Baby/Child Essentials if group has infants/children.
Add Accessibility Equipment if group has mobility needs.
Each category should have 6-12 items. Mark truly essential items accordingly.`;

  try {
    // Uses Mistral (Mistral Large) for detailed structured packing lists
    const { result, provider } = await multiAIGenerateJSON<PackingList>(prompt, 'packing_list');
    console.log(`[PackingAgent] Powered by ${provider}`);
    return result;
  } catch {
    return {
      categories: [
        {
          id: 'clothing', name: 'Clothing', icon: '👕',
          items: [
            { id: 'c1', name: 'T-shirts (x5)', essential: true, packed: false },
            { id: 'c2', name: 'Pants/Shorts (x3)', essential: true, packed: false },
            { id: 'c3', name: 'Underwear (x7)', essential: true, packed: false },
            { id: 'c4', name: 'Light jacket', essential: true, packed: false },
            { id: 'c5', name: 'Swimwear', essential: false, packed: false },
          ],
        },
        {
          id: 'docs', name: 'Documents & Finance', icon: '📊',
          items: [
            { id: 'd1', name: 'Passport', essential: true, packed: false },
            { id: 'd2', name: 'Travel insurance', essential: true, packed: false },
            { id: 'd3', name: 'Credit/debit cards', essential: true, packed: false },
            { id: 'd4', name: 'Local currency', essential: true, packed: false },
          ],
        },
        {
          id: 'medical', name: 'Medical & Health', icon: '💊',
          items: [
            { id: 'm1', name: 'Prescription medications', essential: true, packed: false },
            { id: 'm2', name: 'First aid kit', essential: true, packed: false },
            { id: 'm3', name: 'Sunscreen SPF 50+', essential: true, packed: false },
            { id: 'm4', name: 'Hand sanitizer', essential: false, packed: false },
          ],
        },
      ],
      weatherNote: 'Pack layers for varying temperatures.',
      destinationNote: `Check local customs and dress codes for ${trip.destination}.`,
      generatedAt: new Date().toISOString(),
    };
  }
}
