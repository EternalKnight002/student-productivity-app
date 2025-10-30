// app/planner/index.tsx
import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  Pressable,
  StyleSheet,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTaskStore } from '../../src/stores/useTaskStore';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '../../src/theme';
import * as Haptics from 'expo-haptics';

const FILTERS = ['all', 'upcoming', 'overdue', 'done'] as const;
type Filter = typeof FILTERS[number];

type Task = {
  id: string;
  title: string;
  dueDate?: string;
  course?: string;
  priority?: string;
  status?: string;
};

// --- TaskRow component (hooks allowed here) ---
type TaskRowProps = {
  item: Task;
  onPressEdit: (id: string) => void;
  onDeleteAnimated: (id: string, anim: Animated.Value) => void;
};

const TaskRow: React.FC<TaskRowProps> = ({ item, onPressEdit, onDeleteAnimated }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const toggleComplete = useTaskStore((s) => s.toggleComplete);

  const renderRightActions = (progress: any, dragX: any) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    });
    return (
      <Animated.View style={[styles.deleteContainer, { transform: [{ scale }] }]}>
        <Pressable onPress={() => onDeleteAnimated(item.id, fadeAnim)} style={styles.deleteButton}>
          <Text style={styles.deleteText}>🗑 Delete</Text>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Swipeable renderRightActions={(progress, dragX) => (item.status === 'done' ? renderRightActions(progress, dragX) : null)}>
        <Pressable onPress={() => onPressEdit(item.id)} style={styles.taskItem}>
          {/* checkbox */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              toggleComplete(item.id);
            }}
            style={[styles.checkbox, item.status === 'done' && styles.checkboxChecked]}
          >
            {item.status === 'done' ? <Text style={styles.checkmark}>✓</Text> : null}
          </Pressable>

          <View style={{ flex: 1 }}>
            <Text style={[styles.taskTitle, item.status === 'done' && { textDecorationLine: 'line-through', color: '#888' }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.taskMeta} numberOfLines={1}>
              {item.course ? `${item.course} • ` : ''}
              {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'No due date'}
            </Text>
          </View>
        </Pressable>
      </Swipeable>
    </Animated.View>
  );
};

// --- Main screen component ---
export default function PlannerIndex() {
  const theme = useTheme();
  const colors = theme.colors;
  const tasks = useTaskStore((s) => s.tasks || []);
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

  const handleDeleteAnimated = (id: string, anim: Animated.Value) => {
    // use Expo Haptics (works in Expo Go)
    Haptics.selectionAsync().catch(() => {});
    Animated.timing(anim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      deleteTask(id);
    });
  };

  const onPressEdit = (id: string) => {
    router.push(`/planner/edit/${id}`);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.h1, { color: colors.text }]}>Planner</Text>
        <Pressable style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={() => router.push('/planner/add')}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>+ Add</Text>
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterBtn,
                active && styles.activeFilterBtn,
                active && { shadowColor: '#3751FF', shadowOpacity: 0.25 },
              ]}
            >
              <Text style={[styles.filterText, active && { color: '#fff', fontWeight: '700' }]}>{f.toUpperCase()}</Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <TaskRow item={item} onPressEdit={onPressEdit} onDeleteAnimated={handleDeleteAnimated} />
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: colors.muted }}>No tasks yet — add one!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  h1: { fontSize: 24, fontWeight: '700' },
  addBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8 },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 25, backgroundColor: '#F0F3FF', marginRight: 8 },
  activeFilterBtn: { backgroundColor: '#3751FF' },
  filterText: { color: '#3751FF', fontSize: 13, textTransform: 'capitalize' },

  deleteContainer: { justifyContent: 'center', alignItems: 'flex-end', marginVertical: 6 },
  deleteButton: { backgroundColor: '#FF4D4D', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 10, marginRight: 10 },
  deleteText: { color: '#fff', fontWeight: '600' },

  taskItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F8FB', padding: 14, borderRadius: 10, marginVertical: 6, elevation: 1 },
  checkbox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D9DAE0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#3751FF',
    borderColor: '#3751FF',
  },
  checkmark: { color: '#fff', fontWeight: '800' },

  taskTitle: { fontSize: 16, fontWeight: '600', color: '#222' },
  taskMeta: { fontSize: 12, color: '#777', marginTop: 2 },
  empty: { padding: 24, alignItems: 'center' },
});
