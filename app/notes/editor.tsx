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

  const editorRef = useRef<RichTextEditorRef | null>(null);

  useEffect(() => {
    loadStore();
  }, [loadStore]);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setBody(existing.body);
      setAttachments(existing.attachments ?? []);
    }
  }, [existing?.id]);

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

      if ((result as any).cancelled || (result as any).canceled) return null;

      const localUri = (result as any).assets?.[0]?.uri ?? (result as any).uri;
      if (!localUri) {
        Alert.alert('Error', 'Could not read the selected image.');
        return null;
      }

      setIsProcessingImage(true);

      const manipResult = await ImageManipulator.manipulateAsync(
        localUri,
        [{ resize: { width: 1200 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      const processedUri = manipResult.uri;

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
        console.warn('pickImage: document/cache directory not available; using processedUri directly. dest=', dest);
      }

      const mimeType = 'image/jpeg';

      const attachmentPayloadForStore: Omit<NoteAttachment, 'id'> & { uri: string } = {
        uri: dest,
        mimeType,
        createdAt: new Date().toISOString(),
      };

      if (existing?.id) {
        await addAttachment(existing.id, attachmentPayloadForStore);
        const updatedNote = useNotesStore.getState().notes.find(n => n.id === existing.id);
        setAttachments(updatedNote?.attachments ?? []);
      } else {
        const temp: NoteAttachment = {
          id: nanoid(),
          uri: attachmentPayloadForStore.uri,
          mimeType: attachmentPayloadForStore.mimeType,
          createdAt: attachmentPayloadForStore.createdAt,
        };
        setAttachments(prev => [...prev, temp]);
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
    const attachmentToRemove = attachments.find(a => a.id === attachmentId);
    
    if (existing?.id) {
      await removeAttachment(existing.id, attachmentId);
      const updatedNote = useNotesStore.getState().notes.find(n => n.id === existing.id);
      setAttachments(updatedNote?.attachments ?? []);
      
      // Also remove the image from body HTML if it exists
      if (attachmentToRemove) {
        const currentHtml = await editorRef.current?.getHTML();
        if (currentHtml && currentHtml.includes(attachmentToRemove.uri)) {
          // Remove img tags containing this URI
          const cleanedHtml = currentHtml.replace(
            new RegExp(`<img[^>]*src="${attachmentToRemove.uri.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`, 'g'),
            ''
          );
          setBody(cleanedHtml);
          // Update editor content
          editorRef.current?.insertHTML('');
          // Force re-render by clearing and setting
          setTimeout(() => {
            // Note: RichEditor doesn't have a setHTML method, so we need to update via state
            updateNote(existing.id, { body: cleanedHtml });
            Alert.alert('Removed', 'Image removed from note. Please reload the editor to see changes.');
          }, 100);
        }
      }
    } else {
      const updatedAttachments = attachments.filter(a => a.id !== attachmentId);
      setAttachments(updatedAttachments);
      
      // Remove from body HTML for new notes
      if (attachmentToRemove) {
        const currentHtml = await editorRef.current?.getHTML();
        if (currentHtml && currentHtml.includes(attachmentToRemove.uri)) {
          const cleanedHtml = currentHtml.replace(
            new RegExp(`<img[^>]*src="${attachmentToRemove.uri.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`, 'g'),
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
      <TextInput value={title} onChangeText={(v: string) => setTitle(v)} placeholder="Note title" style={styles.input} />

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
                  const imgHTML = `<img src="${uri}" style="max-width: 100%; height: auto; display: block; margin: 10px 0;" />`;
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