import { create } from 'zustand';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface UIState {
  isHotelModalOpen: boolean;
  selectedHotelId: string | null;
  toasts: Toast[];
  activeTripTab: string;
  isMobileMenuOpen: boolean;

  openHotelModal: (hotelId: string) => void;
  closeHotelModal: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  setActiveTripTab: (tab: string) => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isHotelModalOpen: false,
  selectedHotelId: null,
  toasts: [],
  activeTripTab: 'itinerary',
  isMobileMenuOpen: false,

  openHotelModal: (selectedHotelId) => set({ isHotelModalOpen: true, selectedHotelId }),
  closeHotelModal: () => set({ isHotelModalOpen: false, selectedHotelId: null }),

  addToast: (toast) => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    const duration = toast.duration ?? 4000;
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, duration);
  },

  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) })),
  setActiveTripTab: (activeTripTab) => set({ activeTripTab }),
  setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
}));
