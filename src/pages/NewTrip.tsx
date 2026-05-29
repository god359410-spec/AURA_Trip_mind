import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, DollarSign, Sparkles, Plus, Trash2, ArrowRight, ArrowLeft, Navigation, RefreshCw } from 'lucide-react';
import { Trip, TripStyle, AccommodationType, GroupMember, DietaryRestriction, AccessibilityNeed, getAgeCategory } from '../types/trip.types';
import { useTripStore } from '../stores/tripStore';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { useItineraryStore } from '../stores/itineraryStore';
import { useWeatherStore } from '../stores/weatherStore';
import { saveTrip } from '../services/supabase/trips';
import { useTripGeneration } from '../hooks/useTripGeneration';
import AIThinkingIndicator from '../components/common/AIThinkingIndicator';
import PlanRevealScreen from '../components/common/PlanRevealScreen';
import { getTodayISO, getMinEndDate } from '../utils/dateUtils';
import { TRIP_STYLES, ACCOMMODATION_TYPES, CURRENCIES, DIETARY_OPTIONS, ACCESSIBILITY_OPTIONS } from '../constants/ageCategories';

export default function NewTrip() {
  const [step, setStep] = useState(1);
  const [isLocating, setIsLocating] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [pendingTripId, setPendingTripId] = useState<string | null>(null);
  const [pendingTrip, setPendingTrip] = useState<Trip | null>(null);
  
  // Currency Converter State
  const [convAmount, setConvAmount] = useState<number>(1000);
  const [convBase, setConvBase] = useState('USD');
  const [convTarget, setConvTarget] = useState('EUR');
  const [convResult, setConvResult] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const { user } = useAuthStore();
  const { isGenerating, generationProgress, agentStatus } = useTripStore();
  const { itinerary, hotels, restaurants, packingList } = useItineraryStore();
  const weatherForecast = useWeatherStore(s => s.forecast);
  const { addToast } = useUIStore();
  const { generateTrip } = useTripGeneration();
  const navigate = useNavigate();

  // Form State
  const [destination, setDestination] = useState('');
  const [country, setCountry] = useState('');
  const [startDate, setStartDate] = useState(getTodayISO());
  const [endDate, setEndDate] = useState(getMinEndDate(getTodayISO()));
  const [totalBudget, setTotalBudget] = useState<number>(2000);
  const [currency, setCurrency] = useState('USD');
  const [tripStyle, setTripStyle] = useState<TripStyle>('mixed');
  const [accommodationType, setAccommodationType] = useState<AccommodationType>('mid-range');
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([
    {
      id: crypto.randomUUID(),
      name: user?.user_metadata?.full_name || '',
      age: 30,
      gender: 'Not Specified',
      ageCategory: 'young_adult',
      interests: [],
      dietaryRestrictions: [],
      accessibilityNeeds: [],
      isOrganizer: true,
    }
  ]);

  const addMember = () => {
    setGroupMembers([...groupMembers, {
      id: crypto.randomUUID(),
      name: '',
      age: 30,
      gender: 'Not Specified',
      ageCategory: 'young_adult',
      interests: [],
      dietaryRestrictions: [],
      accessibilityNeeds: [],
    }]);
  };

  const removeMember = (id: string) => {
    setGroupMembers(groupMembers.filter(m => m.id !== id));
  };

  const updateMember = (id: string, updates: Partial<GroupMember>) => {
    setGroupMembers(groupMembers.map(m => {
      if (m.id !== id) return m;
      const updated = { ...m, ...updates };
      if (updates.age !== undefined) {
        updated.ageCategory = getAgeCategory(updates.age);
      }
      return updated;
    }));
  };

  const toggleArrayItem = (id: string, field: 'interests' | 'dietaryRestrictions' | 'accessibilityNeeds', value: string) => {
    setGroupMembers(groupMembers.map(m => {
      if (m.id !== id) return m;
      const arr = m[field] as string[];
      return {
        ...m,
        [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
      };
    }));
  };

  const handleLiveLocation = () => {
    if (!navigator.geolocation) {
      addToast({ type: 'error', message: 'Geolocation is not supported by your browser' });
      return;
    }

    if (!window.confirm("Would you like to use your current location as the starting point?")) {
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        
        if (data.address) {
          const city = data.address.city || data.address.town || data.address.village || data.address.county || '';
          setDestination(city);
          addToast({ type: 'success', message: 'Starting point updated successfully!' });
        }
      } catch (error) {
        addToast({ type: 'error', message: 'Failed to fetch location details.' });
      } finally {
        setIsLocating(false);
      }
    }, () => {
      setIsLocating(false);
      addToast({ type: 'error', message: 'Could not get your location. Please allow location access.' });
    });
  };

  const handleConvertCurrency = async () => {
    if (!convAmount) return;
    setIsConverting(true);
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${convBase}`);
      const data = await response.json();
      if (data.rates && data.rates[convTarget]) {
        const rate = data.rates[convTarget];
        const result = (convAmount * rate).toFixed(2);
        setConvResult(`${convAmount} ${convBase} = ${result} ${convTarget}`);
      } else {
        addToast({ type: 'error', message: 'Conversion rate not found.' });
      }
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to fetch exchange rates.' });
    } finally {
      setIsConverting(false);
    }
  };

  const handleGenerate = async () => {
    if (!destination || !country) {
      addToast({ type: 'error', message: 'Please enter a destination and country.' });
      return;
    }
    if (groupMembers.some(m => !m.name)) {
      addToast({ type: 'error', message: 'Please provide names for all travelers.' });
      return;
    }

    const tripId = crypto.randomUUID();
    const newTrip: Trip = {
      id: tripId,
      userId: user?.id,
      destination,
      country,
      startDate,
      endDate,
      totalBudget,
      currency,
      tripStyle,
      accommodationType,
      groupMembers,
    };

    try {
      if (user) {
        try {
          await saveTrip(newTrip, user.id);
        } catch (dbErr) {
          console.error("Database save failed, proceeding with generation:", dbErr);
          addToast({ type: 'error', message: 'Failed to save to database, but generating your plan anyway...' });
        }
      }
      await generateTrip(newTrip);
      // Store trip info for the reveal screen
      setPendingTripId(tripId);
      setPendingTrip(newTrip);
      
      // Ensure the generated trip is available globally when we navigate
      useTripStore.getState().setCurrentTrip(newTrip);
      useTripStore.getState().addSavedTrip(newTrip);

      // Show the immersive plan reveal instead of navigating immediately
      setShowReveal(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Fallback: navigate if reveal triggered but itinerary not ready
  useEffect(() => {
    if (showReveal && pendingTripId && !itinerary) {
      navigate(`/trip/${pendingTripId}`);
    }
  }, [showReveal, pendingTripId, itinerary, navigate]);

  if (isGenerating) {
    return (
      <AIThinkingIndicator progress={generationProgress} agentStatus={agentStatus} />
    );
  }
  // Plan reveal screen — shown after generation, before navigating to trip detail
  if (showReveal && pendingTripId && pendingTrip && itinerary) {
    return (
      <PlanRevealScreen
        itinerary={itinerary}
        trip={pendingTrip}
        user={user}
        hotels={hotels}
        restaurants={restaurants}
        packingList={packingList}
        weatherForecast={weatherForecast}
        onNavigate={() => navigate(`/trip/${pendingTripId}`)}
        onLoginRequest={() => navigate('/login')}
      />
    );
  }


  return (
    <div className="font-body min-h-screen pt-24 pb-24 px-6 flex flex-col items-center justify-center bg-gradient-to-b from-[#1c1c1c] to-[#0a0a0a]">
      <div className="w-full max-w-4xl flex flex-col items-center">
        
        {/* Progress header */}
        <div className="mb-16 text-center">
          <div className="flex justify-center gap-2 mb-8 max-w-[200px] mx-auto">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-[1px] flex-1 transition-colors duration-500 ${s <= step ? 'bg-gold' : 'bg-darkBorder'}`} />
            ))}
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-light text-primary mb-4 tracking-[0.02em]">
            {step === 1 && 'Where are you going?'}
            {step === 2 && 'Who is traveling?'}
            {step === 3 && 'Budget & Style'}
          </h1>
          <p className="text-primary/50 text-sm font-light max-w-lg mx-auto">
            {step === 1 && 'Set the destination and travel dates for your upcoming journey.'}
            {step === 2 && 'Tell our AI about everyone so we can personalize the itinerary.'}
            {step === 3 && 'Final details so we can optimize your spending.'}
          </p>
        </div>

        <div className="bg-surface/30 border border-darkBorder backdrop-blur-md p-8 md:p-16 relative overflow-hidden">
          {/* Subtle glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gold/5 blur-[100px] pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {/* STEP 1: DESTINATION & DATES */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
                <div className="max-w-2xl mx-auto flex flex-col gap-10">
                  
                  <div className="flex justify-center -mb-4">
                    <button 
                      onClick={handleLiveLocation}
                      disabled={isLocating}
                      className="flex items-center gap-2 text-goldLight hover:text-gold text-[0.7rem] font-sans uppercase tracking-[0.2em] transition-colors disabled:opacity-50"
                    >
                      {isLocating ? <RefreshCw size={14} className="animate-spin" /> : <Navigation size={14} />}
                      Use Live Location
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-3 items-center">
                      <label className="text-[0.7rem] font-sans text-primary/70 uppercase tracking-[0.2em]">Starting Point</label>
                      <input type="text" placeholder="e.g., Tokyo" value={destination} onChange={e => setDestination(e.target.value)} 
                             className="w-full bg-black/40 border border-white/10 rounded-lg py-4 px-6 text-center text-lg text-white focus:outline-none focus:border-gold/50 focus:bg-black/60 transition-all placeholder:text-white/20 shadow-inner" />
                    </div>
                    <div className="flex flex-col gap-3 items-center">
                      <label className="text-[0.7rem] font-sans text-primary/70 uppercase tracking-[0.2em]">Destination City</label>
                      <input type="text" placeholder="e.g., Kyoto" value={country} onChange={e => setCountry(e.target.value)} 
                             className="w-full bg-black/40 border border-white/10 rounded-lg py-4 px-6 text-center text-lg text-white focus:outline-none focus:border-gold/50 focus:bg-black/60 transition-all placeholder:text-white/20 shadow-inner" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-3 items-center">
                      <label className="text-[0.7rem] font-sans text-primary/70 uppercase tracking-[0.2em]">Arrival Date</label>
                      <input type="date" value={startDate} min={getTodayISO()} onChange={e => {
                        setStartDate(e.target.value);
                        if (e.target.value >= endDate) setEndDate(getMinEndDate(e.target.value));
                      }} className="w-full bg-black/40 border border-white/10 rounded-lg py-4 px-6 text-center text-lg text-white focus:outline-none focus:border-gold/50 focus:bg-black/60 transition-all shadow-inner" style={{ colorScheme: 'dark' }} />
                    </div>
                    <div className="flex flex-col gap-3 items-center">
                      <label className="text-[0.7rem] font-sans text-primary/70 uppercase tracking-[0.2em]">Departure Date</label>
                      <input type="date" value={endDate} min={getMinEndDate(startDate)} onChange={e => setEndDate(e.target.value)} 
                             className="w-full bg-black/40 border border-white/10 rounded-lg py-4 px-6 text-center text-lg text-white focus:outline-none focus:border-gold/50 focus:bg-black/60 transition-all shadow-inner" style={{ colorScheme: 'dark' }} />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center mt-16 pt-8 border-t border-white/5">
                  <button onClick={() => setStep(2)} disabled={!destination || !country} 
                          className="flex items-center gap-3 bg-gradient-to-r from-gold via-goldLight to-gold text-black px-12 py-4 rounded-full text-[0.8rem] font-bold uppercase tracking-[0.25em] transition-all disabled:opacity-30 disabled:grayscale hover:shadow-[0_0_30px_rgba(196,163,90,0.3)] hover:-translate-y-1">
                    Next Step <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: GROUP MEMBERS */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
                <div className="flex flex-col gap-8">
                  {groupMembers.map((member, index) => (
                    <div key={member.id} className="bg-surface/30 border border-darkBorder rounded-xl p-8 relative group">
                      {index > 0 && (
                        <button onClick={() => removeMember(member.id)} className="absolute top-4 right-4 text-primary/20 hover:text-danger transition-colors">
                          <Trash2 size={16} />
                        </button>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="flex flex-col gap-3">
                          <label className="text-[0.6rem] font-sans text-primary/40 uppercase tracking-[0.2em]">Traveler Name</label>
                          <input type="text" placeholder="Name" value={member.name} onChange={e => updateMember(member.id, { name: e.target.value })} 
                                 className="w-full bg-surface/50 border border-darkBorder rounded-lg py-3 px-5 text-sm text-primary focus:outline-none focus:border-gold/50 transition-colors placeholder:text-primary/20" />
                        </div>
                        <div className="flex flex-col gap-3">
                          <label className="text-[0.6rem] font-sans text-primary/40 uppercase tracking-[0.2em]">Age</label>
                          <input type="number" min="0" max="120" value={member.age} onChange={e => updateMember(member.id, { age: parseInt(e.target.value) || 0 })} 
                                 className="w-full bg-surface/50 border border-darkBorder rounded-lg py-3 px-5 text-sm text-primary focus:outline-none focus:border-gold/50 transition-colors" />
                        </div>
                        <div className="flex flex-col gap-3">
                          <label className="text-[0.6rem] font-sans text-primary/40 uppercase tracking-[0.2em]">Gender</label>
                          <select value={member.gender || 'Not Specified'} onChange={e => updateMember(member.id, { gender: e.target.value })}
                                  className="w-full bg-surface/50 border border-darkBorder rounded-lg py-3 px-5 text-sm text-primary focus:outline-none focus:border-gold/50 transition-colors [&>option]:text-background">
                            <option value="Not Specified">Not Specified</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="mb-8">
                        <label className="block text-[0.6rem] font-sans text-primary/40 uppercase tracking-[0.2em] mb-4">Dietary Restrictions</label>
                        <div className="flex flex-wrap gap-3">
                          {DIETARY_OPTIONS.map(opt => (
                            <button
                              key={opt.value} type="button" onClick={() => toggleArrayItem(member.id, 'dietaryRestrictions', opt.value as DietaryRestriction)}
                              className={`px-5 py-3 rounded-full text-[0.7rem] tracking-[0.1em] uppercase transition-all border ${
                                member.dietaryRestrictions.includes(opt.value as DietaryRestriction)
                                  ? 'bg-gold/10 text-gold border-gold/50 shadow-[0_0_15px_rgba(196,163,90,0.2)]'
                                  : 'bg-transparent text-primary/60 border-darkBorder hover:border-primary/40 hover:bg-white/5'
                              }`}
                            >
                              {opt.emoji} {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[0.6rem] font-sans text-primary/40 uppercase tracking-[0.2em] mb-4">Accessibility Needs</label>
                        <div className="flex flex-wrap gap-3">
                          {ACCESSIBILITY_OPTIONS.map(opt => (
                            <button
                              key={opt.value} type="button" onClick={() => toggleArrayItem(member.id, 'accessibilityNeeds', opt.value as AccessibilityNeed)}
                              className={`px-5 py-3 rounded-full text-[0.7rem] tracking-[0.1em] uppercase transition-all border flex items-center gap-2 ${
                                member.accessibilityNeeds.includes(opt.value as AccessibilityNeed)
                                  ? 'bg-gold/10 text-gold border-gold/50 shadow-[0_0_15px_rgba(196,163,90,0.2)]'
                                  : 'bg-transparent text-primary/60 border-darkBorder hover:border-primary/40 hover:bg-white/5'
                              }`}
                            >
                              {opt.icon} {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-start">
                    <button onClick={addMember} className="flex items-center gap-2 text-[0.7rem] font-sans uppercase tracking-[0.2em] text-gold hover:text-goldLight transition-colors hover:bg-gold/10 px-6 py-3 rounded-full border border-gold/20">
                      <Plus size={14} /> Add Another Traveler
                    </button>
                  </div>

                  <div className="flex justify-between mt-12 pt-8 border-t border-white/5">
                    <button onClick={() => setStep(1)} className="flex items-center gap-2 text-primary/60 hover:text-primary transition-colors text-[0.75rem] font-bold uppercase tracking-[0.2em]">
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button onClick={() => setStep(3)} className="flex items-center gap-3 bg-gradient-to-r from-gold via-goldLight to-gold text-black px-12 py-4 rounded-full text-[0.8rem] font-bold uppercase tracking-[0.25em] transition-all hover:shadow-[0_0_30px_rgba(196,163,90,0.3)] hover:-translate-y-1">
                      Next Step <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: BUDGET & STYLE */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
                <div className="flex flex-col gap-12">
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex flex-col gap-3">
                      <label className="text-[0.65rem] font-sans text-primary/50 uppercase tracking-[0.2em]">Currency</label>
                      <select value={currency} onChange={e => setCurrency(e.target.value)} 
                              className="w-full bg-surface/50 border border-darkBorder rounded-none py-3.5 px-4 text-sm text-primary focus:outline-none focus:border-gold/50 transition-colors [&>option]:text-background">
                        {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-3 md:col-span-2">
                      <label className="text-[0.65rem] font-sans text-primary/50 uppercase tracking-[0.2em]">Total Group Budget (Excl. Flights)</label>
                      <div className="relative">
                        <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/60" />
                        <input type="number" min="0" value={totalBudget} onChange={e => setTotalBudget(parseInt(e.target.value) || 0)} 
                               className="w-full bg-surface/50 border border-darkBorder rounded-none py-3.5 pl-12 pr-4 text-lg text-primary focus:outline-none focus:border-gold/50 transition-colors" />
                      </div>
                    </div>
                  </div>

                  {/* Currency Converter Widget */}
                  <div className="bg-surface/30 border border-darkBorder p-8 relative">
                    <label className="block text-[0.65rem] font-sans text-primary/50 uppercase tracking-[0.2em] mb-6">Quick Currency Converter</label>
                    <div className="flex flex-col md:flex-row items-end gap-4">
                      <div className="flex flex-col gap-3 w-full md:w-1/3">
                        <label className="text-[0.55rem] font-sans text-primary/40 uppercase tracking-[0.15em]">Amount</label>
                        <input type="number" value={convAmount} onChange={e => setConvAmount(parseFloat(e.target.value) || 0)} 
                               className="w-full bg-surface/50 border border-darkBorder py-2.5 px-4 text-sm text-primary focus:outline-none focus:border-gold/50 transition-colors" />
                      </div>
                      <div className="flex flex-col gap-3 w-full md:w-1/4">
                        <label className="text-[0.55rem] font-sans text-primary/40 uppercase tracking-[0.15em]">From</label>
                        <select value={convBase} onChange={e => setConvBase(e.target.value)} 
                                className="w-full bg-surface/50 border border-darkBorder py-2.5 px-4 text-sm text-primary focus:outline-none focus:border-gold/50 transition-colors [&>option]:text-background">
                          {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-3 w-full md:w-1/4">
                        <label className="text-[0.55rem] font-sans text-primary/40 uppercase tracking-[0.15em]">To</label>
                        <select value={convTarget} onChange={e => setConvTarget(e.target.value)} 
                                className="w-full bg-surface/50 border border-darkBorder py-2.5 px-4 text-sm text-primary focus:outline-none focus:border-gold/50 transition-colors [&>option]:text-background">
                          {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                        </select>
                      </div>
                      <button onClick={handleConvertCurrency} disabled={isConverting} className="w-full md:w-auto bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20 px-6 py-2.5 text-[0.65rem] uppercase tracking-[0.2em] transition-colors disabled:opacity-50">
                        {isConverting ? <RefreshCw size={14} className="animate-spin" /> : 'Convert'}
                      </button>
                    </div>
                    {convResult && (
                      <div className="mt-6 p-4 border border-gold/20 bg-gold/5 text-center font-sans text-sm tracking-widest text-gold">
                        {convResult}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[0.65rem] font-sans text-primary/50 uppercase tracking-[0.2em] mb-6">Accommodation Preference</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {ACCOMMODATION_TYPES.map(type => (
                        <div
                          key={type.value} onClick={() => setAccommodationType(type.value as AccommodationType)}
                          className={`p-6 border cursor-pointer text-center transition-all ${
                            accommodationType === type.value 
                            ? 'border-gold bg-gold/5' 
                            : 'border-darkBorder bg-surface/50 hover:border-primary/30'
                          }`}
                        >
                          <div className={`text-xl font-light mb-3 ${accommodationType === type.value ? 'text-gold' : 'text-primary/30'}`}>{type.priceIndicator}</div>
                          <div className="text-[0.65rem] font-sans uppercase tracking-[0.1em] text-primary">{type.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[0.65rem] font-sans text-primary/50 uppercase tracking-[0.2em] mb-6">Overall Trip Vibe</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {TRIP_STYLES.map(style => (
                        <div
                          key={style.value} onClick={() => setTripStyle(style.value as TripStyle)}
                          className={`p-6 border cursor-pointer text-center transition-all ${
                            tripStyle === style.value 
                            ? 'border-gold bg-gold/5' 
                            : 'border-darkBorder bg-surface/50 hover:border-primary/30'
                          }`}
                        >
                          <div className={`text-2xl mb-3 ${tripStyle === style.value ? 'opacity-100' : 'opacity-40'}`}>{style.icon}</div>
                          <div className="text-[0.65rem] font-sans uppercase tracking-[0.1em] text-primary">{style.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                <div className="flex justify-center items-center mt-16 pt-8 border-t border-white/5 relative">
                  <button onClick={() => setStep(2)} className="absolute left-0 flex items-center gap-2 text-primary/50 hover:text-white text-[0.7rem] font-sans uppercase tracking-[0.2em] transition-colors">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button onClick={handleGenerate} className="flex items-center gap-3 bg-gradient-to-r from-gold via-goldLight to-gold text-black px-12 py-4 rounded-full text-[0.8rem] font-bold uppercase tracking-[0.25em] transition-all hover:shadow-[0_0_30px_rgba(196,163,90,0.3)] hover:-translate-y-1">
                    <Sparkles size={16} /> Generate AI Plan
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
