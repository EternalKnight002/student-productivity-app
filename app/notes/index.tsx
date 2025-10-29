// app/notes/index.tsx
import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNotesStore } from '../../src/stores/useNotesStore';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import Card from '../../src/components/Card';
import { NoteItem } from '../../src/components/NoteItem';

export default function NotesListScreen(): React.ReactElement {
  const router = useRouter();
  const theme = useTheme();
  const colors = theme.colors;
  const { notes, load } = useNotesStore(state => ({ notes: state.notes, load: state.load }));

  useEffect(() => {
    load?.();
  }, [load]);

  const sorted = [...(notes || [])].sort((a, b) => Number(new Date(b.updatedAt ?? b.createdAt)) - Number(new Date(a.updatedAt ?? a.createdAt)));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>Notes</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={() => router.push('/notes/editor')}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>+ New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/notes/note/${item.id}`)}>
            <NoteItem note={item} />
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: colors.muted }}>No notes yet — tap + to create one.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  title: { fontSize: 22, fontWeight: '700' },
  addBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  empty: { padding: 40, alignItems: 'center' },
});
