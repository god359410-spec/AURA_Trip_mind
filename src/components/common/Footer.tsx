import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-background border-t border-darkBorder relative overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center">
                <Sparkles size={14} className="text-primary" />
              </div>
              <span className="font-display text-xl tracking-[0.25em] uppercase text-primary">TripMind</span>
            </div>
            <p className="font-sans text-sm font-light leading-[1.9] text-primary/40 max-w-sm">
              AI-powered group travel planning that handles every detail, so you can focus on the journey.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-sans text-[0.6rem] tracking-[0.3em] uppercase text-goldLight mb-6">Product</h4>
            <div className="flex flex-col gap-4">
              {[['Plan a Trip', '/new-trip'], ['Dashboard', '/dashboard']].map(([label, href]) => (
                <Link key={href} to={href} className="font-sans text-sm font-light text-primary/40 hover:text-primary transition-colors duration-300">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* AI Features */}
          <div>
            <h4 className="font-sans text-[0.6rem] tracking-[0.3em] uppercase text-goldLight mb-6">AI Features</h4>
            <div className="flex flex-col gap-4">
              {['Smart Itineraries', 'Group Analysis', 'Weather Planning', 'Budget Optimizer', 'Packing AI'].map(f => (
                <span key={f} className="font-sans text-sm font-light text-primary/40">{f}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-darkBorder pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans text-[0.6rem] tracking-[0.2em] uppercase text-primary/30">
            © {new Date().getFullYear()} TripMind AI. All rights reserved.
          </p>
          <p className="font-sans text-[0.6rem] tracking-[0.2em] uppercase text-primary/30">
            Powered by Google Gemini 2.5 Flash
          </p>
        </div>
      </div>
    </footer>
  );
}
