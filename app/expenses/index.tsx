// app/expenses/index.tsx
import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../../src/theme';
import Card from '../../src/components/Card';
import Chip from '../../src/components/Chip';
import ExpenseItem from '../../src/components/ExpenseItem';
import { useExpenseStore } from '../../src/stores/useExpenseStore';
import { formatCurrency } from '../../src/utils/formatters';

const CATEGORY_ORDER = [
  { key: 'all', label: 'all' },
  { key: 'Food', label: 'Food' },
  { key: 'Transport', label: 'Transport' },
  { key: 'College', label: 'College' },
  { key: 'Books', label: 'Books' },
  { key: 'Snacks', label: 'Snacks' },
  { key: 'Other', label: 'Other' },
];

export default function ExpensesListScreen(): React.ReactElement {
  const router = useRouter();
  const theme = useTheme();
  const colors = theme.colors;
  const store: any = useExpenseStore((s: any) => s);
  const expenses = Array.isArray(store?.expenses) ? store.expenses : [];

  const total = useMemo(
    () => (Array.isArray(expenses) ? expenses.reduce((acc: number, e: any) => acc + (Number(e.amount) || 0), 0) : 0),
    [expenses],
  );

  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filtered = useMemo(() => {
    if (!Array.isArray(expenses)) return [];
    if (selectedCategory === 'all') return expenses;
    return expenses.filter((e: any) => (e.category ?? 'Other') === selectedCategory);
  }, [expenses, selectedCategory]);

  const addPress = () => router.push('/expenses/add');
  const analyticsPress = () => router.push('/analytics');

  const callDelete = useCallback(async (id: string) => {
    if (!id) return;
    if (typeof store.deleteExpense === 'function') {
      await store.deleteExpense(id);
      return;
    }
    if (typeof store.removeExpense === 'function') {
      await store.removeExpense(id);
      return;
    }
    if (typeof store.setExpenses === 'function') {
      store.setExpenses((prev: any[]) => (Array.isArray(prev) ? prev.filter((it) => it.id !== id) : []));
    }
  }, [store]);

  const callAdd = useCallback((item: any) => {
    if (!item) return;
    if (typeof store.addExpense === 'function') return store.addExpense(item);
    if (typeof store.setExpenses === 'function') {
      store.setExpenses((prev: any[]) => ([item, ...(Array.isArray(prev) ? prev : [])]));
      return;
    }
  }, [store]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Expenses</Text>
        <Text style={[styles.total, { color: colors.accent }]}>{formatCurrency(total)}</Text>
      </View>

      <View style={styles.container}>
        <TouchableOpacity activeOpacity={0.9} onPress={analyticsPress}>
          <Card style={styles.summaryCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={[styles.summaryTitle, { color: colors.text }]}>Summary</Text>
                <Text style={[styles.summarySubtitle, { color: colors.muted }]}>{filtered.length} item{filtered.length === 1 ? '' : 's'}</Text>
              </View>
              <Feather name="bar-chart" size={20} color={colors.primary} />
            </View>
          </Card>
        </TouchableOpacity>

        <View style={styles.chipsRow}>
          <FlatList
            horizontal
            data={CATEGORY_ORDER}
            keyExtractor={(c) => c.key}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Chip
                label={item.label}
                selected={selectedCategory === item.key}
                onPress={() => setSelectedCategory(item.key)}
              />
            )}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id ?? String(Math.random())}
          renderItem={({ item }) => (
            <ExpenseItem
              item={item}
              onPress={() => router.push(`/expenses/edit/${item.id}`)}
              onDelete={(id: string) => callDelete(id)}
              onArchive={(id: string) => store.archiveExpense?.(id)}
              onUndo={(it: any) => callAdd(it)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ color: colors.muted }}>No expenses yet. Tap + to add one.</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* FAB */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => setOpen((v) => !v)}>
          <Text style={styles.fabText}>{open ? '✕' : '＋'}</Text>
        </TouchableOpacity>

        {open && (
          <>
            <TouchableOpacity style={styles.miniAction} onPress={analyticsPress}>
              <Feather name="bar-chart" size={18} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.miniAction, { marginTop: 12 }]} onPress={addPress}>
              <Feather name="plus" size={18} color={colors.text} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '800' },
  total: { marginTop: 6, fontSize: 16, fontWeight: '700' },

  summaryCard: { marginBottom: 12 },
  summaryTitle: { fontSize: 16, fontWeight: '700' },
  summarySubtitle: { fontSize: 13 },

  chipsRow: { marginBottom: 12 },

  empty: { padding: 40, alignItems: 'center' },

  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    alignItems: 'center',
    zIndex: 999,
  },
  fab: {
    height: 56,
    width: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 28 },
  miniAction: {
    marginTop: 12,
    height: 44,
    width: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});
