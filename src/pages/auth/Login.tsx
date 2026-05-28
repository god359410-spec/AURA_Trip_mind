import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { signIn } from '../../services/supabase/auth';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { initialize } = useAuthStore();
  const { addToast } = useUIStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      await initialize();
      addToast({ type: 'success', message: 'Welcome back!' });
      navigate('/dashboard');
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 md:px-16 py-16">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-3 mb-16 group">
            <div className="w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center group-hover:border-gold transition-colors">
              <Sparkles size={14} className="text-primary group-hover:text-gold transition-colors" />
            </div>
            <span className="font-display text-lg tracking-[0.25em] uppercase text-primary">TripMind</span>
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <h1 className="font-display text-4xl md:text-5xl font-light tracking-[0.04em] text-primary mb-4">Welcome back</h1>
            <p className="font-sans text-sm font-light text-primary/40 mb-12">Enter your details to access your upcoming trips.</p>

            <form onSubmit={handleLogin} className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-[0.6rem] font-sans text-primary/50 uppercase tracking-[0.2em]">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/40" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full bg-surface/50 border border-darkBorder rounded-none py-3.5 pl-12 pr-4 text-sm text-primary focus:outline-none focus:border-gold/50 transition-colors placeholder:text-primary/20"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[0.6rem] font-sans text-primary/50 uppercase tracking-[0.2em]">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/40" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-surface/50 border border-darkBorder rounded-none py-3.5 pl-12 pr-4 text-sm text-primary focus:outline-none focus:border-gold/50 transition-colors placeholder:text-primary/20"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="flex items-center justify-center gap-3 w-full bg-primary hover:bg-gold text-background py-3.5 text-[0.65rem] font-sans uppercase tracking-[0.25em] transition-all hover:-translate-y-px disabled:opacity-50 mt-4">
                {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={14} />
              </button>
            </form>

            <p className="mt-10 text-center font-sans text-sm font-light text-primary/40">
              Don't have an account?{' '}
              <Link to="/signup" className="text-gold hover:text-goldLight transition-colors">Sign up</Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Image Side */}
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2021&q=80")' }} />
        <div className="absolute inset-0 bg-background/60" />
        <div className="absolute inset-0 flex items-end p-16">
          <div>
            <div className="font-sans text-[0.6rem] tracking-[0.35em] uppercase text-goldLight mb-4">AI-Powered Travel</div>
            <h2 className="font-display text-4xl font-light tracking-[0.06em] text-primary leading-tight">Your journey<br />begins here</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
