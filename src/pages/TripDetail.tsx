import { useEffect, useState } from 'react';
import { useParams, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Users, Share2, Download, MessageCircle, Map as MapIcon, DollarSign, Hotel, CloudSun, Luggage, Mail, ChevronRight, LogIn, X } from 'lucide-react';
import { useTripStore } from '../stores/tripStore';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';
import { formatDateShort } from '../utils/dateUtils';
import SkeletonCard from '../components/common/SkeletonCard';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function TripDetail() {
  const { tripId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentTrip, savedTrips, setCurrentTrip } = useTripStore();
  const { addToast } = useUIStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // If we land here and don't have currentTrip but have savedTrips, load it
    if (!currentTrip && savedTrips.length > 0 && tripId) {
      const trip = savedTrips.find(t => t.id === tripId);
      if (trip) setCurrentTrip(trip);
      else navigate('/dashboard');
    }
  }, [tripId, currentTrip, savedTrips, setCurrentTrip, navigate]);

  if (!currentTrip) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-background px-6">
        <SkeletonCard />
      </div>
    );
  }

  const tabs = [
    { path: '', label: 'Itinerary', icon: <MapIcon size={14} /> },
    { path: '/hotels', label: 'Hotels', icon: <Hotel size={14} /> },
    { path: '/budget', label: 'Budget & Split', icon: <DollarSign size={14} /> },
    { path: '/weather', label: 'Weather', icon: <CloudSun size={14} /> },
    { path: '/packing', label: 'Packing List', icon: <Luggage size={14} /> },
    { path: '/chat', label: 'AI Assistant', icon: <MessageCircle size={14} /> },
  ];

  const currentTab = location.pathname.split('/').pop() === tripId ? '' : '/' + location.pathname.split('/').pop();

  const handleShare = () => {
    const url = `${window.location.origin}/share/${currentTrip.shareToken}`;
    navigator.clipboard.writeText(url);
    addToast({ type: 'success', message: 'Share link copied to clipboard!' });
  };

  const handleExportPDF = async () => {
    addToast({ type: 'info', message: 'Generating PDF... This may take a moment.' });
    
    try {
      const content = document.querySelector('.trip-content-area') as HTMLElement;
      if (!content) throw new Error('Content not found');
      
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0a0a0a'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Add Footer
      pdf.setFontSize(10);
      pdf.setTextColor(150);
      pdf.text('Trip Mind AI Aura TKS', pdfWidth / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
      
      pdf.save(`TripMind_${currentTrip.destination.replace(/\s+/g, '_')}.pdf`);
      
      addToast({ type: 'success', message: 'Itinerary exported to PDF successfully.' });
    } catch (error) {
      console.error('PDF export failed:', error);
      addToast({ type: 'error', message: 'Failed to generate PDF. Please try again.' });
    }
  };

  const handleExportEmail = () => {
    if (!currentTrip) return;
    
    // Use auth store to check login
    const user = useAuthStore.getState().user;
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    const subject = encodeURIComponent(`TripMind Itinerary: ${currentTrip.destination}`);
    const body = encodeURIComponent(`Hi there!

Here is the itinerary for our upcoming trip to ${currentTrip.destination} from ${formatDateShort(currentTrip.startDate)} to ${formatDateShort(currentTrip.endDate)}.

Check out the full interactive itinerary here: ${window.location.origin}/share/${currentTrip.shareToken}

Powered by Trip Mind AI Aura TKS.`);
    window.location.href = `mailto:${user.email}?subject=${subject}&body=${body}`;
    addToast({ type: 'info', message: 'Opening your default email client...' });
  };

  return (
    <div className="bg-background min-h-[calc(100vh-64px)]">
      {/* Hero Header */}
      <div className="relative pt-32 pb-16 px-6 overflow-hidden border-b border-darkBorder">
        {/* Subtle ambient glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 blur-[120px] pointer-events-none rounded-full" />
        
        <div className="max-w-[1400px] mx-auto relative z-10">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-3 font-sans text-[0.55rem] uppercase tracking-[0.2em] text-primary/40 mb-8">
            <Link to="/dashboard" className="hover:text-gold transition-colors">Dashboard</Link>
            <ChevronRight size={10} />
            <span className="text-goldLight">{currentTrip.destination}</span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
            <div>
              <h1 className="font-display text-5xl md:text-7xl font-light tracking-[0.04em] text-primary mb-6 leading-tight">
                {currentTrip.destination}
              </h1>
              <div className="flex flex-wrap items-center gap-6 font-sans text-xs font-light text-primary/50 tracking-wide">
                <span className="flex items-center gap-2"><MapPin size={14} className="text-gold/60" /> {currentTrip.country}</span>
                <span className="flex items-center gap-2"><Calendar size={14} className="text-gold/60" /> {formatDateShort(currentTrip.startDate)} — {formatDateShort(currentTrip.endDate)}</span>
                <span className="flex items-center gap-2"><Users size={14} className="text-gold/60" /> {currentTrip.groupMembers.length} Travelers</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <button onClick={handleShare} className="flex items-center gap-2 bg-surface/50 hover:bg-surface border border-darkBorder text-primary px-6 py-3 text-[0.6rem] font-sans uppercase tracking-[0.2em] transition-all hover:border-gold/30">
                <Share2 size={12} /> Share
              </button>
              <button onClick={handleExportEmail} className="flex items-center gap-2 bg-surface/50 hover:bg-surface border border-darkBorder text-primary px-6 py-3 text-[0.6rem] font-sans uppercase tracking-[0.2em] transition-all hover:border-gold/30">
                <Mail size={12} /> Email
              </button>
              <button onClick={handleExportPDF} className="flex items-center gap-2 bg-primary hover:bg-gold text-background px-6 py-3 text-[0.6rem] font-sans uppercase tracking-[0.2em] transition-all">
                <Download size={12} /> Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Navigation Tabs */}
      <div className={`sticky top-[64px] z-40 transition-all duration-300 border-b border-darkBorder ${isScrolled ? 'bg-background/90 backdrop-blur-xl shadow-lg' : 'bg-background'}`}>
        <div className="max-w-[1400px] mx-auto px-6 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-10">
            {tabs.map(tab => {
              const isActive = currentTab === tab.path;
              return (
                <Link
                  key={tab.path}
                  to={`/trip/${tripId}${tab.path}`}
                  className={`flex items-center gap-2 py-6 text-[0.65rem] font-sans uppercase tracking-[0.15em] whitespace-nowrap transition-colors relative ${
                    isActive ? 'text-gold' : 'text-primary/40 hover:text-primary/80'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[1px] bg-gold"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="max-w-[1400px] mx-auto px-6 py-16 trip-content-area min-h-[50vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ══════════════════════════════════════════
          INLINE LOGIN PROMPT MODAL
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: 'rgba(5,5,5,0.8)', backdropFilter: 'blur(16px)' }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              className="relative w-full max-w-md text-center"
              style={{
                background: 'linear-gradient(135deg, #141009 0%, #0d0d0d 100%)',
                border: '1px solid rgba(196,163,90,0.25)',
                borderRadius: 20,
                padding: '48px 40px',
                boxShadow: '0 40px 80px rgba(0,0,0,0.8), 0 0 60px rgba(196,163,90,0.06)',
              }}
            >
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="absolute top-5 right-5 transition-colors"
                style={{ color: 'rgba(245,240,235,0.3)' }}
              >
                <X size={16} />
              </button>

              {/* Icon */}
              <div
                className="mx-auto mb-6 flex items-center justify-center"
                style={{
                  width: 64, height: 64,
                  borderRadius: '50%',
                  background: 'rgba(196,163,90,0.08)',
                  border: '1px solid rgba(196,163,90,0.25)',
                  fontSize: 28,
                }}
              >
                📧
              </div>

              <h3
                className="font-display font-light mb-3"
                style={{ fontSize: '1.8rem', color: '#f5f0eb', letterSpacing: '0.02em' }}
              >
                Sign in to send
                <br />
                your plan via email
              </h3>
              <p
                className="font-sans font-light mb-8"
                style={{ color: 'rgba(245,240,235,0.4)', fontSize: '0.85rem', lineHeight: 1.7 }}
              >
                Log in to get your full AI itinerary sent directly to your inbox so you can easily share it.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { setShowLoginPrompt(false); navigate('/login'); }}
                  className="w-full flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(135deg, #c4a35a 0%, #e6c883 50%, #c4a35a 100%)',
                    color: '#0a0a0a',
                    borderRadius: 10,
                    padding: '14px 20px',
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.25em',
                    boxShadow: '0 0 24px rgba(196,163,90,0.2)',
                  }}
                >
                  <LogIn size={14} />
                  Sign In to Continue
                </button>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="w-full font-sans text-[0.65rem] uppercase tracking-[0.2em] py-3 transition-colors"
                  style={{ color: 'rgba(245,240,235,0.3)' }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
