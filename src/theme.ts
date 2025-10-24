// src/theme.ts
// Central design tokens used across the app.

export const colors = {
  primary: '#3751FF',
  accent: '#00C48C',
  background: '#F7F8FA',
  surface: '#FFFFFF',
  muted: '#9AA0A6',
  text: '#0F1724',
  danger: '#FF5C5C',
  // category palette
  category: {
    food: '#4A90E2',
    transport: '#FFB74D',
    college: '#7E57C2',
    books: '#00C48C',
    snacks: '#FF7AA2',
    other: '#9E9E9E',
  },
};

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

export default {
  colors,
  typography,
  spacing,
  radii,
  sizes,
  motion,
};
