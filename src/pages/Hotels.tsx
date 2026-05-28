import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, ExternalLink, Sparkles } from 'lucide-react';
import { useItineraryStore } from '../stores/itineraryStore';
import { formatCurrency } from '../utils/currencyUtils';
import { fetchPlaceImage } from '../utils/imageUtils';

function HotelCard({ hotel, i }: { hotel: any; i: number }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadImg() {
      const url = await fetchPlaceImage(`${hotel.name} hotel`);
      if (url) {
        setImageUrl(url);
      }
    }
    loadImg();
  }, [hotel.name]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: i * 0.1 }} 
      className="group bg-surface/30 border border-darkBorder flex flex-col transition-colors hover:border-primary/20"
    >
      {/* Hotel Image */}
      <div className="h-[250px] bg-surface relative overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={hotel.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-sans text-xs uppercase tracking-widest text-primary/20">
            Awaiting image...
          </div>
        )}
        <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md px-3 py-1.5 border border-gold/20 flex items-center gap-2">
          <Star size={12} className="text-gold" fill="currentColor" />
          <span className="font-sans text-[0.65rem] font-bold text-gold">{hotel.rating}</span>
        </div>
      </div>

      <div className="p-8 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2 gap-4">
          <h3 className="font-display text-2xl font-light text-primary">{hotel.name}</h3>
          <div className="flex gap-1 shrink-0 pt-1">
            {Array.from({ length: hotel.starRating }).map((_, idx) => <Star key={idx} size={10} className="text-gold" fill="currentColor" />)}
          </div>
        </div>
        
        <div className="flex items-center gap-2 font-sans text-[0.65rem] uppercase tracking-[0.15em] text-primary/40 mb-8">
          <MapPin size={12} className="text-gold/60" /> {hotel.distanceFromCenter}km from center
        </div>

        <div className="bg-gold/5 border border-gold/20 p-6 mb-8">
          <div className="flex items-center gap-2 font-sans text-[0.6rem] uppercase tracking-[0.2em] text-gold mb-3">
            <Sparkles size={12} /> AI Recommendation
          </div>
          <div className="font-sans text-xs font-light leading-[1.8] text-primary/60">{hotel.aiReasoningNote}</div>
        </div>

        <div className="mb-10">
          <div className="font-sans text-[0.55rem] uppercase tracking-[0.3em] text-primary/30 mb-4">Signature Amenities</div>
          <div className="flex flex-wrap gap-2">
            {hotel.amenities.slice(0, 4).map((a: string) => (
              <span key={a} className="font-sans text-[0.6rem] font-medium uppercase tracking-[0.1em] bg-surface border border-darkBorder text-primary/60 px-3 py-1.5">
                {a}
              </span>
            ))}
            {hotel.accessibilityFeatures?.slice(0, 2).map((a: string) => (
              <span key={a} className="font-sans text-[0.6rem] font-medium uppercase tracking-[0.1em] border border-info/30 text-info px-3 py-1.5">
                {a}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-8 border-t border-darkBorder flex justify-between items-end">
          <div>
            <div className="font-display text-2xl text-primary">
              {formatCurrency(hotel.pricePerNight, hotel.currency)}
              <span className="font-sans text-[0.6rem] uppercase tracking-widest text-primary/30 ml-2">/ night</span>
            </div>
            <div className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-goldLight mt-1">Total: {formatCurrency(hotel.totalPrice, hotel.currency)}</div>
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-gold text-background px-6 py-3 text-[0.6rem] font-sans uppercase tracking-[0.2em] transition-all">
            Reserve <ExternalLink size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function HotelsPage() {
  const { hotels } = useItineraryStore();

  if (!hotels || hotels.length === 0) {
    return <div className="text-center py-20 font-sans text-sm font-light text-primary/40 uppercase tracking-[0.2em]">No hotel recommendations available.</div>;
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-16">
        <h2 className="font-display text-4xl md:text-5xl font-light tracking-[0.02em] text-primary mb-4">Curated Stays</h2>
        <p className="font-sans text-sm font-light text-primary/40">Handpicked accommodations matching your budget, size, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {hotels.map((hotel, i) => (
          <HotelCard key={hotel.id} hotel={hotel} i={i} />
        ))}
      </div>
    </div>
  );
}
