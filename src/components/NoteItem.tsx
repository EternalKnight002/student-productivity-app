// src/components/NoteItem.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Note } from '../types/note';
import { useNotesStore } from '../stores/useNotesStore';
import theme from '../theme';

type Props = { note: Note };

// simple helper to avoid showing raw HTML / file:// URIs in list preview
function makePreview(raw?: string, maxLen = 120) {
  if (!raw) return '';
  // replace imgs with placeholder
  const withoutImgs = raw.replace(/<img[^>]*>/gi, ' [Image] ');
  // strip all html tags
  const noTags = withoutImgs.replace(/<\/?[^>]+(>|$)/g, ' ');
  // collapse whitespace and decode minimal entities
  const cleaned = noTags
    .replace(/\s+/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .trim();
  if (cleaned.length <= maxLen) return cleaned;
  return cleaned.slice(0, maxLen - 1).trim() + '…';
}

export function NoteItem({ note }: Props) {
  const togglePin = useNotesStore((s: any) => s.togglePin);

  // prefer body (rich editor) then fallback to content
  const raw = (note.body ?? (note as any).content ?? '') as string;
  const preview = makePreview(raw, 120);
  const initial = ((note.title && note.title[0]) || (preview && preview[0]) || 'N').toUpperCase();

  return (
    // Use View here so parent TouchableOpacity in the list can receive presses.
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={[styles.iconCircle, { backgroundColor: getColorFromId(note.id) }]}>
          <Text style={styles.iconInitial}>{initial}</Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>{note.title || 'Untitled'}</Text>
        <Text style={styles.preview} numberOfLines={2}>{preview || 'No content'}</Text>
      </View>

      <Pressable
        onPress={(e) => {
          e.stopPropagation(); // keep this so pin press doesn't bubble to parent
          togglePin(note.id);
        }}
        style={styles.pin}
        android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
      >
        <Text style={{ fontSize: 16 }}>{note.pinned ? '📌' : '📍'}</Text>
      </Pressable>
    </View>
  );
}

function getColorFromId(id?: string) {
  const palette = ['#A78BFA', '#60C0FF', '#FFB86B', '#00C48C'];
  if (!id) return palette[0];
  const n = id.split('').reduce((s, ch) => s + ch.charCodeAt(0), 0);
  return palette[n % palette.length];
}

function platformLift() {
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  } as any;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    padding: 12,
    marginVertical: 6,
    borderRadius: theme.radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...platformLift(), // fixed: spread the returned style
  },
  left: { marginRight: 12 },
  iconCircle: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconInitial: { fontWeight: '800', color: '#fff' },
  title: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  preview: { fontSize: 13, color: theme.colors.muted, marginTop: 6 },
  pin: { marginLeft: 12, padding: 6 },
});

export default NoteItem;
