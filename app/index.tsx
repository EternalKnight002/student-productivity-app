// app/index.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  Platform,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import theme from "../src/theme";
import Card from "../src/components/Card";

/**
 * Clean, robust Home screen for app/
 * - Uses ../../src/... imports (no import path errors)
 * - Uses Card + Pressable for feature rows (no PrimaryButton prop mismatch)
 * - Dark theme fallback and safe theme token usage
 * - Full-width bottom nav with curved top corners
 * - Simple entrance animation (Animated API compatible with Expo Go)
 *
 * Paste this as: app/index.tsx
 */

// const APP_VERSION = "0.1.0";

type Feature = {
  key: string;
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  route: string;
  color?: string;
};

const FEATURES: Feature[] = [
  {
    key: "expenses",
    title: "Expenses",
    subtitle: "Track and manage your spending",
    icon: "credit-card",
    route: "/expenses",
    color: "#2D9CDB",
  },
  {
    key: "notes",
    title: "Notes",
    subtitle: "Capture ideas and study materials",
    icon: "file-text",
    route: "/notes",
    color: "#A78BFA",
  },
  {
    key: "planner",
    title: "Planner",
    subtitle: "Plan your schedule and deadlines",
    icon: "calendar",
    route: "/planner",
    color: "#FB8C00",
  },
];

const NAV_ITEMS = [
  { key: "expenses", label: "Expenses", icon: "credit-card", route: "/expenses" },
  { key: "notes", label: "Notes", icon: "file-text", route: "/notes" },
  { key: "planner", label: "Planner", icon: "calendar", route: "/planner" },
  { key: "settings", label: "Settings", icon: "settings", route: "/settings" },
];

export default function Home(): React.ReactElement {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // keep a local active key to reflect bottom nav
  const [active, setActive] = useState<string>("expenses");

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
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 0],
  });

  // safe theme tokens with fallbacks
  const colors = (theme && theme.colors) || ({} as any);
  const bg = colors.background ?? "#07080a";
  const surface = colors.surface ?? "#0f1417";
  const text = colors.text ?? "#ffffff";
  const muted = colors.muted ?? "#9aa0a6";
  const primary = colors.primary ?? "#7C5CFF";

  function navigateTo(route: string, key?: string) {
    if (key) setActive(key);
    // guard router.push in case expo-router is not available at runtime
    try {
      router.push(route);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("Navigation failed:", err);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <StatusBar barStyle="light-content" />
      <Animated.View
        style={[
          styles.container,
          {
            opacity,
            transform: [{ translateY }],
            paddingHorizontal: isTablet ? 48 : 16,
            paddingTop: isTablet ? 28 : 18,
          },
        ]}
      >
        {/* Header - minimal */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: muted }]}>
              What would you like to work on today?
            </Text>
          </View>

          {/* small settings quick action (keeps header compact) */}
          <Pressable
            onPress={() => navigateTo("/settings")}
            style={({ pressed }) => [styles.headerAction, pressed && { opacity: 0.8 }]}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
          >
            <Feather name="settings" size={18} color={muted} />
          </Pressable>
        </View>

        {/* Feature rows using Card + Pressable (safe, consistent) */}
        <View style={[styles.features, isTablet && { maxWidth: 900 }]}>
          {FEATURES.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => navigateTo(f.route, f.key)}
              android_ripple={{ color: "#ffffff06" }}
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

        {/* Bottom nav — full width, touches edges, curved top corners */}
        <View style={styles.bottomShell}>
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
                  <Text style={[styles.navLabel, { color: isActive ? primary : muted }]}>
                    {n.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* small version text */}
        <View style={styles.versionWrap}>
          {/* <Text style={[styles.versionText, { color: muted }]}>v{APP_VERSION}</Text> */}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerAction: {
    padding: 8,
    borderRadius: 10,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
  },

  features: { width: "100%" },
  featurePressable: { marginBottom: 12 },
  featurePressed: { opacity: 0.95 },
  featureCard: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    // gap is unsupported in RN stable versions; use padding/margins instead
  },
  iconWrap: { width: 56, alignItems: "center", justifyContent: "center" },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: { flex: 1, paddingRight: 8 },
  featureTitle: { fontSize: 18, fontWeight: "700" },
  featureSubtitle: { marginTop: 4, fontSize: 14 },

  bottomShell: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.22,
        shadowOffset: { width: 0, height: -8 },
        shadowRadius: 18,
      },
      android: { elevation: 14 },
    }),
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    minWidth: 56,
  },
  navLabel: { fontSize: 11, marginTop: 4 },

  versionWrap: {
    position: "absolute",
    right: 12,
    bottom: 12 + (Platform.OS === "ios" ? 6 : 0),
  },
  versionText: { fontSize: 11, opacity: 0.95 },
});
