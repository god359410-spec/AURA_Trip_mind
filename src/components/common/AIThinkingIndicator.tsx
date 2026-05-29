import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentStatus } from '../../types/ai.types';

interface Props {
  progress: number;
  agentStatus: AgentStatus;
}

const agentLabels: Record<keyof AgentStatus, string> = {
  groupAnalyzer: 'Analyzing your travel group',
  weather:       'Fetching live weather data',
  budget:        'Optimizing budget allocation',
  hotel:         'Discovering perfect hotels',
  food:          'Curating local dining experiences',
  packing:       'Building smart packing list',
  itinerary:     'Crafting day-by-day itinerary',
};

const agentIcons: Record<keyof AgentStatus, string> = {
  groupAnalyzer: '🧠',
  weather:       '🌤️',
  budget:        '💰',
  hotel:         '🏨',
  food:          '🍽️',
  packing:       '🎒',
  itinerary:     '✨',
};

const agentModels: Record<keyof AgentStatus, string> = {
  groupAnalyzer: 'Groq Llama 3',
  weather:       'OpenRouter',
  budget:        'Groq Llama 3',
  hotel:         'ChatGPT-4o',
  food:          'Mistral Large',
  packing:       'Mistral Large',
  itinerary:     'Gemini 2.5',
};

// Floating particle configs
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 8 + 6,
  delay: Math.random() * 4,
  opacity: Math.random() * 0.4 + 0.1,
}));

interface LogEntry {
  key: keyof AgentStatus;
  status: string;
  timestamp: number;
}

export default function AIThinkingIndicator({ progress, agentStatus }: Props) {
  const feedRef = useRef<HTMLDivElement>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const prevStatus = useRef<AgentStatus>(agentStatus);

  // Build live log from status changes
  useEffect(() => {
    const keys = Object.keys(agentStatus) as (keyof AgentStatus)[];
    const newEntries: LogEntry[] = [];

    keys.forEach((key) => {
      const current = agentStatus[key];
      const prev = prevStatus.current[key];
      if (current !== prev) {
        newEntries.push({ key, status: current, timestamp: Date.now() });
      }
    });

    if (newEntries.length > 0) {
      setLog((prev) => [...prev, ...newEntries].slice(-20));
    }
    prevStatus.current = agentStatus;
  }, [agentStatus]);

  // Auto-scroll feed to bottom
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [log]);

  // Active agent
  const activeAgent = (Object.entries(agentStatus) as [keyof AgentStatus, string][])
    .find(([, s]) => s === 'running')?.[0];

  // Circular progress arc calculation
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
         style={{ background: 'radial-gradient(ellipse at 50% 30%, #111008 0%, #0a0a0a 60%, #050505 100%)' }}>

      {/* ── Floating Ambient Particles ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: `rgba(196, 163, 90, ${p.opacity})`,
              boxShadow: `0 0 ${p.size * 4}px rgba(196, 163, 90, ${p.opacity * 0.6})`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [p.opacity, p.opacity * 2.5, p.opacity],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* ── Wide ambient glow behind orb ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(196,163,90,0.25) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* ── Main layout ── */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-16 px-8 w-full max-w-5xl">

        {/* ── Left: Orbital Orb + Progress Arc ── */}
        <div className="flex-shrink-0 flex flex-col items-center gap-10">

          {/* Orbital animation */}
          <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>

            {/* Progress ring */}
            <svg className="absolute inset-0" width="220" height="220" style={{ transform: 'rotate(-90deg)' }}>
              {/* Track */}
              <circle cx="110" cy="110" r={radius} fill="none" stroke="rgba(245,240,235,0.06)" strokeWidth="1.5" />
              {/* Fill */}
              <motion.circle
                cx="110" cy="110" r={radius}
                fill="none"
                stroke="url(#goldArc)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ filter: 'drop-shadow(0 0 6px rgba(196,163,90,0.7))' }}
              />
              <defs>
                <linearGradient id="goldArc" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#c4a35a" />
                  <stop offset="100%" stopColor="#e6c883" />
                </linearGradient>
              </defs>
            </svg>

            {/* Outer ring — slow CW */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              className="absolute"
              style={{
                width: 190, height: 190,
                borderRadius: '50%',
                border: '1px solid transparent',
                borderTopColor: 'rgba(196,163,90,0.5)',
                borderRightColor: 'rgba(196,163,90,0.15)',
              }}
            />

            {/* Middle ring — medium CCW */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute"
              style={{
                width: 155, height: 155,
                borderRadius: '50%',
                border: '1px solid transparent',
                borderBottomColor: 'rgba(196,163,90,0.35)',
                borderLeftColor: 'rgba(196,163,90,0.1)',
              }}
            />

            {/* Inner ring — fast CW */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="absolute"
              style={{
                width: 118, height: 118,
                borderRadius: '50%',
                border: '1.5px solid transparent',
                borderTopColor: 'rgba(230,200,131,0.6)',
                borderRightColor: 'rgba(230,200,131,0.2)',
                filter: 'drop-shadow(0 0 4px rgba(196,163,90,0.5))',
              }}
            />

            {/* Center gem */}
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="relative flex items-center justify-center"
              style={{
                width: 78, height: 78,
                borderRadius: '50%',
                background: 'radial-gradient(circle, #1a1507 0%, #0d0d0d 100%)',
                border: '1px solid rgba(196,163,90,0.3)',
                boxShadow: '0 0 30px rgba(196,163,90,0.2), inset 0 0 20px rgba(196,163,90,0.05)',
              }}
            >
              <span style={{ fontSize: 28 }}>✈️</span>
            </motion.div>
          </div>

          {/* Progress percentage */}
          <div className="text-center">
            <motion.div
              key={progress}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-5xl font-light tracking-wider"
              style={{ color: '#c4a35a', textShadow: '0 0 30px rgba(196,163,90,0.4)' }}
            >
              {progress}%
            </motion.div>
            <div className="font-sans text-[0.55rem] uppercase tracking-[0.35em] mt-2"
                 style={{ color: 'rgba(245,240,235,0.3)' }}>
              Generating
            </div>
          </div>

          {/* Active agent label */}
          <AnimatePresence mode="wait">
            {activeAgent && (
              <motion.div
                key={activeAgent}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4 }}
                className="text-center px-6 py-3 rounded-full"
                style={{
                  background: 'rgba(196,163,90,0.08)',
                  border: '1px solid rgba(196,163,90,0.2)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em]"
                      style={{ color: '#e6c883' }}>
                  {agentIcons[activeAgent]} {agentModels[activeAgent]}
                </span>
                <div className="font-sans text-[0.6rem] mt-1" style={{ color: 'rgba(245,240,235,0.4)' }}>
                  {agentLabels[activeAgent]}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right: Text + Live Agent Feed ── */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
          {/* Headline */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="font-display font-light leading-tight mb-3"
              style={{
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                color: '#f5f0eb',
                letterSpacing: '0.04em',
              }}
            >
              Crafting Your
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #c4a35a 0%, #e6c883 50%, #c4a35a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Journey
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="font-sans font-light"
              style={{ color: 'rgba(245,240,235,0.35)', fontSize: '0.8rem', letterSpacing: '0.05em' }}
            >
              7 specialized AI agents working in parallel to build your perfect trip.
            </motion.p>
          </div>

          {/* Live Agent Feed */}
          <div
            style={{
              background: 'rgba(10,10,10,0.6)',
              border: '1px solid rgba(245,240,235,0.08)',
              borderRadius: 12,
              padding: '4px 0',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Feed header */}
            <div className="flex items-center gap-2 px-5 py-3"
                 style={{ borderBottom: '1px solid rgba(245,240,235,0.06)' }}>
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="rounded-full"
                style={{ width: 6, height: 6, background: '#c4a35a' }}
              />
              <span className="font-sans text-[0.55rem] uppercase tracking-[0.3em]"
                    style={{ color: 'rgba(245,240,235,0.3)' }}>
                Live Agent Feed
              </span>
            </div>

            {/* Scrollable feed */}
            <div
              ref={feedRef}
              style={{ maxHeight: 220, overflowY: 'auto', scrollbarWidth: 'none' }}
              className="no-scrollbar"
            >
              {/* Static initial rows for all agents */}
              {(Object.entries(agentStatus) as [keyof AgentStatus, string][]).map(([key, status]) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3 px-5 py-3"
                  style={{ borderBottom: '1px solid rgba(245,240,235,0.04)' }}
                >
                  {/* Status icon */}
                  <div style={{ width: 20, textAlign: 'center', fontSize: 13 }}>
                    {status === 'done' ? (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{ color: '#c4a35a' }}
                      >✓</motion.span>
                    ) : status === 'running' ? (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        style={{ display: 'inline-block', color: '#e6c883' }}
                      >⟳</motion.span>
                    ) : status === 'error' ? (
                      <span style={{ color: '#ef4444' }}>✕</span>
                    ) : (
                      <span style={{ color: 'rgba(245,240,235,0.15)' }}>○</span>
                    )}
                  </div>

                  {/* Agent emoji */}
                  <span style={{ fontSize: 14, opacity: status === 'idle' ? 0.3 : 1 }}>
                    {agentIcons[key]}
                  </span>

                  {/* Agent info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-sans text-[0.6rem] uppercase tracking-[0.12em] truncate"
                         style={{
                           color: status === 'done'
                             ? '#c4a35a'
                             : status === 'running'
                             ? '#f5f0eb'
                             : 'rgba(245,240,235,0.25)',
                         }}>
                      {agentLabels[key]}
                    </div>
                    <div className="font-sans text-[0.5rem] uppercase tracking-widest mt-0.5"
                         style={{ color: 'rgba(245,240,235,0.2)' }}>
                      {agentModels[key]}
                    </div>
                  </div>

                  {/* Running pulse */}
                  {status === 'running' && (
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="rounded-full flex-shrink-0"
                      style={{ width: 5, height: 5, background: '#e6c883' }}
                    />
                  )}

                  {/* Done badge */}
                  {status === 'done' && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="font-sans text-[0.5rem] uppercase tracking-widest flex-shrink-0"
                      style={{
                        color: '#c4a35a',
                        background: 'rgba(196,163,90,0.08)',
                        border: '1px solid rgba(196,163,90,0.2)',
                        borderRadius: 4,
                        padding: '2px 6px',
                      }}
                    >
                      Done
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom tip */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="font-sans font-light"
            style={{ color: 'rgba(245,240,235,0.2)', fontSize: '0.65rem', letterSpacing: '0.08em' }}
          >
            ✦ This usually takes 20–40 seconds depending on trip complexity.
          </motion.p>
        </div>
      </div>
    </div>
  );
}
