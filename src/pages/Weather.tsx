import { motion } from 'framer-motion';
import { Cloud, Sun, CloudRain, Wind, AlertTriangle, Droplets, Thermometer } from 'lucide-react';
import { useWeatherStore } from '../stores/weatherStore';
import { formatDayName, formatDateShort } from '../utils/dateUtils';
import SkeletonCard from '../components/common/SkeletonCard';

export default function WeatherPage() {
  const { forecast, alerts, isLoading } = useWeatherStore();

  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-3 gap-8"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>;
  }

  if (!forecast || forecast.days.length === 0) {
    return <div className="text-center py-20 font-sans text-sm font-light text-primary/40 uppercase tracking-[0.2em]">Atmospheric data unavailable for this destination/date range.</div>;
  }

  const getWeatherIcon = (iconId: string) => {
    if (iconId.includes('01') || iconId.includes('02')) return <Sun size={24} className="text-gold" />;
    if (iconId.includes('09') || iconId.includes('10')) return <CloudRain size={24} className="text-info" />;
    if (iconId.includes('50')) return <Wind size={24} className="text-primary/40" />;
    return <Cloud size={24} className="text-primary/60" />;
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-16">
        <h2 className="font-display text-4xl md:text-5xl font-light tracking-[0.02em] text-primary mb-4">Atmospheric Outlook</h2>
        <p className="font-sans text-sm font-light text-primary/40">Real-time weather telemetry for {forecast.city}, seamlessly integrated into your plans.</p>
      </div>

      {alerts.length > 0 && (
        <div className="mb-16 flex flex-col gap-4">
          {alerts.map((alert, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-6 border flex gap-4 items-start ${
              alert.severity === 'high' ? 'bg-danger/5 border-danger/20' : 'bg-warning/5 border-warning/20'
            }`}>
              <AlertTriangle size={16} className={`shrink-0 mt-0.5 ${alert.severity === 'high' ? 'text-danger' : 'text-warning'}`} />
              <div>
                <div className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-bold text-primary mb-2">Advisory Issued</div>
                <div className="font-sans text-xs font-light text-primary/70 leading-[1.6]">{alert.message}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
        {forecast.days.map((day, i) => (
          <motion.div 
            key={day.date} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }} 
            className={`p-6 text-center border transition-colors ${
              i === 0 
              ? 'bg-gold/5 border-gold/40 shadow-[0_0_30px_rgba(212,175,55,0.05)]' 
              : 'bg-surface/30 border-darkBorder hover:border-primary/20'
            }`}
          >
            {i === 0 && <div className="font-sans text-[0.55rem] uppercase tracking-[0.25em] text-gold mb-4">Current Outlook</div>}
            
            <div className="font-display text-lg text-primary tracking-wide mb-1">{formatDayName(day.date)}</div>
            <div className="font-sans text-[0.6rem] uppercase tracking-widest text-primary/40 mb-8">{formatDateShort(day.date)}</div>
            
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-surface/50 border border-darkBorder">
                {getWeatherIcon(day.condition.icon)}
              </div>
            </div>
            
            <div className="font-display text-4xl text-primary mb-1">
              {Math.round(day.tempMax)}°
            </div>
            <div className="font-sans text-[0.65rem] uppercase tracking-[0.1em] text-primary/40 mb-8">
              Low: {Math.round(day.tempMin)}°
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-darkBorder/50">
              <div className="flex flex-col items-center gap-2 font-sans text-[0.6rem] uppercase tracking-[0.1em] text-primary/50">
                <Droplets size={12} className="text-info/80" />
                {day.precipitationProbability}%
              </div>
              <div className="flex flex-col items-center gap-2 font-sans text-[0.6rem] uppercase tracking-[0.1em] text-primary/50">
                <Thermometer size={12} className="text-danger/60" />
                {Math.round(day.humidity)}%
              </div>
            </div>
            
            <div className="mt-8 font-sans text-xs font-light text-primary/80 capitalize">
              {day.condition.description}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
