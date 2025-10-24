// app/expenses/add.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import theme from '../../src/theme';
import Card from '../../src/components/Card';
import Chip from '../../src/components/Chip';
import PrimaryButton from '../../src/components/PrimaryButton';
import { useExpenseStore } from '../../src/stores/useExpenseStore';
import { generateId } from '../../src/utils/formatters';

type FormValues = {
  amount: string;
  category: string;
  note?: string;
  date: string;
};

const CATEGORIES = ['Food', 'Transport', 'College', 'Books', 'Snacks', 'Other'];

export default function AddExpenseScreen() {
  const router = useRouter();
  const store: any = useExpenseStore((s: any) => s);

  // prefer addExpense, fallback to create/upsert
  const addExpenseFn =
    typeof store.addExpense === 'function'
      ? store.addExpense
      : typeof store.create === 'function'
      ? store.create
      : typeof store.upsert === 'function'
      ? store.upsert
      : (item: any) => {
          if (typeof store.setExpenses === 'function') {
            store.setExpenses((prev: any[]) => [item, ...(Array.isArray(prev) ? prev : [])]);
          } else {
            // fallback - push into array (not reactive in many setups)
            store.expenses = [item, ...(Array.isArray(store.expenses) ? store.expenses : [])];
          }
        };

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      amount: '',
      category: 'Food',
      note: '',
      date: new Date().toISOString(),
    },
  });

  const onSubmit = (data: FormValues) => {
    const amountNum = Number(data.amount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Validation', 'Enter a valid amount (> 0)');
      return;
    }

    const now = new Date();
    const expense = {
      id: generateId(),
      amount: Math.round(amountNum),
      category: data.category,
      note: data.note?.trim(),
      date: new Date(data.date).toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    try {
      addExpenseFn(expense);
      router.replace('/expenses');
    } catch (err) {
      console.error('Add expense error', err);
      Alert.alert('Error', 'Could not save expense. Try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Expense</Text>

      <Card>
        <View style={styles.field}>
          <Text style={styles.label}>Amount (₹)</Text>
          <Controller
            control={control}
            name="amount"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                value={value}
                onChangeText={(t) => onChange(t.replace(/[^0-9.]/g, ''))}
                keyboardType="numeric"
                placeholder="e.g. 120"
                style={[styles.input, errors.amount && styles.inputError]}
              />
            )}
          />
          {errors.amount && <Text style={styles.err}>Amount is required</Text>}
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
                  <Chip
                    key={c}
                    label={c}
                    selected={value === c}
                    onPress={() => onChange(c)}
                    compact
                  />
                ))}
              </View>
            )}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Date</Text>
          <Controller
            control={control}
            name="date"
            render={({ field: { onChange, value } }) => (
              <DateWrapper value={value} onChange={onChange} />
            )}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Note (optional)</Text>
          <Controller
            control={control}
            name="note"
            render={({ field: { onChange, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                style={[styles.input, styles.textArea]}
                placeholder="e.g. Maggi at canteen"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            )}
          />
        </View>

        <View style={{ marginTop: theme.spacing.md }}>
          <PrimaryButton title="Save" onPress={handleSubmit(onSubmit)} />
        </View>
      </Card>
    </View>
  );
}

function DateWrapper({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const date = new Date(value);
  const [show, setShow] = React.useState(false);

  const openWebPicker = async () => {
    try {
      const isoDefault = date.toISOString().slice(0, 10); // yyyy-mm-dd
      // eslint-disable-next-line no-undef
      const resp = window.prompt('Enter date (YYYY-MM-DD)', isoDefault);
      if (resp) {
        const ok = /^\d{4}-\d{2}-\d{2}$/.test(resp);
        if (ok) onChange(new Date(resp + 'T00:00:00.000Z').toISOString());
        else Alert.alert('Invalid', 'Date must be in YYYY-MM-DD format');
      }
    } catch (err) {
      console.warn('Web date fallback failed', err);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <TouchableOpacity
        onPress={openWebPicker}
        style={styles.input}
        accessibilityRole="button"
        accessibilityLabel="Pick date"
      >
        <Text>{date.toLocaleDateString()}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View>
      <TouchableOpacity onPress={() => setShow(true)} style={styles.input}>
        <Text>{date.toLocaleDateString()}</Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, selected) => {
            setShow(false);
            if (selected) onChange(selected.toISOString());
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg, backgroundColor: theme.colors.background },
  title: { ...theme.typography.h2, marginBottom: theme.spacing.md, color: theme.colors.text },
  field: { marginBottom: theme.spacing.md },
  label: { ...theme.typography.body, color: theme.colors.text, marginBottom: 6 },
  input: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    fontSize: theme.typography.body.fontSize,
  },
  inputError: { borderWidth: 1, borderColor: theme.colors.danger },
  err: { color: theme.colors.danger, marginTop: 6 },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap' as const },
  textArea: { minHeight: 80 },
});
