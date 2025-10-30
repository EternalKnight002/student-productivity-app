// src/stores/useThemeStore.ts
import create from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeState = {
  dark: boolean;
  accent: string;
  setDark: (v: boolean) => void;
  toggleDark: () => void;
  setAccent: (c: string) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      dark: false,
      accent: '#3751FF',
      setDark: (v: boolean) => set({ dark: v }),
      toggleDark: () => set((s) => ({ dark: !s.dark })),
      setAccent: (c: string) => set({ accent: c }),
    }),
    {
      name: 'student_theme_v1',
      getStorage: () => AsyncStorage,
      partialize: (state) => ({ dark: state.dark, accent: state.accent }),
    },
  ),
);

export default useThemeStore;
