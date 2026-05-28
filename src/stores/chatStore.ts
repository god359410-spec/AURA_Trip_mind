import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatMessage } from '../types/ai.types';

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  tripId: string | null;

  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (content: string) => void;
  setTyping: (typing: boolean) => void;
  setTripId: (tripId: string | null) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      isTyping: false,
      tripId: null,

      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages.slice(-39), message], // Rolling 40-message window
        })),

      updateLastMessage: (content) =>
        set((state) => ({
          messages: state.messages.map((m, i) =>
            i === state.messages.length - 1 ? { ...m, content } : m
          ),
        })),

      setTyping: (isTyping) => set({ isTyping }),
      setTripId: (tripId) => set({ tripId }),
      clearChat: () => set({ messages: [], isTyping: false }),
    }),
    { name: 'tripmind-chat', version: 1 }
  )
);
