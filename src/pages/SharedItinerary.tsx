import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plane, Calendar, MapPin, Users, Copy } from 'lucide-react';
import { Trip } from '../types/trip.types';
import { Itinerary } from '../types/itinerary.types';
import { loadTripByShareToken, loadItinerary } from '../services/supabase/trips';
import { formatDateShort, formatDayName } from '../utils/dateUtils';
import SkeletonCard from '../components/common/SkeletonCard';
import { formatCurrency } from '../utils/currencyUtils';

export default function SharedItinerary() {
  const { shareToken } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!shareToken) return;
    
    const fetchSharedData = async () => {
      try {
        const loadedTrip = await loadTripByShareToken(shareToken);
        if (loadedTrip) {
          setTrip(loadedTrip);
          const loadedItin = await loadItinerary(loadedTrip.id);
          setItinerary(loadedItin as Itinerary);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchSharedData();
  }, [shareToken]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="container-section" style={{ padding: 40 }}><SkeletonCard height={400} /></div>;
  if (error || !trip || !itinerary) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 16 }}>Trip Not Found</h1>
        <p style={{ color: 'var(--color-muted)', marginBottom: 32 }}>This shared link may have expired or is invalid.</p>
        <Link to="/" className="btn btn-primary">Go to Home</Link>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-surface)', minHeight: '100vh', paddingBottom: 64 }}>
      {/* Read-only Header */}
      <div style={{ background: 'var(--color-surface-alt)', color: 'white', padding: '40px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container-section" style={{ maxWidth: 800 }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.05)', padding: '6px 16px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 16, color: 'var(--color-accent)' }}>
            SHARED ITINERARY (READ-ONLY)
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: 16 }}>{trip.destination}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.8)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={16} /> {trip.country}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={16} /> {formatDateShort(trip.startDate)} - {formatDateShort(trip.endDate)}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Users size={16} /> {trip.groupMembers.length} Travelers</span>
          </div>
          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 'var(--text-sm)' }}>
              Total Est. Cost: <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>{formatCurrency(itinerary.totalEstimatedCost, trip.currency)}</span>
            </div>
            <button onClick={handleCopyLink} className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
              {copied ? 'Copied!' : <><Copy size={16} /> Copy Link</>}
            </button>
          </div>
        </div>
      </div>

      {/* Itinerary Body */}
      <div className="container-section" style={{ maxWidth: 800, marginTop: 32 }}>
        <div className="card" style={{ padding: 24, marginBottom: 32, background: 'var(--color-surface-alt)', border: '1px solid rgba(59, 130, 246, 0.2)', color: 'var(--color-primary)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: 8, color: 'white' }}>Trip Summary</h3>
          <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6, color: 'var(--color-primary-light)' }}>{itinerary.aiSummary}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {itinerary.days.map((day) => (
            <div key={day.dayNumber}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'white' }}>
                  Day {day.dayNumber}: {day.theme}
                </h2>
                <div style={{ color: 'var(--color-muted)' }}>{formatDayName(day.date)}, {formatDateShort(day.date)}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {day.activities.map((act, i) => (
                  <div key={i} className="card" style={{ padding: 20, display: 'flex', gap: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-accent)', width: 60, flexShrink: 0 }}>
                      {act.time}
                    </div>
                    <div style={{ flex: 1, borderLeft: '2px solid rgba(255,255,255,0.05)', paddingLeft: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'white' }}>{act.name}</h4>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-secondary)' }}>
                          {act.estimatedCostPerPerson > 0 ? formatCurrency(act.estimatedCostPerPerson, act.currency) : 'Free'}
                        </span>
                      </div>
                      <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.5, marginBottom: 12 }}>{act.description}</p>
                      
                      {act.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                          <MapPin size={12} /> {act.location.address}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 64, textAlign: 'center', padding: 40, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, var(--color-accent), var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Plane size={24} color="white" style={{ transform: 'rotate(45deg)' }} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 8, color: 'white' }}>Want to plan your own trip?</h3>
          <p style={{ color: 'var(--color-muted)', marginBottom: 24 }}>TripMind AI builds personalized group itineraries in seconds.</p>
          <Link to="/" className="btn btn-primary" style={{ margin: '0 auto' }}>Plan a Trip for Free</Link>
        </div>
      </div>
    </div>
  );
}
