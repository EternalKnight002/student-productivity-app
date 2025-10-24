// src/components/TaskItem.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Task } from '../types/task';
import { useRouter, Link } from 'expo-router';
import { useTaskStore } from '../stores/useTaskStore';

type Props = {
  task: Task;
};

export const TaskItem: React.FC<Props> = ({ task }) => {
  const toggle = useTaskStore((s) => s.toggleComplete);
  const router = useRouter();

  const due = task.dueDate ? new Date(task.dueDate) : null;
  const dueLabel = due ? due.toLocaleDateString() : 'No due date';

  return (
    <Pressable
      onPress={() => router.push({ pathname: `/planner/edit/${task.id}` })}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.left}>
        <Pressable onPress={(e) => { e.stopPropagation(); toggle(task.id); }} style={styles.checkbox}>
          <Text>{task.status === 'done' ? '✓' : ''}</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={[styles.title, task.status === 'done' && styles.done]} numberOfLines={1}>
          {task.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {task.course ? `${task.course} • ` : ''}{dueLabel} • {task.priority}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 6,
    elevation: 1,
  },
  pressed: { opacity: 0.85 },
  left: { marginRight: 12 },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: '#111' },
  done: { textDecorationLine: 'line-through', color: '#888' },
  meta: { fontSize: 12, color: '#666', marginTop: 4 },
});
