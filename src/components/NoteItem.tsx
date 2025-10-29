// src/components/NoteItem.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Note } from '../types/note';
import { useNotesStore } from '../stores/useNotesStore';
import theme from '../theme';

type Props = { note: Note };

export function NoteItem({ note }: Props) {
  const togglePin = useNotesStore((s: any) => s.togglePin);

  return (
    <Pressable style={styles.container} onPress={() => { /* parent handles navigation */ }}>
      <View style={styles.left}>
        <View style={[styles.iconCircle, { backgroundColor: getColorFromId(note.id) }]}>
          <Text style={styles.iconInitial}>{(note.title || 'N').charAt(0).toUpperCase()}</Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>{note.title || 'Untitled'}</Text>
        <Text style={styles.preview} numberOfLines={2}>{note.body ? note.body.replace(/\n/g, ' ') : ''}</Text>
      </View>

      <Pressable onPress={(e) => { e.stopPropagation(); togglePin(note.id); }} style={styles.pin}>
        <Text style={{ fontSize: 16 }}>{note.pinned ? '📌' : '📍'}</Text>
      </Pressable>
    </Pressable>
  );
}

function getColorFromId(id?: string) {
  const palette = ['#A78BFA', '#60C0FF', '#FFB86B', '#00C48C'];
  if (!id) return palette[0];
  const n = id.split('').reduce((s, ch) => s + ch.charCodeAt(0), 0);
  return palette[n % palette.length];
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    padding: 12,
    marginVertical: 6,
    borderRadius: theme.radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...platformLift(),
  },
  left: { marginRight: 12 },
  iconCircle: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconInitial: { fontWeight: '800', color: '#fff' },
  title: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  preview: { fontSize: 13, color: theme.colors.muted, marginTop: 6 },
  pin: { marginLeft: 12 },
});

function platformLift() {
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  } as any;
}
