import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, MapPin, Calendar, Users, DollarSign, Mail, LogIn, Download, Sparkles, ChevronRight, X } from 'lucide-react';
import { Itinerary } from '../../types/itinerary.types';
import { Trip } from '../../types/trip.types';
import { User } from '@supabase/supabase-js';
import { formatDateShort } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/currencyUtils';
import { fetchPlaceImage } from '../../utils/imageUtils';
import { jsPDF } from 'jspdf';

interface Props {
  itinerary: Itinerary;
  trip: Trip;
  user: User | null;
  onNavigate: () => void;
  onLoginRequest: () => void;
}

// Floating particles for background
const REVEAL_PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 1,
  duration: Math.random() * 10 + 8,
  delay: Math.random() * 5,
}));

function DayCard({
  day,
  index,
  currency,
}: {
  day: Itinerary['days'][0];
  index: number;
  currency: string;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setImageLoading(true);
    fetchPlaceImage(day.imageSearchTerm || day.theme + ' ' + day.activities[0]?.name || day.theme).then((url) => {
      if (!cancelled) {
        setImageUrl(url);
        setImageLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [day]);

  const topActivities = day.activities.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.97 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full"
    >
      {/* Day hero image */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          height: 280,
          borderRadius: '16px 16px 0 0',
          background: 'linear-gradient(135deg, #1a1507 0%, #0d0d0d 100%)',
        }}
      >
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 32, height: 32,
                borderRadius: '50%',
                border: '2px solid rgba(196,163,90,0.2)',
                borderTopColor: '#c4a35a',
              }}
            />
          </div>
        )}
        {imageUrl && (
          <motion.img
            src={imageUrl}
            alt={day.theme}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.8) 100%)',
          }}
        />
        {/* Day badge */}
        <div className="absolute top-5 left-5">
          <div
            className="font-sans text-[0.55rem] uppercase tracking-[0.3em] px-4 py-2 rounded-full"
            style={{
              background: 'rgba(10,10,10,0.7)',
              border: '1px solid rgba(196,163,90,0.4)',
              color: '#e6c883',
              backdropFilter: 'blur(12px)',
            }}
          >
            Day {day.dayNumber} · {formatDateShort(day.date)}
          </div>
        </div>
        {/* Theme on image */}
        <div className="absolute bottom-5 left-6 right-6">
          <h3
            className="font-display font-light leading-tight"
            style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', color: '#f5f0eb', letterSpacing: '0.02em' }}
          >
            {day.theme}
          </h3>
        </div>
      </div>

      {/* Card body */}
      <div
        style={{
          background: 'rgba(14,12,6,0.95)',
          border: '1px solid rgba(196,163,90,0.12)',
          borderTop: 'none',
          borderRadius: '0 0 16px 16px',
          padding: '28px 28px 24px',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Activities list */}
        <div className="flex flex-col gap-3 mb-6">
          {topActivities.map((act, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 + 0.3 }}
              className="flex items-center gap-4"
              style={{ borderBottom: i < topActivities.length - 1 ? '1px solid rgba(245,240,235,0.05)' : 'none', paddingBottom: i < topActivities.length - 1 ? 12 : 0 }}
            >
              <div
                className="font-sans text-[0.55rem] uppercase tracking-widest flex-shrink-0"
                style={{ color: '#c4a35a', minWidth: 40 }}
              >
                {act.time}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-sans text-sm font-light truncate" style={{ color: '#f5f0eb' }}>
                  {act.name}
                </div>
                <div className="font-sans text-[0.6rem] uppercase tracking-wider" style={{ color: 'rgba(245,240,235,0.3)' }}>
                  {act.duration}
                </div>
              </div>
              <div
                className="font-sans text-[0.6rem] uppercase tracking-wider flex-shrink-0 px-2 py-1 rounded"
                style={{
                  color: '#c4a35a',
                  background: 'rgba(196,163,90,0.08)',
                  border: '1px solid rgba(196,163,90,0.15)',
                }}
              >
                {act.estimatedCostPerPerson > 0 ? formatCurrency(act.estimatedCostPerPerson, act.currency) : 'Free'}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Day total */}
        <div
          className="flex items-center justify-between pt-4"
          style={{ borderTop: '1px solid rgba(245,240,235,0.08)' }}
        >
          <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em]" style={{ color: 'rgba(245,240,235,0.3)' }}>
            Est. Per Person
          </span>
          <span className="font-display text-xl font-light" style={{ color: '#c4a35a' }}>
            {formatCurrency(day.totalCostPerPerson, currency)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function PlanRevealScreen({ itinerary, trip, user, onNavigate, onLoginRequest }: Props) {
  const [currentDay, setCurrentDay] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isSendingPDF, setIsSendingPDF] = useState(false);
  const [pdfSent, setPdfSent] = useState(false);

  const totalDays = itinerary.days.length;
  const currency = trip.currency || 'USD';

  // Show intro for 2.5 seconds then reveal day 0
  useEffect(() => {
    const t = setTimeout(() => setShowIntro(false), 2600);
    return () => clearTimeout(t);
  }, []);

  const goNext = useCallback(() => {
    if (currentDay < totalDays - 1) setCurrentDay((d) => d + 1);
  }, [currentDay, totalDays]);

  const goPrev = useCallback(() => {
    if (currentDay > 0) setCurrentDay((d) => d - 1);
  }, [currentDay]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  const handleGeneratePDF = async (action: 'download' | 'email') => {
    if (action === 'email' && !user) {
      setShowLoginPrompt(true);
      return;
    }
    setIsSendingPDF(true);
    try {
      // Generate PDF
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = pdf.internal.pageSize.getWidth();
      const H = pdf.internal.pageSize.getHeight();
      const gold = [196, 163, 90] as const;
      const cream = [245, 240, 235] as const;

      // Cover page
      pdf.setFillColor(10, 10, 10);
      pdf.rect(0, 0, W, H, 'F');

      // Gold accent line top
      pdf.setDrawColor(...gold);
      pdf.setLineWidth(0.5);
      pdf.line(20, 18, W - 20, 18);

      // Title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(28);
      pdf.setTextColor(...cream);
      pdf.text(itinerary.destination.toUpperCase(), W / 2, 50, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(...gold);
      pdf.text('AI TRAVEL ITINERARY', W / 2, 60, { align: 'center' });

      // Meta info
      pdf.setFontSize(8);
      pdf.setTextColor(180, 175, 170);
      pdf.text(`${formatDateShort(trip.startDate)} — ${formatDateShort(trip.endDate)}`, W / 2, 72, { align: 'center' });
      pdf.text(`${trip.groupMembers.length} Traveler${trip.groupMembers.length > 1 ? 's' : ''} · Budget: ${formatCurrency(trip.totalBudget, currency)}`, W / 2, 80, { align: 'center' });

      // Gold line separator
      pdf.setDrawColor(...gold);
      pdf.line(20, 90, W - 20, 90);

      // AI Summary
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(200, 195, 190);
      const summaryLines = pdf.splitTextToSize(itinerary.aiSummary, W - 40);
      pdf.text(summaryLines.slice(0, 8), 20, 102);

      // Each day
      let yPos = 130;
      itinerary.days.forEach((day) => {
        if (yPos > H - 60) {
          pdf.addPage();
          pdf.setFillColor(10, 10, 10);
          pdf.rect(0, 0, W, H, 'F');
          yPos = 24;
        }

        // Day header
        pdf.setFillColor(30, 24, 8);
        pdf.roundedRect(20, yPos - 6, W - 40, 18, 3, 3, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(...gold);
        pdf.text(`DAY ${day.dayNumber}: ${day.theme.toUpperCase()}`, 26, yPos + 5);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(150, 145, 140);
        pdf.text(formatDateShort(day.date), W - 26, yPos + 5, { align: 'right' });
        yPos += 22;

        // Activities
        day.activities.forEach((act) => {
          if (yPos > H - 30) {
            pdf.addPage();
            pdf.setFillColor(10, 10, 10);
            pdf.rect(0, 0, W, H, 'F');
            yPos = 24;
          }
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8);
          pdf.setTextColor(...cream);
          pdf.text(`${act.time}  ${act.name}`, 24, yPos);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7);
          pdf.setTextColor(150, 145, 140);
          const descLines = pdf.splitTextToSize(act.description, W - 60);
          pdf.text(descLines.slice(0, 2), 24, yPos + 4);
          if (act.estimatedCostPerPerson > 0) {
            pdf.setTextColor(...gold);
            pdf.text(formatCurrency(act.estimatedCostPerPerson, act.currency), W - 24, yPos, { align: 'right' });
          }
          yPos += 14 + Math.min(descLines.length, 2) * 3.5;
        });

        // Day total
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7);
        pdf.setTextColor(...gold);
        pdf.text(`Day Total (per person): ${formatCurrency(day.totalCostPerPerson, currency)}`, W - 24, yPos, { align: 'right' });
        yPos += 14;

        // Divider
        pdf.setDrawColor(50, 45, 35);
        pdf.line(20, yPos - 4, W - 20, yPos - 4);
        yPos += 4;
      });

      // Footer on last page
      pdf.setFontSize(7);
      pdf.setTextColor(...gold);
      pdf.text('Powered by TripMind AI · Aura TKS', W / 2, H - 10, { align: 'center' });
      pdf.setDrawColor(...gold);
      pdf.line(20, H - 15, W - 20, H - 15);

      // Save locally
      pdf.save(`TripMind_${itinerary.destination.replace(/\s+/g, '_')}.pdf`);

      // If email action, open mailto
      if (action === 'email' && user) {
        const subject = encodeURIComponent(`Your AI Itinerary: ${itinerary.destination}`);
        const body = encodeURIComponent(
          `Hi ${user.user_metadata?.full_name || ''},\n\nYour TripMind AI itinerary for ${itinerary.destination} is attached as a PDF.\n\n📅 Dates: ${formatDateShort(trip.startDate)} — ${formatDateShort(trip.endDate)}\n👥 Group: ${trip.groupMembers.length} traveler${trip.groupMembers.length > 1 ? 's' : ''}\n💰 Budget: ${formatCurrency(trip.totalBudget, currency)}\n\n${itinerary.aiSummary}\n\nPowered by TripMind AI · Aura TKS`
        );
        setTimeout(() => {
          window.location.href = `mailto:${user.email}?subject=${subject}&body=${body}`;
        }, 600);
      }

      setPdfSent(true);
    } finally {
      setIsSendingPDF(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #12100a 0%, #0a0a0a 55%, #050505 100%)' }}
    >
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {REVEAL_PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`, top: `${p.y}%`,
              width: p.size, height: p.size,
              background: 'rgba(196,163,90,0.25)',
              boxShadow: `0 0 ${p.size * 5}px rgba(196,163,90,0.2)`,
            }}
            animate={{ y: [0, -35, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* ══════════════════════════════════════════
          INTRO REVEAL — shown for 2.5s
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center"
            style={{ background: 'radial-gradient(ellipse at 50% 40%, #1a1507 0%, #0a0a0a 70%)' }}
          >
            {/* Gold star burst */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
              className="mb-8"
              style={{ fontSize: 52 }}
            >
              ✨
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              <div
                className="font-sans text-[0.55rem] uppercase tracking-[0.5em] mb-5"
                style={{ color: '#c4a35a' }}
              >
                Your Plan is Ready
              </div>
              <h1
                className="font-display font-light leading-tight mb-6"
                style={{
                  fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                  color: '#f5f0eb',
                  letterSpacing: '0.03em',
                }}
              >
                New Day,
                <br />
                <span
                  style={{
                    background: 'linear-gradient(135deg, #c4a35a 0%, #e6c883 50%, #c4a35a 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  New Plans,
                </span>
                <br />
                New Places.
              </h1>
              <p
                className="font-sans font-light max-w-md mx-auto"
                style={{ color: 'rgba(245,240,235,0.4)', fontSize: '0.9rem', lineHeight: 1.7 }}
              >
                {itinerary.destination} awaits — {totalDays} day{totalDays > 1 ? 's' : ''} of curated
                experiences crafted just for you.
              </p>
            </motion.div>

            {/* Animated loading dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex gap-2 mt-10"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                  className="rounded-full"
                  style={{ width: 5, height: 5, background: '#c4a35a' }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
          MAIN REVEAL CONTENT
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {!showIntro && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative z-10 flex flex-col h-full overflow-hidden"
          >
            {/* ── Header strip ── */}
            <div
              className="flex-shrink-0 flex items-center justify-between px-6 md:px-10 py-4"
              style={{ borderBottom: '1px solid rgba(196,163,90,0.1)' }}
            >
              {/* Trip meta */}
              <div className="flex items-center gap-5">
                <div>
                  <div
                    className="font-sans text-[0.5rem] uppercase tracking-[0.35em] mb-0.5"
                    style={{ color: 'rgba(196,163,90,0.7)' }}
                  >
                    New Day · New Plans · New Places
                  </div>
                  <div className="font-display text-lg font-light" style={{ color: '#f5f0eb' }}>
                    {itinerary.destination}
                  </div>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-6">
                <div className="flex items-center gap-2 font-sans text-xs" style={{ color: 'rgba(245,240,235,0.4)' }}>
                  <Calendar size={12} style={{ color: '#c4a35a' }} />
                  {formatDateShort(trip.startDate)} — {formatDateShort(trip.endDate)}
                </div>
                <div className="flex items-center gap-2 font-sans text-xs" style={{ color: 'rgba(245,240,235,0.4)' }}>
                  <Users size={12} style={{ color: '#c4a35a' }} />
                  {trip.groupMembers.length} Traveler{trip.groupMembers.length > 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-2 font-sans text-xs" style={{ color: 'rgba(245,240,235,0.4)' }}>
                  <DollarSign size={12} style={{ color: '#c4a35a' }} />
                  {formatCurrency(trip.totalBudget, currency)} Budget
                </div>
              </div>
            </div>

            {/* ── Body: Two-column ── */}
            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">

              {/* LEFT: Day card carousel */}
              <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col items-center justify-start px-6 md:px-12 py-8 gap-6">

                {/* "New Day" tagline per day */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`tagline-${currentDay}`}
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-center"
                  >
                    <div
                      className="inline-flex items-center gap-3 px-5 py-2 rounded-full"
                      style={{
                        background: 'rgba(196,163,90,0.06)',
                        border: '1px solid rgba(196,163,90,0.18)',
                      }}
                    >
                      <Sparkles size={12} style={{ color: '#c4a35a' }} />
                      <span
                        className="font-sans text-[0.55rem] uppercase tracking-[0.3em]"
                        style={{ color: '#c4a35a' }}
                      >
                        Day {currentDay + 1} of {totalDays} · {itinerary.days[currentDay]?.theme}
                      </span>
                      <Sparkles size={12} style={{ color: '#c4a35a' }} />
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Day card */}
                <div className="w-full max-w-xl">
                  <AnimatePresence mode="wait">
                    <DayCard
                      key={currentDay}
                      day={itinerary.days[currentDay]}
                      index={currentDay}
                      currency={currency}
                    />
                  </AnimatePresence>
                </div>

                {/* Day navigation */}
                <div className="flex items-center gap-6 mt-2">
                  <button
                    onClick={goPrev}
                    disabled={currentDay === 0}
                    className="flex items-center gap-2 transition-all disabled:opacity-20"
                    style={{ color: '#c4a35a' }}
                  >
                    <ArrowLeft size={16} />
                    <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em]">Prev</span>
                  </button>

                  {/* Dot indicators */}
                  <div className="flex items-center gap-2">
                    {itinerary.days.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentDay(i)}
                        className="rounded-full transition-all"
                        style={{
                          width: i === currentDay ? 20 : 6,
                          height: 6,
                          background: i === currentDay
                            ? 'linear-gradient(90deg, #c4a35a, #e6c883)'
                            : 'rgba(245,240,235,0.15)',
                          boxShadow: i === currentDay ? '0 0 8px rgba(196,163,90,0.5)' : 'none',
                        }}
                      />
                    ))}
                  </div>

                  <button
                    onClick={goNext}
                    disabled={currentDay === totalDays - 1}
                    className="flex items-center gap-2 transition-all disabled:opacity-20"
                    style={{ color: '#c4a35a' }}
                  >
                    <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em]">Next</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* RIGHT: Summary panel */}
              <div
                className="w-full lg:w-[340px] xl:w-[380px] flex-shrink-0 overflow-y-auto no-scrollbar flex flex-col gap-0"
                style={{ borderLeft: '1px solid rgba(196,163,90,0.08)' }}
              >
                {/* AI summary */}
                <div
                  className="p-7"
                  style={{ borderBottom: '1px solid rgba(196,163,90,0.08)' }}
                >
                  <div
                    className="font-sans text-[0.55rem] uppercase tracking-[0.3em] mb-3"
                    style={{ color: 'rgba(196,163,90,0.7)' }}
                  >
                    AI Summary
                  </div>
                  <p className="font-sans text-sm font-light leading-relaxed" style={{ color: 'rgba(245,240,235,0.55)', lineHeight: 1.75 }}>
                    {itinerary.aiSummary}
                  </p>
                </div>

                {/* Budget breakdown */}
                <div className="p-7" style={{ borderBottom: '1px solid rgba(196,163,90,0.08)' }}>
                  <div className="font-sans text-[0.55rem] uppercase tracking-[0.3em] mb-5" style={{ color: 'rgba(196,163,90,0.7)' }}>
                    Budget per Day (per person)
                  </div>
                  <div className="flex flex-col gap-3">
                    {itinerary.days.map((day, i) => {
                      const maxCost = Math.max(...itinerary.days.map((d) => d.totalCostPerPerson), 1);
                      const pct = (day.totalCostPerPerson / maxCost) * 100;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <div
                            className="font-sans text-[0.5rem] uppercase tracking-widest flex-shrink-0"
                            style={{ color: i === currentDay ? '#c4a35a' : 'rgba(245,240,235,0.3)', minWidth: 30 }}
                          >
                            D{day.dayNumber}
                          </div>
                          <div className="flex-1 relative h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(245,240,235,0.06)' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: i * 0.07, ease: 'easeOut' }}
                              className="absolute top-0 left-0 h-full rounded-full"
                              style={{
                                background: i === currentDay
                                  ? 'linear-gradient(90deg, #c4a35a, #e6c883)'
                                  : 'rgba(196,163,90,0.3)',
                                boxShadow: i === currentDay ? '0 0 6px rgba(196,163,90,0.5)' : 'none',
                              }}
                            />
                          </div>
                          <div
                            className="font-sans text-[0.55rem] flex-shrink-0"
                            style={{ color: i === currentDay ? '#c4a35a' : 'rgba(245,240,235,0.25)', minWidth: 48, textAlign: 'right' }}
                          >
                            {formatCurrency(day.totalCostPerPerson, currency)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    className="flex items-center justify-between mt-5 pt-4"
                    style={{ borderTop: '1px solid rgba(245,240,235,0.06)' }}
                  >
                    <span className="font-sans text-[0.55rem] uppercase tracking-[0.2em]" style={{ color: 'rgba(245,240,235,0.3)' }}>
                      Total Est. Cost
                    </span>
                    <span className="font-display text-xl font-light" style={{ color: '#c4a35a' }}>
                      {formatCurrency(itinerary.totalEstimatedCost, currency)}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="p-7 flex flex-col gap-3">

                  {/* PDF Email & Download Buttons */}
                  {!pdfSent ? (
                    <div className="flex gap-3 w-full">
                      <button
                        onClick={() => handleGeneratePDF('download')}
                        disabled={isSendingPDF}
                        className="flex-1 flex items-center justify-center gap-2 transition-all"
                        style={{
                          background: 'rgba(196,163,90,0.08)',
                          border: '1px solid rgba(196,163,90,0.3)',
                          color: '#e6c883',
                          borderRadius: 10,
                          padding: '14px 10px',
                          fontSize: '0.65rem',
                          fontFamily: 'var(--font-sans)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.15em',
                          cursor: isSendingPDF ? 'wait' : 'pointer',
                          opacity: isSendingPDF ? 0.7 : 1,
                        }}
                      >
                        {isSendingPDF ? '...' : <><Download size={14} /> Download</>}
                      </button>
                      
                      <button
                        onClick={() => handleGeneratePDF('email')}
                        disabled={isSendingPDF}
                        className="flex-1 flex items-center justify-center gap-2 transition-all"
                        style={{
                          background: 'rgba(196,163,90,0.08)',
                          border: '1px solid rgba(196,163,90,0.3)',
                          color: '#e6c883',
                          borderRadius: 10,
                          padding: '14px 10px',
                          fontSize: '0.65rem',
                          fontFamily: 'var(--font-sans)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.15em',
                          cursor: isSendingPDF ? 'wait' : 'pointer',
                          opacity: isSendingPDF ? 0.7 : 1,
                        }}
                      >
                        {isSendingPDF ? '...' : <><Mail size={14} /> Email</>}
                      </button>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-full flex items-center justify-center gap-2 rounded-lg py-3.5"
                      style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', fontSize: '0.65rem', fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '0.2em' }}
                    >
                      ✓ PDF Sent & Downloaded
                    </motion.div>
                  )}

                  {/* Open full plan */}
                  <button
                    onClick={onNavigate}
                    className="w-full flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5"
                    style={{
                      background: 'linear-gradient(135deg, #c4a35a 0%, #e6c883 50%, #c4a35a 100%)',
                      color: '#0a0a0a',
                      borderRadius: 10,
                      padding: '14px 20px',
                      fontSize: '0.65rem',
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.25em',
                      boxShadow: '0 0 30px rgba(196,163,90,0.25)',
                    }}
                  >
                    Open Full Plan
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                Sign in to receive
                <br />
                your plan via email
              </h3>
              <p
                className="font-sans font-light mb-8"
                style={{ color: 'rgba(245,240,235,0.4)', fontSize: '0.85rem', lineHeight: 1.7 }}
              >
                Log in to get your full AI itinerary delivered as a beautifully formatted PDF directly to your inbox.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { setShowLoginPrompt(false); onLoginRequest(); }}
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
                  Continue without email
                </button>
              </div>

              {/* Subtle note */}
              <div
                className="mt-6 pt-5 font-sans text-[0.6rem] leading-relaxed"
                style={{
                  color: 'rgba(245,240,235,0.2)',
                  borderTop: '1px solid rgba(245,240,235,0.06)',
                }}
              >
                Your plan will still be available in the full itinerary view.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
