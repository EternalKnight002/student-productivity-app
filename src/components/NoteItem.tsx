// src/components/NoteItem.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useNotesStore } from '../stores/useNotesStore';
import { Note } from '../types/note';

type NoteItemProps = {
  note: Note;
};

export default function NoteItem({ note }: NoteItemProps): React.ReactElement {
  const router = useRouter();
  const deleteNote = useNotesStore((state) => state.deleteNote);

  const handlePress = () => {
    // open note detail
    router.push(`/notes/note/${note.id}`);
  };

  const handleDelete = () => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteNote(note.id);
          // replace ensures deleted note route isn't left in stack
          router.replace('/notes');
        },
      },
    ]);
  };

  const renderRightActions = () => (
    <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );

  // Use note.body (not content). fallback protections included
  const plain = (note.body ?? '').replace(/<[^>]+>/g, '');

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity style={styles.item} onPress={handlePress}>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {note.title || 'Untitled'}
          </Text>
          <Text style={styles.preview} numberOfLines={2}>
            {plain || 'No content'}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  content: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  preview: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
  },
});
