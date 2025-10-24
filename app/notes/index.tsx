// app/notes/index.tsx
import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ListRenderItem } from 'react-native';
import { useNotesStore } from '../../src/stores/useNotesStore';
import { useRouter } from 'expo-router';
import { Note } from '../../src/types/note';

export default function NotesListScreen(): React.ReactElement {
  const router = useRouter();
  const { notes, load } = useNotesStore(state => ({ notes: state.notes, load: state.load }));

  useEffect(() => {
    load();
  }, [load]);

  const sorted = [...notes].sort((a, b) => Number(new Date(b.updatedAt ?? b.createdAt)) - Number(new Date(a.updatedAt ?? a.createdAt)));

  const renderItem: ListRenderItem<Note> = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/notes/note/${item.id}`)}>
      <Text style={styles.cardTitle}>{item.title || 'Untitled'}</Text>
      <Text numberOfLines={2} style={styles.cardBody}>{item.body}</Text>
      {item.attachments?.length ? <Text style={styles.attachCount}>📷 {item.attachments.length}</Text> : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Notes</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/notes/editor')}>
          <Text style={styles.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  addBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#3751FF', borderRadius: 8 },
  addBtnText: { color: 'white', fontWeight: '600' },
  card: { padding: 12, borderRadius: 10, backgroundColor: '#fff', marginBottom: 12, elevation: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardBody: { marginTop: 6, color: '#444' },
  attachCount: { marginTop: 8, color: '#666' },
});
