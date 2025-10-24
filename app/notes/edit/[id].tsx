// app/notes/edit/[id].tsx
import React, { useEffect } from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, Pressable, StyleSheet, View, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { useNotesStore } from '../../../src/stores/useNotesStore';
import Markdown from 'react-native-markdown-display';
import { Note } from '../../../src/types/note';

type Params = { id: string };
type FormValues = { title: string; body?: string; pinned?: boolean };

export default function EditNote(): React.ReactElement {
  const { id } = useLocalSearchParams<Params>();
  const router = useRouter();
  const note = useNotesStore((s) => (id ? s.getById(id) : undefined));
  const updateNote = useNotesStore((s) => s.updateNote);
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const { control, handleSubmit, reset } = useForm<FormValues>({ defaultValues: { title: '', body: '', pinned: false } });

  useEffect(() => {
    if (note) {
      reset({ title: note.title, body: note.body ?? '', pinned: !!note.pinned });
    }
  }, [note, reset]);

  if (!note) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Note not found</Text>
      </SafeAreaView>
    );
  }

  const onSave = (vals: FormValues) => {
    updateNote(note.id, { title: vals.title, body: vals.body, pinned: !!vals.pinned });
    router.back();
  };

  const onDelete = () => {
    Alert.alert('Delete note', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteNote(note.id);
          router.push('/notes');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.h1}>Edit Note</Text>

        <Text style={styles.label}>Title</Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => <TextInput value={value} onChangeText={(v) => onChange(v)} style={styles.input} />}
        />

        <Text style={styles.label}>Body (Markdown)</Text>
        <Controller
          control={control}
          name="body"
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              onChangeText={(v) => onChange(v)}
              style={[styles.input, { height: 160 }]}
              multiline
            />
          )}
        />

        <Text style={styles.label}>Preview</Text>
        <View style={styles.previewBox}>
          <Markdown>{(control._formValues?.body as string) ?? note.body ?? '*Nothing to preview*'}</Markdown>
        </View>

        <Pressable onPress={handleSubmit(onSave)} style={styles.saveBtn}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Save</Text>
        </Pressable>

        <Pressable onPress={onDelete} style={styles.deleteBtn}>
          <Text style={{ color: '#FF4D4D', fontWeight: '600' }}>Delete</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  label: { marginTop: 12, marginBottom: 6, color: '#444' },
  input: { backgroundColor: '#F7F8FB', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#EFEFF0' },
  previewBox: { backgroundColor: '#fff', borderRadius: 8, padding: 12, minHeight: 80, borderWidth: 1, borderColor: '#EFEFF0' },
  saveBtn: { marginTop: 20, backgroundColor: '#3751FF', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  deleteBtn: { marginTop: 12, alignItems: 'center' },
});
