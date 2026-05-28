import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { useTripStore } from '../stores/tripStore';
import { useItineraryStore } from '../stores/itineraryStore';
import { useChatStore } from '../stores/chatStore';
import { chatWithAssistant } from '../services/gemini/agents/chatAgent';

export default function ChatPage() {
  const { currentTrip } = useTripStore();
  const { itinerary } = useItineraryStore();
  const { messages, isTyping, addMessage, setTyping, setTripId, tripId } = useChatStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentTrip && currentTrip.id !== tripId) {
      setTripId(currentTrip.id);
    }
  }, [currentTrip, tripId, setTripId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentTrip) return;

    const userMsg = input.trim();
    setInput('');
    addMessage({ id: crypto.randomUUID(), role: 'user', content: userMsg, timestamp: Date.now() });
    setTyping(true);

    try {
      const response = await chatWithAssistant(userMsg, messages, currentTrip, itinerary);
      addMessage({ id: crypto.randomUUID(), role: 'assistant', content: response.text, timestamp: Date.now(), provider: response.provider });
    } catch (err) {
      addMessage({ id: crypto.randomUUID(), role: 'assistant', content: 'Sorry, I encountered an error. Please try asking again.', timestamp: Date.now() });
    } finally {
      setTyping(false);
    }
  };

  if (!currentTrip) return null;

  return (
    <div className="max-w-[1000px] mx-auto bg-surface/30 border border-darkBorder flex flex-col" style={{ height: 'calc(100vh - 250px)', minHeight: 600 }}>
      {/* Chat Header */}
      <div className="p-6 border-b border-darkBorder bg-surface/50 flex items-center justify-between backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border border-gold/30 rounded-full flex items-center justify-center bg-gold/5 relative">
            <Sparkles size={16} className="text-gold" />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-surface" />
          </div>
          <div>
            <h3 className="font-display text-xl font-light text-primary tracking-wide">Concierge AI</h3>
            <div className="font-sans text-[0.6rem] uppercase tracking-[0.2em] text-goldLight mt-1">Active Intelligence</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col gap-8 scroll-smooth no-scrollbar">
        {messages.length === 0 && (
          <div className="m-auto text-center max-w-sm flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border border-darkBorder bg-surface/50 flex items-center justify-center mb-6">
              <Bot size={24} className="text-primary/40" />
            </div>
            <h4 className="font-display text-2xl font-light text-primary mb-4">How may I assist?</h4>
            <p className="font-sans text-sm font-light text-primary/40 leading-[1.8]">Inquire about itinerary modifications, bespoke recommendations, or local etiquette.</p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
            >
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${
                msg.role === 'user' 
                ? 'border-gold/30 bg-gold/5 text-gold' 
                : 'border-primary/20 bg-surface/80 text-primary/60'
              }`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`font-sans text-sm font-light leading-[1.8] px-6 py-4 ${
                  msg.role === 'user'
                  ? 'bg-gold/10 border border-gold/20 text-gold'
                  : 'bg-surface/50 border border-darkBorder text-primary/80'
                }`}>
                  {msg.content}
                </div>
                {msg.provider && (
                  <span className="font-sans text-[0.55rem] uppercase tracking-[0.2em] text-primary/30 mt-3">
                    Engineered by {msg.provider}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-[85%] self-start">
              <div className="w-8 h-8 rounded-full border border-primary/20 bg-surface/80 text-primary/60 flex items-center justify-center shrink-0">
                <Bot size={14} />
              </div>
              <div className="bg-surface/50 border border-darkBorder px-6 py-5 flex gap-2 items-center">
                <motion.div animate={{ y: [0, -4, 0], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-gold/60" />
                <motion.div animate={{ y: [0, -4, 0], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-gold/60" />
                <motion.div animate={{ y: [0, -4, 0], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-gold/60" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-6 border-t border-darkBorder bg-surface/50 backdrop-blur-sm z-10">
        <form onSubmit={handleSend} className="flex gap-4 items-center">
          <input
            type="text"
            className="flex-1 bg-surface/50 border border-darkBorder py-4 px-6 text-sm text-primary focus:outline-none focus:border-gold/50 transition-colors placeholder:text-primary/20 font-sans font-light"
            placeholder="Instruct the Concierge AI..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="w-14 h-14 bg-primary hover:bg-gold text-background flex items-center justify-center transition-all disabled:opacity-50 shrink-0"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
