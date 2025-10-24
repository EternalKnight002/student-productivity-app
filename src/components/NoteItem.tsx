// src/components/NoteItem.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Note } from '../types/note';
import { useNotesStore } from '../stores/useNotesStore';

type Props = { note: Note };

export function NoteItem({ note }: Props) {
  const togglePin = useNotesStore((s: any) => s.togglePin);

  return (
    <Pressable style={styles.container}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>{note.title || 'Untitled'}</Text>
        <Text style={styles.preview} numberOfLines={2}>{note.body ? note.body.replace(/\n/g, ' ') : ''}</Text>
      </View>

      <Pressable onPress={(e) => { e.stopPropagation(); togglePin(note.id); }} style={styles.pin}>
        <Text>{note.pinned ? '📌' : '📍'}</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },
  title: { fontSize: 16, fontWeight: '600' },
  preview: { fontSize: 13, color: '#666', marginTop: 6 },
  pin: { marginLeft: 12 },
});
