import { Trip, GroupMember, GroupConstraints } from '../../types/trip.types';
import { WeatherForecast } from '../../types/weather.types';

export function buildGroupContext(members: GroupMember[]): string {
  return members.map((m, i) => 
    `Member ${i + 1}: ${m.name}, Age ${m.age} (${m.ageCategory}), ` +
    `Interests: ${m.interests.join(', ') || 'General'}, ` +
    `Dietary: ${m.dietaryRestrictions.join(', ') || 'None'}, ` +
    `Accessibility: ${m.accessibilityNeeds.join(', ') || 'None'}`
  ).join('\n');
}

export function buildTripContext(trip: Trip): string {
  const nights = Math.ceil(
    (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  return [
    `Destination: ${trip.destination}, ${trip.country}`,
    `Dates: ${trip.startDate} to ${trip.endDate} (${nights} nights)`,
    `Total Budget: ${trip.currency} ${trip.totalBudget.toLocaleString()}`,
    `Trip Style: ${trip.tripStyle}`,
    `Accommodation: ${trip.accommodationType}`,
    `Group Size: ${trip.groupMembers.length} people`,
  ].join('\n');
}

export function buildWeatherContext(forecast: WeatherForecast | null): string {
  if (!forecast || forecast.days.length === 0) return 'Weather data unavailable.';
  
  return 'Weather Forecast:\n' + forecast.days.slice(0, 5).map(d => 
    `  ${d.dayName} ${d.dateFormatted}: ${d.tempMin}-${d.tempMax}°C, ${d.precipitationProbability}% rain, ${d.condition.description}`
  ).join('\n');
}

export function buildConstraintsContext(constraints: GroupConstraints): string {
  const parts: string[] = [];
  if (constraints.hasInfants) parts.push('Group includes infants/toddlers (stroller access, nap times)');
  if (constraints.hasChildren) parts.push('Group includes children (kid-friendly activities essential)');
  if (constraints.hasElderly) parts.push('Group includes elderly members (accessibility, slow pace, rest periods)');
  if (constraints.mobilityRestrictions.length > 0) parts.push(`Mobility restrictions: ${constraints.mobilityRestrictions.join(', ')}`);
  if (constraints.dietaryRestrictions.length > 0) parts.push(`Dietary restrictions: ${constraints.dietaryRestrictions.join(', ')}`);
  if (constraints.conflictVectors.length > 0) parts.push(`Preference conflicts to resolve: ${constraints.conflictVectors.join(', ')}`);
  return parts.length > 0 ? 'Key Constraints:\n' + parts.map(p => `  - ${p}`).join('\n') : 'No special constraints.';
}

export function buildFullContext(trip: Trip, forecast: WeatherForecast | null, constraints: GroupConstraints): string {
  return [
    '=== TRIP DETAILS ===',
    buildTripContext(trip),
    '',
    '=== GROUP MEMBERS ===',
    buildGroupContext(trip.groupMembers),
    '',
    '=== GROUP CONSTRAINTS ===',
    buildConstraintsContext(constraints),
    '',
    '=== WEATHER ===',
    buildWeatherContext(forecast),
  ].join('\n');
}
