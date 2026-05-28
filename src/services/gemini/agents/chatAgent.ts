import { multiAIChatCompletion } from '../../ai/multiProvider';
import { Trip } from '../../../types/trip.types';
import { Itinerary } from '../../../types/itinerary.types';
import { ChatMessage } from '../../../types/ai.types';
import { buildTripContext, buildGroupContext } from '../promptBuilder';

const buildSystemPrompt = (trip: Trip, itinerary: Itinerary | null): string =>
  `You are TripMind AI, an expert AI travel assistant powered by multiple AI models. You are helping plan a trip to ${trip.destination}.

Current Trip Context:
${buildTripContext(trip)}

Group Members:
${buildGroupContext(trip.groupMembers)}

${itinerary ? `Current Itinerary Summary:
${itinerary.aiSummary}

Highlights: ${itinerary.highlights?.join(', ')}

You have a ${itinerary.totalDays}-day itinerary already planned. The user may ask you to modify it, explain it, or ask destination questions.` : 'No itinerary generated yet.'}

You are conversational, helpful, specific, and always consider ALL group members. Give practical, actionable advice. When suggesting changes, be specific about what, when, and why. Format responses with markdown for readability.`;

export async function chatWithAssistant(
  message: string,
  history: ChatMessage[],
  trip: Trip,
  itinerary: Itinerary | null
): Promise<{ text: string; provider: string }> {
  const systemPrompt = buildSystemPrompt(trip, itinerary);

  const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
    { role: 'system', content: systemPrompt },
    // Map chat history (last 16 messages for context window)
    ...history.slice(-16).map(msg => ({
      role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content,
    })),
    { role: 'user', content: message },
  ];

  try {
    // Uses OpenAI (GPT-4o-mini) as primary for best conversational quality
    const { text, provider } = await multiAIChatCompletion(messages, 'chat', 0.8);
    return { text, provider };
  } catch (error) {
    throw new Error(`Chat failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
