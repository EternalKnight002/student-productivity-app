// app/analytics/index.tsx
import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import theme from '../../src/theme';
import AnalyticsCard from '../../src/components/AnalyticsCard';
import Card from '../../src/components/Card';
import Chip from '../../src/components/Chip';
import { useExpenseStore } from '../../src/stores/useExpenseStore';

// small helper to produce recent months like ['2025-10','2025-09',...]
function getRecentMonths(count = 6) {
  const out: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    out.push(key);
  }
  return out;
}

export default function AnalyticsScreen() {
  const store: any = useExpenseStore((s: any) => s);
  const expensesRaw: any[] = Array.isArray(store?.expenses) ? store.expenses : [];

  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const months = useMemo(() => getRecentMonths(6), []);

  // Filter expenses by month (selectedMonth) then by archived flag depending on showArchived
  const expensesForMonth = useMemo(() => {
    const monthFiltered = expensesRaw.filter((e: any) => {
      if (!e?.date) return false;
      return e.date.slice(0, 7) === selectedMonth;
    });

    if (showArchived) return monthFiltered;
    return monthFiltered.filter((e: any) => !e.archived);
  }, [expensesRaw, selectedMonth, showArchived]);

  const archivedCountInMonth = useMemo(
    () => expensesRaw.filter((e: any) => e?.date?.slice(0, 7) === selectedMonth && e.archived).length,
    [expensesRaw, selectedMonth],
  );

  const totalThisMonth = useMemo(
    () => expensesForMonth.reduce((acc: number, it: any) => acc + (Number(it.amount) || 0), 0),
    [expensesForMonth],
  );

  const countThisMonth = useMemo(() => expensesForMonth.length, [expensesForMonth]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
      </View>

      <View style={styles.container}>
        <Card style={{ marginBottom: theme.spacing.md }}>
          <Text style={styles.cardTitle}>Month</Text>

          <FlatList
            horizontal
            data={months}
            keyExtractor={(m) => m}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={{ marginRight: theme.spacing.sm }}>
                <TouchableOpacity onPress={() => setSelectedMonth(item)}>
                  <Text
                    style={[
                      styles.monthLabel,
                      item === selectedMonth ? styles.monthSelected : undefined,
                    ]}
                  >
                    {new Date(item + '-01').toLocaleString(undefined, { month: 'short', year: 'numeric' })}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </Card>

        <View style={styles.controlsRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.filterLabel}>Filters</Text>
            <View style={styles.filterChips}>
              <Chip
                label={showArchived ? 'Showing: Archived & Active' : 'Showing: Active only'}
                selected={showArchived}
                onPress={() => setShowArchived((s) => !s)}
                compact
              />
              {archivedCountInMonth > 0 && !showArchived ? (
                <View style={styles.archivedBadge}>
                  <Text style={styles.archivedBadgeText}>{archivedCountInMonth} archived</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <Card style={styles.smallCard}>
            <Text style={styles.smallTitle}>Total</Text>
            <Text style={styles.smallValue}>₹{totalThisMonth}</Text>
          </Card>

          <Card style={styles.smallCard}>
            <Text style={styles.smallTitle}>Items</Text>
            <Text style={styles.smallValue}>{countThisMonth}</Text>
          </Card>
        </View>

        <AnalyticsCard expenses={expensesForMonth} monthIso={selectedMonth} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.sm,
  },
  title: { ...theme.typography.h1, color: theme.colors.text },
  container: { paddingHorizontal: theme.spacing.lg, flex: 1 },
  cardTitle: { ...theme.typography.body, color: theme.colors.muted, marginBottom: theme.spacing.sm },

  controlsRow: {
    marginBottom: theme.spacing.md,
  },
  filterLabel: {
    ...theme.typography.small,
    color: theme.colors.muted,
    marginBottom: theme.spacing.sm / 2,
  },
  filterChips: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  archivedBadge: {
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  archivedBadgeText: {
    color: theme.colors.muted,
    fontSize: theme.typography.small.fontSize,
  },

  smallCard: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  smallTitle: {
    ...theme.typography.small,
    color: theme.colors.muted,
  },
  smallValue: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },

  monthLabel: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
  },
  monthSelected: {
    backgroundColor: theme.colors.primary,
    color: '#fff',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
  },
});
