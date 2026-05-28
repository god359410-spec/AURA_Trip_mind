/**
 * Multi-AI Provider System
 * Routes different tasks to different AI providers for best results.
 * 
 * Provider Assignment:
 *   - Groq (Llama 3.3 70B): Group Analysis, Budget Analysis (blazing fast)
 *   - OpenAI (GPT-4o-mini): Hotel Recommendations, Chat Assistant (best conversational)
 *   - Mistral (Mistral Large): Food Recommendations, Packing List (great structured output)
 *   - Cohere (Command R+): Trip summary enhancement & re-ranking
 *   - OpenRouter (meta-llama): Weather-based alternatives, route planning
 *   - Gemini (2.5 Flash): Primary itinerary generation (existing, proven)
 * 
 * Every provider has Gemini as a fallback.
 */

export type AIProvider = 'gemini' | 'openai' | 'groq' | 'mistral' | 'cohere' | 'openrouter';

export type TaskType =
  | 'group_analysis'
  | 'budget_analysis'
  | 'hotel_recommendations'
  | 'food_recommendations'
  | 'packing_list'
  | 'itinerary'
  | 'chat'
  | 'summary_enhancement'
  | 'route_planning'
  | 'general';

interface ProviderConfig {
  name: AIProvider;
  displayName: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  maxTokens: number;
}

// Provider configurations
function getProviderConfigs(): Record<AIProvider, ProviderConfig> {
  return {
    openai: {
      name: 'openai',
      displayName: 'ChatGPT',
      baseUrl: 'https://api.openai.com/v1',
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      model: 'gpt-4o-mini',
      maxTokens: 8192,
    },
    groq: {
      name: 'groq',
      displayName: 'Groq AI',
      baseUrl: 'https://api.groq.com/openai/v1',
      apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
      model: 'llama-3.3-70b-versatile',
      maxTokens: 8192,
    },
    mistral: {
      name: 'mistral',
      displayName: 'Mistral AI',
      baseUrl: 'https://api.mistral.ai/v1',
      apiKey: import.meta.env.VITE_MISTRAL_API_KEY || '',
      model: 'mistral-large-latest',
      maxTokens: 8192,
    },
    openrouter: {
      name: 'openrouter',
      displayName: 'OpenRouter',
      baseUrl: 'https://openrouter.ai/api/v1',
      apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
      model: 'meta-llama/llama-3.3-70b-instruct',
      maxTokens: 8192,
    },
    cohere: {
      name: 'cohere',
      displayName: 'Cohere AI',
      baseUrl: 'https://api.cohere.com/v2',
      apiKey: import.meta.env.VITE_COHERE_API_KEY || '',
      model: 'command-r-plus',
      maxTokens: 4096,
    },
    gemini: {
      name: 'gemini',
      displayName: 'Google Gemini',
      baseUrl: '', // Uses SDK
      apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
      model: 'gemini-2.5-flash',
      maxTokens: 8192,
    },
  };
}

// Task → Primary Provider mapping
const TASK_PROVIDER_MAP: Record<TaskType, AIProvider> = {
  group_analysis: 'groq',
  budget_analysis: 'groq',
  hotel_recommendations: 'openai',
  food_recommendations: 'mistral',
  packing_list: 'mistral',
  itinerary: 'gemini',
  chat: 'openai',
  summary_enhancement: 'cohere',
  route_planning: 'openrouter',
  general: 'gemini',
};

// Fallback chain per provider
const FALLBACK_CHAIN: Record<AIProvider, AIProvider[]> = {
  openai: ['groq', 'openrouter', 'gemini'],
  groq: ['openai', 'mistral', 'gemini'],
  mistral: ['openai', 'groq', 'gemini'],
  openrouter: ['groq', 'openai', 'gemini'],
  cohere: ['openai', 'mistral', 'gemini'],
  gemini: ['openai', 'groq', 'mistral'],
};

/**
 * Call an OpenAI-compatible API (works for OpenAI, Groq, Mistral, OpenRouter)
 */
async function callOpenAICompatible(
  config: ProviderConfig,
  prompt: string,
  temperature: number
): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.apiKey}`,
  };

  // OpenRouter requires extra headers
  if (config.name === 'openrouter') {
    headers['HTTP-Referer'] = window.location.origin;
    headers['X-Title'] = 'TripMind AI';
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: config.maxTokens,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`${config.displayName} API error ${response.status}: ${errBody.slice(0, 200)}`);
  }

  const data = await response.json();

  if (!data.choices || !data.choices[0]?.message?.content) {
    throw new Error(`${config.displayName} returned empty response`);
  }

  return data.choices[0].message.content;
}

/**
 * Call Cohere API (different format from OpenAI)
 */
async function callCohere(
  config: ProviderConfig,
  prompt: string,
  temperature: number
): Promise<string> {
  const response = await fetch(`${config.baseUrl}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: config.maxTokens,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`Cohere API error ${response.status}: ${errBody.slice(0, 200)}`);
  }

  const data = await response.json();

  // Cohere v2 returns message.content array
  if (data.message?.content?.[0]?.text) {
    return data.message.content[0].text;
  }
  // Fallback for different response shapes
  if (data.text) {
    return data.text;
  }

  throw new Error('Cohere returned empty response');
}

/**
 * Call Gemini via the existing SDK (fallback provider)
 */
async function callGemini(prompt: string, temperature: number): Promise<string> {
  // Import dynamically to avoid circular deps
  const { generateText } = await import('../gemini/geminiClient');
  return generateText(prompt, temperature);
}

/**
 * Call a specific provider
 */
async function callProvider(
  provider: AIProvider,
  prompt: string,
  temperature: number
): Promise<string> {
  const configs = getProviderConfigs();
  const config = configs[provider];

  if (!config.apiKey) {
    throw new Error(`${config.displayName} API key not configured`);
  }

  if (provider === 'gemini') {
    return callGemini(prompt, temperature);
  }

  if (provider === 'cohere') {
    return callCohere(config, prompt, temperature);
  }

  // OpenAI, Groq, Mistral, OpenRouter all use OpenAI-compatible API
  return callOpenAICompatible(config, prompt, temperature);
}

/**
 * Extract JSON from an AI response string
 */
function extractJSON(text: string): string {
  // Try markdown code block first
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();

  // Try direct JSON object/array
  const jsonMatch = text.match(/({\s*[\s\S]*\s*}|\[\s*[\s\S]*\s*\])/);
  if (jsonMatch) return jsonMatch[0].trim();

  // Try finding start of JSON
  const objStart = text.indexOf('{');
  const objEnd = text.lastIndexOf('}');
  const arrStart = text.indexOf('[');
  const arrEnd = text.lastIndexOf(']');

  if (arrStart !== -1 && arrEnd !== -1 && (objStart === -1 || arrStart < objStart)) {
    return text.slice(arrStart, arrEnd + 1);
  }
  if (objStart !== -1 && objEnd !== -1) {
    return text.slice(objStart, objEnd + 1);
  }

  return text.trim();
}

/**
 * Main entry point: Generate JSON with the appropriate AI for the task
 * Includes automatic fallback chain.
 */
export async function multiAIGenerateJSON<T>(
  prompt: string,
  task: TaskType,
  temperature = 0.5
): Promise<{ result: T; provider: AIProvider }> {
  const primaryProvider = TASK_PROVIDER_MAP[task];
  const fallbacks = FALLBACK_CHAIN[primaryProvider];
  const allProviders = [primaryProvider, ...fallbacks];

  let lastError: Error | null = null;

  for (const provider of allProviders) {
    try {
      console.log(`[MultiAI] Trying ${provider} for ${task}...`);
      const rawText = await callProvider(provider, prompt, temperature);
      const jsonStr = extractJSON(rawText);
      const parsed = JSON.parse(jsonStr) as T;
      console.log(`[MultiAI] ✓ ${provider} succeeded for ${task}`);
      return { result: parsed, provider };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`[MultiAI] ✗ ${provider} failed for ${task}:`, lastError.message);
      // Continue to next provider
    }
  }

  throw lastError || new Error(`All AI providers failed for task: ${task}`);
}

/**
 * Generate text (non-JSON) with the appropriate AI
 */
export async function multiAIGenerateText(
  prompt: string,
  task: TaskType,
  temperature = 0.8
): Promise<{ text: string; provider: AIProvider }> {
  const primaryProvider = TASK_PROVIDER_MAP[task];
  const fallbacks = FALLBACK_CHAIN[primaryProvider];
  const allProviders = [primaryProvider, ...fallbacks];

  let lastError: Error | null = null;

  for (const provider of allProviders) {
    try {
      console.log(`[MultiAI] Trying ${provider} for ${task} (text)...`);
      const text = await callProvider(provider, prompt, temperature);
      console.log(`[MultiAI] ✓ ${provider} succeeded for ${task} (text)`);
      return { text, provider };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`[MultiAI] ✗ ${provider} failed for ${task} (text):`, lastError.message);
    }
  }

  throw lastError || new Error(`All AI providers failed for task: ${task}`);
}

/**
 * Chat with a specific provider (for the chat assistant)
 */
export async function multiAIChatCompletion(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  task: TaskType = 'chat',
  temperature = 0.8
): Promise<{ text: string; provider: AIProvider }> {
  const primaryProvider = TASK_PROVIDER_MAP[task];
  const fallbacks = FALLBACK_CHAIN[primaryProvider];
  const allProviders = [primaryProvider, ...fallbacks];

  let lastError: Error | null = null;
  const configs = getProviderConfigs();

  for (const provider of allProviders) {
    try {
      const config = configs[provider];
      if (!config.apiKey) throw new Error('No API key');

      if (provider === 'gemini') {
        // Gemini uses its own SDK for chat
        const { getModel } = await import('../gemini/geminiClient');
        const model = getModel(temperature);
        const chat = model.startChat({
          history: messages.slice(0, -1).map(m => ({
            role: m.role === 'assistant' ? 'model' as const : 'user' as const,
            parts: [{ text: m.content }],
          })),
        });
        const lastMsg = messages[messages.length - 1];
        const result = await chat.sendMessage(lastMsg.content);
        return { text: result.response.text(), provider: 'gemini' };
      }

      if (provider === 'cohere') {
        const response = await fetch(`${config.baseUrl}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({
            model: config.model,
            messages: messages.map(m => ({
              role: m.role === 'assistant' ? 'assistant' : m.role,
              content: m.content,
            })),
            temperature,
          }),
        });
        if (!response.ok) throw new Error(`Cohere error ${response.status}`);
        const data = await response.json();
        const text = data.message?.content?.[0]?.text || data.text || '';
        if (!text) throw new Error('Empty response');
        return { text, provider: 'cohere' };
      }

      // OpenAI-compatible providers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      };
      if (provider === 'openrouter') {
        headers['HTTP-Referer'] = window.location.origin;
        headers['X-Title'] = 'TripMind AI';
      }

      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: config.model,
          messages,
          temperature,
          max_tokens: config.maxTokens,
        }),
      });
      if (!response.ok) throw new Error(`${config.displayName} error ${response.status}`);
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error('Empty response');
      return { text, provider };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`[MultiAI Chat] ✗ ${provider} failed:`, lastError.message);
    }
  }

  throw lastError || new Error('All chat providers failed');
}

/**
 * Get display info about which provider handled which task
 */
export function getProviderDisplayName(provider: AIProvider): string {
  const configs = getProviderConfigs();
  return configs[provider]?.displayName || provider;
}

export function getTaskProviderInfo(): Array<{ task: string; provider: string }> {
  return Object.entries(TASK_PROVIDER_MAP).map(([task, provider]) => ({
    task: task.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    provider: getProviderDisplayName(provider),
  }));
}
