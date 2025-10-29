// app/_layout.tsx
// Drawer with improved avatar + grouped menu + type-safe Feather icons

import 'react-native-get-random-values';
import React, { useRef, useState, useEffect } from 'react';
import { Slot, useRouter } from 'expo-router';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  Animated,
  Dimensions,
  View,
  Text,
  Pressable,
  StyleSheet,
  StatusBar as RNStatusBar,
  Platform,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import TopHeader from '../src/components/TopHeaderCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(360, Math.round(SCREEN_WIDTH * 0.78));

// Grouped menu items
const PRIMARY_ITEMS = [
  { key: 'analytics', label: 'Analytics', icon: 'bar-chart', route: '/analytics' },
  { key: 'notes', label: 'Notes', icon: 'file-text', route: '/notes' },
  { key: 'planner', label: 'Planner', icon: 'calendar', route: '/planner' },
  { key: 'expenses', label: 'Expenses', icon: 'credit-card', route: '/expenses' },
];

const SECONDARY_ITEMS = [
  { key: 'settings', label: 'Settings', icon: 'settings', route: '/settings' },
];

const UTILITY_ITEMS = [
  { key: 'help', label: 'Help & feedback', icon: 'help-circle', route: '/help' },
  { key: 'about', label: 'About', icon: 'info', route: '/about' },
];

const DANGER_ITEMS = [
  { key: 'logout', label: 'Sign out', icon: 'log-out', route: '/settings?panel=logout', destructive: true },
];

export default function Layout(): React.ReactElement {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Drawer animation state
  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: open ? 1 : 0,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [open, anim]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [-DRAWER_WIDTH, 0] });
  const overlayOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.45] });
  const contentScale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.985] });

  function toggleDrawer() {
    setOpen((v) => !v);
  }
  function closeDrawer() {
    setOpen(false);
  }
  function navigateAndClose(route?: string) {
    closeDrawer();
    if (!route) return;
    setTimeout(() => {
      try {
        router.push(route);
      } catch {
        router.push('/settings');
      }
    }, 160);
  }

  function handleRight() {
    router.push('/settings?panel=profile');
  }

  // Example profile data
  const profile = {
    name: 'Eternal',
    email: 'eternal@example.com',
    avatarUri: null as string | null,
  };

  const initials = (profile.name || 'U')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider style={{ flex: 1 }}>
        <RNStatusBar barStyle="dark-content" translucent={false} />

        {/* Header with avatar icon on right */}
        <TopHeader
          title="Student Planner"
          onMenuPress={toggleDrawer}
          onRightPress={handleRight}
          rightType="avatar"
          avatarUri={profile.avatarUri}
        />

        <Animated.View style={{ flex: 1, transform: [{ scale: contentScale }] }} pointerEvents={open ? 'none' : 'auto'}>
          <Slot />
        </Animated.View>

        {/* Overlay */}
        <Animated.View pointerEvents={open ? 'auto' : 'none'} style={[styles.overlay, { opacity: overlayOpacity }]}>
          <Pressable style={{ flex: 1 }} onPress={closeDrawer} accessibilityLabel="Close menu" />
        </Animated.View>

        {/* Drawer */}
        <Animated.View
          style={[
            styles.drawer,
            {
              width: DRAWER_WIDTH,
              transform: [{ translateX }],
              paddingTop: Math.max(insets.top, Platform.OS === 'ios' ? 18 : 12),
            },
          ]}
        >
          <View style={styles.drawerContent}>
            {/* Profile header */}
            <View style={styles.profileRow}>
              <View style={styles.avatarRing}>
                {profile.avatarUri ? (
                  <Image source={{ uri: profile.avatarUri }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>{initials}</Text>
                  </View>
                )}
              </View>

              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.profileName}>{profile.name}</Text>
                <Text style={styles.profileEmail}>{profile.email}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Group: Main */}
            <Text style={styles.sectionTitle}>Main</Text>
            {PRIMARY_ITEMS.map((m) => (
              <Pressable
                key={m.key}
                onPress={() => navigateAndClose(m.route)}
                style={({ pressed }) => [styles.menuRow, pressed && { opacity: 0.85 }]}
              >
                <Feather
                  name={m.icon as React.ComponentProps<typeof Feather>['name']}
                  size={18}
                  color="#374151"
                />
                <Text style={styles.menuLabel}>{m.label}</Text>
              </Pressable>
            ))}

            <View style={styles.groupSpacer} />

            {/* Group: Preferences */}
            <Text style={styles.sectionTitle}>Preferences</Text>
            {SECONDARY_ITEMS.map((m) => (
              <Pressable
                key={m.key}
                onPress={() => navigateAndClose(m.route)}
                style={({ pressed }) => [styles.menuRow, pressed && { opacity: 0.85 }]}
              >
                <Feather
                  name={m.icon as React.ComponentProps<typeof Feather>['name']}
                  size={18}
                  color="#374151"
                />
                <Text style={styles.menuLabel}>{m.label}</Text>
              </Pressable>
            ))}

            <View style={styles.groupSpacer} />

            {/* Group: More */}
            <Text style={styles.sectionTitle}>More</Text>
            {UTILITY_ITEMS.map((m) => (
              <Pressable
                key={m.key}
                onPress={() => navigateAndClose(m.route)}
                style={({ pressed }) => [styles.menuRow, pressed && { opacity: 0.85 }]}
              >
                <Feather
                  name={m.icon as React.ComponentProps<typeof Feather>['name']}
                  size={18}
                  color="#374151"
                />
                <Text style={styles.menuLabel}>{m.label}</Text>
              </Pressable>
            ))}

            <View style={{ flex: 1 }} />

            {/* Group: Logout */}
            {DANGER_ITEMS.map((m) => (
              <Pressable
                key={m.key}
                onPress={() => navigateAndClose(m.route)}
                style={({ pressed }) => [styles.menuRow, pressed && { opacity: 0.85 }]}
              >
                <Feather
                  name={m.icon as React.ComponentProps<typeof Feather>['name']}
                  size={18}
                  color={m.destructive ? '#EF4444' : '#374151'}
                />
                <Text style={[styles.menuLabel, m.destructive && { color: '#EF4444' }]}>{m.label}</Text>
              </Pressable>
            ))}

            <Text style={styles.drawerFooter}>v1.0.0</Text>
          </View>
        </Animated.View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 50,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 60,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 12,
  },
  drawerContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#FFEDD5',
  },
  avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#fff' },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontWeight: '700', color: '#111827' },
  profileName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  profileEmail: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E6E9EE', marginVertical: 8 },
  sectionTitle: { fontSize: 12, color: '#6B7280', marginTop: 6, marginBottom: 6, fontWeight: '700' },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  menuLabel: { marginLeft: 12, fontSize: 16, color: '#111827' },
  groupSpacer: { height: 8 },
  drawerFooter: { fontSize: 12, color: '#9CA3AF', marginBottom: 18, textAlign: 'center' },
});
