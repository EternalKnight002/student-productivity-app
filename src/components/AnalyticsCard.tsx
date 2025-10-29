// src/components/AnalyticsCard.tsx
import React, { useMemo } from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import theme from '../theme';
import Card from './Card';

type CategoryAgg = { category: string; total: number; percent: number };

interface Props {
  expenses?: Array<any>;
  monthIso?: string; // optional ISO string for month filter, e.g. '2025-10' (YYYY-MM)
  style?: StyleProp<ViewStyle>; // allow callers to pass a style (fixes TS error)
}

/**
 * Simple in-component aggregation for categories.
 * Returns totals and percentages for the provided month (if any).
 */
export default function AnalyticsCard({ expenses = [], monthIso, style }: Props) {
  const prepared = useMemo(() => {
    // filter by monthIso if provided (YYYY-MM)
    const filtered = (expenses || []).filter((e) => {
      if (!monthIso) return true;
      if (!e?.date) return false;
      return e.date.slice(0, 7) === monthIso;
    });

    const total = filtered.reduce((s: number, it: any) => s + (Number(it.amount) || 0), 0);

    const map: Record<string, number> = {};
    filtered.forEach((e: any) => {
      const cat = e.category ?? 'Other';
      map[cat] = (map[cat] || 0) + (Number(e.amount) || 0);
    });

    const entries = Object.entries(map)
      .map(([category, totalCat]) => ({ category, total: totalCat }))
      .sort((a, b) => b.total - a.total);

    const list: CategoryAgg[] = entries.map((en) => ({
      category: en.category,
      total: en.total,
      percent: total === 0 ? 0 : Math.round((en.total / total) * 100),
    }));

    return { total, list, filteredCount: filtered.length };
  }, [expenses, monthIso]);

  const top3 = prepared.list.slice(0, 3);

  return (
    <Card style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Monthly overview</Text>
        <Text style={styles.total}>₹{prepared.total}</Text>
      </View>

      <Text style={styles.sub}>Items: {prepared.filteredCount}</Text>

      <View style={{ height: 12 }} />

      {prepared.list.length === 0 ? (
        <Text style={styles.empty}>No data for this period.</Text>
      ) : (
        <>
          <View style={styles.list}>
            {prepared.list.map((row) => (
              <View key={row.category} style={styles.row}>
                <View style={styles.rowLeft}>
                  <Text style={styles.cat}>{row.category}</Text>
                </View>

                <View style={styles.rowRight}>
                  <View style={styles.barBackground}>
                    {/* proportional bar */}
                    <View style={[styles.barFill, { width: `${Math.max(row.percent, 2)}%` }]} />
                  </View>
                  <Text style={styles.value}>₹{row.total} · {row.percent}%</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.top}>
            <Text style={styles.topTitle}>Top categories</Text>
            {top3.map((t) => (
              <Text key={t.category} style={styles.topItem}>
                • {t.category}: ₹{t.total} ({t.percent}%)
              </Text>
            ))}
          </View>
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: theme.spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  total: {
    color: theme.colors.accent,
    ...theme.typography.h2,
  },
  sub: {
    ...theme.typography.body,
    color: theme.colors.muted,
    marginTop: 6,
  },
  empty: {
    color: theme.colors.muted,
    marginTop: theme.spacing.md,
  },
  list: {
    marginTop: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  rowLeft: {
    flex: 3,
  },
  rowRight: {
    flex: 5,
    alignItems: 'flex-end',
    width: '100%',
  },
  cat: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  barBackground: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.background, // subtle track
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 6,
    marginBottom: 6,
  },
  barFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  value: {
    ...theme.typography.small,
    color: theme.colors.muted,
    marginTop: 2,
  },
  top: {
    marginTop: theme.spacing.md,
  },
  topTitle: {
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  topItem: {
    color: theme.colors.text,
    marginBottom: 4,
  },
});
