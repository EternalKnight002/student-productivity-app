// app/notes/editor.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useNotesStore } from '../../src/stores/useNotesStore';
import { ImageGrid } from '../../src/components/ImageGrid';
import { Note, NoteAttachment } from '../../src/types/note';
import { nanoid } from 'nanoid/non-secure';

// NEW: import the RichTextEditor component and its ref type
import RichTextEditor, { RichTextEditorRef } from '../../src/components/RichTextEditor';

type Params = {
  id?: string;
};

export default function NotesEditor(): React.ReactElement {
  const router = useRouter();
  const params = useLocalSearchParams() as Params;
  const id = params?.id;
  const loadStore = useNotesStore(state => state.load);
  const addNote = useNotesStore(state => state.addNote);
  const updateNote = useNotesStore(state => state.updateNote);
  const addAttachment = useNotesStore(state => state.addAttachment);
  const removeAttachment = useNotesStore(state => state.removeAttachment);
  const notes = useNotesStore(state => state.notes);

  const existing = notes.find(n => n.id === id);

  const [title, setTitle] = useState<string>(existing?.title ?? '');
  const [body, setBody] = useState<string>(existing?.body ?? '');
  const [attachments, setAttachments] = useState<NoteAttachment[]>(existing?.attachments ?? []);
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);

  // ref for editor control
  const editorRef = useRef<RichTextEditorRef | null>(null);

  useEffect(() => {
    // ensure store has loaded
    loadStore();
  }, [loadStore]);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setBody(existing.body);
      setAttachments(existing.attachments ?? []);
    }
  }, [existing?.id]);

  /**
   * pickImage
   * - picks, resizes, compresses and copies the image into app storage (if available)
   * - adds attachment to store (if editing existing note) or to local attachments (if new)
   * - RETURNS the saved URI (string) on success, or null if cancelled / failed
   *
   * This function no longer inserts into the editor directly. The editor's toolbar
   * will call this via onExternalImagePick and handle insertion itself.
   */
  const pickImage = async (): Promise<string | null> => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted && permission.status !== 'granted') {
        Alert.alert('Permission required', 'Please allow photo access to attach images.');
        return null;
      }

      const result: ImagePicker.ImagePickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      // handle both new and legacy shapes
      if ((result as any).cancelled || (result as any).canceled) return null;

      const localUri = (result as any).assets?.[0]?.uri ?? (result as any).uri;
      if (!localUri) {
        Alert.alert('Error', 'Could not read the selected image.');
        return null;
      }

      setIsProcessingImage(true);

      // Resize & compress: cap longest side by 1200px and compress to 0.7
      const manipResult = await ImageManipulator.manipulateAsync(
        localUri,
        [{ resize: { width: 1200 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      const processedUri = manipResult.uri;

      // --- Robust file storage handling ---
      const docDir = (FileSystem as any).documentDirectory ?? null;
      const cacheDir = (FileSystem as any).cacheDirectory ?? null;
      const baseDirFallback: string | null = docDir ?? cacheDir ?? null;

      let dest: string;

      if (baseDirFallback) {
        const extension = processedUri.split('.').pop() ?? 'jpg';
        const filename = `${nanoid()}.${extension}`;
        const notesDir = `${baseDirFallback}notes/`;
        dest = `${notesDir}${filename}`;

        // ensure folder exists
        const folderInfo = await FileSystem.getInfoAsync(notesDir);
        if (!folderInfo.exists) {
          await FileSystem.makeDirectoryAsync(notesDir, { intermediates: true });
        }

        // copy processed image to app dir
        await FileSystem.copyAsync({ from: processedUri, to: dest });
      } else {
        // fallback: use the processedUri directly (works in Expo Go / some dev flows)
        dest = processedUri;
        console.warn('pickImage: document/cache directory not available; using processedUri directly. dest=', dest);
      }

      const mimeType = 'image/jpeg';

      const attachmentPayloadForStore: Omit<NoteAttachment, 'id'> & { uri: string } = {
        uri: dest,
        mimeType,
        createdAt: new Date().toISOString(),
      };

      if (existing?.id) {
        // persist attachment for existing note
        await addAttachment(existing.id, attachmentPayloadForStore);
        const updatedNote = useNotesStore.getState().notes.find(n => n.id === existing.id);
        setAttachments(updatedNote?.attachments ?? []);
      } else {
        // temporary attachment for new note (persist when saving the note)
        const temp: NoteAttachment = {
          id: nanoid(),
          uri: attachmentPayloadForStore.uri,
          mimeType: attachmentPayloadForStore.mimeType,
          createdAt: attachmentPayloadForStore.createdAt,
        };
        setAttachments(prev => [...prev, temp]);
      }

      // Return the saved URI so the editor can insert it inline
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
      // pull latest HTML from editor (if available). Fallback to local body state
      const htmlFromEditor = await editorRef.current?.getHTML();
      const finalBody = (htmlFromEditor ?? body) as string;

      if (existing?.id) {
        await updateNote(existing.id, { title, body: finalBody });
        router.back();
        return;
      }
      const created = await addNote({
        title,
        body: finalBody,
        attachments: attachments.map(a => ({ id: a.id, uri: a.uri, mimeType: a.mimeType, createdAt: a.createdAt })),
      } as Partial<Note>);
      router.replace(`/notes/note/${created.id}`);
    } catch (e) {
      console.warn('save error', e);
      Alert.alert('Error', 'Could not save note.');
    }
  };

  const handleRemoveAttachment = async (attachmentId: string): Promise<void> => {
    if (existing?.id) {
      await removeAttachment(existing.id, attachmentId);
      const updatedNote = useNotesStore.getState().notes.find(n => n.id === existing.id);
      setAttachments(updatedNote?.attachments ?? []);
    } else {
      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.label}>Title</Text>
      <TextInput value={title} onChangeText={(v: string) => setTitle(v)} placeholder="Note title" style={styles.input} />

      <Text style={[styles.label, { marginTop: 12 }]}>Body</Text>

      {/* use RichTextEditor and pass pickImage as external handler */}
      <View style={{ minHeight: 200, borderRadius: 8, overflow: 'hidden' }}>
        <RichTextEditor
          ref={editorRef}
          initialHTML={body}
          onChange={(html) => setBody(html)}
          placeholder="Write something..."
          autoFocus={false}
          onExternalImagePick={pickImage}
          externalImageProcessing={isProcessingImage} /* <-- pass processing flag here */
        />
      </View>

      <Text style={[styles.label, { marginTop: 12 }]}>Attachments</Text>
      <ImageGrid attachments={attachments} onRemove={handleRemoveAttachment} />

      {isProcessingImage ? (
        <View style={{ marginTop: 12, alignItems: 'center' }}>
          <ActivityIndicator size="small" />
          <Text style={{ marginTop: 6 }}>Processing image…</Text>
        </View>
      ) : (
        <View style={{ marginTop: 12 }}>
          {/* Keep this button for picking images outside the editor toolbar (it uses same flow).
              Now it will also insert the image into the editor after pickImage returns the URI. */}
          <Button
            title="Add Image"
            onPress={async () => {
              try {
                const uri = await pickImage();
                if (uri) {
                  // insert into editor so user sees inline placement
                  try {
                    await editorRef.current?.insertImage(uri);
                  } catch {
                    // fallback to inserting HTML img tag
                    await editorRef.current?.insertHTML(`<img src="${uri}" style="max-width:100%;height:auto;" />`);
                  }
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
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, backgroundColor: '#fff' },
});
