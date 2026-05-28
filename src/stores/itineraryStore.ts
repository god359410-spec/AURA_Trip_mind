import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Itinerary } from '../types/itinerary.types';
import { HotelRecommendation } from '../types/hotel.types';
import { FoodRecommendation, PackingList, PackingCategory } from '../types/ai.types';

interface ItineraryState {
  itinerary: Itinerary | null;
  hotels: HotelRecommendation[];
  restaurants: FoodRecommendation[];
  packingList: PackingList | null;

  setItinerary: (itinerary: Itinerary | null) => void;
  setHotels: (hotels: HotelRecommendation[]) => void;
  setRestaurants: (restaurants: FoodRecommendation[]) => void;
  setPackingList: (packingList: PackingList | null) => void;
  togglePackingItem: (categoryId: string, itemId: string) => void;
  clearAll: () => void;
}

export const useItineraryStore = create<ItineraryState>()(
  persist(
    (set) => ({
      itinerary: null,
      hotels: [],
      restaurants: [],
      packingList: null,

      setItinerary: (itinerary) => set({ itinerary }),
      setHotels: (hotels) => set({ hotels }),
      setRestaurants: (restaurants) => set({ restaurants }),
      setPackingList: (packingList) => set({ packingList }),

      togglePackingItem: (categoryId, itemId) =>
        set((state) => ({
          packingList: state.packingList
            ? {
                ...state.packingList,
                categories: state.packingList.categories.map((cat: PackingCategory) =>
                  cat.id === categoryId
                    ? { ...cat, items: cat.items.map(item => item.id === itemId ? { ...item, packed: !item.packed } : item) }
                    : cat
                ),
              }
            : null,
        })),

      clearAll: () => set({ itinerary: null, hotels: [], restaurants: [], packingList: null }),
    }),
    { name: 'tripmind-itinerary', version: 1 }
  )
);
