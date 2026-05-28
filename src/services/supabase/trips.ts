import { supabase } from './client';
import { Trip, GroupMember, Expense, getAgeCategory, DietaryRestriction, AccessibilityNeed } from '../../types/trip.types';

export async function saveTrip(trip: Trip, userId: string): Promise<string> {
  const { data: tripData, error: tripError } = await supabase
    .from('trips')
    .insert({
      id: trip.id,
      user_id: userId,
      destination: trip.destination,
      country: trip.country,
      start_date: trip.startDate,
      end_date: trip.endDate,
      total_budget: trip.totalBudget,
      currency: trip.currency,
      trip_style: trip.tripStyle,
      accommodation_type: trip.accommodationType,
      share_token: trip.shareToken || crypto.randomUUID(),
    })
    .select('id, share_token')
    .single();

  if (tripError) throw tripError;

  // Save group members
  if (trip.groupMembers.length > 0) {
    const { error: membersError } = await supabase
      .from('group_members')
      .insert(
        trip.groupMembers.map((m: GroupMember) => ({
          id: m.id,
          trip_id: trip.id,
          name: m.name,
          age: m.age,
          gender: m.gender || 'Not Specified',
          interests: m.interests,
          dietary_restrictions: m.dietaryRestrictions,
          accessibility_needs: m.accessibilityNeeds,
        }))
      );
    if (membersError) throw membersError;
  }

  return tripData.id;
}

export async function loadTrips(userId: string): Promise<Trip[]> {
  const { data, error } = await supabase
    .from('trips')
    .select(`
      *,
      group_members(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(mapTrip);
}

export async function loadTripByShareToken(shareToken: string): Promise<Trip | null> {
  const { data, error } = await supabase
    .from('trips')
    .select(`*, group_members(*)`)
    .eq('share_token', shareToken)
    .single();

  if (error || !data) return null;
  return mapTrip(data);
}

export async function loadTrip(tripId: string): Promise<Trip | null> {
  const { data, error } = await supabase
    .from('trips')
    .select(`*, group_members(*)`)
    .eq('id', tripId)
    .single();

  if (error || !data) return null;
  return mapTrip(data);
}

export async function deleteTrip(tripId: string): Promise<void> {
  const { error } = await supabase.from('trips').delete().eq('id', tripId);
  if (error) throw error;
}

export async function saveItinerary(tripId: string, content: unknown): Promise<void> {
  const { error } = await supabase
    .from('itineraries')
    .upsert({ trip_id: tripId, content, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function loadItinerary(tripId: string): Promise<unknown> {
  const { data, error } = await supabase
    .from('itineraries')
    .select('content')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error) return null;
  return data?.content;
}

export async function saveExpense(expense: Expense): Promise<void> {
  const { error } = await supabase.from('expenses').insert({
    id: expense.id,
    trip_id: expense.tripId,
    description: expense.description,
    amount: expense.amount,
    currency: expense.currency,
    category: expense.category,
    paid_by: expense.paidBy,
    split_between: expense.splitBetween,
  });
  if (error) throw error;
}

export async function loadExpenses(tripId: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((e: Record<string, unknown>) => ({
    id: e.id as string,
    tripId: e.trip_id as string,
    description: e.description as string,
    amount: e.amount as number,
    currency: e.currency as string,
    category: e.category as Expense['category'],
    paidBy: e.paid_by as string,
    splitBetween: e.split_between as string[],
    createdAt: e.created_at as string,
  }));
}

function mapTrip(data: Record<string, unknown>): Trip {
  const members = ((data.group_members as Record<string, unknown>[]) || []).map((m: Record<string, unknown>) => ({
    id: m.id as string,
    name: m.name as string,
    age: m.age as number,
    gender: (m.gender as string) || 'Not Specified',
    ageCategory: getAgeCategory(m.age as number),
    interests: (m.interests as string[]) || [],
    dietaryRestrictions: ((m.dietary_restrictions as string[]) || []) as DietaryRestriction[],
    accessibilityNeeds: ((m.accessibility_needs as string[]) || []) as AccessibilityNeed[],
  }));

  return {
    id: data.id as string,
    userId: data.user_id as string,
    destination: data.destination as string,
    country: data.country as string,
    startDate: data.start_date as string,
    endDate: data.end_date as string,
    totalBudget: data.total_budget as number,
    currency: data.currency as string,
    tripStyle: data.trip_style as Trip['tripStyle'],
    accommodationType: data.accommodation_type as Trip['accommodationType'],
    groupMembers: members,
    shareToken: data.share_token as string,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}
