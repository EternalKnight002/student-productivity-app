// app/help/index.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../src/theme';

export default function HelpScreen(): React.ReactElement {
  const router = useRouter();
  const theme = useTheme();
  const colors = theme.colors;

 const openMail = async () => {
  // FIX: This must be a complete email address
  const to = 'alternatewavelenght@gmail.com'; // Or contact@, support@, etc.
  
  const subject = encodeURIComponent('Feedback — Student Planner');
  const body = encodeURIComponent('Hi —\n\nI wanted to share the following feedback:\n');
  const url = `mailto:${to}?subject=${subject}&body=${body}`;
  
  try {
    await Linking.openURL(url);
  } catch (err) {
    // fallback: navigate to settings or show alert
    router.push('/settings');
  }
};

  return (
    <ScrollView style={[styles.page, { backgroundColor: colors.background }]} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.row}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Feather name="chevron-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Help & feedback</Text>
      </View>

      <Text style={[styles.h1, { color: colors.text, marginTop: 18 }]}>How can we help?</Text>

      <Text style={[styles.p, { color: colors.muted, marginTop: 12 }]}>
        This is your help center. If you found a bug or want to give feedback, you can:
      </Text>

      <View style={{ height: 12 }} />

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Report a bug</Text>
        <Text style={[styles.cardBody, { color: colors.muted }]}>
          Tell us what happened and steps to reproduce. Include device, OS and app version.
        </Text>
      </View>

      <View style={{ height: 12 }} />

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Request a feature</Text>
        <Text style={[styles.cardBody, { color: colors.muted }]}>
          Tell us what you'd like to see and why — we read every suggestion.
        </Text>
      </View>

      <View style={{ height: 18 }} />

      <Pressable
        onPress={openMail}
        style={({ pressed }) => [
          styles.action,
          { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <Text style={styles.actionText}>Send feedback by email</Text>
      </Pressable>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  back: { padding: 8 },
  title: { fontSize: 18, fontWeight: '700', marginLeft: 6 },
  h1: { fontSize: 22, fontWeight: '800' },
  p: { fontSize: 14, lineHeight: 20 },
  card: { borderRadius: 12, padding: 12, shadowColor: '#000', shadowOpacity: 0.03, elevation: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardBody: { marginTop: 6, fontSize: 14 },
  action: { borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: '700' },
});
