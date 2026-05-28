import { motion, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, ArrowRight, Compass, Users, Sparkles, Shield, Utensils, MapPin } from 'lucide-react';
import { MouseEvent, useEffect } from 'react';
import Particles from '../components/common/Particles';
import ImageSequenceBackground from '../components/common/ImageSequenceBackground';

export default function Landing() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const yHeroText = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacityHeroText = useTransform(scrollYProgress, [0, 0.2], [1, 0]);


  // Mouse Parallax Effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 100, mass: 1 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const parallaxX = useTransform(smoothMouseX, [0, window.innerWidth], [-20, 20]);
  const parallaxY = useTransform(smoothMouseY, [0, window.innerHeight], [-20, 20]);
  
  const handleMouseMove = (e: MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      }
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }
  };

  return (
    <div className="bg-background text-primary overflow-hidden" onMouseMove={handleMouseMove}>
      
      {/* ── CINEMATIC HERO SECTION ── */}
      <section className="relative h-[100svh] flex items-center justify-center overflow-hidden bg-background">
        {/* Image Sequence Background */}
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ x: parallaxX, y: parallaxY }}
        >
          <ImageSequenceBackground frameCount={410} folderPath="/bg-sequence" fps={15} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(196,163,90,0.15)_0%,transparent_60%)] mix-blend-screen pointer-events-none" />
        </motion.div>
        
        <Particles count={40} />

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 z-[5] pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />
        
        {/* Blur-to-focus load wrapper */}
        <motion.div 
          initial={{ filter: 'blur(20px)', scale: 1.1 }}
          animate={{ filter: 'blur(0px)', scale: 1 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          style={{ y: yHeroText, opacity: opacityHeroText }}
          className="relative z-10 w-full pt-32 pb-24 flex flex-col items-center justify-center text-center px-4"
        >
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center"
          >
            <motion.span 
              variants={staggerItem}
              className="font-sans text-[0.65rem] md:text-xs tracking-[0.4em] uppercase text-goldLight mb-6 block drop-shadow-[0_0_15px_rgba(196,163,90,0.5)]"
            >
              The Future of Travel
            </motion.span>
            
            <motion.h1 
              variants={staggerItem}
              className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-light tracking-[0.08em] uppercase text-primary leading-[0.9] drop-shadow-2xl mb-12 relative"
            >
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-b from-white via-primary to-primary/70">
                TripMind AI
              </span>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,transparent_60%)] blur-2xl pointer-events-none" />
            </motion.h1>
            
            <motion.div variants={staggerItem} className="flex justify-center items-center relative z-20 mt-4">
              <div className="relative group">
                {/* Continuous glowing ambient background */}
                <div className="absolute -inset-1 bg-gradient-to-r from-gold via-goldLight to-gold rounded-sm blur-md opacity-40 group-hover:opacity-70 transition duration-1000 group-hover:duration-500 animate-[pulse_3s_ease-in-out_infinite]" />
                
                <button 
                  onClick={() => navigate('/new-trip')} 
                  className="relative overflow-hidden font-sans text-[0.7rem] md:text-xs font-semibold tracking-[0.3em] uppercase px-16 py-6 bg-background/80 backdrop-blur-xl border border-gold/50 text-goldLight transition-all duration-500 hover:bg-gold hover:text-background hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(196,163,90,0.6)] rounded-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] skew-x-[-30deg] group-hover:animate-[shine_1.5s_ease-in-out]" />
                  Start Planning Free
                </button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-4"
        >
          <span className="font-sans text-[0.6rem] tracking-[0.3em] uppercase text-primary/40">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-primary/50 to-transparent animate-[pulse_2s_ease-in-out_infinite]" />
        </motion.div>
      </section>



      {/* ── MARQUEE DIVIDER ── */}
      <section className="relative bg-background py-10 overflow-hidden border-y border-darkBorder/50 z-20">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10" />
        <div className="flex gap-16 whitespace-nowrap animate-[marqueeScroll_40s_linear_infinite]">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="font-display text-xl md:text-3xl font-light tracking-[0.15em] uppercase text-primary/20 flex items-center gap-16">
              <span className="hover:text-primary/40 transition-colors duration-500 cursor-default">Intelligent Group Travel</span>
              <div className="w-1.5 h-1.5 rounded-full bg-gold/30 shadow-[0_0_10px_rgba(196,163,90,0.5)]" />
              <span className="hover:text-primary/40 transition-colors duration-500 cursor-default">7 AI Agents</span>
              <div className="w-1.5 h-1.5 rounded-full bg-gold/30 shadow-[0_0_10px_rgba(196,163,90,0.5)]" />
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES STRIP ── */}
      <section className="relative bg-background py-32 px-6 md:px-12 overflow-hidden z-20 flex flex-col items-center">
        <div className="w-full max-w-[1400px] flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-24 w-full"
          >
            <div className="font-sans text-[0.65rem] tracking-[0.35em] uppercase text-goldLight mb-6">The TripMind Advantage</div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-7xl font-light tracking-[0.06em] text-primary drop-shadow-lg">Elevate Your Adventure</h2>
          </motion.div>

          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12 px-4 md:px-12 lg:px-20 max-w-[1300px]">
            {[
              { title: 'Group Intelligence', desc: "Analyzes everyone's needs for a perfect plan.", img: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=800' },
              { title: 'Perfect Hotel Match', desc: 'Curated for accessibility and family amenities.', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800' },
              { title: 'Food Discovery', desc: 'Satisfies every dietary restriction in the group.', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800' },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 1.2, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden group cursor-pointer rounded-2xl shadow-2xl bg-darkBorder/20 border border-white/5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                style={{ perspective: 1000 }}
              >
                <motion.div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110" 
                  style={{ backgroundImage: `url(${feature.img})` }} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent z-10 transition-opacity duration-700 group-hover:opacity-80" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 z-20 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="font-sans text-[0.6rem] tracking-[0.3em] uppercase text-goldLight mb-4 flex items-center gap-2">
                    <Sparkles size={10} className="text-gold animate-pulse" />
                    AI Powered
                  </div>
                  <h3 className="font-display text-3xl md:text-4xl font-light tracking-[0.04em] text-primary mb-4 drop-shadow-md">{feature.title}</h3>
                  <div className="overflow-hidden">
                    <p className="font-sans text-sm font-light leading-[1.8] text-primary/60 max-w-[280px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SANCTUARY SPLIT SECTION ── */}
      <section className="relative bg-background overflow-hidden border-t border-darkBorder/30 z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
          <motion.div 
            initial={{ opacity: 0, scale: 1.05 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="relative overflow-hidden min-h-[60vh] lg:min-h-0 group"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[3s] group-hover:scale-105"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/80" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent lg:hidden" />
            
            <div className="absolute bottom-12 left-6 lg:left-12 z-10 transition-transform duration-500 group-hover:-translate-y-2">
              <div className="bg-background/40 backdrop-blur-xl border border-white/10 px-8 py-6 max-w-[320px] rounded-sm shadow-2xl">
                <div className="font-sans text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                  Powered by 7 AI Agents
                </div>
                <p className="font-sans text-sm font-light text-primary/80 leading-[1.8]">Each specialist agent handles a different aspect of your trip planning in absolute harmony.</p>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col justify-center px-8 py-24 md:px-16 lg:px-24 bg-background relative">
            <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-gold/10 blur-[150px] pointer-events-none rounded-full -translate-y-1/2 mix-blend-screen" />
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10"
            >
              <div className="font-sans text-[0.65rem] tracking-[0.35em] uppercase text-goldLight mb-8">Seamless Integration</div>
              <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-light tracking-[0.06em] text-primary leading-[1.1] mb-8">
                A Symphony of Specialized Agents
              </h2>
              <p className="font-sans text-base font-light leading-[1.9] text-primary/60 max-w-xl mb-12">
                Planning a trip for multiple people used to be a nightmare of spreadsheets and endless group chats. From finding the perfect accommodations to discovering hidden gems that fit your exact budget, our agents work in harmony to craft the ultimate itinerary in seconds.
              </p>

              <div className="grid grid-cols-2 gap-8 mb-16">
                {[
                  { icon: <Compass size={18} />, label: 'Route Planner' },
                  { icon: <Users size={18} />, label: 'Group Analyst' },
                  { icon: <Shield size={18} />, label: 'Safety Agent' },
                  { icon: <Utensils size={18} />, label: 'Food Curator' },
                ].map((agent, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-4 text-primary/80 cursor-default group"
                  >
                    <div className="w-10 h-10 rounded-full border border-gold/20 bg-gold/5 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-background transition-all duration-300">
                      {agent.icon}
                    </div>
                    <span className="font-sans text-sm font-light tracking-wide">{agent.label}</span>
                  </motion.div>
                ))}
              </div>

              <div className="w-24 h-[1px] bg-gradient-to-r from-gold/50 to-transparent mb-12" />
              <button onClick={() => navigate('/new-trip')} className="group flex items-center gap-4 font-sans text-[0.75rem] font-medium tracking-[0.25em] uppercase text-gold transition-colors hover:text-goldLight">
                Explore The Magic
                <ArrowRight size={18} className="transition-transform duration-500 group-hover:translate-x-3" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative bg-background py-40 px-6 md:px-12 border-t border-darkBorder/30 overflow-hidden z-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(196,163,90,0.05)_0%,transparent_60%)] pointer-events-none mix-blend-screen" />
        
        <div className="max-w-[1400px] mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-32"
          >
            <div className="font-sans text-[0.65rem] tracking-[0.35em] uppercase text-goldLight mb-6">How It Works</div>
            <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-light tracking-[0.06em] text-primary drop-shadow-md">Three Steps to Perfection</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12 lg:gap-24 relative px-4 lg:px-12 max-w-[1200px] mx-auto">
            {/* Desktop Connector Line */}
            <div className="hidden md:block absolute top-[4.5rem] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
            
            {[
              { step: '01', title: 'Define Your Journey', desc: 'Set your destination, travel dates, group size, and budget. Our AI starts working immediately.', icon: <MapPin size={24} /> },
              { step: '02', title: 'AI Crafts Your Plan', desc: 'Seven specialized agents collaborate to build the perfect itinerary, hotels, dining, and packing list.', icon: <Sparkles size={24} /> },
              { step: '03', title: 'Travel With Confidence', desc: 'Download your plan, share with your group, and enjoy real-time weather and budget tracking.', icon: <Compass size={24} /> },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 1, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-col items-center text-center group"
              >
                <div className="relative mb-12">
                  <div className="font-display text-[7rem] font-light text-gold/5 leading-none select-none transition-colors duration-700 group-hover:text-gold/10">
                    {item.step}
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-background border border-gold/30 flex items-center justify-center text-gold shadow-[0_0_20px_rgba(196,163,90,0.1)] group-hover:shadow-[0_0_30px_rgba(196,163,90,0.3)] group-hover:scale-110 transition-all duration-500">
                    {item.icon}
                  </div>
                </div>
                
                <h3 className="font-display text-3xl font-light tracking-[0.04em] text-primary mb-6">{item.title}</h3>
                <p className="font-sans text-base font-light leading-[1.9] text-primary/50 max-w-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ESCAPE CTA SECTION ── */}
      <section className="relative min-h-[70vh] py-32 flex items-center justify-center overflow-hidden z-20">
        <motion.div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2621')",
            y: useTransform(scrollYProgress, [0.8, 1], ['-20%', '0%']) // Parallax background
          }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/30 to-background mix-blend-multiply" />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 text-center px-4 flex flex-col items-center w-full max-w-5xl mx-auto"
        >
          <div className="w-16 h-16 rounded-full border border-gold/30 flex items-center justify-center text-gold mb-12 shadow-[0_0_30px_rgba(196,163,90,0.2)]">
            <Sparkles size={24} />
          </div>
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-light tracking-[0.1em] text-white uppercase mb-16 drop-shadow-[0_10px_40px_rgba(0,0,0,1)]">
            Design Your Journey
          </h2>
          <button onClick={() => navigate('/new-trip')} className="group relative overflow-hidden font-sans text-[0.8rem] font-bold tracking-[0.35em] uppercase px-16 py-6 border border-gold/50 bg-gold/10 backdrop-blur-md text-goldLight transition-all duration-700 hover:border-gold hover:-translate-y-2 hover:shadow-[0_0_50px_rgba(196,163,90,0.5)] rounded-sm">
            <div className="absolute inset-0 bg-gold/20 translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:translate-y-0" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] skew-x-[-30deg] group-hover:animate-[shine_1.5s_ease-in-out]" />
            <span className="relative z-10 flex items-center gap-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              Start Planning Now <ArrowRight size={18} className="transition-transform group-hover:translate-x-3" />
            </span>
          </button>
        </motion.div>
      </section>
      
    </div>
  );
}
