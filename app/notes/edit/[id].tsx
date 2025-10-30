// app/notes/edit/[id].tsx
import React, { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNotesStore } from '../../../src/stores/useNotesStore';
import { Note } from '../../../src/types/note';

export default function EditNoteScreen(): React.ReactElement | null {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();

  const note = useNotesStore((state) =>
    state.notes.find((n: Note) => n.id === id)
  );

  // If note doesn't exist -> go back to notes list.
  // If note exists, navigate into the page-editor route so the editor can load it.
  useEffect(() => {
    if (!id) {
      router.replace('/notes');
      return;
    }

    if (!note) {
      // If note isn't present in store yet, either it's been deleted or store not loaded.
      // We still navigate to editor route — the editor will handle missing note and redirect.
      router.replace('/notes');
      return;
    }

    // Replace so we don't leave this intermediate route in the stack.
    // Editor reads the id via useLocalSearchParams.
    router.replace(`/notes/editor?id=${note.id}`);
  }, [id, note, router]);

  // We don't render anything here — the router.replace will open the editing page.
  return null;
}
