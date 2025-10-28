import { useColorScheme } from 'react-native';

export type ThemeColors = {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  muted: string;
  text: string;
  danger: string;
  category: Record<string, string>;
};

export type Theme = {
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  radii: typeof radii;
  sizes: typeof sizes;
  motion: typeof motion;
};

// Shared tokens (typography, spacing, radii, sizes, motion) remain the same
export const typography = {
  h1: { fontSize: 24, lineHeight: 32, fontWeight: '700' as const },
  h2: { fontSize: 20, lineHeight: 28, fontWeight: '700' as const },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' as const },
  small: { fontSize: 12, lineHeight: 18, fontWeight: '400' as const },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  round: 999,
};

export const sizes = {
  fab: 56,
  buttonHeight: 48,
  minTouch: 44,
};

export const motion = {
  durationFast: 120,
  duration: 220,
  durationSlow: 360,
  // simple easing label for reference
  easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
};

// Define light palette
const lightColors: ThemeColors = {
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
};

// Define dark palette
const darkColors: ThemeColors = {
  primary: '#8EA2FF',
  accent: '#4CE0B2',
  background: '#0F1724',
  surface: '#0B1220',
  muted: '#9AA0A6',
  text: '#E6EEF8',
  danger: '#FF8A8A',
  category: {
    food: '#6EA8FF',
    transport: '#FFD38A',
    college: '#B39DFF',
    books: '#76E7C4',
    snacks: '#FFA2C6',
    other: '#B0B0B0',
  },
};

// Build a theme object based on colors
function buildTheme(colors: ThemeColors): Theme {
  return {
    colors,
    typography,
    spacing,
    radii,
    sizes,
    motion,
  };
}

// Public API:
// getTheme(mode?) -> returns a theme object for 'light' or 'dark' (default 'light')
export function getTheme(mode?: 'light' | 'dark'): Theme {
  const useMode = mode ?? 'light';
  return buildTheme(useMode === 'dark' ? darkColors : lightColors);
}

// React hook: useTheme() reads system appearance and returns the correct theme
export function useTheme(): Theme {
  const scheme = useColorScheme();
  return getTheme(scheme === 'dark' ? 'dark' : 'light');
}

// Default export for backward compatibility with `import theme from '../src/theme'`.
// The default export returns the light theme; consumers who want automatic dark
// switching should import { useTheme } and call it inside components.
export default getTheme();
