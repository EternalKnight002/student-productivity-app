// app/notes/editor.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useNotesStore } from '../../src/stores/useNotesStore';
import { ImageGrid } from '../../src/components/ImageGrid';
import { Note, NoteAttachment } from '../../src/types/note';
import { nanoid } from 'nanoid/non-secure';
import RichTextEditor, { RichTextEditorRef } from '../../src/components/RichTextEditor';

type Params = {
  id?: string;
};

export default function NotesEditor(): React.ReactElement {
  const router = useRouter();
  const params = useLocalSearchParams() as Params;
  const id = params?.id;

  const loadStore = useNotesStore((s) => s.load);
  const addNote = useNotesStore((s) => s.addNote);
  const updateNote = useNotesStore((s) => s.updateNote);
  const addAttachment = useNotesStore((s) => s.addAttachment);
  const removeAttachment = useNotesStore((s) => s.removeAttachment);
  const notes = useNotesStore((s) => s.notes);

  useEffect(() => {
    // ensure persisted notes are loaded
    loadStore();
  }, [loadStore]);

  const existing = notes.find((n) => n.id === id);

  const [title, setTitle] = useState<string>(existing?.title ?? '');
  const [body, setBody] = useState<string>(existing?.body ?? '');
  const [attachments, setAttachments] = useState<NoteAttachment[]>(existing?.attachments ?? []);
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);

  const editorRef = useRef<RichTextEditorRef | null>(null);

  useEffect(() => {
    // when existing changes (store update), update local states
    if (existing) {
      setTitle(existing.title);
      setBody(existing.body);
      setAttachments(existing.attachments ?? []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id]);

  const pickImage = async (): Promise<string | null> => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted && permission.status !== 'granted') {
        Alert.alert('Permission required', 'Please allow photo access to attach images.');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      // handle both expo sdk shapes
      const cancelled = (result as any).cancelled ?? (result as any).canceled;
      if (cancelled) return null;

      const localUri = (result as any).assets?.[0]?.uri ?? (result as any).uri;
      if (!localUri) {
        Alert.alert('Error', 'Could not read the selected image.');
        return null;
      }

      setIsProcessingImage(true);

      // downscale for storage
      const manipResult = await ImageManipulator.manipulateAsync(
        localUri,
        [{ resize: { width: 1200 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      const processedUri = manipResult.uri;

      // pick a folder in app document/cache directory
      const docDir = (FileSystem as any).documentDirectory ?? null;
      const cacheDir = (FileSystem as any).cacheDirectory ?? null;
      const baseDirFallback: string | null = docDir ?? cacheDir ?? null;

      let dest: string;

      if (baseDirFallback) {
        const extension = processedUri.split('.').pop() ?? 'jpg';
        const filename = `${nanoid()}.${extension}`;
        const notesDir = `${baseDirFallback}notes/`;
        dest = `${notesDir}${filename}`;

        const folderInfo = await FileSystem.getInfoAsync(notesDir);
        if (!folderInfo.exists) {
          await FileSystem.makeDirectoryAsync(notesDir, { intermediates: true });
        }

        await FileSystem.copyAsync({ from: processedUri, to: dest });
      } else {
        dest = processedUri;
        console.warn('pickImage: document/cache directory not available; using processedUri directly.');
      }

      const mimeType = 'image/jpeg';
      const createdAt = new Date().toISOString();

      // IMPORTANT: always create a full NoteAttachment with an id
      const attachmentPayload: NoteAttachment = {
        id: nanoid(),
        uri: dest,
        mimeType,
        createdAt,
      };

      if (existing?.id) {
        // persist to the existing note
        await addAttachment(existing.id, attachmentPayload);
        const updatedNote = useNotesStore.getState().notes.find((n) => n.id === existing.id);
        setAttachments(updatedNote?.attachments ?? []);
      } else {
        // collect locally for a new note
        setAttachments((prev) => [...prev, attachmentPayload]);
      }

      return dest;
    } catch (e) {
      console.warn('pickImage error', e);
      Alert.alert('Error', 'Could not attach image.');
      return null;
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSave = async (): Promise<void> => {
    try {
      // get HTML from rich editor if present; fall back to local body
      const htmlFromEditor = await editorRef.current?.getHTML();
      const finalBody = (htmlFromEditor ?? body) as string;

      if (existing?.id) {
        // update existing note (partial)
        await updateNote(existing.id, { title: title ?? existing.title, body: finalBody, attachments });
        router.back();
        return;
      }

      // create new note and persist attachments included
      const created = await addNote({
        title: title ?? 'Untitled',
        body: finalBody,
        attachments,
      });
      router.replace(`/notes/note/${created.id}`);
    } catch (e) {
      console.warn('save error', e);
      Alert.alert('Error', 'Could not save note.');
    }
  };

  const handleRemoveAttachment = async (attachmentId: string): Promise<void> => {
    const attachmentToRemove = attachments.find((a) => a.id === attachmentId);

    if (existing?.id) {
      await removeAttachment(existing.id, attachmentId);
      const updated = useNotesStore.getState().notes.find((n) => n.id === existing.id);
      setAttachments(updated?.attachments ?? []);

      // also try to remove image src from editor HTML if present
      if (attachmentToRemove) {
        const currentHtml = await editorRef.current?.getHTML();
        if (currentHtml && currentHtml.includes(attachmentToRemove.uri)) {
          const cleanedHtml = currentHtml.replace(
            new RegExp(`<img[^>]*src="${attachmentToRemove.uri.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}"[^>]*>`, 'g'),
            ''
          );
          setBody(cleanedHtml);
          // update store content so view page shows consistent state
          await updateNote(existing.id, { body: cleanedHtml });
        }
      }
    } else {
      // just local adjustment for new note
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
      if (attachmentToRemove) {
        const currentHtml = await editorRef.current?.getHTML();
        if (currentHtml && currentHtml.includes(attachmentToRemove.uri)) {
          const cleanedHtml = currentHtml.replace(
            new RegExp(`<img[^>]*src="${attachmentToRemove.uri.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}"[^>]*>`, 'g'),
            ''
          );
          setBody(cleanedHtml);
        }
      }
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Note title"
        style={styles.input}
      />

      <Text style={[styles.label, { marginTop: 12 }]}>Body</Text>

      <View style={{ minHeight: 200, borderRadius: 8, overflow: 'hidden' }}>
        <RichTextEditor
          ref={editorRef}
          initialHTML={body}
          onChange={(html) => setBody(html)}
          onSave={handleSave}
          placeholder="Write something..."
          autoFocus={false}
          onExternalImagePick={pickImage}
          externalImageProcessing={isProcessingImage}
        />
      </View>

      <Text style={[styles.label, { marginTop: 12 }]}>Attachments</Text>
      <Text style={styles.hint}>Tip: Images saved here will display in the note view</Text>

      <ImageGrid attachments={attachments} onRemove={handleRemoveAttachment} />

      {isProcessingImage ? (
        <View style={{ marginTop: 12, alignItems: 'center' }}>
          <ActivityIndicator size="small" />
          <Text style={{ marginTop: 6 }}>Processing image…</Text>
        </View>
      ) : (
        <View style={{ marginTop: 12 }}>
          <Button
            title="Add Image"
            onPress={async () => {
              try {
                const uri = await pickImage();
                if (uri) {
                  const imgHTML = `<img src="${uri}" style="max-width:100%;height:auto;display:block;margin:10px 0;" />`;
                  await editorRef.current?.insertHTML(imgHTML);
                }
              } catch (e) {
                console.warn('Add Image button error', e);
              }
            }}
          />
        </View>
      )}

      <View style={{ marginTop: 18 }}>
        <Button title="Save" onPress={handleSave} />
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  hint: { fontSize: 12, color: '#666', marginBottom: 8, fontStyle: 'italic' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, backgroundColor: '#fff' },
});
