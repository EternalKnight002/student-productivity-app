// app/planner/index.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, SafeAreaView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { TaskItem } from '../../src/components/TaskItem';
import { useTaskStore } from '../../src/stores/useTaskStore';
import { useTheme } from '../../src/theme';

const FILTERS = ['all', 'upcoming', 'overdue', 'done'] as const;
type Filter = typeof FILTERS[number];

export default function PlannerIndex() {
  const theme = useTheme();
  const colors = theme.colors;
  const tasks = useTaskStore((s) => s.tasks || []);
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
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.h1, { color: colors.text }]}>Planner</Text>
        <Pressable style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={() => router.push('/planner/add')}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>+ Add</Text>
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[styles.filterBtn, filter === f && { backgroundColor: '#E8EEFF' }]}>
            <Text style={filter === f ? styles.filterTextActive : styles.filterText}>{f}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <TaskItem task={item} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        ListEmptyComponent={<View style={styles.empty}><Text style={{ color: colors.muted }}>No tasks yet — add one!</Text></View>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  h1: { fontSize: 22, fontWeight: '700' },
  addBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16 },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, marginRight: 8 },
  filterText: { color: '#333' },
  filterTextActive: { color: '#3751FF', fontWeight: '600' },
  empty: { padding: 24, alignItems: 'center' },
});
