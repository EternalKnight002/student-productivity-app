// app/notes/add.tsx
import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddNoteRedirect(): React.ReactElement | null {
  const router = useRouter();

  useEffect(() => {
    // open the rich editor for creating a new note
    // editor handles "no id" case and creates a new note when saved
    router.replace('/notes/editor');
  }, [router]);

  return <SafeAreaView style={{ flex: 1 }} />;
}
