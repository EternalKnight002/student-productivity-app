// app/about/index.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { Feather } from '@expo/vector-icons';

export default function AboutScreen(): React.ReactElement {
  const router = useRouter();
  const theme = useTheme();
  const colors = theme.colors;

  return (
    <View style={[styles.page, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Feather name="chevron-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>About</Text>
      </View>

      <View style={{ padding: 16 }}>
        <Text style={[styles.h1, { color: colors.text }]}>Student Planner</Text>
        <Text style={[styles.p, { color: colors.muted, marginTop: 8 }]}>
          Version 1.0.0
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.muted, marginTop: 18 }]}>About the app</Text>
        <Text style={[styles.p, { color: colors.muted }]}>
          A lightweight productivity app for students — notes, planner and expenses in one place.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.muted, marginTop: 14 }]}>License</Text>
        <Text style={[styles.p, { color: colors.muted }]}>
          This is a demo project. Replace this text with your licence / credits.
        </Text>

        <View style={{ height: 18 }} />

        <Pressable
          onPress={() => router.push('/settings')}
          style={({ pressed }) => [{ backgroundColor: colors.primary, padding: 12, borderRadius: 10, alignItems: 'center', opacity: pressed ? 0.9 : 1 }]}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Open settings</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  back: { padding: 8 },
  title: { fontSize: 18, fontWeight: '700', marginLeft: 6 },
  h1: { fontSize: 20, fontWeight: '800' },
  p: { fontSize: 14, lineHeight: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700' },
});
