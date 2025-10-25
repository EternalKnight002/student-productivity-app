// app/notes/note/[id].tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Alert, Modal, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNotesStore } from '../../../src/stores/useNotesStore';
import { ImageGrid } from '../../../src/components/ImageGrid';
import * as FileSystem from 'expo-file-system';
import { Note } from '../../../src/types/note';
import { WebView } from 'react-native-webview';

type Params = { id: string };

export default function NoteDetail(): React.ReactElement {
  const { id } = useLocalSearchParams() as Params;
  const router = useRouter();
  const notes = useNotesStore(state => state.notes);
  const deleteNote = useNotesStore(state => state.deleteNote);
  const removeAttachment = useNotesStore(state => state.removeAttachment);
  const [note, setNote] = useState<Note | undefined>(() => notes.find(n => n.id === id));
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');

  useEffect(() => {
    const foundNote = useNotesStore.getState().notes.find(n => n.id === id);
    setNote(foundNote);
    if (foundNote) {
      prepareHtmlContent(foundNote);
    }
  }, [id]);

  const prepareHtmlContent = async (currentNote: Note) => {
    let bodyContent = currentNote.body || '<p>No content</p>';

    // Convert local file:// URIs to base64 data URIs for WebView
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;
    const replacements: { original: string; replacement: string }[] = [];

    while ((match = imgRegex.exec(bodyContent)) !== null) {
      const imgSrc = match[1];
      
      // Check if it's a local file URI
      if (imgSrc.startsWith('file://')) {
        try {
          const base64 = await FileSystem.readAsStringAsync(imgSrc, {
            encoding: 'base64' as any,
          });
          const dataUri = `data:image/jpeg;base64,${base64}`;
          replacements.push({ original: imgSrc, replacement: dataUri });
        } catch (error) {
          console.warn('Failed to convert image to base64:', imgSrc, error);
        }
      }
    }

    // Apply all replacements
    let processedBody = bodyContent;
    for (const { original, replacement } of replacements) {
      processedBody = processedBody.replace(original, replacement);
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            padding: 16px;
            margin: 0;
            font-size: 16px;
            line-height: 1.6;
            color: #333;
          }
          img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 10px 0;
            border-radius: 8px;
          }
          p {
            margin: 0 0 12px 0;
          }
          ul, ol {
            padding-left: 20px;
            margin: 0 0 12px 0;
          }
          li {
            margin-bottom: 6px;
          }
          div {
            margin-bottom: 8px;
          }
        </style>
      </head>
      <body>
        ${processedBody}
      </body>
      </html>
    `;

    setHtmlContent(html);
  };

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
    const updatedNote = useNotesStore.getState().notes.find(n => n.id === note.id);
    setNote(updatedNote);
    if (updatedNote) {
      prepareHtmlContent(updatedNote);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.header}>
        <Text style={styles.title}>{note.title || 'Untitled'}</Text>
        <View style={styles.headerBtns}>
          <Button title="Edit" onPress={() => router.push(`/notes/editor?id=${note.id}`)} />
          <Button title="Delete" onPress={handleDelete} color="#FF5C5C" />
        </View>
      </View>

      {htmlContent ? (
        <View style={styles.webviewContainer}>
          <WebView
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            style={styles.webview}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            allowFileAccess={true}
            allowUniversalAccessFromFileURLs={true}
            mixedContentMode="always"
          />
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <Text>Loading content...</Text>
        </View>
      )}

      <Text style={[styles.label, { marginTop: 12 }]}>Attachments</Text>
      <ImageGrid attachments={note.attachments} onRemove={handleRemoveAttachment} onPress={(uri: string) => setPreviewUri(uri)} />

      <Modal visible={!!previewUri} transparent={false} onRequestClose={() => setPreviewUri(null)}>
        <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity style={{ position: 'absolute', top: 48, right: 20, zIndex: 10 }} onPress={() => setPreviewUri(null)}>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', flex: 1 },
  headerBtns: { flexDirection: 'row', gap: 8 },
  webviewContainer: { 
    minHeight: 200,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  webview: { 
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  label: { fontWeight: '600', fontSize: 14, marginTop: 16 },
});
