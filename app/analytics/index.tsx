// app/analytics/index.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

import theme from '../../src/theme';
import Card from '../../src/components/Card';
import AnalyticsCard from '../../src/components/AnalyticsCard';
import { useExpenseStore } from '../../src/stores/useExpenseStore';
import { formatCurrency } from '../../src/utils/formatters';

const SCREEN_WIDTH = Dimensions.get('window').width;

// ---------- MAIN COMPONENT ----------
export default function AnalyticsScreen(): React.ReactElement {
  const router = useRouter();
  const colors = theme.colors;
  const store: any = useExpenseStore((s: any) => s);
  const expenses = Array.isArray(store?.expenses) ? store.expenses : [];

  // ---- time range filter ----
  const RANGES = [
    { key: '7', label: '7 days', days: 7 },
    { key: '30', label: '30 days', days: 30 },
    { key: 'all', label: 'All time', days: Infinity },
  ] as const;
  type RangeKey = (typeof RANGES)[number]['key'];
  const [range, setRange] = useState<RangeKey>('7');

  // --- derived / filtered ---
  const filtered = useMemo(() => {
    if (range === 'all') return expenses;
    const since = new Date();
    since.setDate(since.getDate() - Number(range));
    return expenses.filter((e: any) => new Date(e.date ?? 0) >= since);
  }, [range, expenses]);

  // --- chart data ---
  const series = useMemo(() => {
    const map = new Map<string, number>();
    const days = range === 'all' ? 30 : Number(range);
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString();
      map.set(key, 0);
    }
    for (const e of filtered) {
      const dateKey = e?.date ? new Date(e.date).toLocaleDateString() : new Date().toLocaleDateString();
      if (map.has(dateKey)) {
        map.set(dateKey, (map.get(dateKey) ?? 0) + Number(e.amount ?? 0));
      }
    }
    const labels = Array.from(map.keys());
    const data = Array.from(map.values());
    return { labels, data };
  }, [filtered, range]);

  // --- totals ---
  const total = useMemo(() => filtered.reduce((a: number, e: any) => a + (Number(e.amount) || 0), 0), [filtered]);
  const avg = filtered.length ? total / filtered.length : 0;
  const count = filtered.length;

  return (
    <ScrollView style={[styles.page, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>
        <Pressable onPress={() => router.push('/settings')} style={styles.headerAction}>
          <Feather name="download" size={18} color={colors.primary} />
        </Pressable>
      </View>

      {/* Time-range selector */}
      <FlatList
        data={RANGES}
        horizontal
        keyExtractor={(r) => r.key}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setRange(item.key)}
            style={[
              styles.rangeChip,
              range === item.key && { backgroundColor: colors.primary + '22', borderColor: colors.primary },
            ]}
          >
            <Text style={[styles.rangeText, range === item.key && { color: colors.primary, fontWeight: '700' }]}>
              {item.label}
            </Text>
          </Pressable>
        )}
      />

      <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
        {/* Summary cards */}
        <View style={styles.row}>
          <SummaryCard title="Total spent" value={formatCurrency(total)} />
          <SummaryCard title="Avg / expense" value={formatCurrency(avg)} />
        </View>

        <View style={styles.row}>
          <SummaryCard title="Transactions" value={`${count}`} />
          <SummaryCard title="Period" value={range === 'all' ? 'All' : `${range} days`} />
        </View>

        {/* Chart */}
        <Card style={styles.chartCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Spending — {range === 'all' ? 'All Time' : `Last ${range} Days`}</Text>
          {series.data.length ? (
            <LineChart
              data={{
                labels: series.labels.map((l) => {
                  const d = new Date(l);
                  return isNaN(d.getTime()) ? l : d.toLocaleDateString(undefined, { weekday: 'short' });
                }),
                datasets: [{ data: series.data }],
              }}
              width={Math.max(SCREEN_WIDTH - 64, 300)}
              height={210}
              chartConfig={{
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: (o = 1) => `rgba(55,81,255,${o})`,
                labelColor: () => colors.muted,
                propsForDots: { r: '4', strokeWidth: '0', fill: colors.primary },
                propsForBackgroundLines: { strokeDasharray: '' },
              }}
              bezier
              style={{ marginVertical: 8 }}
            />
          ) : (
            <View style={styles.emptyChart}>
              <Text style={{ color: colors.muted }}>No data in selected range</Text>
            </View>
          )}
        </Card>

        {/* Category breakdown */}
        <Card style={styles.breakdownCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Top categories</Text>
          <View style={{ marginTop: 8 }}>
            {getTopCategories(filtered).map((c) => (
              <View key={c.key} style={styles.catRow}>
                <View style={[styles.catDot, { backgroundColor: c.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.catLabel, { color: colors.text }]}>{c.key}</Text>
                  <Text style={[styles.catSub, { color: colors.muted }]}>{formatCurrency(c.total)}</Text>
                </View>
                <Text style={[styles.catAmount, { color: colors.text }]}>{formatCurrency(c.total)}</Text>
              </View>
            ))}
            {filtered.length === 0 && (
              <Text style={{ color: colors.muted, marginTop: 8 }}>No categories yet</Text>
            )}
          </View>
        </Card>

        {/* Monthly detailed analytics card */}
        <AnalyticsCard expenses={expenses} monthIso={new Date().toISOString().slice(0, 7)} style={{ marginTop: 16 }} />
      </View>
    </ScrollView>
  );
}

// ---------- SummaryCard (local small component) ----------
function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <Card style={styles.smallCard}>
      <Text style={styles.smallTitle}>{title}</Text>
      <Text style={styles.smallValue}>{value}</Text>
    </Card>
  );
}

// ---------- HELPERS ----------
function getTopCategories(expenses: any[]) {
  const map = new Map<string, number>();
  for (const e of expenses) {
    const k = (e?.category ?? 'Other').toString();
    map.set(k, (map.get(k) ?? 0) + Number(e.amount ?? 0));
  }
  const palette = ['#2D9CDB', '#A78BFA', '#FB8C00', '#00C48C', '#FF7AA2', '#9E9E9E'];
  const items = Array.from(map.entries()).map(([key, total], idx) => ({ key, total, color: palette[idx % palette.length] }));
  items.sort((a, b) => b.total - a.total);
  return items.slice(0, 6);
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 22, fontWeight: '800' },
  headerAction: { padding: 8 },

  rangeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    marginRight: 10,
  },
  rangeText: { fontSize: 13, color: '#374151' },

  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  smallCard: { flex: 1, paddingVertical: 14 },
  smallTitle: { fontSize: 14, color: '#6B7280' },
  smallValue: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 4 },

  chartCard: { marginTop: 6, borderRadius: 14, paddingBottom: 18 },
  sectionTitle: { fontSize: 14, fontWeight: '700' },
  emptyChart: { paddingVertical: 36, alignItems: 'center' },

  breakdownCard: { marginTop: 12, paddingBottom: 8 },

  catRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  catDot: { width: 10, height: 10, borderRadius: 6, marginRight: 12 },
  catLabel: { fontSize: 15, fontWeight: '700' },
  catSub: { fontSize: 13 },
  catAmount: { fontSize: 15, fontWeight: '700' },
});
