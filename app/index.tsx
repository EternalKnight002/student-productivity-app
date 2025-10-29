// app/index.tsx
// Modern interactive home screen with bolder footer icons + analytics swap
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../src/theme';
import Card from '../src/components/Card';

type Feature = {
  key: string;
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  route: string;
  colorA: string;
  colorB: string;
};

const FEATURES: Feature[] = [
  {
    key: 'expenses',
    title: 'Expenses',
    subtitle: 'Track and manage your spending',
    icon: 'credit-card',
    route: '/expenses',
    colorA: '#2D9CDB',
    colorB: '#60C0FF',
  },
  {
    key: 'notes',
    title: 'Notes',
    subtitle: 'Capture ideas and study materials',
    icon: 'file-text',
    route: '/notes',
    colorA: '#A78BFA',
    colorB: '#C4B5FD',
  },
  {
    key: 'planner',
    title: 'Planner',
    subtitle: 'Plan your schedule and deadlines',
    icon: 'calendar',
    route: '/planner',
    colorA: '#FB8C00',
    colorB: '#FFB86B',
  },
];

const NAV_ITEMS = [
  { key: 'expenses', label: 'Expenses', icon: 'credit-card', route: '/expenses' },
  { key: 'notes', label: 'Notes', icon: 'file-text', route: '/notes' },
  { key: 'planner', label: 'Planner', icon: 'calendar', route: '/planner' },
  // swapped settings -> analytics
  { key: 'analytics', label: 'Analytics', icon: 'chart-line', route: '/analytics' },
];

export default function Home(): React.ReactElement {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const theme = useTheme();
  const colors = theme.colors;

  const [active, setActive] = useState<string>('expenses');

  // screen entrance animation
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [anim]);

  const opacity = anim;
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  const bg = colors.background;
  const surface = colors.surface;
  const text = colors.text;
  const muted = colors.muted;
  const primary = colors.primary;

  function navigateTo(route: string, key?: string) {
    if (key) setActive(key);
    try {
      router.push(route);
    } catch (err) {
      // fallback
      // @ts-ignore
      router.replace ? router.replace(route) : router.push(route);
    }
  }

  return (
    <View style={[styles.page, { backgroundColor: bg }]}>
      <Animated.View
        style={[
          styles.container,
          {
            opacity,
            transform: [{ translateY }],
            paddingHorizontal: isTablet ? 48 : 16,
            paddingTop: isTablet ? 14 : 12,
          },
        ]}
      >
        {/* Subtle on-page header (keeps global header intact) */}
        <View style={styles.introWrap}>
          <Text style={[styles.pageTitle, { color: text }]}>Welcome Back</Text>
          <Text style={[styles.pageSubtitle, { color: muted }]}>
            What would you like to work on today?
          </Text>
        </View>

        {/* New interactive feature cards */}
        <View style={[styles.features, isTablet && { maxWidth: 900 }]}>
          {FEATURES.map((f) => (
            <FeatureCard
              key={f.key}
              feature={f}
              surface={surface}
              text={text}
              muted={muted}
              onPress={() => navigateTo(f.route, f.key)}
            />
          ))}
        </View>

        <View style={{ flex: 1 }} />

        {/* Bottom nav — heavier icons (MaterialCommunityIcons used for visual weight) */}
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
                  {/* use MaterialCommunityIcons for a chunkier look */}
                  <MaterialCommunityIcons
                    name={n.icon as any}
                    size={22}
                    color={isActive ? primary : muted}
                    style={{ marginBottom: 2 }}
                  />
                  <Text style={[styles.navLabel, { color: isActive ? primary : muted }]}>
                    {n.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

/* FeatureCard component (local) */
function FeatureCard({
  feature,
  surface,
  text,
  muted,
  onPress,
}: {
  feature: Feature;
  surface: string;
  text: string;
  muted: string;
  onPress: () => void;
}) {
  // press animation
  const scale = useRef(new Animated.Value(1)).current;

  function onPressIn() {
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, friction: 8 }).start();
  }
  function onPressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 8 }).start();
  }

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
    >
      <Animated.View style={[styles.featurePressable, { transform: [{ scale }] }]}>
        <Card style={[styles.featureCard, { backgroundColor: surface }]}>
          <View style={styles.featureRow}>
            <View style={styles.iconWrap}>
              <LinearGradient
                colors={[feature.colorA, feature.colorB]}
                start={[0, 0]}
                end={[1, 1]}
                style={styles.gradientCircle}
              >
                <Feather name={feature.icon} size={18} color="#fff" />
              </LinearGradient>
            </View>

            <View style={styles.textWrap}>
              <Text style={[styles.featureTitle, { color: text }]}>{feature.title}</Text>
              <Text style={[styles.featureSubtitle, { color: muted }]}>{feature.subtitle}</Text>
            </View>

            <View style={styles.chevWrap}>
              <Feather name="chevron-right" size={20} color={muted} />
            </View>
          </View>
        </Card>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  container: { flex: 1 },

  introWrap: { marginTop: 6, marginBottom: 12 },
  pageTitle: { fontSize: 28, fontWeight: '800' },
  pageSubtitle: { marginTop: 6, fontSize: 14 },

  features: { width: '100%' },
  featurePressable: {
    marginBottom: 14,
  },
  featureCard: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    // subtle lift/shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 18,
      },
      android: { elevation: 3 },
    }),
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: { width: 64, alignItems: 'center', justifyContent: 'center' },
  gradientCircle: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1, paddingRight: 8 },
  featureTitle: { fontSize: 18, fontWeight: '800' },
  featureSubtitle: { marginTop: 6, fontSize: 13 },

  chevWrap: { width: 28, alignItems: 'center' },

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
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: -8 },
        shadowRadius: 18,
      },
      android: { elevation: 18 },
    }),
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 26 : 12,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    minWidth: 64,
  },
  navLabel: { fontSize: 11, marginTop: 4 },
});
