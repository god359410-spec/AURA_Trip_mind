import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, MapPin, Calendar, Users, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useTripStore } from '../stores/tripStore';
import { loadTrips } from '../services/supabase/trips';
import { Trip } from '../types/trip.types';
import { formatDateShort } from '../utils/dateUtils';
import SkeletonCard from '../components/common/SkeletonCard';
import Chatbot from '../components/Chatbot';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { savedTrips, setSavedTrips, currentTrip } = useTripStore();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchTrips = async () => {
      try {
        const trips = await loadTrips(user.id);
        setSavedTrips(trips);
      } catch (error) {
        console.error('Error loading trips:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [user, navigate, setSavedTrips]);

  return (
    <div className="bg-background min-h-[calc(100vh-64px)] pt-32 pb-16 px-6">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <div className="font-sans text-[0.6rem] tracking-[0.35em] uppercase text-goldLight mb-4">Dashboard</div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light tracking-[0.04em] text-primary mb-3">
              Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Traveler'}
            </h1>
            <p className="font-sans text-sm font-light text-primary/40">Ready for your next adventure?</p>
          </div>
          <Link to="/new-trip" className="flex items-center gap-3 bg-primary hover:bg-gold text-background px-6 py-3 text-[0.65rem] font-sans uppercase tracking-[0.25em] transition-all hover:-translate-y-px">
            <Plus size={14} /> New Journey
          </Link>
        </div>

        {/* Section Title */}
        <div className="flex items-center gap-6 mb-10">
          <h2 className="font-display text-2xl font-light tracking-[0.06em] text-primary">Your Journeys</h2>
          <div className="flex-1 h-px bg-darkBorder" />
        </div>

        {loading ? (
          <div className="grid-auto-fit">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : savedTrips.length === 0 ? (
          <div className="bg-surface/30 backdrop-blur-md border border-darkBorder p-16 text-center max-w-xl mx-auto">
            <div className="text-5xl mb-6">🌍</div>
            <h3 className="font-display text-2xl font-light tracking-[0.04em] text-primary mb-4">No trips planned yet</h3>
            <p className="font-sans text-sm font-light text-primary/40 mb-8">Let our AI build the perfect itinerary for your group.</p>
            <Link to="/new-trip" className="inline-flex items-center gap-3 bg-primary hover:bg-gold text-background px-8 py-3 text-[0.65rem] font-sans uppercase tracking-[0.25em] transition-all hover:-translate-y-px">
              <Plus size={14} /> Start Planning
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Current unsaved trip if exists */}
            {currentTrip && !savedTrips.find(t => t.id === currentTrip.id) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Link to={`/trip/${currentTrip.id}`} className="block group p-8 border border-gold/30 bg-gold/5 transition-all duration-500 hover:border-gold/60 hover:bg-gold/10">
                  <div className="inline-block bg-gold/20 text-gold text-[0.55rem] font-sans uppercase tracking-[0.2em] px-3 py-1 mb-6">In Progress</div>
                  <h3 className="font-display text-2xl font-light tracking-[0.04em] text-primary mb-6 group-hover:text-gold transition-colors">{currentTrip.destination}</h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-primary/40 text-sm font-light">
                      <Calendar size={14} className="text-gold/60" /> {formatDateShort(currentTrip.startDate)} — {formatDateShort(currentTrip.endDate)}
                    </div>
                    <div className="flex items-center gap-3 text-primary/40 text-sm font-light">
                      <Users size={14} className="text-gold/60" /> {currentTrip.groupMembers.length} Travelers
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-darkBorder flex items-center gap-2 text-gold text-[0.6rem] font-sans uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                    Continue Planning <ArrowRight size={12} />
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Saved Trips */}
            {savedTrips.map((trip: Trip, i) => (
              <motion.div key={trip.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/trip/${trip.id}`} className="block group p-8 border border-darkBorder bg-surface/30 transition-all duration-500 hover:border-primary/20 hover:bg-surface/50">
                  <h3 className="font-display text-2xl font-light tracking-[0.04em] text-primary mb-6 group-hover:text-gold transition-colors">{trip.destination}</h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-primary/40 text-sm font-light">
                      <Calendar size={14} className="text-gold/60" /> {formatDateShort(trip.startDate)} — {formatDateShort(trip.endDate)}
                    </div>
                    <div className="flex items-center gap-3 text-primary/40 text-sm font-light">
                      <Users size={14} className="text-gold/60" /> {trip.groupMembers?.length || 1} Travelers
                    </div>
                    <div className="flex items-center gap-3 text-primary/40 text-sm font-light">
                      <MapPin size={14} className="text-gold/60" /> {trip.country}
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-darkBorder flex items-center gap-2 text-goldLight text-[0.6rem] font-sans uppercase tracking-[0.2em] group-hover:text-gold group-hover:gap-4 transition-all">
                    View Itinerary <ArrowRight size={12} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Embedded Chatbot Section */}
        <div className="mt-20">
          <div className="flex items-center gap-6 mb-10">
            <h2 className="font-display text-2xl font-light tracking-[0.06em] text-primary">TripMind Assistant</h2>
            <div className="flex-1 h-px bg-darkBorder" />
          </div>
          <div className="max-w-3xl">
            <Chatbot inline />
          </div>
        </div>
      </div>
    </div>
  );
}
