// app/expenses/index.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useExpenseStore } from '../../src/stores/useExpenseStore';
import ExpenseItem from '../../src/components/ExpenseItem';
import { formatCurrency } from '../../src/utils/formatters';

export default function ExpensesListScreen(): React.ReactElement {
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

  // FAB menu state + animation
  const [open, setOpen] = useState<boolean>(false);
  const anim = React.useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = open ? 0 : 1;
    Animated.timing(anim, {
      toValue,
      duration: 180,
      easing: Easing.out(Easing.circle),
      useNativeDriver: true,
    }).start();
    setOpen(!open);
  };

  const addPress = () => {
    toggleMenu();
    router.push('/expenses/add');
  };

  const analyticsPress = () => {
    toggleMenu();
    router.push('/analytics');
  };

  // animated styles for the two mini buttons
  const addStyle = {
    transform: [
      {
        scale: anim,
      },
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -70],
        }),
      },
    ],
    opacity: anim,
  };

  const analyticsStyle = {
    transform: [
      {
        scale: anim,
      },
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -130],
        }),
      },
    ],
    opacity: anim,
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

      {/* FAB menu */}
      <View style={styles.fabContainer} pointerEvents="box-none">
        {/* Analytics mini button */}
        <Animated.View style={[styles.miniBtnWrapper, analyticsStyle]}>
          <TouchableOpacity style={[styles.miniBtn]} onPress={analyticsPress} activeOpacity={0.85}>
            <Text style={styles.miniTxt}>📊</Text>
          </TouchableOpacity>
          <View style={styles.miniLabel}><Text style={styles.miniLabelText}>Analytics</Text></View>
        </Animated.View>

        {/* Add mini button */}
        <Animated.View style={[styles.miniBtnWrapper, addStyle]}>
          <TouchableOpacity style={[styles.miniBtn]} onPress={addPress} activeOpacity={0.85}>
            <Text style={styles.miniTxt}>＋</Text>
          </TouchableOpacity>
          <View style={styles.miniLabel}><Text style={styles.miniLabelText}>Add</Text></View>
        </Animated.View>

        {/* Main FAB */}
        <TouchableOpacity style={styles.fab} onPress={toggleMenu} activeOpacity={0.85}>
          <Text style={styles.fabText}>{open ? '✕' : '＋'}</Text>
        </TouchableOpacity>
      </View>
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

  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  fab: {
    height: 60,
    width: 60,
    borderRadius: 30,
    backgroundColor: '#3751FF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
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
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  miniTxt: { fontSize: 22 },

  miniLabel: {
    backgroundColor: 'transparent',
    marginRight: 8,
    marginLeft: 8,
  },
  miniLabelText: { backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, overflow: 'hidden', fontSize: 13, color: '#111' },
});
