// app/settings.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

import { useExpenseStore } from '../src/stores/useExpenseStore';
import type { Expense } from '../src/types/expense';
import { formatCurrency } from '../src/utils/formatters';

const THEME_KEY = 'app-settings-theme';

export default function SettingsScreen(): React.ReactElement {
  const router = useRouter();

  // Read full store instance (avoids implicit 'any' in selector lambdas)
  const store = useExpenseStore();
  const expenses: Expense[] = store.expenses;
  const addExpense = store.addExpense;
  const clearAll = store.clearAll;

  // UI state
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportJson, setExportJson] = useState('');
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importText, setImportText] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    (async () => {
      try {
        const t = await AsyncStorage.getItem(THEME_KEY);
        if (t === 'dark') setTheme('dark');
        else setTheme('light');
      } catch {
        // ignore
      }
    })();
  }, []);

  // Export - open modal and prepare JSON
  const onExport = (): void => {
    const json = JSON.stringify(expenses, null, 2);
    setExportJson(json);
    setExportModalVisible(true);
  };

  // Import - validate then import
  const onImport = async (): Promise<void> => {
    if (!importText || importText.trim() === '') {
      Alert.alert('Paste JSON', 'Please paste valid JSON to import.');
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(importText);
    } catch (err) {
      Alert.alert('Invalid JSON', 'Could not parse JSON. Please check format.');
      return;
    }

    if (!Array.isArray(parsed)) {
      Alert.alert('Invalid format', 'Expected an array of expense objects.');
      return;
    }

    // basic validation and import
    const items = parsed as unknown[];
    const valid: Expense[] = [];
    for (const it of items) {
      if (typeof it !== 'object' || it === null) continue;
      const asAny = it as Record<string, unknown>;
      // required fields: id (string), amount (number), category (string), date (string)
      if (
        typeof asAny.id === 'string' &&
        typeof asAny.amount === 'number' &&
        typeof asAny.category === 'string' &&
        typeof asAny.date === 'string'
      ) {
        const e: Expense = {
          id: String(asAny.id),
          amount: Math.round(Number(asAny.amount)),
          category: String(asAny.category),
          date: String(asAny.date),
          note: typeof asAny.note === 'string' ? (asAny.note as string) : undefined,
          createdAt:
            typeof asAny.createdAt === 'string' ? (asAny.createdAt as string) : new Date().toISOString(),
          updatedAt: typeof asAny.updatedAt === 'string' ? (asAny.updatedAt as string) : undefined,
        };
        valid.push(e);
      }
    }

    if (valid.length === 0) {
      Alert.alert('No valid items', 'No valid expense items were found in the JSON.');
      return;
    }

    Alert.alert(
      'Import expenses?',
      `Found ${valid.length} valid items. Do you want to append them to existing data (Cancel will replace)?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: async () => {
            // replace flow
            clearAll();
            for (const e of valid) addExpense(e);
            setImportModalVisible(false);
            setImportText('');
            Alert.alert('Imported', `Replaced with ${valid.length} items.`);
          },
        },
        {
          text: 'Append',
          onPress: () => {
            for (const e of valid) addExpense(e);
            setImportModalVisible(false);
            setImportText('');
            Alert.alert('Imported', `Appended ${valid.length} items.`);
          },
        },
      ]
    );
  };

  const onClearAll = (): void => {
    Alert.alert('Clear all expenses?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          clearAll();
          Alert.alert('Cleared', 'All expenses removed.');
        },
      },
    ]);
  };

  const toggleTheme = async (): Promise<void> => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try {
      await AsyncStorage.setItem(THEME_KEY, next);
    } catch {
      // ignore
    }
  };

  // explicit typed reducer for total (no implicit any)
  const totalAmount = expenses.reduce((acc: number, curr: Expense) => acc + (curr.amount ?? 0), 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data</Text>

        <TouchableOpacity style={styles.row} onPress={onExport} activeOpacity={0.8}>
          <Text style={styles.rowTitle}>Export expenses (JSON)</Text>
          <Text style={styles.rowSub}>Open JSON to copy/share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={() => setImportModalVisible(true)} activeOpacity={0.8}>
          <Text style={styles.rowTitle}>Import expenses (JSON)</Text>
          <Text style={styles.rowSub}>Paste exported JSON to import</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={onClearAll} activeOpacity={0.8}>
          <Text style={[styles.rowTitle, { color: '#EF4444' }]}>Clear all expenses</Text>
          <Text style={styles.rowSub}>Removes all local expense data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Preferences</Text>

        <TouchableOpacity style={styles.row} onPress={toggleTheme} activeOpacity={0.8}>
          <Text style={styles.rowTitle}>Theme</Text>
          <Text style={styles.rowSub}>{theme === 'light' ? 'Light' : 'Dark'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick info</Text>
        <Text style={styles.info}>Total expenses: {expenses.length}</Text>
        <Text style={styles.info}>Total amount: {formatCurrency(totalAmount)}</Text>

        <TouchableOpacity style={[styles.row, { marginTop: 12 }]} onPress={() => router.push('/analytics')} activeOpacity={0.85}>
          <Text style={[styles.rowTitle, { color: '#3751FF' }]}>Open Analytics</Text>
        </TouchableOpacity>
      </View>

      {/* Export Modal */}
      <Modal visible={exportModalVisible} animationType="slide" onRequestClose={() => setExportModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Exported JSON</Text>
          <ScrollView style={{ flex: 1 }}>
            <TextInput value={exportJson} multiline editable={false} style={styles.exportText} textAlignVertical="top" />
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setExportModalVisible(false)}>
              <Text style={styles.modalBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Import Modal */}
      <Modal visible={importModalVisible} animationType="slide" onRequestClose={() => setImportModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Import JSON</Text>
          <Text style={styles.modalHint}>Paste an exported JSON array of expenses below:</Text>
          <TextInput
            value={importText}
            onChangeText={setImportText}
            multiline
            placeholder="Paste JSON here..."
            style={[styles.exportText, { height: 240 }]}
            textAlignVertical="top"
          />

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setImportModalVisible(false)}>
              <Text style={styles.modalBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#3751FF' }]} onPress={onImport}>
              <Text style={[styles.modalBtnText, { color: '#fff' }]}>Import</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12, marginTop: Platform.OS === 'ios' ? 12 : 0, paddingLeft: 2 },
  card: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  row: {
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#F1F5F9',
  },
  rowTitle: { fontSize: 14, fontWeight: '600' },
  rowSub: { color: '#6B7280', marginTop: 4 },
  info: { color: '#374151', marginTop: 6 },

  modalContainer: { flex: 1, padding: 16, backgroundColor: '#fff' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  modalHint: { color: '#6B7280', marginBottom: 8 },
  exportText: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 8, minHeight: 120 },

  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  modalBtnText: { fontWeight: '700' },
});
