import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-md"
      >
        <div className="text-7xl mb-8">🗺️</div>
        <h1 className="font-display text-6xl md:text-8xl font-light tracking-[0.1em] text-primary mb-4">404</h1>
        <p className="font-sans text-sm font-light text-primary/40 mb-12">Looks like this destination doesn't exist on our map.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/" className="flex items-center gap-3 bg-primary hover:bg-gold text-background px-6 py-3 text-[0.65rem] font-sans uppercase tracking-[0.25em] transition-all hover:-translate-y-px">
            <Home size={14} /> Back Home
          </Link>
          <Link to="/new-trip" className="flex items-center gap-3 border border-gold/40 text-gold hover:bg-gold/10 px-6 py-3 text-[0.65rem] font-sans uppercase tracking-[0.25em] transition-all hover:-translate-y-px">
            <Sparkles size={14} /> Plan a Trip
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
