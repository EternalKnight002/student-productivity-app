// app/expenses/index.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useExpenseStore } from '../../src/stores/useExpenseStore';
import ExpenseItem from '../../src/components/ExpenseItem';
import { formatCurrency } from '../../src/utils/formatters';

export default function ExpensesListScreen() {
  const router = useRouter();
  const { expenses, deleteExpense } = useExpenseStore((s) => ({
    expenses: s.expenses,
    deleteExpense: s.deleteExpense,
  }));

  const total = useMemo(() => expenses.reduce((acc, e) => acc + e.amount, 0), [expenses]);

  const confirmDelete = (id: string) => {
    Alert.alert('Delete expense?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
        <Text style={styles.total}>{formatCurrency(total)}</Text>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <ExpenseItem
            item={item}
            onPress={() => router.push(`/expenses/edit/${item.id}`)}
            onDelete={() => confirmDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No expenses yet. Tap + to add one.</Text>
          </View>
        }
        contentContainerStyle={{ paddingVertical: 8 }}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/expenses/add')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    paddingTop: 28,
    paddingBottom: 18,
  },
  title: { fontSize: 22, fontWeight: '700' },
  total: { marginTop: 6, fontSize: 18, color: '#0F766E', fontWeight: '700' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#6B7280' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    height: 60,
    width: 60,
    borderRadius: 30,
    backgroundColor: '#3751FF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 28 },
});
