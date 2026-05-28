import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Trip, GroupMember, GroupConstraints, BudgetBreakdown } from '../types/trip.types';
import { AgentStatus } from '../types/ai.types';

interface TripState {
  currentTrip: Trip | null;
  groupConstraints: GroupConstraints | null;
  isGenerating: boolean;
  generationProgress: number;
  agentStatus: AgentStatus;
  savedTrips: Trip[];

  setCurrentTrip: (trip: Trip | null) => void;
  addGroupMember: (member: GroupMember) => void;
  removeGroupMember: (id: string) => void;
  updateGroupMember: (id: string, updates: Partial<GroupMember>) => void;
  setGroupConstraints: (constraints: GroupConstraints) => void;
  setGenerating: (loading: boolean) => void;
  setGenerationProgress: (progress: number) => void;
  setAgentStatus: (status: AgentStatus) => void;
  setSavedTrips: (trips: Trip[]) => void;
  addSavedTrip: (trip: Trip) => void;
  resetTrip: () => void;
}

const defaultAgentStatus: AgentStatus = {
  groupAnalyzer: 'idle', weather: 'idle', budget: 'idle',
  hotel: 'idle', food: 'idle', packing: 'idle', itinerary: 'idle',
};

export const useTripStore = create<TripState>()(
  persist(
    (set) => ({
      currentTrip: null,
      groupConstraints: null,
      isGenerating: false,
      generationProgress: 0,
      agentStatus: defaultAgentStatus,
      savedTrips: [],

      setCurrentTrip: (trip) => set({ currentTrip: trip }),

      addGroupMember: (member) =>
        set((state) => ({
          currentTrip: state.currentTrip
            ? { ...state.currentTrip, groupMembers: [...state.currentTrip.groupMembers, member] }
            : state.currentTrip,
        })),

      removeGroupMember: (id) =>
        set((state) => ({
          currentTrip: state.currentTrip
            ? { ...state.currentTrip, groupMembers: state.currentTrip.groupMembers.filter(m => m.id !== id) }
            : state.currentTrip,
        })),

      updateGroupMember: (id, updates) =>
        set((state) => ({
          currentTrip: state.currentTrip
            ? {
                ...state.currentTrip,
                groupMembers: state.currentTrip.groupMembers.map(m => m.id === id ? { ...m, ...updates } : m),
              }
            : state.currentTrip,
        })),

      setGroupConstraints: (groupConstraints) => set({ groupConstraints }),
      setGenerating: (isGenerating) => set({ isGenerating }),
      setGenerationProgress: (generationProgress) => set({ generationProgress }),
      setAgentStatus: (agentStatus) => set({ agentStatus }),
      setSavedTrips: (savedTrips) => set({ savedTrips }),
      addSavedTrip: (trip) => set((state) => ({ savedTrips: [trip, ...state.savedTrips] })),
      resetTrip: () => set({ currentTrip: null, groupConstraints: null, agentStatus: defaultAgentStatus, generationProgress: 0, isGenerating: false }),
    }),
    { name: 'tripmind-trip', version: 1 }
  )
);
