import { motion } from 'framer-motion';
import { Check, Circle } from 'lucide-react';
import { useItineraryStore } from '../stores/itineraryStore';

export default function PackingListPage() {
  const { packingList, togglePackingItem } = useItineraryStore();

  if (!packingList) {
    return <div className="text-center py-20 font-sans text-sm font-light text-primary/40 uppercase tracking-[0.2em]">Inventory specification unavailable.</div>;
  }

  const calculateProgress = () => {
    let total = 0;
    let packed = 0;
    packingList.categories.forEach(cat => {
      total += cat.items.length;
      packed += cat.items.filter(i => i.packed).length;
    });
    return { total, packed, percent: total === 0 ? 0 : Math.round((packed / total) * 100) };
  };

  const progress = calculateProgress();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 items-start">
      
      <div>
        <div className="mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-light tracking-[0.02em] text-primary mb-4">Preparation Manifest</h2>
          <p className="font-sans text-sm font-light text-primary/40">Intelligently curated for your destination's climate and activities.</p>
        </div>

        <div className="flex flex-col gap-10">
          {packingList.categories.map((cat, i) => (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-surface/30 border border-darkBorder p-8">
              <h3 className="font-display text-2xl font-light tracking-[0.02em] text-primary mb-8 flex items-center gap-4">
                <span className="text-gold/60">{cat.icon}</span> {cat.name}
              </h3>
              
              <div className="flex flex-col">
                {cat.items.map((item, itemIdx) => (
                  <label key={item.id} className={`flex items-start gap-4 cursor-pointer py-4 transition-colors hover:bg-surface/50 group ${itemIdx !== cat.items.length - 1 ? 'border-b border-darkBorder/50' : ''}`}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent double trigger with label
                        togglePackingItem(cat.id, item.id);
                      }}
                      className="mt-0.5 shrink-0 transition-colors"
                    >
                      {item.packed 
                        ? <div className="w-5 h-5 rounded-full bg-gold/20 border border-gold flex items-center justify-center text-gold"><Check size={12} strokeWidth={3} /></div> 
                        : <div className="w-5 h-5 rounded-full border border-darkBorder group-hover:border-gold/50 flex items-center justify-center text-transparent"><Circle size={12} /></div>
                      }
                    </button>
                    <div className="flex-1">
                      <div className={`font-sans text-sm font-medium tracking-wide transition-colors ${item.packed ? 'text-primary/30 line-through' : 'text-primary'}`}>
                        {item.name} {item.essential && <span className="text-danger/80 ml-1 text-lg leading-none">*</span>}
                      </div>
                      {item.notes && <div className={`font-sans text-[0.65rem] uppercase tracking-[0.1em] mt-2 transition-colors ${item.packed ? 'text-primary/20' : 'text-primary/50'}`}>{item.notes}</div>}
                    </div>
                  </label>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div className="sticky top-[160px] flex flex-col gap-8">
        {/* Progress Card */}
        <div className="bg-surface/30 border border-darkBorder p-8">
          <h3 className="font-sans text-[0.65rem] tracking-[0.3em] uppercase text-goldLight mb-8">Acquisition Status</h3>
          <div className="flex justify-between mb-4">
            <span className="font-sans text-xs font-light text-primary/50">Packed: <span className="text-primary font-medium ml-1">{progress.packed}/{progress.total}</span></span>
            <span className="font-sans text-xs font-bold text-gold">{progress.percent}%</span>
          </div>
          <div className="h-[2px] bg-darkBorder w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-gold transition-all duration-500 ease-out" style={{ width: `${progress.percent}%` }} />
          </div>
        </div>

        {/* Notes */}
        <div className="bg-surface/30 border border-darkBorder p-8 flex flex-col gap-8">
          <div>
            <div className="font-sans text-[0.55rem] uppercase tracking-[0.2em] font-bold text-info mb-3">Meteorological Advisory</div>
            <div className="font-sans text-xs font-light text-primary/60 leading-[1.8]">{packingList.weatherNote}</div>
          </div>
          
          <div className="pt-8 border-t border-darkBorder">
            <div className="font-sans text-[0.55rem] uppercase tracking-[0.2em] font-bold text-secondary mb-3">Contextual Briefing</div>
            <div className="font-sans text-xs font-light text-primary/60 leading-[1.8]">{packingList.destinationNote}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
