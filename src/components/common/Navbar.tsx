import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Menu, X, LogOut, LayoutDashboard, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled 
          ? 'py-4 bg-[#050505]/60 backdrop-blur-2xl border-b border-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.8)]' 
          : 'py-8 bg-gradient-to-b from-black/80 via-black/20 to-transparent'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-4 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm transition-all duration-500 group-hover:border-gold/50 group-hover:bg-gold/10 group-hover:shadow-[0_0_20px_rgba(196,163,90,0.2)]">
            <Sparkles size={16} className="text-primary/80 group-hover:text-goldLight transition-colors duration-500" />
            <div className="absolute inset-0 rounded-full border border-white/10 mix-blend-overlay" />
          </div>
          <span className="font-display text-xl tracking-[0.3em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/90 to-primary/60 group-hover:from-goldLight group-hover:to-gold transition-all duration-500 drop-shadow-sm">
            TripMind
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {user ? (
            <>
              <Link to="/dashboard" className="font-sans text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-primary/70 hover:text-goldLight transition-colors duration-300 relative after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:w-full after:h-[1px] after:bg-goldLight/50 after:origin-right after:scale-x-0 hover:after:scale-x-100 hover:after:origin-left after:transition-transform after:duration-500">
                Dashboard
              </Link>
              <Link to="/new-trip" className="relative group font-sans text-[0.8rem] font-bold tracking-[0.25em] uppercase px-10 py-4 overflow-hidden rounded-full transition-all duration-500 hover:shadow-[0_0_30px_rgba(196,163,90,0.3)] hover:-translate-y-[1px]">
                <div className="absolute inset-0 bg-gradient-to-r from-gold via-goldLight to-gold opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.4)_0%,transparent_50%)] mix-blend-overlay pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] skew-x-[-30deg] group-hover:animate-[shine_1.5s_ease-in-out]" />
                <span className="relative z-10 text-[#050505] drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">New Trip</span>
              </Link>
              <button onClick={handleSignOut} className="font-sans text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-primary/50 hover:text-red-400 transition-colors duration-300">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-sans text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-primary/70 hover:text-goldLight transition-colors duration-300 relative after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:w-full after:h-[1px] after:bg-goldLight/50 after:origin-right after:scale-x-0 hover:after:scale-x-100 hover:after:origin-left after:transition-transform after:duration-500">
                Sign In
              </Link>
              <Link to="/new-trip" className="relative group font-sans text-[0.8rem] font-bold tracking-[0.25em] uppercase px-10 py-4 overflow-hidden rounded-full transition-all duration-500 hover:shadow-[0_0_30px_rgba(196,163,90,0.3)] hover:-translate-y-[1px]">
                <div className="absolute inset-0 bg-gradient-to-r from-gold via-goldLight to-gold opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.4)_0%,transparent_50%)] mix-blend-overlay pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] skew-x-[-30deg] group-hover:animate-[shine_1.5s_ease-in-out]" />
                <span className="relative z-10 text-[#050505] drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">Plan Journey</span>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-primary hover:text-gold transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} strokeWidth={1} /> : <Menu size={24} strokeWidth={1} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-background/95 backdrop-blur-xl border-t border-darkBorder mt-4"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="font-sans text-[0.7rem] font-medium tracking-[0.2em] uppercase text-primary/80 flex items-center gap-3">
                    <LayoutDashboard size={14} /> Dashboard
                  </Link>
                  <Link to="/new-trip" onClick={() => setMenuOpen(false)} className="font-sans text-[0.7rem] font-medium tracking-[0.2em] uppercase text-gold flex items-center gap-3">
                    <Sparkles size={14} /> New Journey
                  </Link>
                  <button onClick={() => { handleSignOut(); setMenuOpen(false); }} className="font-sans text-[0.7rem] font-medium tracking-[0.2em] uppercase text-primary/50 flex items-center gap-3 text-left">
                    <LogOut size={14} /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="font-sans text-[0.7rem] font-medium tracking-[0.2em] uppercase text-primary/80">
                    Sign In
                  </Link>
                  <Link to="/new-trip" onClick={() => setMenuOpen(false)} className="font-sans text-[0.7rem] font-medium tracking-[0.2em] uppercase text-gold">
                    Plan Journey
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
