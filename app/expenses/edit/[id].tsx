// app/expenses/edit/[id].tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useExpenseStore } from '../../../src/stores/useExpenseStore';
import type { Expense } from '../../../src/types/expense';

const CATEGORIES = ['Food', 'Transport', 'College', 'Books', 'Snacks', 'Other'];

type FormValues = {
  amount: string;
  category: string;
  note?: string;
  date: string;
};

export default function EditExpenseScreen(): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams() as { id?: string };
  const getById = useExpenseStore((s) => s.getById);
  const updateExpense = useExpenseStore((s) => s.updateExpense);

  const expense: Expense | undefined = id ? getById(String(id)) : undefined;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: {
      amount: '',
      category: 'Food',
      note: '',
      date: new Date().toISOString()
    }
  });

  useEffect(() => {
    if (expense) {
      reset({
        amount: String(expense.amount),
        category: expense.category,
        note: expense.note ?? '',
        date: expense.date
      });
    }
  }, [expense, reset]);

  if (!expense) {
    return (
      <View style={styles.container}>
        <Text style={styles.missing}>Expense not found.</Text>
      </View>
    );
  }

  const onSubmit = (data: FormValues) => {
    const amountNum = Number(data.amount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      alert('Enter a valid amount (> 0)');
      return;
    }

    updateExpense(expense.id, {
      amount: Math.round(amountNum),
      category: data.category,
      note: data.note?.trim(),
      date: new Date(data.date).toISOString()
    });

    router.replace('/expenses');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Expense</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Amount (₹)</Text>
        <Controller
          control={control}
          name="amount"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              keyboardType="numeric"
              placeholder="e.g. 120"
              style={[styles.input, errors.amount && styles.inputError]}
            />
          )}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Category</Text>
        <Controller
          control={control}
          name="category"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.pickerRow}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => onChange(c)}
                  style={[styles.catChip, value === c && styles.catChipActive]}
                >
                  <Text style={value === c ? styles.catTextActive : styles.catText}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Date (ISO or any date text)</Text>
        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="e.g. 2025-10-12T00:00:00.000Z or 12/10/2025"
              style={styles.input}
            />
          )}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Note (optional)</Text>
        <Controller
          control={control}
          name="note"
          render={({ field: { onChange, value } }) => (
            <TextInput value={value} onChangeText={onChange} style={styles.input} placeholder="e.g. Maggi at canteen" />
          )}
        />
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.saveText}>Save changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F3F4F6' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  missing: { padding: 16 },
  field: { marginBottom: 12 },
  label: { fontSize: 13, color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    fontSize: 16
  },
  inputError: { borderWidth: 1, borderColor: '#ff4444' },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap' as const },
  catChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    marginBottom: 8
  },
  catChipActive: { backgroundColor: '#3751FF' },
  catText: { color: '#111' },
  catTextActive: { color: '#fff' },
  saveBtn: {
    marginTop: 18,
    backgroundColor: '#3751FF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  saveText: { color: '#fff', fontWeight: '700' }
});
