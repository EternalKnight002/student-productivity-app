// app/notes/note/[id].tsx
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { useNotesStore } from '../../../src/stores/useNotesStore';
import { Note } from '../../../src/types/note';

export default function NoteDetail(): React.ReactElement | null {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const note = useNotesStore((s) => s.notes.find((n) => n.id === id));
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const removeAttachment = useNotesStore((s) => s.removeAttachment);

  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const { width } = useWindowDimensions();

  const prepareHtmlContent = async (noteData: Note) => {
    try {
      let html = noteData.body ?? '';
      for (const att of noteData.attachments || []) {
        if (att.uri && (att.uri.endsWith('.jpg') || att.uri.endsWith('.png'))) {
          const base64 = await FileSystem.readAsStringAsync(att.uri, {
            encoding: 'base64',
          });
          const uri = `data:${att.mimeType};base64,${base64}`;
          html = html.replace(att.uri, uri);
        }
      }
      setHtmlContent(html);
    } catch (e) {
      console.error('prepareHtmlContent error', e);
    }
  };

  useEffect(() => {
    if (note) {
      prepareHtmlContent(note);
    } else {
      setHtmlContent('');
      router.replace('/notes');
    }
  }, [note, id]);

  const handleDelete = async () => {
    Alert.alert('Delete Note', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteNote(id!);
          router.replace('/notes');
        },
      },
    ]);
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    if (!note) return;
    await removeAttachment(note.id, attachmentId);
    const updated = useNotesStore.getState().notes.find((n) => n.id === note.id);
    if (updated) prepareHtmlContent(updated);
    else router.replace('/notes');
  };

  if (!note) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{note.title}</Text>
        <RenderHtml contentWidth={width} source={{ html: htmlContent }} />
        {note.attachments?.length ? (
          <View style={styles.attachmentsContainer}>
            {note.attachments.map((att) => (
              // use id if present, fallback to uri so key is always defined
              <TouchableOpacity
                key={att.id ?? att.uri}
                onPress={() => setPreviewUri(att.uri)}
                onLongPress={() => handleRemoveAttachment(att.id)}
              >
                <Image source={{ uri: att.uri }} style={styles.attachmentImage} />
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerButton, { backgroundColor: '#007AFF' }]}
          onPress={() => router.push(`/notes/editor?id=${note.id}`)}
        >
          <Text style={styles.footerButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.footerButton, { backgroundColor: '#FF3B30' }]}
          onPress={handleDelete}
        >
          <Text style={styles.footerButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {previewUri && (
        <TouchableOpacity
          style={styles.previewOverlay}
          onPress={() => setPreviewUri(null)}
        >
          <Image source={{ uri: previewUri }} style={styles.previewImage} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  attachmentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 8,
  },
  attachmentImage: { width: 100, height: 100, borderRadius: 8 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
  },
  footerButton: { paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8 },
  footerButtonText: { color: '#fff', fontWeight: '600' },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: { width: '90%', height: '80%', resizeMode: 'contain' },
});
