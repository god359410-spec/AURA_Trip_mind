import { GoogleGenerativeAI, GenerationConfig, SafetySetting, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

if (!API_KEY) {
  console.warn('Gemini API key missing. AI features will not work.');
}

export const genAI = new GoogleGenerativeAI(API_KEY || 'MISSING_KEY');

export const defaultGenerationConfig: GenerationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 8192,
};

export const safetySettings: SafetySetting[] = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export function getModel(temperature = 0.7) {
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { ...defaultGenerationConfig, temperature },
    safetySettings,
  });
}

export async function generateJSON<T>(prompt: string, temperature = 0.5): Promise<T> {
  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const model = getModel(temperature);
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      // Extract JSON from response (handles markdown code blocks)
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/({[\s\S]*}|\[[\s\S]*\])/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]).trim() : text.trim();
      
      try {
        return JSON.parse(jsonStr) as T;
      } catch {
        try {
          const start = text.indexOf('{');
          const end = text.lastIndexOf('}');
          const arrStart = text.indexOf('[');
          const arrEnd = text.lastIndexOf(']');
          
          let parsed: any;
          if (arrStart !== -1 && arrEnd !== -1 && (start === -1 || arrStart < start) && (end === -1 || arrEnd > end)) {
            // It's likely an array
            parsed = JSON.parse(text.slice(arrStart, arrEnd + 1));
          } else if (start !== -1 && end !== -1) {
            // It's likely an object
            parsed = JSON.parse(text.slice(start, end + 1));
          } else {
            throw new Error('No valid JSON structure found in text.');
          }
          return parsed as T;
        } catch (innerError) {
          throw new Error(`Failed to parse JSON from Gemini response: ${text.slice(0, 200)}`);
        }
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError!;
}

export async function generateText(prompt: string, temperature = 0.8): Promise<string> {
  const model = getModel(temperature);
  const result = await model.generateContent(prompt);
  return result.response.text();
}
