import { motion } from 'framer-motion';
import { AgentStatus } from '../../types/ai.types';

interface Props {
  progress: number;
  agentStatus: AgentStatus;
}

const agentLabels: Record<keyof AgentStatus, string> = {
  groupAnalyzer: '🧠 Groq Llama 3: Analyzing your group...',
  weather: '🌤️ OpenRouter: Fetching weather...',
  budget: '💰 Groq Llama 3: Optimizing budget...',
  hotel: '🏨 ChatGPT-4o: Finding perfect hotels...',
  food: '🍽️ Mistral Large: Discovering local food...',
  packing: '🎒 Mistral Large: Building packing list...',
  itinerary: '✨ Gemini 2.5: Crafting day-by-day itinerary...',
};

export default function AIThinkingIndicator({ progress, agentStatus }: Props) {
  const activeAgent = (Object.entries(agentStatus) as [keyof AgentStatus, string][])
    .find(([, s]) => s === 'running')?.[0];

  return (
    <div className="text-center py-16 px-6 font-sans max-w-2xl mx-auto">
      {/* Animated orb */}
      <div className="relative w-28 h-28 mx-auto mb-12">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(196,163,90,0.15), transparent)' }}
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-2 rounded-full border border-transparent"
          style={{ borderTopColor: 'rgba(196,163,90,0.6)', borderRightColor: 'rgba(196,163,90,0.1)' }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-5 rounded-full border border-transparent"
          style={{ borderBottomColor: 'rgba(196,163,90,0.3)', borderLeftColor: 'rgba(196,163,90,0.1)' }}
        />
        <div className="absolute inset-7 rounded-full bg-surface flex items-center justify-center text-2xl border border-darkBorder">
          ✈️
        </div>
      </div>

      <h2 className="font-display text-3xl md:text-4xl font-light tracking-[0.06em] text-primary mb-3">
        Crafting Your Journey
      </h2>
      <p className="font-sans text-xs font-light text-primary/40 mb-12 min-h-[20px] tracking-wide">
        {activeAgent ? agentLabels[activeAgent] : '7 AI agents working simultaneously...'}
      </p>

      {/* Progress bar */}
      <div className="max-w-sm mx-auto mb-12">
        <div className="flex justify-between mb-3">
          <span className="text-[0.6rem] text-primary/30 uppercase tracking-[0.25em]">Progress</span>
          <span className="text-[0.6rem] font-medium text-gold tracking-widest">{progress}%</span>
        </div>
        <div className="h-[1px] bg-darkBorder relative overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-gold/80 to-gold/40"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Agent grid */}
      <div className="flex flex-wrap gap-2 justify-center">
        {(Object.entries(agentStatus) as [keyof AgentStatus, string][]).map(([agent, status]) => (
          <motion.div
            key={agent}
            animate={status === 'running' ? { opacity: [0.7, 1, 0.7] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`px-4 py-2 text-[0.6rem] tracking-[0.1em] uppercase transition-all border ${
              status === 'done' 
                ? 'bg-gold/10 text-gold border-gold/20'
                : status === 'running'
                ? 'bg-surface text-primary border-gold/50'
                : status === 'error'
                ? 'bg-red-900/10 text-red-400/80 border-red-500/20'
                : 'bg-transparent text-primary/20 border-darkBorder'
            }`}
          >
            {status === 'done' ? '✓' : status === 'running' ? '⟳' : status === 'error' ? '!' : '○'} {agentLabels[agent].split(' ').slice(1).join(' ').replace('...','')}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
