// src/theme.ts
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'app-settings-theme-v2';
const ACCENT_KEY = 'app-settings-accent-v1';

/* -----------------------
   Design token objects
   ----------------------- */
export const defaultTokens = {
  colors: {
    primary: '#3751FF',
    accent: '#00C48C',
    background: '#F7F8FA',
    surface: '#FFFFFF',
    muted: '#9AA0A6',
    text: '#0F1724',
    danger: '#FF5C5C',
    category: {
      food: '#4A90E2',
      transport: '#FFB74D',
      college: '#7E57C2',
      books: '#00C48C',
      snacks: '#FF7AA2',
      other: '#9E9E9E',
    },
  },
  typography: {
    h1: { fontSize: 24, lineHeight: 32, fontWeight: '700' as const },
    h2: { fontSize: 20, lineHeight: 28, fontWeight: '700' as const },
    body: { fontSize: 16, lineHeight: 22, fontWeight: '400' as const },
    small: { fontSize: 12, lineHeight: 18, fontWeight: '400' as const },
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 32 },
  radii: { sm: 8, md: 12, lg: 16, round: 999 },
  sizes: { fab: 56, buttonHeight: 48, minTouch: 44 },
  motion: { durationFast: 120, duration: 220, durationSlow: 360, easing: 'cubic-bezier(0.2,0.8,0.2,1)' },
};

export const darkTokens = {
  colors: {
    ...defaultTokens.colors,
    background: '#0B0D0F',
    surface: '#0F1417',
    text: '#E6EEF6',
    muted: '#9AA0A6',
    primary: '#7C5CFF',
    accent: '#00C48C',
    danger: '#FF6B6B',
  },
  typography: defaultTokens.typography,
  spacing: defaultTokens.spacing,
  radii: defaultTokens.radii,
  sizes: defaultTokens.sizes,
  motion: defaultTokens.motion,
};

/* -----------------------
   Types
   ----------------------- */
export type Tokens = typeof defaultTokens;
export type Mode = 'light' | 'dark';

export type ThemeController = {
  theme: Tokens;
  colors: Tokens['colors'];
  typography: Tokens['typography'];
  spacing: Tokens['spacing'];
  radii: Tokens['radii'];
  sizes: Tokens['sizes'];
  motion: Tokens['motion'];

  mode: Mode;
  setMode: (m: Mode) => Promise<void>;
  toggleMode: () => Promise<void>;

  setAccent: (hex: string) => Promise<void>;
};

/* -----------------------
   Context + Provider
   ----------------------- */
const ThemeCtx = createContext<ThemeController | null>(null);
// Optional alias to satisfy imports expecting `ThemeContext`
export const ThemeContext = ThemeCtx;

export function ThemeProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const systemPref: ColorSchemeName = Appearance.getColorScheme();
  const initialMode: Mode = systemPref === 'dark' ? 'dark' : 'light';
  const [mode, setModeState] = useState<Mode>(initialMode);
  const [tokens, setTokens] = useState<Tokens>(() => (initialMode === 'dark' ? darkTokens : defaultTokens));

  // on mount, load persisted mode and accent
  useEffect(() => {
    (async (): Promise<void> => {
      try {
        const [storedMode, storedAccent] = await Promise.all([
          AsyncStorage.getItem(THEME_KEY),
          AsyncStorage.getItem(ACCENT_KEY),
        ]);

        let loadedMode: Mode = initialMode;
        if (storedMode === 'dark' || storedMode === 'light') {
          loadedMode = storedMode;
          setModeState(storedMode);
        }

        if (storedAccent && typeof storedAccent === 'string') {
          setTokens(() => {
            const base = loadedMode === 'dark' ? { ...darkTokens } : { ...defaultTokens };
            base.colors = { ...base.colors, primary: storedAccent };
            return base;
          });
        }
      } catch {
        /* ignore */
      }
    })();
  }, [initialMode]);

  // whenever mode changes, update tokens and preserve customized primary
  useEffect(() => {
    setTokens((prev) => {
      const base = mode === 'dark' ? { ...darkTokens } : { ...defaultTokens };
      const prevPrimary = prev?.colors?.primary;
      if (prevPrimary && prevPrimary !== defaultTokens.colors.primary && prevPrimary !== darkTokens.colors.primary) {
        base.colors = { ...base.colors, primary: prevPrimary };
      }
      return base;
    });
  }, [mode]);

  const setMode = async (m: Mode): Promise<void> => {
    try {
      await AsyncStorage.setItem(THEME_KEY, m);
    } catch {
      /* ignore */
    }
    setModeState(m);
  };

  const toggleMode = async (): Promise<void> => {
    await setMode(mode === 'light' ? 'dark' : 'light');
  };

  const setAccent = async (hex: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(ACCENT_KEY, hex);
    } catch {
      /* ignore */
    }
    setTokens((prev) => {
      const copy = { ...prev };
      copy.colors = { ...copy.colors, primary: hex };
      return copy;
    });
  };

  const controller: ThemeController = useMemo(
    () => ({
      theme: tokens,
      colors: tokens.colors,
      typography: tokens.typography,
      spacing: tokens.spacing,
      radii: tokens.radii,
      sizes: tokens.sizes,
      motion: tokens.motion,
      mode,
      setMode,
      toggleMode,
      setAccent,
    }),
    [tokens, mode],
  );

  // Use React.createElement to avoid JSX in .ts files
  return React.createElement(ThemeCtx.Provider, { value: controller }, children);
}

/* -----------------------
   Hook + default export
   ----------------------- */
export function useTheme(): ThemeController {
  const ctx = useContext(ThemeCtx);
  if (!ctx) {
    const noop = async (): Promise<void> => {};
    return {
      theme: defaultTokens,
      colors: defaultTokens.colors,
      typography: defaultTokens.typography,
      spacing: defaultTokens.spacing,
      radii: defaultTokens.radii,
      sizes: defaultTokens.sizes,
      motion: defaultTokens.motion,
      mode: 'light',
      setMode: noop,
      toggleMode: noop,
      setAccent: noop,
    };
  }
  return ctx;
}

export default defaultTokens;
