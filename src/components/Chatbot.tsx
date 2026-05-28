import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Loader2 } from 'lucide-react';
import { multiAIChatCompletion } from '../services/ai/multiProvider';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  provider?: string;
}

interface Props {
  inline?: boolean;
}

export default function Chatbot({ inline = false }: Props) {
  const [isOpen, setIsOpen] = useState(inline);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', text: 'Hi! I am your TripMind AI Assistant. How can I help you plan your luxury getaway today?', isBot: true, provider: 'OpenAI' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), text: input.trim(), isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatMessages = messages.map(m => ({
        role: m.isBot ? 'assistant' as const : 'user' as const,
        content: m.text
      }));
      chatMessages.push({ role: 'user', content: userMessage.text });
      
      const { text, provider } = await multiAIChatCompletion(chatMessages, 'chat');
      
      const botMessage: Message = { id: (Date.now() + 1).toString(), text, isBot: true, provider };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = { id: (Date.now() + 1).toString(), text: 'I apologize, but I am currently experiencing technical difficulties connecting to my systems. Please try again later.', isBot: true };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (inline) {
    return (
      <div className="w-full h-[600px] bg-surface/30 border border-darkBorder flex flex-col overflow-hidden relative">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-gold/5 blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="p-6 bg-surface/50 border-b border-darkBorder flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border border-gold/30 rounded-full flex items-center justify-center bg-gold/5 relative">
              <Bot size={16} className="text-gold" />
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-surface" />
            </div>
            <div>
              <h3 className="font-display text-xl font-light text-primary tracking-wide">Concierge AI</h3>
              <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] text-goldLight mt-1 block">Active Intelligence</span>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col gap-8 scroll-smooth no-scrollbar z-10">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex max-w-[85%] ${msg.isBot ? 'self-start' : 'self-end flex-row-reverse'}`}
            >
              <div className={`flex flex-col ${msg.isBot ? 'items-start' : 'items-end'}`}>
                <div className={`font-sans text-sm font-light leading-[1.8] px-6 py-4 ${msg.isBot ? 'bg-surface/50 border border-darkBorder text-primary/80' : 'bg-gold/10 border border-gold/20 text-gold'}`}>
                  {msg.text}
                </div>
                {msg.provider && msg.isBot && (
                  <span className="font-sans text-[0.55rem] uppercase tracking-[0.2em] text-primary/30 mt-3">
                    Engineered by {msg.provider}
                  </span>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="bg-surface/50 border border-darkBorder px-6 py-5 flex gap-2 items-center">
                <motion.div animate={{ y: [0, -4, 0], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-gold/60" />
                <motion.div animate={{ y: [0, -4, 0], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-gold/60" />
                <motion.div animate={{ y: [0, -4, 0], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-gold/60" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-darkBorder bg-surface/50 z-10">
          <form onSubmit={handleSend} className="flex gap-4 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Instruct the Concierge AI..."
              className="flex-1 bg-surface/50 border border-darkBorder py-4 px-6 text-sm text-primary focus:outline-none focus:border-gold/50 transition-colors placeholder:text-primary/20 font-sans font-light"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-14 h-14 bg-primary hover:bg-gold text-background flex items-center justify-center transition-all disabled:opacity-50 shrink-0"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            drag
            dragConstraints={{ left: -1000, right: 0, top: -800, bottom: 0 }}
            dragElastic={0.1}
            className="absolute bottom-20 right-0 w-[380px] h-[600px] bg-background border border-darkBorder shadow-2xl flex flex-col overflow-hidden cursor-default"
          >
             {/* Subtle background glow */}
             <div className="absolute inset-0 bg-gold/5 blur-[100px] pointer-events-none" />

            {/* Header (Draggable Handle) */}
            <div className="p-6 bg-surface/50 border-b border-darkBorder flex justify-between items-center cursor-grab active:cursor-grabbing z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-gold/30 rounded-full flex items-center justify-center bg-gold/5 relative">
                  <Bot size={16} className="text-gold" />
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-surface" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-light text-primary tracking-wide">Concierge AI</h3>
                  <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] text-goldLight mt-1 block">Active Intelligence</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-primary/40 hover:text-primary transition-colors p-2"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scroll-smooth no-scrollbar z-10">
              {messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id} 
                  className={`flex max-w-[90%] ${msg.isBot ? 'self-start' : 'self-end flex-row-reverse'}`}
                >
                  <div className={`flex flex-col ${msg.isBot ? 'items-start' : 'items-end'}`}>
                    <div className={`font-sans text-[0.8rem] font-light leading-[1.8] px-5 py-3 ${msg.isBot ? 'bg-surface/50 border border-darkBorder text-primary/80' : 'bg-gold/10 border border-gold/20 text-gold'}`}>
                      {msg.text}
                    </div>
                    {msg.provider && msg.isBot && (
                      <span className="font-sans text-[0.55rem] uppercase tracking-[0.2em] text-primary/30 mt-2">
                        Engineered by {msg.provider}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                   <div className="bg-surface/50 border border-darkBorder px-5 py-4 flex gap-2 items-center">
                    <motion.div animate={{ y: [0, -3, 0], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-gold/60" />
                    <motion.div animate={{ y: [0, -3, 0], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-gold/60" />
                    <motion.div animate={{ y: [0, -3, 0], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-gold/60" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-darkBorder bg-surface/50 z-10">
              <form onSubmit={handleSend} className="flex gap-3 items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Instruct..."
                  className="flex-1 bg-surface/50 border border-darkBorder py-3 px-4 text-sm text-primary focus:outline-none focus:border-gold/50 transition-colors placeholder:text-primary/20 font-sans font-light"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-12 h-12 bg-primary hover:bg-gold text-background flex items-center justify-center transition-all disabled:opacity-50 shrink-0"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-gold hover:bg-goldLight rounded-none flex items-center justify-center text-background transition-colors"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </div>
  );
}
