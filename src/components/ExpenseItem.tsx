// src/components/ExpenseItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Expense } from '../types/expense';
import { formatCurrency, formatDateShort } from '../utils/formatters';

type Props = {
  item: Expense;
  onPress?: () => void;
  onDelete?: () => void;
};

export default function ExpenseItem({ item, onPress, onDelete }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.cat}>{item.category}</Text>
        <Text style={styles.note} numberOfLines={1}>{item.note || '—'}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
        <Text style={styles.date}>{formatDateShort(item.date)}</Text>
        {onDelete ? (
          <TouchableOpacity onPress={onDelete} style={styles.delBtn}>
            <Text style={styles.delText}>Delete</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flex: 1,
    paddingRight: 12,
  },
  cat: {
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  right: {
    alignItems: 'flex-end',
    minWidth: 110,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  delBtn: {
    marginTop: 6,
  },
  delText: {
    color: '#ff4444',
    fontSize: 12,
  },
});
