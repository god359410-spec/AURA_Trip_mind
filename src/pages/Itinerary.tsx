import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Info, CheckCircle, Navigation, CloudRain, Mail, Compass } from 'lucide-react';
import { useItineraryStore } from '../stores/itineraryStore';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { formatDayName, formatDateShort } from '../utils/dateUtils';
import { formatCurrency } from '../utils/currencyUtils';
import { fetchPlaceImage } from '../utils/imageUtils';

function ActivityCard({ act }: { act: any }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadImg() {
      const url = await fetchPlaceImage(act.name);
      if (url) {
        setImageUrl(url);
      }
    }
    loadImg();
  }, [act.name]);

  return (
    <div className="bg-surface/30 border border-darkBorder p-6 lg:p-8 flex flex-col md:flex-row gap-8 transition-all hover:bg-surface/50 hover:border-primary/20">
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <h4 className="font-display text-2xl font-light tracking-[0.02em] text-primary">{act.name}</h4>
            <span className="font-sans text-[0.65rem] font-medium tracking-[0.2em] uppercase text-gold bg-gold/5 px-3 py-1.5 border border-gold/20 self-start whitespace-nowrap">
              {act.estimatedCostPerPerson > 0 ? formatCurrency(act.estimatedCostPerPerson, act.currency) : 'Complimentary'}
            </span>
          </div>
          
          <p className="font-sans text-sm font-light leading-[1.8] text-primary/50 mb-8">{act.description}</p>
        </div>
        
        <div className="flex flex-wrap gap-6 font-sans text-[0.65rem] uppercase tracking-[0.15em] text-primary/40">
          <div className="flex items-center gap-2"><Clock size={14} className="text-gold/60" /> {act.duration}</div>
          {act.location && (
            <div className="flex items-center gap-2"><MapPin size={14} className="text-gold/60" /> {act.location.address}</div>
          )}
        </div>

        {/* Badges/Notes */}
        {(act.accessibilityNote || act.dietaryNote || act.bookingRequired || act.weatherAlternative) && (
          <div className="mt-8 pt-6 border-t border-darkBorder flex flex-col gap-3">
            {act.bookingRequired && <div className="flex items-center gap-3 text-warning text-[0.65rem] font-sans uppercase tracking-[0.1em]"><Info size={14} /> Advanced booking required</div>}
            {act.accessibilityNote && <div className="flex items-center gap-3 text-info text-[0.65rem] font-sans uppercase tracking-[0.1em]"><CheckCircle size={14} /> {act.accessibilityNote}</div>}
            {act.dietaryNote && <div className="flex items-center gap-3 text-success text-[0.65rem] font-sans uppercase tracking-[0.1em]"><CheckCircle size={14} /> {act.dietaryNote}</div>}
            {act.weatherAlternative && <div className="flex items-center gap-3 text-primary/40 text-[0.65rem] font-sans uppercase tracking-[0.1em]"><CloudRain size={14} /> Rain Alternative: {act.weatherAlternative}</div>}
          </div>
        )}
      </div>

      {imageUrl && (
        <div className="w-full md:w-48 lg:w-64 aspect-[4/3] md:aspect-square overflow-hidden shrink-0 border border-darkBorder">
          <img src={imageUrl} alt={act.name} className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110" />
        </div>
      )}
    </div>
  );
}

export default function ItineraryPage() {
  const { itinerary } = useItineraryStore();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(1);

  if (!itinerary || !itinerary.days || !Array.isArray(itinerary.days)) {
    return <div className="text-center py-20 font-sans text-sm font-light text-primary/40 uppercase tracking-[0.2em]">Curating your exclusive itinerary...</div>;
  }

  const currentDayData = itinerary.days.find(d => d.dayNumber === selectedDay);

  const handleSendEmail = () => {
    if (!user) {
      addToast({ type: 'warning', message: 'Please log in to email your itinerary.' });
      navigate('/login');
      return;
    }

    let emailText = `Trip to ${itinerary.destination}\n\nSummary:\n${itinerary.aiSummary}\n\n`;
    itinerary.days.forEach(day => {
      emailText += `--- Day ${day.dayNumber}: ${day.theme} ---\n`;
      day.activities.forEach(act => {
        emailText += `${act.time} - ${act.name}\n${act.description}\n\n`;
      });
    });
    
    emailText += `\nPowered by Trip Mind AI Aura TKS.`;

    const subject = encodeURIComponent(`Your Trip to ${itinerary.destination}`);
    const body = encodeURIComponent(emailText);
    window.location.href = `mailto:${user.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-12 items-start">
      
      {/* Sidebar: AI Summary & Days List */}
      <div className="sticky top-[160px]">
        <div className="bg-surface/50 border border-darkBorder p-8 mb-8 backdrop-blur-sm">
          <h3 className="font-sans text-[0.6rem] tracking-[0.3em] uppercase text-goldLight mb-6">Executive Summary</h3>
          <p className="font-sans text-sm font-light leading-[1.8] text-primary/60 mb-8">{itinerary.aiSummary}</p>
          <div className="pt-6 border-t border-darkBorder">
            <div className="font-sans text-[0.6rem] tracking-[0.2em] uppercase text-primary/40 mb-2">Total Est. Cost</div>
            <div className="font-display text-2xl text-primary">{formatCurrency(itinerary.totalEstimatedCost, itinerary.days[0]?.activities[0]?.currency || 'USD')}</div>
          </div>
          
          <button 
            onClick={handleSendEmail} 
            className="w-full mt-8 flex items-center justify-center gap-3 border border-gold/30 bg-gold/5 hover:bg-gold/10 text-gold px-6 py-3.5 text-[0.65rem] font-sans uppercase tracking-[0.25em] transition-colors"
          >
            <Mail size={14} /> Dispatch Itinerary
          </button>
        </div>

        <div className="bg-surface/30 border border-darkBorder py-4 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible no-scrollbar">
          {itinerary.days.map((day) => (
            <button
              key={day.dayNumber}
              onClick={() => setSelectedDay(day.dayNumber)}
              className={`min-w-[140px] lg:min-w-0 w-full text-left px-8 py-4 transition-all border-b-[3px] lg:border-b-0 lg:border-l-[3px] flex flex-col gap-2 ${
                selectedDay === day.dayNumber 
                ? 'border-gold bg-gold/5' 
                : 'border-transparent hover:bg-surface/50'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`font-sans text-[0.65rem] tracking-[0.2em] uppercase ${selectedDay === day.dayNumber ? 'text-gold' : 'text-primary/40'}`}>
                  Day {day.dayNumber}
                </span>
                <span className="font-sans text-[0.55rem] uppercase tracking-widest text-primary/30">{formatDateShort(day.date)}</span>
              </div>
              <span className={`font-display text-lg font-light tracking-[0.02em] truncate ${selectedDay === day.dayNumber ? 'text-primary' : 'text-primary/50'}`}>
                {day.theme}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Day Details */}
      <div>
        <AnimatePresence mode="wait">
          {currentDayData && (
            <motion.div
              key={currentDayData.dayNumber}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
            >
              <div className="mb-16">
                <div className="font-sans text-[0.65rem] tracking-[0.3em] uppercase text-goldLight mb-4">
                  {formatDayName(currentDayData.date)}, {formatDateShort(currentDayData.date)}
                </div>
                <h2 className="font-display text-4xl md:text-5xl font-light tracking-[0.02em] text-primary leading-tight">
                  Day {currentDayData.dayNumber}: {currentDayData.theme}
                </h2>
                
                {currentDayData.weatherNote && (
                  <div className="inline-flex items-center gap-3 mt-6 border border-info/30 bg-info/10 text-info px-6 py-3 text-[0.65rem] font-sans uppercase tracking-[0.1em]">
                    <CloudRain size={14} /> {currentDayData.weatherNote}
                  </div>
                )}
              </div>

              <div className="relative pl-6 lg:pl-10">
                {/* Timeline line */}
                <div className="absolute left-[70px] lg:left-[86px] top-6 bottom-6 w-px bg-darkBorder" />

                <div className="flex flex-col gap-12">
                  {currentDayData.activities.map((act, i) => (
                    <div key={i} className="flex gap-8 lg:gap-12 relative group">
                      {/* Timeline dot */}
                      <div className="w-3 h-3 rounded-full bg-background border-[1.5px] border-gold absolute left-[41px] lg:left-[41px] top-7 z-10 transition-transform duration-300 group-hover:scale-150 group-hover:bg-gold" />
                      
                      <div className="w-16 lg:w-20 pt-6 text-right font-sans text-[0.65rem] font-medium tracking-[0.15em] text-gold uppercase shrink-0">
                        {act.time}
                      </div>
                      
                      <ActivityCard act={act} />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transportation & Route Details Section */}
        {itinerary.routesAndTransit && itinerary.routesAndTransit.length > 0 && (
          <div className="mt-32 pt-16 border-t border-darkBorder">
            <div className="flex items-center gap-4 mb-12">
              <Navigation size={24} className="text-gold/60" />
              <div>
                <h3 className="font-display text-3xl font-light tracking-[0.02em] text-primary mb-2">Transit & Routes</h3>
                <p className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-primary/40">Navigate {itinerary.destination} effortlessly</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {itinerary.routesAndTransit.map((route, idx) => (
                <div key={idx} className="bg-surface/30 border border-darkBorder p-8 transition-colors hover:border-primary/20">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                    <span className="font-display text-xl text-primary font-light">
                      {route.from} <span className="text-gold mx-2">&rarr;</span> {route.to}
                    </span>
                    <span className="font-sans text-[0.55rem] font-medium uppercase tracking-[0.2em] text-gold bg-gold/5 px-3 py-1.5 border border-gold/20 self-start md:self-auto whitespace-nowrap">
                      {route.mode} • {route.duration}
                    </span>
                  </div>
                  <p className="font-sans text-sm font-light leading-[1.8] text-primary/50 mb-6">
                    {route.description}
                  </p>
                  {route.tips && (
                    <div className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-primary/40 flex items-center gap-3">
                      <Info size={14} className="text-gold/60" /> {route.tips}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explore Alternative Locations Section */}
        {itinerary.alternativeLocations && itinerary.alternativeLocations.length > 0 && (
          <div className="mt-20 pt-16 border-t border-darkBorder">
             <div className="flex items-center gap-4 mb-12">
              <Compass size={24} className="text-gold/60" />
              <div>
                <h3 className="font-display text-3xl font-light tracking-[0.02em] text-primary mb-2">Curated Escapes</h3>
                <p className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-primary/40">Alternative environs near {itinerary.destination}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {itinerary.alternativeLocations.map((loc, idx) => (
                <div key={idx} className="bg-surface/30 border border-darkBorder p-8 flex flex-col justify-between gap-8 transition-colors hover:border-primary/20">
                  <div>
                    <h4 className="font-display text-2xl font-light text-primary mb-3">{loc.name}</h4>
                    <div className="font-sans text-[0.55rem] uppercase tracking-[0.2em] text-goldLight mb-6">
                      Distance: {loc.distance}
                    </div>
                    <p className="font-sans text-sm font-light leading-[1.8] text-primary/50">
                      {loc.description}
                    </p>
                  </div>
                  <div className="pt-6 border-t border-darkBorder/50">
                    <div className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-primary/60 mb-6">
                      <span className="text-primary/30 mr-2">Route:</span> {loc.bestWayToGetThere}
                    </div>
                    {loc.highlights && loc.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-3">
                        {loc.highlights.map((hl, hIdx) => (
                          <span key={hIdx} className="font-sans text-[0.55rem] font-medium uppercase tracking-[0.2em] text-primary/40 bg-surface border border-darkBorder px-3 py-1.5">
                            {hl}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
