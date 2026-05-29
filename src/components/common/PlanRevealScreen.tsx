import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, MapPin, Calendar, Users, DollarSign, Mail, LogIn, Download, Sparkles, ChevronRight, X } from 'lucide-react';
import { Itinerary } from '../../types/itinerary.types';
import { Trip } from '../../types/trip.types';
import { HotelRecommendation } from '../../types/hotel.types';
import { FoodRecommendation, PackingList } from '../../types/ai.types';
import { WeatherForecast } from '../../types/weather.types';
import { User } from '@supabase/supabase-js';
import { formatDateShort } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/currencyUtils';
import { fetchPlaceImage, fetchImageAsBase64 } from '../../utils/imageUtils';
import { jsPDF } from 'jspdf';

interface Props {
  itinerary: Itinerary;
  trip: Trip;
  user: User | null;
  hotels?: HotelRecommendation[];
  restaurants?: FoodRecommendation[];
  packingList?: PackingList | null;
  weatherForecast?: WeatherForecast | null;
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

export default function PlanRevealScreen({ itinerary, trip, user, hotels = [], restaurants = [], packingList = null, weatherForecast = null, onNavigate, onLoginRequest }: Props) {
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
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = pdf.internal.pageSize.getWidth();
      const H = pdf.internal.pageSize.getHeight();
      const gold: [number, number, number] = [196, 163, 90];
      const cream: [number, number, number] = [245, 240, 235];
      const dark: [number, number, number] = [20, 16, 8];
      const grey: [number, number, number] = [140, 135, 130];

      // ── COVER PAGE ──────────────────────────────────────────────
      // Try to fetch destination cover image
      const coverImgB64 = await fetchImageAsBase64(itinerary.destination + ' landmark');
      
      pdf.setFillColor(...dark);
      pdf.rect(0, 0, W, H, 'F');

      if (coverImgB64) {
        try {
          pdf.addImage(coverImgB64, 'JPEG', 0, 0, W, H * 0.52);
          // Dark overlay on cover image
          pdf.setFillColor(0, 0, 0);
          pdf.rect(0, 0, W, H * 0.52, 'F');
        } catch { /* image embed failed */ }
      }

      // Gold accent lines
      pdf.setDrawColor(...gold);
      pdf.setLineWidth(0.5);
      pdf.line(20, 15, W - 20, 15);
      pdf.line(20, H - 15, W - 20, H - 15);

      // Title
      const titleY = coverImgB64 ? H * 0.38 : 55;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(32);
      pdf.setTextColor(...cream);
      pdf.text(itinerary.destination.toUpperCase(), W / 2, titleY, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(...gold);
      pdf.text('AI-POWERED TRAVEL ITINERARY · TRIPMIND AI', W / 2, titleY + 10, { align: 'center' });

      // Meta info box
      const metaY = titleY + 22;
      pdf.setFillColor(...dark);
      pdf.roundedRect(20, metaY, W - 40, 28, 3, 3, 'F');
      pdf.setDrawColor(...gold);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(20, metaY, W - 40, 28, 3, 3, 'S');

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(...grey);
      pdf.text('DATES', 30, metaY + 9);
      pdf.text('GROUP', W / 2 - 10, metaY + 9);
      pdf.text('BUDGET', W - 50, metaY + 9);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(...cream);
      pdf.text(`${formatDateShort(trip.startDate)} – ${formatDateShort(trip.endDate)}`, 30, metaY + 18);
      pdf.text(`${trip.groupMembers.length} Traveler${trip.groupMembers.length > 1 ? 's' : ''}`, W / 2 - 10, metaY + 18);
      pdf.text(formatCurrency(trip.totalBudget, currency), W - 50, metaY + 18);

      // AI Summary
      const summaryY = metaY + 40;
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(9);
      pdf.setTextColor(...cream);
      const summaryLines = pdf.splitTextToSize(itinerary.aiSummary, W - 40);
      pdf.text(summaryLines.slice(0, 4), 20, summaryY);

      // Highlights
      const hlY = summaryY + summaryLines.slice(0, 4).length * 5.5 + 10;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(...gold);
      pdf.text('HIGHLIGHTS', 20, hlY);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(...grey);
      (itinerary.highlights || []).slice(0, 5).forEach((hl, i) => {
        pdf.text(`• ${hl}`, 22, hlY + 7 + i * 5.5);
      });

      // Travel Tips
      const tipsY = hlY + 42;
      if (itinerary.travelTips?.length) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(...gold);
        pdf.text('TRAVEL TIPS', 20, tipsY);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.setTextColor(...grey);
        itinerary.travelTips.slice(0, 5).forEach((tip, i) => {
          const tipLines = pdf.splitTextToSize(`• ${tip}`, W - 44);
          pdf.text(tipLines.slice(0, 1), 22, tipsY + 7 + i * 6);
        });
      }

      // Budget breakdown
      const bdgY = Math.min(tipsY + 50, H - 50);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(...gold);
      pdf.text('BUDGET BREAKDOWN (TOTAL)', 20, bdgY);
      const bdg = itinerary.budgetBreakdown;
      const bdgItems: [string, number][] = [
        ['Accommodation', bdg.accommodation], ['Food', bdg.food],
        ['Activities', bdg.activities], ['Transport', bdg.transport],
        ['Shopping', bdg.shopping], ['Emergency', bdg.emergency],
      ];
      bdgItems.forEach(([label, val], i) => {
        const bx = i < 3 ? 20 : W / 2 + 5;
        const by = bdgY + 8 + (i % 3) * 7;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(...grey);
        pdf.text(label, bx, by);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...cream);
        pdf.text(formatCurrency(val, currency), bx + 30, by);
      });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(...gold);
      pdf.text('Powered by TripMind AI · Aura TKS', W / 2, H - 8, { align: 'center' });

      // ── DAY PAGES ───────────────────────────────
      for (const day of itinerary.days) {
        pdf.addPage();
        pdf.setFillColor(...dark);
        pdf.rect(0, 0, W, H, 'F');

        // Fetch a real image for this day's landmark
        const dayImgB64 = await fetchImageAsBase64(
          day.imageSearchTerm || day.theme || itinerary.destination
        );

        let headerHeight = 0;
        if (dayImgB64) {
          try {
            pdf.addImage(dayImgB64, 'JPEG', 0, 0, W, 55);
            // Dark overlay
            pdf.setFillColor(0, 0, 0);
            pdf.rect(0, 0, W, 55, 'F');
            headerHeight = 55;
          } catch { headerHeight = 0; }
        }

        // Day badge (gold pill)
        const badgeY = headerHeight > 0 ? 10 : 12;
        pdf.setFillColor(...gold);
        pdf.roundedRect(18, badgeY, 26, 7, 2, 2, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7);
        pdf.setTextColor(10, 10, 10);
        pdf.text(`DAY ${day.dayNumber}`, 31, badgeY + 5, { align: 'center' });

        // Date badge
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(headerHeight > 0 ? 220 : 140, headerHeight > 0 ? 215 : 135, headerHeight > 0 ? 210 : 130);
        pdf.text(formatDateShort(day.date), W - 20, badgeY + 5, { align: 'right' });

        // Day Theme
        const themeY = headerHeight > 0 ? 42 : badgeY + 13;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(15);
        pdf.setTextColor(...cream);
        const themeLines = pdf.splitTextToSize(day.theme, W - 40);
        pdf.text(themeLines.slice(0, 2), 20, themeY);

        // Description
        const dayDescY = themeY + themeLines.slice(0, 2).length * 6.5 + 2;
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(8);
        pdf.setTextColor(...grey);
        if (day.description) {
          const dayDescLines = pdf.splitTextToSize(day.description, W - 40);
          pdf.text(dayDescLines.slice(0, 1), 20, dayDescY);
        }

        // Separator
        const sepY = dayDescY + 6;
        pdf.setDrawColor(...gold);
        pdf.setLineWidth(0.25);
        pdf.line(20, sepY, W - 20, sepY);

        // Activities table
        let actY = sepY + 7;
        const actHeader = ['TIME', 'ACTIVITY', 'DURATION', 'COST'];
        const colX = [20, 38, W - 50, W - 22];

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(6.5);
        pdf.setTextColor(...gold);
        actHeader.forEach((h, hi) => pdf.text(h, colX[hi], actY, { align: hi === 3 ? 'right' : 'left' }));
        actY += 4;
        pdf.setLineWidth(0.15);
        pdf.setDrawColor(...gold);
        pdf.line(20, actY, W - 20, actY);
        actY += 3;

        day.activities.forEach((act, ai) => {
          if (actY > H - 22) {
            pdf.addPage();
            pdf.setFillColor(...dark);
            pdf.rect(0, 0, W, H, 'F');
            actY = 16;
          }

          // Alternating row bg
          if (ai % 2 === 0) {
            pdf.setFillColor(28, 22, 8);
            pdf.rect(18, actY - 2, W - 36, 14, 'F');
          }

          // Type indicator dot
          const dotColor: [number, number, number] =
            act.type === 'meal' ? [34, 197, 94] :
            act.type === 'transport' ? [59, 130, 246] :
            act.type === 'rest' ? [139, 92, 246] : [...gold];
          pdf.setFillColor(...dotColor);
          pdf.circle(23, actY + 4, 1.2, 'F');

          // Time
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(7);
          pdf.setTextColor(...gold);
          pdf.text(act.time, 27, actY + 4);

          // Activity Name
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8);
          pdf.setTextColor(...cream);
          const nameClipped = act.name.length > 42 ? act.name.substring(0, 40) + '…' : act.name;
          pdf.text(nameClipped, 38, actY + 4);

          // Description below name
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(6.5);
          pdf.setTextColor(...grey);
          const actDescLines = pdf.splitTextToSize(act.description || '', W - 90);
          pdf.text(actDescLines.slice(0, 1), 38, actY + 9);

          // Duration
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7);
          pdf.setTextColor(...grey);
          pdf.text(act.duration, W - 50, actY + 4);

          // Cost
          if (act.estimatedCostPerPerson > 0) {
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(7);
            pdf.setTextColor(...gold);
            pdf.text(formatCurrency(act.estimatedCostPerPerson, act.currency), W - 20, actY + 4, { align: 'right' });
          } else {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(7);
            pdf.setTextColor(34, 197, 94);
            pdf.text('Free', W - 20, actY + 4, { align: 'right' });
          }

          actY += 14;

          // Tips row
          if (act.tips) {
            if (actY > H - 22) {
              pdf.addPage();
              pdf.setFillColor(...dark);
              pdf.rect(0, 0, W, H, 'F');
              actY = 16;
            }
            pdf.setFont('helvetica', 'italic');
            pdf.setFontSize(6);
            pdf.setTextColor(196, 163, 90);
            pdf.text(`⚡ Tip: ${act.tips.substring(0, 80)}`, 28, actY);
            actY += 5;
          }
        });

        // Day total row
        if (actY > H - 16) {
          pdf.addPage();
          pdf.setFillColor(...dark);
          pdf.rect(0, 0, W, H, 'F');
          actY = 16;
        }
        pdf.setDrawColor(...gold);
        pdf.setLineWidth(0.2);
        pdf.line(20, actY + 2, W - 20, actY + 2);
        actY += 7;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(...grey);
        pdf.text('ESTIMATED TOTAL (per person)', 20, actY);
        pdf.setTextColor(...gold);
        pdf.text(formatCurrency(day.totalCostPerPerson, currency), W - 20, actY, { align: 'right' });

        // Page footer
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6);
        pdf.setTextColor(70, 65, 55);
        pdf.text(`Day ${day.dayNumber} of ${itinerary.totalDays} · TripMind AI`, W / 2, H - 5, { align: 'center' });
      }

      // ── STAY RECOMMENDATIONS PAGE ─────────────────────────────
      if (hotels.length > 0) {
        pdf.addPage();
        pdf.setFillColor(...dark);
        pdf.rect(0, 0, W, H, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.setTextColor(...gold);
        pdf.text('STAY RECOMMENDATIONS', W / 2, 25, { align: 'center' });
        pdf.setDrawColor(...gold);
        pdf.setLineWidth(0.3);
        pdf.line(20, 30, W - 20, 30);

        let hy = 40;
        hotels.slice(0, 6).forEach((hotel) => {
          if (hy > H - 40) {
            pdf.addPage();
            pdf.setFillColor(...dark);
            pdf.rect(0, 0, W, H, 'F');
            hy = 20;
          }
          pdf.setFillColor(28, 22, 8);
          pdf.roundedRect(18, hy - 2, W - 36, 30, 2, 2, 'F');

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.setTextColor(...cream);
          pdf.text(hotel.name, 24, hy + 6);

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7);
          pdf.setTextColor(...grey);
          pdf.text(`${'★'.repeat(hotel.starRating)} · ${hotel.amenities.slice(0, 3).join(', ')}`, 24, hy + 13);
          pdf.text(`${hotel.distanceFromCenter}km from center · ${hotel.roomTypes.slice(0, 2).join(', ')}`, 24, hy + 19);

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.setTextColor(...gold);
          pdf.text(`${formatCurrency(hotel.pricePerNight, hotel.currency)}/night`, W - 22, hy + 6, { align: 'right' });

          pdf.setFont('helvetica', 'italic');
          pdf.setFontSize(6.5);
          pdf.setTextColor(160, 155, 140);
          const note = hotel.aiReasoningNote.substring(0, 80);
          pdf.text(note, 24, hy + 25);

          hy += 36;
        });
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6);
        pdf.setTextColor(70, 65, 55);
        pdf.text('Stay Recommendations · TripMind AI', W / 2, H - 5, { align: 'center' });
      }

      // ── LOCAL FOOD GUIDE PAGE ─────────────────────────────────
      if (restaurants.length > 0) {
        pdf.addPage();
        pdf.setFillColor(...dark);
        pdf.rect(0, 0, W, H, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.setTextColor(...gold);
        pdf.text('LOCAL FOOD GUIDE', W / 2, 25, { align: 'center' });
        pdf.setDrawColor(...gold);
        pdf.setLineWidth(0.3);
        pdf.line(20, 30, W - 20, 30);

        let fy = 40;
        restaurants.slice(0, 8).forEach((rest, ri) => {
          if (fy > H - 35) {
            pdf.addPage();
            pdf.setFillColor(...dark);
            pdf.rect(0, 0, W, H, 'F');
            fy = 20;
          }
          if (ri % 2 === 0) {
            pdf.setFillColor(28, 22, 8);
            pdf.rect(18, fy - 2, W - 36, 22, 'F');
          }
          // Dot color by meal type
          const mealColor: [number, number, number] = rest.mealType.includes('breakfast') ? [59, 130, 246] : rest.mealType.includes('dinner') ? [196, 163, 90] : [34, 197, 94];
          pdf.setFillColor(...mealColor);
          pdf.circle(23, fy + 4, 1.2, 'F');

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.setTextColor(...cream);
          pdf.text(rest.name, 28, fy + 5);

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7);
          pdf.setTextColor(...grey);
          pdf.text(`${rest.cuisineType} · ${rest.priceRange} · ${rest.openingHours}`, 28, fy + 11);

          if (rest.mustTryDishes.length > 0) {
            pdf.setFont('helvetica', 'italic');
            pdf.setFontSize(6.5);
            pdf.setTextColor(180, 170, 140);
            pdf.text(`Must try: ${rest.mustTryDishes.slice(0, 3).join(', ')}`, 28, fy + 17);
          }

          if (rest.dietaryTags.length > 0) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(6);
            pdf.setTextColor(34, 197, 94);
            pdf.text(rest.dietaryTags.slice(0, 3).join(' · '), W - 22, fy + 5, { align: 'right' });
          }

          fy += 26;
        });
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6);
        pdf.setTextColor(70, 65, 55);
        pdf.text('Local Food Guide · TripMind AI', W / 2, H - 5, { align: 'center' });
      }

      // ── WEATHER FORECAST PAGE ─────────────────────────────────
      if (weatherForecast && weatherForecast.days.length > 0) {
        pdf.addPage();
        pdf.setFillColor(...dark);
        pdf.rect(0, 0, W, H, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.setTextColor(...gold);
        pdf.text('WEATHER FORECAST', W / 2, 25, { align: 'center' });
        pdf.setDrawColor(...gold);
        pdf.setLineWidth(0.3);
        pdf.line(20, 30, W - 20, 30);

        let wy = 40;
        // Table header
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7);
        pdf.setTextColor(...gold);
        ['DAY', 'TEMP', 'RAIN', 'CONDITION', 'WIND', 'HUMIDITY'].forEach((h, i) => {
          const wx = [20, 55, 85, 110, W - 50, W - 22][i];
          pdf.text(h, wx, wy);
        });
        wy += 5;
        pdf.line(20, wy, W - 20, wy);
        wy += 5;

        weatherForecast.days.slice(0, 14).forEach((wDay, wi) => {
          if (wy > H - 20) {
            pdf.addPage();
            pdf.setFillColor(...dark);
            pdf.rect(0, 0, W, H, 'F');
            wy = 20;
          }
          if (wi % 2 === 0) {
            pdf.setFillColor(28, 22, 8);
            pdf.rect(18, wy - 3, W - 36, 10, 'F');
          }
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7);
          pdf.setTextColor(...cream);
          pdf.text(`${wDay.dayName} ${wDay.dateFormatted}`, 20, wy + 3);
          pdf.text(`${wDay.tempMin}° – ${wDay.tempMax}°C`, 55, wy + 3);

          // Rain probability color-coded
          const rainColor: [number, number, number] = wDay.precipitationProbability > 60 ? [59, 130, 246] : wDay.precipitationProbability > 30 ? [196, 163, 90] : [34, 197, 94];
          pdf.setTextColor(...rainColor);
          pdf.text(`${wDay.precipitationProbability}%`, 85, wy + 3);

          pdf.setTextColor(...grey);
          pdf.text(wDay.condition.description, 110, wy + 3);
          pdf.text(`${wDay.windSpeed} km/h`, W - 50, wy + 3);
          pdf.text(`${wDay.humidity}%`, W - 22, wy + 3);
          wy += 12;
        });
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6);
        pdf.setTextColor(70, 65, 55);
        pdf.text('Weather Forecast · TripMind AI', W / 2, H - 5, { align: 'center' });
      }

      // ── PACKING LIST PAGE ─────────────────────────────────────
      if (packingList && packingList.categories.length > 0) {
        pdf.addPage();
        pdf.setFillColor(...dark);
        pdf.rect(0, 0, W, H, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.setTextColor(...gold);
        pdf.text('WEATHER-BASED PACKING ADVICE', W / 2, 25, { align: 'center' });
        pdf.setDrawColor(...gold);
        pdf.setLineWidth(0.3);
        pdf.line(20, 30, W - 20, 30);

        // Weather & destination notes
        let py = 38;
        if (packingList.weatherNote) {
          pdf.setFont('helvetica', 'italic');
          pdf.setFontSize(8);
          pdf.setTextColor(...cream);
          pdf.text(`☁ ${packingList.weatherNote}`, 20, py);
          py += 6;
        }
        if (packingList.destinationNote) {
          pdf.setFont('helvetica', 'italic');
          pdf.setFontSize(8);
          pdf.setTextColor(...grey);
          pdf.text(`📍 ${packingList.destinationNote}`, 20, py);
          py += 8;
        }

        packingList.categories.forEach((cat) => {
          if (py > H - 30) {
            pdf.addPage();
            pdf.setFillColor(...dark);
            pdf.rect(0, 0, W, H, 'F');
            py = 20;
          }
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.setTextColor(...gold);
          pdf.text(`${cat.icon} ${cat.name.toUpperCase()}`, 20, py);
          py += 6;

          // Two-column layout for items
          cat.items.forEach((item, ii) => {
            if (py > H - 12) {
              pdf.addPage();
              pdf.setFillColor(...dark);
              pdf.rect(0, 0, W, H, 'F');
              py = 20;
            }
            const colX = ii % 2 === 0 ? 24 : W / 2 + 4;
            const itemY = py;

            // Checkbox
            pdf.setDrawColor(...gold);
            pdf.setLineWidth(0.2);
            pdf.rect(colX, itemY - 2.5, 3, 3);

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(7);
            pdf.setTextColor(item.essential ? cream[0] : grey[0], item.essential ? cream[1] : grey[1], item.essential ? cream[2] : grey[2]);
            const qty = item.quantity && item.quantity > 1 ? ` ×${item.quantity}` : '';
            pdf.text(`${item.name}${qty}`, colX + 5, itemY);

            if (item.essential) {
              pdf.setFont('helvetica', 'bold');
              pdf.setFontSize(5);
              pdf.setTextColor(...gold);
              pdf.text('★', colX + 5 + pdf.getTextWidth(`${item.name}${qty}`) + 1, itemY);
            }

            if (ii % 2 === 1 || ii === cat.items.length - 1) py += 5.5;
          });
          py += 4;
        });
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6);
        pdf.setTextColor(70, 65, 55);
        pdf.text('Packing Advice · TripMind AI', W / 2, H - 5, { align: 'center' });
      }

      // ── TRANSPORT & ROUTES PAGE ───────────────────────────────
      if (itinerary.routesAndTransit && itinerary.routesAndTransit.length > 0) {
        pdf.addPage();
        pdf.setFillColor(...dark);
        pdf.rect(0, 0, W, H, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.setTextColor(...gold);
        pdf.text('TRANSPORT OPTIONS', W / 2, 25, { align: 'center' });
        pdf.setDrawColor(...gold);
        pdf.setLineWidth(0.3);
        pdf.line(20, 30, W - 20, 30);

        let ty = 40;
        itinerary.routesAndTransit.forEach((route, ri) => {
          if (ty > H - 30) {
            pdf.addPage();
            pdf.setFillColor(...dark);
            pdf.rect(0, 0, W, H, 'F');
            ty = 20;
          }
          if (ri % 2 === 0) {
            pdf.setFillColor(28, 22, 8);
            pdf.rect(18, ty - 2, W - 36, 20, 'F');
          }
          const modeEmoji = { walking: '🚶', bus: '🚌', train: '🚆', metro: '🚇', taxi: '🚕', bicycle: '🚲', flight: '✈️', other: '🚗' }[route.mode] || '🚗';

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8);
          pdf.setTextColor(...cream);
          pdf.text(`${modeEmoji} ${route.from} → ${route.to}`, 24, ty + 5);

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7);
          pdf.setTextColor(...grey);
          pdf.text(`${route.duration} · ${route.mode.toUpperCase()}`, 24, ty + 11);

          if (route.cost) {
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(7);
            pdf.setTextColor(...gold);
            pdf.text(formatCurrency(route.cost, currency), W - 22, ty + 5, { align: 'right' });
          }

          if (route.tips) {
            pdf.setFont('helvetica', 'italic');
            pdf.setFontSize(6);
            pdf.setTextColor(160, 155, 140);
            pdf.text(route.tips.substring(0, 70), 24, ty + 16);
          }
          ty += 24;
        });
      }

      // ── EMERGENCY INFO (BACK COVER) ───────────────────────────
      pdf.addPage();
      pdf.setFillColor(...dark);
      pdf.rect(0, 0, W, H, 'F');
      pdf.setDrawColor(...gold);
      pdf.setLineWidth(0.5);
      pdf.line(20, 15, W - 20, 15);
      pdf.line(20, H - 15, W - 20, H - 15);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.setTextColor(...gold);
      pdf.text('EMERGENCY INFO', W / 2, 35, { align: 'center' });

      const ei = itinerary.emergencyInfo;
      let ey = 50;
      const emergencyItems = [
        ['🚨 Police', ei.policeNumber],
        ['🚑 Ambulance', ei.ambulanceNumber],
        ['🚒 Fire', ei.fireNumber],
        ['ℹ️ Tourist Helpline', ei.touristHelpline || 'N/A'],
        ['🏥 Nearest Hospital', ei.nearestHospital || 'N/A'],
        ['🏛️ Embassy', ei.embassyInfo || 'N/A'],
      ];
      emergencyItems.forEach(([label, val]) => {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(...grey);
        pdf.text(String(label), 30, ey);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...cream);
        pdf.text(String(val), W / 2, ey);
        ey += 10;
      });

      // Final branding
      ey += 20;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(...gold);
      pdf.text('Have a wonderful trip!', W / 2, ey, { align: 'center' });
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(...grey);
      pdf.text('Powered by TripMind AI · Aura TKS', W / 2, ey + 10, { align: 'center' });

      // Save locally
      pdf.save(`TripMind_${itinerary.destination.replace(/\s+/g, '_')}.pdf`);

      // If email action, open mailto
      if (action === 'email' && user) {
        const subject = encodeURIComponent(`Your AI Itinerary: ${itinerary.destination}`);
        const body = encodeURIComponent(
          `Hi ${user.user_metadata?.full_name || ''},\n\nYour TripMind AI itinerary for ${itinerary.destination} is ready.\n\n📅 Dates: ${formatDateShort(trip.startDate)} — ${formatDateShort(trip.endDate)}\n👥 Group: ${trip.groupMembers.length} traveler${trip.groupMembers.length > 1 ? 's' : ''}\n💰 Budget: ${formatCurrency(trip.totalBudget, currency)}\n\n${itinerary.aiSummary}\n\nPowered by TripMind AI · Aura TKS`
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
