// app/planner/index.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, SafeAreaView, Pressable, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import {TaskItem} from '../../src/components/TaskItem';
import { useTaskStore } from '../../src/stores/useTaskStore';
import { Task } from '../../src/types/task';

const FILTERS = ['all', 'upcoming', 'overdue', 'done'] as const;
type Filter = typeof FILTERS[number];

export default function PlannerIndex() {
  const tasks = useTaskStore((s) => s.tasks);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const [filter, setFilter] = useState<Filter>('all');
  const router = useRouter();

  const filtered = useMemo(() => {
    const now = new Date();
    switch (filter) {
      case 'upcoming':
        return tasks.filter((t) => t.dueDate && new Date(t.dueDate) >= now && t.status !== 'done');
      case 'overdue':
        return tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done');
      case 'done':
        return tasks.filter((t) => t.status === 'done');
      default:
        return tasks;
    }
  }, [tasks, filter]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.h1}>Planner</Text>
        <Link href="/planner/add" style={styles.addBtn}><Text style={{ color: '#fff' }}>+ Add</Text></Link>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[styles.filterBtn, filter === f && styles.filterActive]}>
            <Text style={filter === f ? styles.filterTextActive : styles.filterText}>{f}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <TaskItem task={item as Task} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        ListEmptyComponent={<View style={styles.empty}><Text>No tasks yet — add one!</Text></View>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f7fb' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  h1: { fontSize: 22, fontWeight: '700' },
  addBtn: {
    backgroundColor: '#3751FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16 },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  filterActive: { backgroundColor: '#E8EEFF' },
  filterText: { color: '#333' },
  filterTextActive: { color: '#3751FF', fontWeight: '600' },
  empty: { padding: 24, alignItems: 'center' },
});
