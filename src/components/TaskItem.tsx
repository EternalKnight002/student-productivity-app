// src/components/TaskItem.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Task } from '../types/task';
import { useRouter } from 'expo-router';
import { useTaskStore } from '../stores/useTaskStore';
import theme from '../theme';

type Props = { task: Task };

export const TaskItem: React.FC<Props> = ({ task }) => {
  const toggle = useTaskStore((s) => s.toggleComplete);
  const router = useRouter();

  const due = task.dueDate ? new Date(task.dueDate) : null;
  const dueLabel = due ? due.toLocaleDateString() : 'No due date';

  return (
    <Pressable
      onPress={() => router.push(`/planner/edit/${task.id}`)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.left}>
        <Pressable onPress={(e) => { e.stopPropagation(); toggle(task.id); }} style={[styles.checkbox, task.status === 'done' && styles.checked]}>
          {task.status === 'done' ? <Text style={styles.checkMark}>✓</Text> : null}
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={[styles.title, task.status === 'done' && styles.done]} numberOfLines={1}>{task.title}</Text>
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
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    marginVertical: 6,
    ...platformLift(),
  },
  pressed: { opacity: 0.9 },
  left: { marginRight: 12 },
  checkbox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkMark: { color: '#fff', fontWeight: '800' },
  body: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  done: { textDecorationLine: 'line-through', color: theme.colors.muted },
  meta: { fontSize: 12, color: theme.colors.muted, marginTop: 4 },
});

function platformLift() {
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  } as any;
}
