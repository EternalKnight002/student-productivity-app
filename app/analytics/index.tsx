// app/index.tsx
// Home screen — updated to use useTheme() hook from src/theme for dynamic light/dark support.

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

// Import the hook (preferred) so this screen responds to system dark mode
import { useTheme } from '../../src/theme';
import Card from '../../src/components/Card';

type Feature = {
  key: string;
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  route: string; // must match app/route path
  color?: string;
};

const FEATURES: Feature[] = [
  {
    key: 'expenses',
    title: 'Expenses',
    subtitle: 'Track and manage your spending',
    icon: 'credit-card',
    route: '/expenses',
    color: '#2D9CDB',
  },
  {
    key: 'notes',
    title: 'Notes',
    subtitle: 'Capture ideas and study materials',
    icon: 'file-text',
    route: '/notes',
    color: '#A78BFA',
  },
  {
    key: 'planner',
    title: 'Planner',
    subtitle: 'Plan your schedule and deadlines',
    icon: 'calendar',
    route: '/planner',
    color: '#FB8C00',
  },
];

const NAV_ITEMS = [
  { key: 'expenses', label: 'Expenses', icon: 'credit-card', route: '/expenses' },
  { key: 'notes', label: 'Notes', icon: 'file-text', route: '/notes' },
  { key: 'planner', label: 'Planner', icon: 'calendar', route: '/planner' },
  { key: 'settings', label: 'Settings', icon: 'settings', route: '/settings' },
];

export default function Home(): React.ReactElement {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const theme = useTheme();
  const colors = theme.colors;

  const [active, setActive] = useState<string>('expenses');

  // entrance animation
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [anim]);

  const opacity = anim;
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });

  const bg = colors.background;
  const surface = colors.surface;
  const text = colors.text;
  const muted = colors.muted;
  const primary = colors.primary;

  // Robust navigation helper for expo-router
  function navigateTo(route: string, key?: string) {
    if (key) setActive(key);

    try {
      router.push(route);
    } catch (err) {
      try {
        // @ts-ignore
        router.replace ? router.replace(route) : router.push(route);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Navigation failed:', err, e);
      }
    }
  }

  return (
    <View style={[styles.page, { backgroundColor: bg }]}> 
      {/* Animated content area; top spacing kept small because global header sits above */}
      <Animated.View
        style={[
          styles.container,
          {
            opacity,
            transform: [{ translateY }],
            paddingHorizontal: isTablet ? 48 : 16,
            paddingTop: isTablet ? 12 : 12,
          },
        ]}
      >
        {/* Page heading inside content */}
        <View style={styles.introWrap}>
          <Text style={[styles.pageTitle, { color: text }]}>Welcome Back</Text>
          <Text style={[styles.pageSubtitle, { color: muted }]}>What would you like to work on today?</Text>
        </View>

        <View style={[styles.features, isTablet && { maxWidth: 900 }]}>
          {FEATURES.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => navigateTo(f.route, f.key)}
              android_ripple={{ color: '#00000006' }}
              style={({ pressed }) => [styles.featurePressable, pressed && styles.featurePressed]}
              accessibilityRole="button"
              accessibilityLabel={`${f.title} — ${f.subtitle}`}
            >
              <Card style={[styles.featureCard, { backgroundColor: surface }]}>
                <View style={styles.featureRow}>
                  <View style={styles.iconWrap}>
                    <View style={[styles.iconCircle, { backgroundColor: f.color ?? primary }]}>
                      <Feather name={f.icon} size={18} color="#fff" />
                    </View>
                  </View>

                  <View style={styles.textWrap}>
                    <Text style={[styles.featureTitle, { color: text }]}>{f.title}</Text>
                    <Text style={[styles.featureSubtitle, { color: muted }]}>{f.subtitle}</Text>
                  </View>

                  <Feather name="chevron-right" size={20} color={muted} />
                </View>
              </Card>
            </Pressable>
          ))}
        </View>

        <View style={{ flex: 1 }} />

        {/* Bottom nav */}
        <View style={styles.bottomShell} pointerEvents="box-none">
          <View style={[styles.bottomBar, { backgroundColor: surface }]}>
            {NAV_ITEMS.map((n) => {
              const isActive = active === n.key;
              return (
                <Pressable
                  key={n.key}
                  onPress={() => navigateTo(n.route, n.key)}
                  style={({ pressed }) => [styles.navItem, pressed && { opacity: 0.85 }]}
                  accessibilityRole="button"
                  accessibilityLabel={n.label}
                >
                  <Feather name={n.icon as any} size={20} color={isActive ? primary : muted} />
                  <Text style={[styles.navLabel, { color: isActive ? primary : muted }]}>{n.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  container: { flex: 1 },

  introWrap: { marginTop: 6, marginBottom: 12 },
  pageTitle: { fontSize: 28, fontWeight: '800' },
  pageSubtitle: { marginTop: 6, fontSize: 14 },

  features: { width: '100%' },
  featurePressable: { marginBottom: 12 },
  featurePressed: { opacity: 0.95 },
  featureCard: { borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 56, alignItems: 'center', justifyContent: 'center' },
  iconCircle: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  textWrap: { flex: 1, paddingRight: 8 },
  featureTitle: { fontSize: 18, fontWeight: '700' },
  featureSubtitle: { marginTop: 4, fontSize: 14 },

  bottomShell: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.22,
        shadowOffset: { width: 0, height: -8 },
        shadowRadius: 18,
      },
      android: { elevation: 14 },
    }),
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
  },
  navItem: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, minWidth: 56 },
  navLabel: { fontSize: 11, marginTop: 4 },
});
