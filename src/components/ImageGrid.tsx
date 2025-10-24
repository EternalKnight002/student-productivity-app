// src/components/ImageGrid.tsx
import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, FlatList, Text, ListRenderItem } from 'react-native';
import { NoteAttachment } from '../types/note';

type Props = {
  attachments?: NoteAttachment[];
  onRemove?: (id: string) => void;
  onPress?: (uri: string) => void;
};

export const ImageGrid: React.FC<Props> = ({ attachments = [], onRemove, onPress }) => {
  if (!attachments.length) {
    return null;
  }

  const renderItem: ListRenderItem<NoteAttachment> = ({ item }) => (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => onPress?.(item.uri)} activeOpacity={0.8}>
        <Image source={{ uri: item.uri }} style={styles.image} />
      </TouchableOpacity>

      {onRemove ? (
        <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(item.id)}>
          <Text style={styles.removeText}>✕</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  return (
    <FlatList
      data={attachments}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 8 }}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
    width: 120,
    height: 120,
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: 120,
    height: 120,
    resizeMode: 'cover',
  },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: 'white',
    fontWeight: '700',
  },
});
