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
import theme from '../../src/theme';
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

  // Pull commonly used store API (we'll still call other methods defensively if they exist)
  const store: any = useExpenseStore((s: any) => s);

  // Keep direct reactive slices simple
  const expenses = Array.isArray(store?.expenses) ? store.expenses : [];

  const total = useMemo(
    () => (Array.isArray(expenses) ? expenses.reduce((acc: number, e: any) => acc + (Number(e.amount) || 0), 0) : 0),
    [expenses],
  );

  const [open, setOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filtered = useMemo(() => {
    if (!Array.isArray(expenses)) return [];
    if (selectedCategory === 'all') return expenses;
    return expenses.filter((e: any) => (e.category ?? 'Other') === selectedCategory);
  }, [expenses, selectedCategory]);

  const toggleMenu = () => setOpen((v) => !v);

  const addPress = () => {
    setOpen(false);
    router.push('/expenses/add');
  };

  // Navigate to the analytics screen (explicit path)
  const analyticsPress = () => {
    setOpen(false);
    router.push('/expenses/analytics');
  };

  // ---------- Store adapter helpers (defensive) ----------
  const callDelete = useCallback(
    async (id: string) => {
      if (!id) return;
      try {
        // prefer common method names and await when returned value is a promise
        if (typeof store.deleteExpense === 'function') {
          const r = store.deleteExpense(id);
          if (r && typeof r.then === 'function') await r;
          else return;
        }
        if (typeof store.removeExpense === 'function') {
          const r = store.removeExpense(id);
          if (r && typeof r.then === 'function') await r;
          else return;
        }
        if (typeof store.delete === 'function') {
          const r = store.delete(id);
          if (r && typeof r.then === 'function') await r;
          else return;
        }
        // fallback: if there's a setExpenses helper, use it
        if (typeof store.setExpenses === 'function') {
          store.setExpenses((prev: any[]) => (Array.isArray(prev) ? prev.filter((it) => it.id !== id) : []));
          return;
        }
        // final fallback: try to call a load() function to refresh the store if available
        if (typeof store.load === 'function') {
          await store.load();
          return;
        }
      } catch (err) {
        console.error('callDelete error:', err);
        // try best-effort reload
        if (typeof store.load === 'function') {
          try {
            await store.load();
          } catch (e) {
            console.error('reload after delete error:', e);
          }
        }
      }
    },
    [store],
  );

  const callAdd = useCallback(
    (item: any) => {
      if (!item) return;
      if (typeof store.addExpense === 'function') return store.addExpense(item);
      if (typeof store.create === 'function') return store.create(item);
      if (typeof store.upsert === 'function') return store.upsert(item);
      if (typeof store.setExpenses === 'function') {
        store.setExpenses((prev: any[]) => ([item, ...(Array.isArray(prev) ? prev : [])]));
        return;
      }
    },
    [store],
  );

  const callArchive = useCallback(
    (id: string) => {
      if (!id) return;
      // prefer dedicated method
      if (typeof store.archiveExpense === 'function') return store.archiveExpense(id);
      // try update
      if (typeof store.updateExpense === 'function') return store.updateExpense(id, { archived: true });
      // try generic upsert
      if (typeof store.upsert === 'function') return store.upsert({ id, archived: true });
      // fallback: mutate the array to set archived flag
      if (typeof store.setExpenses === 'function') {
        store.setExpenses((prev: any[]) =>
          (Array.isArray(prev) ? prev.map((it) => (it.id === id ? { ...it, archived: true } : it)) : prev),
        );
        return;
      }
      // final fallback: warn
      console.warn('No archive method found on store; please implement archiveExpense/updateExpense/upsert or setExpenses.');
    },
    [store],
  );

  // ---------- Handlers passed to ExpenseItem ----------
  const handleDelete = async (id: string) => {
    await callDelete(id);
    // ensure UI refresh - attempt load if store exposes it
    if (typeof store.load === 'function') {
      try {
        await store.load();
      } catch (e) {
        console.error('store.load after delete failed:', e);
      }
    }
  };

  const handleArchive = (id: string) => {
    callArchive(id);
  };

  const handleUndo = (item: any) => {
    callAdd(item);
  };

  // ---------- Render ----------
  const renderItem = ({ item }: { item: any }) => (
    <ExpenseItem
      item={item}
      onPress={() => router.push(`/expenses/edit/${item.id}`)}
      onDelete={(id: string) => handleDelete(id)}
      onArchive={(id: string) => handleArchive(id)}
      onUndo={(it: any) => handleUndo(it)}
    />
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
        <Text style={styles.total}>{formatCurrency(total)}</Text>
      </View>

      <View style={styles.container}>
        <TouchableOpacity activeOpacity={0.85} onPress={analyticsPress}>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <Text style={styles.summarySubtitle}>{filtered.length} item{filtered.length === 1 ? '' : 's'}</Text>
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
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No expenses yet. Tap + to add one.</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* FAB menu */}
      <View style={styles.fabContainer} pointerEvents="box-none">
        {open && (
          <>
            <View style={[styles.miniBtnWrapper, { bottom: 130 }]}>
              <TouchableOpacity style={styles.miniBtn} onPress={analyticsPress} activeOpacity={0.85}>
                <Text style={styles.miniTxt}>📊</Text>
              </TouchableOpacity>
              <View style={styles.miniLabel}><Text style={styles.miniLabelText}>Analytics</Text></View>
            </View>

            <View style={[styles.miniBtnWrapper, { bottom: 70 }]}>
              <TouchableOpacity style={styles.miniBtn} onPress={addPress} activeOpacity={0.85}>
                <Text style={styles.miniTxt}>＋</Text>
              </TouchableOpacity>
              <View style={styles.miniLabel}><Text style={styles.miniLabelText}>Add</Text></View>
            </View>
          </>
        )}

        <TouchableOpacity style={styles.fab} onPress={toggleMenu} activeOpacity={0.85} accessibilityRole="button">
          <Text style={styles.fabText}>{open ? '✕' : '＋'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, paddingHorizontal: theme.spacing.lg },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  title: { ...theme.typography.h1, color: theme.colors.text },
  total: { marginTop: 6, fontSize: 18, color: theme.colors.accent, fontWeight: '700' },

  summaryCard: { marginBottom: theme.spacing.md },
  summaryTitle: { ...theme.typography.h2, color: theme.colors.text },
  summarySubtitle: { ...theme.typography.body, color: theme.colors.muted },

  chipsRow: { marginBottom: theme.spacing.md },

  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: theme.colors.muted },

  fabContainer: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    alignItems: 'center',
    zIndex: 999,
  },

  fab: {
    height: theme.sizes.fab,
    width: theme.sizes.fab,
    borderRadius: theme.sizes.fab / 2,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 28 },

  miniBtnWrapper: {
    position: 'absolute',
    right: 0,
    alignItems: 'center',
    flexDirection: 'row',
  },
  miniBtn: {
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  miniTxt: { fontSize: 22 },

  miniLabel: {
    backgroundColor: 'transparent',
    marginRight: 8,
    marginLeft: 8,
  },
  miniLabelText: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
    fontSize: 13,
    color: theme.colors.text,
  },
});
