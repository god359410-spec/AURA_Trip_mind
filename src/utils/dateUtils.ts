import { format, differenceInDays, parseISO, addDays } from 'date-fns';

export function formatDate(dateStr: string, fmt = 'MMM d, yyyy'): string {
  try { return format(parseISO(dateStr), fmt); }
  catch { return dateStr; }
}

export function formatDateShort(dateStr: string): string {
  return formatDate(dateStr, 'MMM d');
}

export function getTripDuration(startDate: string, endDate: string): number {
  return differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;
}

export function getTripNights(startDate: string, endDate: string): number {
  return differenceInDays(parseISO(endDate), parseISO(startDate));
}

export function getDaysArray(startDate: string, endDate: string): string[] {
  const nights = differenceInDays(parseISO(endDate), parseISO(startDate));
  return Array.from({ length: nights + 1 }, (_, i) =>
    format(addDays(parseISO(startDate), i), 'yyyy-MM-dd')
  );
}

export function formatDayName(dateStr: string): string {
  return formatDate(dateStr, 'EEEE');
}

export function getTodayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getMinEndDate(startDate: string): string {
  return format(addDays(parseISO(startDate), 1), 'yyyy-MM-dd');
}
