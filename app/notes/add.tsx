// app/notes/add.tsx
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, Pressable, StyleSheet, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useNotesStore } from '../../src/stores/useNotesStore';
import { useRouter } from 'expo-router';
import Markdown from 'react-native-markdown-display';

type FormValues = { title: string; content?: string; pinned?: boolean };

export default function AddNote() {
  const { control, handleSubmit } = useForm<FormValues>({ defaultValues: { title: '', content: '', pinned: false } });
  const addNote = useNotesStore((s) => s.addNote);
  const router = useRouter();
  const [preview, setPreview] = useState('');

  const onSubmit = (data: FormValues) => {
    // cast to any to satisfy the store signature when the Note type doesn't include `content`
    addNote({ title: data.title, content: data.content, pinned: !!data.pinned } as any);
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.h1}>New Note</Text>

        <Text style={styles.label}>Title</Text>
        <Controller control={control} name="title" rules={{ required: true }} render={({ field: { onChange, value } }) => (
          <TextInput value={value} onChangeText={onChange} style={styles.input} placeholder="Title" />
        )} />

        <Text style={styles.label}>Content (Markdown)</Text>
        <Controller control={control} name="content" render={({ field: { onChange, value } }) => (
          <TextInput
            value={value}
            onChangeText={(v) => { onChange(v); setPreview(v || ''); }}
            style={[styles.input, { height: 160 }]}
            multiline
            placeholder="Write in markdown..."
          />
        )} />

        <Text style={styles.label}>Preview</Text>
        <View style={styles.previewBox}>
          <Markdown>{preview || '*Nothing to preview*'}</Markdown>
        </View>

        <Pressable onPress={handleSubmit(onSubmit)} style={styles.saveBtn}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Save</Text>
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
});
