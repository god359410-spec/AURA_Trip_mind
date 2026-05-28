import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Mic, MoreHorizontal } from 'lucide-react';

import { multiAIChatCompletion } from '../../services/ai/multiProvider';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'assistant' | 'user'; content: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Auto-greet
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([
        { role: 'assistant', content: "Welcome to TripMind AI — Where should we take you next?" }
      ]);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      // Prepare messages for the API including a system prompt to define the persona
      const apiMessages = [
        { 
          role: 'system' as const, 
          content: "You are the TripMind AI Concierge, an ultra-premium, highly intelligent luxury travel assistant. Your tone is elegant, cinematic, concise, and incredibly helpful. You specialize in curating world-class travel experiences, hotels, dining, and itineraries. You do not use markdown unless necessary, keep it conversational and refined." 
        },
        ...newMessages.map(m => ({ role: m.role, content: m.content }))
      ];

      const response = await multiAIChatCompletion(apiMessages, 'chat');
      
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response.text }
      ]);
    } catch (error) {
      console.error('Chat API Error:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "I apologize, but I am having trouble connecting to my neural network right now. Please try again in a moment." }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser doesn't support voice input. Please try Chrome or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(prev => prev ? prev + ' ' + transcript : transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div ref={widgetRef} className="fixed top-24 right-6 md:right-10 z-[100] flex flex-col items-end pointer-events-none" data-lenis-prevent="true">
      
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, y: -20, filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="mb-6 w-[350px] sm:w-[400px] h-[500px] max-h-[70vh] pointer-events-auto rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 bg-background/60 backdrop-blur-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-gradient-to-r from-background/80 to-background/40">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gold/10 border border-gold/30">
                  <Sparkles size={14} className="text-gold animate-pulse" />
                  <div className="absolute inset-0 rounded-full shadow-[0_0_10px_rgba(196,163,90,0.5)] animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-light tracking-[0.05em] text-primary">TripMind Concierge</h3>
                  <p className="font-sans text-[0.6rem] tracking-[0.2em] uppercase text-goldLight">Always Online</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-primary/50 hover:text-primary transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col no-scrollbar">
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                    msg.role === 'user' 
                      ? 'bg-gold/10 border border-gold/20 text-primary' 
                      : 'bg-white/5 border border-white/5 text-primary/90'
                  }`}>
                    <p className="font-sans text-sm font-light leading-[1.6]">{msg.content}</p>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="flex justify-start"
                >
                  <div className="max-w-[85%] rounded-2xl px-5 py-4 bg-white/5 border border-white/5 flex items-center gap-1">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-gold/50" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-gold/50" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-gold/50" />
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background/80 border-t border-white/5">
              <div className="relative flex items-center">
                <input 
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask anything..."
                  className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-5 pr-24 font-sans text-sm font-light text-primary placeholder:text-primary/30 focus:outline-none focus:border-gold/30 transition-colors"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  <button 
                    onClick={startListening}
                    className={`p-2 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-primary/40 hover:text-primary'}`}
                  >
                    <Mic size={16} />
                  </button>
                  <button 
                    onClick={handleSend}
                    className="p-2 bg-gold/20 text-gold hover:bg-gold hover:text-background rounded-full transition-all duration-300"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Pill Button */}
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto relative flex items-center justify-center h-14 rounded-full bg-background/80 backdrop-blur-md border border-gold/30 shadow-[0_0_20px_rgba(196,163,90,0.2)] group transition-all duration-500 overflow-hidden ${
          isOpen ? 'w-14' : 'px-6 gap-3'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-gold/5 via-transparent to-transparent group-hover:from-gold/20 transition-colors duration-500" />
        
        {isOpen ? (
          <X size={20} className="text-gold relative z-10" />
        ) : (
          <>
            <div className="relative">
              <Sparkles size={18} className="text-gold relative z-10 animate-[pulse_3s_ease-in-out_infinite]" />
              {/* Unread notification dot */}
              {messages.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-background animate-pulse" />
              )}
            </div>
            <span className="relative z-10 font-sans text-xs font-medium tracking-[0.2em] uppercase text-goldLight whitespace-nowrap">
              Ask AI Assistant
            </span>
          </>
        )}
      </motion.button>

    </div>
  );
}
