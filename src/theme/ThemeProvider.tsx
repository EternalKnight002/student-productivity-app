// src/theme/ThemeProvider.tsx
import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import useThemeStore from '../stores/useThemeStore';
import baseTheme from '../theme';

// ThemeContext shape
type ThemeContextType = typeof baseTheme & {
  dark: boolean;
};

// Create context
const ThemeContext = createContext<ThemeContextType>({
  ...baseTheme,
  dark: false,
});

// Provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const dark = useThemeStore((s) => s.dark);
  const accent = useThemeStore((s) => s.accent);

  // Merge base theme with overrides
  const theme = useMemo(() => {
    const isDark = dark ?? (systemScheme === 'dark');
    const colors = {
      ...baseTheme.colors,
      primary: accent,
      accent,
      background: isDark ? '#0B1220' : '#F8FAFC',
      surface: isDark ? '#0f1724' : '#FFFFFF',
      text: isDark ? '#E6EEF8' : '#0F1724',
      muted: isDark ? '#9AA7B2' : '#94A3B8',
      danger: '#FF5C5C',
    };

    return {
      ...baseTheme,
      dark: isDark,
      colors,
    };
  }, [dark, accent, systemScheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

// Hook to use theme
export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;
