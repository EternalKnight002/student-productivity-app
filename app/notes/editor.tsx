// app/notes/editor.tsx
import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useNotesStore } from '../../src/stores/useNotesStore';
import { ImageGrid } from '../../src/components/ImageGrid';
import { Note, NoteAttachment } from '../../src/types/note';
import { nanoid } from 'nanoid/non-secure';

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

  const pickImage = async (): Promise<void> => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Please allow photo access to attach images.');
        return;
      }

      const result: ImagePicker.ImagePickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      // handle both new and legacy shapes
      if ((result as any).cancelled || (result as any).canceled) return;

      const localUri = (result as any).assets?.[0]?.uri ?? (result as any).uri;
      if (!localUri) {
        Alert.alert('Error', 'Could not read the selected image.');
        return;
      }

      setIsProcessingImage(true);

      // Resize & compress: cap longest side by 1200px and compress to 0.7
      // We use resize by width:1200 which will be ignored if smaller than original.
      const manipResult = await ImageManipulator.manipulateAsync(
        localUri,
        [{ resize: { width: 1200 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      const processedUri = manipResult.uri;

      // ensure base dir
      const baseDir: string | null = (FileSystem as any).documentDirectory ?? (FileSystem as any).cacheDirectory ?? null;
      if (!baseDir) {
        Alert.alert('Unsupported platform', 'File storage is unavailable on this platform.');
        setIsProcessingImage(false);
        return;
      }

      const extension = processedUri.split('.').pop() ?? 'jpg';
      const filename = `${nanoid()}.${extension}`;
      const notesDir = `${baseDir}notes/`;
      const dest = `${notesDir}${filename}`;

      // ensure folder exists
      const folderInfo = await FileSystem.getInfoAsync(notesDir);
      if (!folderInfo.exists) {
        await FileSystem.makeDirectoryAsync(notesDir, { intermediates: true });
      }

      // copy processed image to app dir
      await FileSystem.copyAsync({ from: processedUri, to: dest });

      const mimeType = 'image/jpeg';
      // const attachmentPayload: Omit<NoteAttachment, 'id' | 'createdAt'> & { uri: string } = {
      //   uri: dest,
      //   mimeType,
      // };

      // if (existing?.id) {
      //   await addAttachment(existing.id, attachmentPayload);
      //   const updatedNote = useNotesStore.getState().notes.find(n => n.id === existing.id);
      //   setAttachments(updatedNote?.attachments ?? []);
      // } else {
      //   const temp: NoteAttachment = { id: nanoid(), uri: dest, mimeType: attachmentPayload.mimeType, createdAt: new Date().toISOString() };
      //   setAttachments(prev => [...prev, temp]);
      // }
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
          const temp: NoteAttachment = { id: nanoid(), uri: dest, mimeType: attachmentPayloadForStore.mimeType, createdAt: attachmentPayloadForStore.createdAt };
          setAttachments(prev => [...prev, temp]);
        }

    } catch (e) {
      console.warn('pickImage error', e);
      Alert.alert('Error', 'Could not attach image.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSave = async (): Promise<void> => {
    try {
      if (existing?.id) {
        await updateNote(existing.id, { title, body });
        router.back();
        return;
      }
      const created = await addNote({
        title,
        body,
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
      <TextInput value={body} onChangeText={(v: string) => setBody(v)} placeholder="Write something..." style={[styles.input, { minHeight: 120 }]} multiline />

      <Text style={[styles.label, { marginTop: 12 }]}>Attachments</Text>
      <ImageGrid attachments={attachments} onRemove={handleRemoveAttachment} />

      {isProcessingImage ? (
        <View style={{ marginTop: 12, alignItems: 'center' }}>
          <ActivityIndicator size="small" />
          <Text style={{ marginTop: 6 }}>Processing image…</Text>
        </View>
      ) : (
        <View style={{ marginTop: 12 }}>
          <Button title="Add Image" onPress={pickImage} />
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
