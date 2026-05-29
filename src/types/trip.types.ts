export type TripStyle = 'adventure' | 'relaxation' | 'culture' | 'food' | 'mixed' | 'luxury' | 'budget';
export type AccommodationType = 'hostel' | 'budget' | 'mid-range' | 'boutique' | 'luxury';
export type AccessibilityNeed = 'wheelchair' | 'low_mobility' | 'vision_impaired' | 'hearing_impaired' | 'cognitive' | 'none';
export type DietaryRestriction = 'vegetarian' | 'vegan' | 'halal' | 'kosher' | 'gluten-free' | 'nut-free' | 'dairy-free' | 'diabetic-friendly' | 'none';
export type AgeCategory = 'infant' | 'child' | 'teen' | 'young_adult' | 'adult' | 'senior' | 'elderly';

export function getAgeCategory(age: number): AgeCategory {
  if (age < 5) return 'infant';
  if (age < 13) return 'child';
  if (age < 18) return 'teen';
  if (age < 36) return 'young_adult';
  if (age < 56) return 'adult';
  if (age < 71) return 'senior';
  return 'elderly';
}

export interface GroupMember {
  id: string;
  name: string;
  age: number;
  gender: string;
  ageCategory: AgeCategory;
  interests: string[];
  dietaryRestrictions: DietaryRestriction[];
  accessibilityNeeds: AccessibilityNeed[];
  isOrganizer?: boolean;
}

export interface Trip {
  id: string;
  userId?: string;
  destination: string;
  country: string;
  startingLocation?: string;
  coordinates?: { lat: number; lng: number };
  startDate: string; // ISO date string
  endDate: string;
  totalBudget: number;
  currency: string;
  tripStyle: TripStyle;
  accommodationType: AccommodationType;
  groupMembers: GroupMember[];
  shareToken?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TripFormData {
  destination: string;
  country: string;
  startingLocation?: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  currency: string;
  tripStyle: TripStyle;
  accommodationType: AccommodationType;
  groupMembers: Omit<GroupMember, 'id' | 'ageCategory'>[];
}

export interface BudgetBreakdown {
  accommodation: number;
  food: number;
  activities: number;
  transport: number;
  shopping: number;
  emergency: number;
  perPersonPerDay: number;
  totalPerPerson: number;
}

export interface GroupConstraints {
  mobilityRestrictions: string[];
  dietaryRestrictions: string[];
  ageRange: { min: number; max: number };
  hasChildren: boolean;
  hasElderly: boolean;
  hasInfants: boolean;
  pacePreference: 'slow' | 'moderate' | 'fast';
  conflictVectors: string[];
  accessibilityScore: number;
  commonInterests: string[];
}

export interface Expense {
  id: string;
  tripId: string;
  description: string;
  amount: number;
  currency: string;
  category: 'accommodation' | 'food' | 'activities' | 'transport' | 'shopping' | 'other';
  paidBy: string;
  splitBetween: string[];
  createdAt: string;
}

export interface SplitResult {
  member: string;
  owes: { to: string; amount: number }[];
  isOwed: { from: string; amount: number }[];
  netBalance: number;
}
