// app/notes/note/[id].tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Alert, Modal, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNotesStore } from '../../../src/stores/useNotesStore';
import { ImageGrid } from '../../../src/components/ImageGrid';
import * as FileSystem from 'expo-file-system';
import { Note } from '../../../src/types/note';

type Params = { id: string };

export default function NoteDetail(): React.ReactElement {
  const { id } = useLocalSearchParams() as Params;
  const router = useRouter();
  const notes = useNotesStore(state => state.notes);
  const deleteNote = useNotesStore(state => state.deleteNote);
  const removeAttachment = useNotesStore(state => state.removeAttachment);
  const [note, setNote] = useState<Note | undefined>(() => notes.find(n => n.id === id));
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  useEffect(() => {
    setNote(useNotesStore.getState().notes.find(n => n.id === id));
    // no subscription wired; if needed add store subscriptions here
  }, [id]);

  if (!note) {
    return (
      <View style={styles.container}>
        <Text>Note not found.</Text>
      </View>
    );
  }

  const handleDelete = async (): Promise<void> => {
    Alert.alert('Delete note', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          // optionally delete files
          for (const a of note.attachments ?? []) {
            try {
              const info = await FileSystem.getInfoAsync(a.uri);
              if (info.exists) {
                await FileSystem.deleteAsync(a.uri, { idempotent: true });
              }
            } catch (e) {
              console.warn('delete file error', e);
            }
          }
          await deleteNote(note.id);
          router.push('/notes');
        },
      },
    ]);
  };

  const handleRemoveAttachment = async (attachmentId: string): Promise<void> => {
    const att = note.attachments?.find(a => a.id === attachmentId);
    if (att) {
      try {
        const info = await FileSystem.getInfoAsync(att.uri);
        if (info.exists) {
          await FileSystem.deleteAsync(att.uri, { idempotent: true });
        }
      } catch (e) {
        console.warn('delete file', e);
      }
    }
    await removeAttachment(note.id, attachmentId);
    setNote(useNotesStore.getState().notes.find(n => n.id === note.id));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.header}>
        <Text style={styles.title}>{note.title || 'Untitled'}</Text>
        <View style={styles.headerBtns as any}>
          <Button title="Edit" onPress={() => router.push(`/notes/editor?id=${note.id}`)} />
          <Button title="Delete" onPress={handleDelete} color="#FF5C5C" />
        </View>
      </View>

      <Text style={styles.body}>{note.body}</Text>

      <Text style={[styles.label, { marginTop: 12 }]}>Attachments</Text>
      <ImageGrid attachments={note.attachments} onRemove={handleRemoveAttachment} onPress={(uri: string) => setPreviewUri(uri)} />

      <Modal visible={!!previewUri} transparent={false} onRequestClose={() => setPreviewUri(null)}>
        <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity style={{ position: 'absolute', top: 48, right: 20 }} onPress={() => setPreviewUri(null)}>
            <Text style={{ color: 'white', fontSize: 20 }}>Close</Text>
          </TouchableOpacity>
          {previewUri ? <Image source={{ uri: previewUri }} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} /> : null}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700' },
  headerBtns: { flexDirection: 'row', gap: 8 },
  body: { marginTop: 12, fontSize: 16, color: '#333' },
  label: { fontWeight: '600', fontSize: 14 },
});
