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
         Your our all-in-one student productivity companion. Track expenses, plan tasks, take notes, and visualize your spending—all in one beautiful, lightweight app. Keep everything organized and private, right on your device.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.muted, marginTop: 14 }]}>License</Text>
        <Text style={[styles.p, { color: colors.muted }]}>
            Copyright 2025 Student Planner Contributors

                Licensed under the Apache License, Version 2.0 (the "License");
                you may not use this file except in compliance with the License.
                You may obtain a copy of the License at

            http://www.apache.org/licenses/LICENSE-2.0
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
