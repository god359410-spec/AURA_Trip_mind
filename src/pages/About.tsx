import { motion } from 'framer-motion';
import { Sparkles, BrainCircuit, Users, DollarSign, Map, CloudSun, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  const specialties = [
    {
      icon: <BrainCircuit size={24} />,
      title: 'Multi-Agent AI Orchestration',
      description: 'TripMind leverages a swarm of specialized AI agents—from local guides to budget analysts—to curate highly personalized, data-driven itineraries.'
    },
    {
      icon: <Users size={24} />,
      title: 'Group Dynamics Optimized',
      description: 'We analyze the unique constraints of your entire group, perfectly balancing pace, accessibility, and diverse dietary needs into a single unified plan.'
    },
    {
      icon: <DollarSign size={24} />,
      title: 'Intelligent Budgeting',
      description: 'Dynamic cost-splitting and live budget allocation ensures you know exactly where your money goes, from luxury stays to local street food.'
    },
    {
      icon: <CloudSun size={24} />,
      title: 'Real-Time Adaptive Advice',
      description: 'Integrated live weather forecasting automatically adjusts your packing list and daily activity suggestions based on local conditions.'
    },
    {
      icon: <Map size={24} />,
      title: 'Cinematic Interactive Maps',
      description: 'Visualize your journey on premium, interactive 3D map views that bring your destination to life before you even pack your bags.'
    },
    {
      icon: <ShieldCheck size={24} />,
      title: 'Seamless Sharing',
      description: 'Easily export your cinematic itineraries as beautiful PDFs via email, or generate secure share links for the whole group to view.'
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-48 pb-32 px-6 md:px-12 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gold/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-[1200px] mx-auto relative z-10">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-32"
        >
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-gold/10 border border-gold/20 mb-8">
            <Sparkles size={32} className="text-gold" />
          </div>
          <h1 className="font-display text-5xl md:text-7xl text-primary mb-6 tracking-wide font-light">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-goldLight to-gold font-normal">TripMind</span>
          </h1>
          <p className="font-sans text-primary/60 text-lg md:text-xl leading-relaxed font-light">
            TripMind AI is a state-of-the-art, AI-powered travel planning platform designed to effortlessly generate highly personalized, comprehensive group travel itineraries. Experience the next generation of seamless exploration.
          </p>
        </motion.div>

        {/* Specialties Grid */}
        <div className="mb-16">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display text-3xl text-primary text-center mb-16 tracking-[0.1em]"
          >
            Our Specialties
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {specialties.map((spec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-surface/30 border border-darkBorder hover:border-gold/30 rounded-2xl p-8 transition-all duration-500 group hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="w-14 h-14 rounded-full bg-black border border-white/10 flex items-center justify-center text-primary group-hover:text-gold group-hover:border-gold/30 transition-colors duration-500 mb-6">
                  {spec.icon}
                </div>
                
                <h3 className="font-display text-xl text-primary mb-4 tracking-wide">
                  {spec.title}
                </h3>
                
                <p className="font-sans text-sm text-primary/50 leading-relaxed font-light">
                  {spec.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-40 p-12 md:p-16 rounded-[40px] border border-gold/20 bg-[#0a0a0a] relative overflow-hidden text-center"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(196,163,90,0.15)_0%,transparent_70%)]" />
          <h2 className="relative z-10 font-display text-4xl md:text-5xl text-primary mb-6">
            Ready for your next journey?
          </h2>
          <p className="relative z-10 font-sans text-primary/60 mb-10 max-w-2xl mx-auto">
            Let our AI agents craft the perfect itinerary for you and your group. It only takes a few seconds.
          </p>
          <Link 
            to="/new-trip" 
            className="relative z-10 inline-flex items-center gap-3 bg-gradient-to-r from-gold via-goldLight to-gold text-black px-12 py-5 rounded-full text-sm font-bold uppercase tracking-[0.25em] hover:shadow-[0_0_40px_rgba(196,163,90,0.4)] transition-all hover:-translate-y-1"
          >
            Plan Your Journey <Sparkles size={16} />
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
