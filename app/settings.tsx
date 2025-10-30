// app/settings.tsx
import React, { useCallback, useMemo, useState } from 'react';
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
  Pressable,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useExpenseStore } from '../src/stores/useExpenseStore';
import type { Expense } from '../src/types/expense';
import { formatCurrency } from '../src/utils/formatters';
import Card from '../src/components/Card';
import useThemeStore from '../src/stores/useThemeStore';

export default function SettingsScreen(): React.ReactElement {
  const router = useRouter();
  const store = useExpenseStore();
  const expenses: Expense[] = store.expenses ?? [];
  const addExpense = store.addExpense;
  const clearAll = store.clearAll;

  // THEME: use the persistent theme store we added
  const dark = useThemeStore((s) => s.dark);
  const accent = useThemeStore((s) => s.accent);
  const setAccent = useThemeStore((s) => s.setAccent);
  const toggleDark = useThemeStore((s) => s.toggleDark);

  // Build a theme object similar to what app used previously (so components using theme props keep working)
  const theme = useMemo(
    () => ({
      colors: {
        primary: accent,
        accent,
        background: dark ? '#0B1220' : '#F8FAFC',
        surface: dark ? '#0f1724' : '#fff',
        text: dark ? '#E6EEF8' : '#0F1724',
        muted: dark ? '#9AA7B2' : '#94A3B8',
      },
    }),
    [dark, accent],
  );

  // Export/Import state
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportJson, setExportJson] = useState('');
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importText, setImportText] = useState('');

  const totalAmount = expenses.reduce((acc: number, curr: Expense) => acc + (curr.amount ?? 0), 0);

  const onExport = useCallback(() => {
    const json = JSON.stringify(expenses, null, 2);
    setExportJson(json);
    setExportModalVisible(true);
  }, [expenses]);

  const onClearAll = useCallback(() => {
    Alert.alert('Clear all expenses?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          clearAll?.();
          Alert.alert('Cleared', 'All expenses removed.');
        },
      },
    ]);
  }, [clearAll]);

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

    const items = parsed as unknown[];
    const valid: Expense[] = [];
    for (const it of items) {
      if (typeof it !== 'object' || it === null) continue;
      const asAny = it as Record<string, unknown>;
      if (
        typeof asAny.id === 'string' &&
        typeof asAny.amount === 'number' &&
        typeof asAny.category === 'string' &&
        typeof asAny.date === 'string'
      ) {
        valid.push({
          id: String(asAny.id),
          amount: Math.round(Number(asAny.amount)),
          category: String(asAny.category),
          date: String(asAny.date),
          note: typeof asAny.note === 'string' ? (asAny.note as string) : undefined,
          createdAt: typeof asAny.createdAt === 'string' ? (asAny.createdAt as string) : new Date().toISOString(),
          updatedAt: typeof asAny.updatedAt === 'string' ? (asAny.updatedAt as string) : undefined,
        });
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
            clearAll?.();
            for (const e of valid) addExpense?.(e);
            setImportModalVisible(false);
            setImportText('');
            Alert.alert('Imported', `Replaced with ${valid.length} items.`);
          },
        },
        {
          text: 'Append',
          onPress: () => {
            for (const e of valid) addExpense?.(e);
            setImportModalVisible(false);
            setImportText('');
            Alert.alert('Imported', `Appended ${valid.length} items.`);
          },
        },
      ],
    );
  };

  // Accent color choices
  const accents = useMemo(() => ['#3751FF', '#00C48C', '#FB8C00', '#A78BFA', '#FF7AA2'], []);

  // local selectedAccent reads from the current theme primary so swatches reflect current state
  const [selectedAccent, setSelectedAccent] = useState<string>(theme.colors.primary ?? accents[0]);

  React.useEffect(() => {
    if (theme?.colors?.primary) setSelectedAccent(theme.colors.primary);
  }, [theme?.colors?.primary]);

  const chooseAccent = async (col: string) => {
    setSelectedAccent(col);
    try {
      await setAccent(col);
    } catch {
      // ignore
    }
  };

  // Theme toggle
  const onToggleTheme = async () => {
    // toggleDark flips and persists in store
    toggleDark();
  };

  // Feedback (opens mailto)
  const onFeedback = () => {
    router.push('mailto:alternatewavelenght@gmail.com?subject=Feedback%20—%20Student%20Planner');
  };

  // About screen
  const onAbout = () => {
    router.push('/about');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={{ padding: 16 }}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>

      <Card style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Preferences</Text>

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={[styles.rowTitle, { color: theme.colors.text }]}>Dark mode</Text>
            <Text style={[styles.rowSub, { color: theme.colors.muted }]}>Switch between light & dark</Text>
          </View>
          <Switch value={dark} onValueChange={onToggleTheme} />
        </View>

        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: '#F1F5F9' }]}>
          <View style={styles.rowLeft}>
            <Text style={[styles.rowTitle, { color: theme.colors.text }]}>Accent color</Text>
            <Text style={[styles.rowSub, { color: theme.colors.muted }]}>Choose an accent for the app</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {accents.map((c) => (
              <Pressable
                key={c}
                onPress={() => chooseAccent(c)}
                style={[
                  styles.accentSwatch,
                  { backgroundColor: c, borderWidth: selectedAccent === c ? 3 : 0, borderColor: '#fff' },
                ]}
              />
            ))}
          </View>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Data</Text>

        <TouchableOpacity style={styles.row} onPress={onExport} activeOpacity={0.8}>
          <View>
            <Text style={[styles.rowTitle, { color: theme.colors.text }]}>Export expenses (JSON)</Text>
            <Text style={[styles.rowSub, { color: theme.colors.muted }]}>Open JSON to copy/share</Text>
          </View>
          <Feather name="share" size={18} color={theme.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={() => setImportModalVisible(true)} activeOpacity={0.8}>
          <View>
            <Text style={[styles.rowTitle, { color: theme.colors.text }]}>Import expenses (JSON)</Text>
            <Text style={[styles.rowSub, { color: theme.colors.muted }]}>Paste exported JSON to import</Text>
          </View>
          <Feather name="upload" size={18} color={theme.colors.muted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={onClearAll} activeOpacity={0.8}>
          <View>
            <Text style={[styles.rowTitle, { color: '#EF4444' }]}>Clear all expenses</Text>
            <Text style={[styles.rowSub, { color: theme.colors.muted }]}>Removes all local expense data</Text>
          </View>
          <Feather name="trash-2" size={18} color="#EF4444" />
        </TouchableOpacity>
      </Card>

      <Card style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Support</Text>

        <TouchableOpacity style={styles.row} onPress={onFeedback} activeOpacity={0.8}>
          <Text style={[styles.rowTitle, { color: theme.colors.text }]}>Help & feedback</Text>
          <Feather name="help-circle" size={18} color={theme.colors.muted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={onAbout} activeOpacity={0.8}>
          <Text style={[styles.rowTitle, { color: theme.colors.text }]}>About</Text>
          <Feather name="info" size={18} color={theme.colors.muted} />
        </TouchableOpacity>
      </Card>

      {/* Export Modal */}
      <Modal visible={exportModalVisible} animationType="slide" onRequestClose={() => setExportModalVisible(false)}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Exported JSON</Text>
          <ScrollView style={{ flex: 1 }}>
            <TextInput value={exportJson} multiline editable={false} style={[styles.exportText, { backgroundColor: theme.colors.background, color: theme.colors.text }]} textAlignVertical="top" />
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
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Import JSON</Text>
          <Text style={[styles.modalHint, { color: theme.colors.muted }]}>Paste an exported JSON array of expenses below:</Text>
          <TextInput
            value={importText}
            onChangeText={setImportText}
            multiline
            placeholder="Paste JSON here..."
            placeholderTextColor={theme.colors.muted}
            style={[styles.exportText, { height: 240, backgroundColor: theme.colors.background, color: theme.colors.text }]}
            textAlignVertical="top"
          />

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setImportModalVisible(false)}>
              <Text style={styles.modalBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: theme.colors.primary }]} onPress={onImport}>
              <Text style={[styles.modalBtnText, { color: '#fff' }]}>Import</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12, marginTop: Platform.OS === 'ios' ? 12 : 0, paddingLeft: 2 },
  card: { marginBottom: 12, padding: 12, borderRadius: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  row: { paddingVertical: 12, borderTopWidth: 0.5, borderTopColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLeft: { flex: 1, paddingRight: 12 },
  rowTitle: { fontSize: 14, fontWeight: '600' },
  rowSub: { color: '#6B7280', marginTop: 4 },
  info: { color: '#374151', marginTop: 6 },

  modalContainer: { flex: 1, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  modalHint: { color: '#6B7280', marginBottom: 8 },
  exportText: { padding: 12, borderRadius: 8, minHeight: 120 },

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

  accentSwatch: { width: 36, height: 36, borderRadius: 10, marginLeft: 8, borderColor: '#fff' },
});
