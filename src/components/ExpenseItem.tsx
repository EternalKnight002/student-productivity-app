// src/components/ExpenseItem.tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  GestureResponderEvent,
  Pressable,
  Platform,
  Animated as RNAnimated,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { FadeInRight, FadeOutLeft, Layout } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import theme from '../theme';

/**
 * ExpenseItem with:
 * - entering/exiting/layout animations (Reanimated)
 * - swipe-left to reveal Delete action (renderRightActions)
 * - swipe-right to reveal Archive action (renderLeftActions)
 * - Delete uses onDelete(id) and shows an Undo Snackbar (calls onUndo(item) if provided)
 * - Archive uses onArchive(id)
 *
 * Props:
 * - item: expense object (id, amount, category, note, date)
 * - onPress(item)
 * - onDelete(id)
 * - onArchive(id)
 * - onUndo(item)  <-- optional, called when user taps Undo after delete
 */
type Expense = {
  id: string;
  amount?: number;
  category?: string;
  note?: string;
  date?: string;
};

interface Props {
  item: Expense;
  onPress?: (item: Expense) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  onUndo?: (item: Expense) => void;
  testID?: string;
}

export default function ExpenseItem({
  item,
  onPress,
  onDelete,
  onArchive,
  onUndo,
  testID,
}: Props) {
  const swipeRef = useRef<Swipeable | null>(null);
  const [snackVisible, setSnackVisible] = useState(false);
  const snackTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (snackTimerRef.current) {
        clearTimeout(snackTimerRef.current);
      }
    };
  }, []);

  const formattedAmount = typeof item.amount === 'number' ? `₹${Math.round(item.amount)}` : '₹0';
  const dateText = item.date ? new Date(item.date).toLocaleDateString() : '';

  const handlePress = (e: GestureResponderEvent) => {
    onPress?.(item);
  };

  const doDelete = () => {
    // close the swipeable
    swipeRef.current?.close();
    // show snackbar
    setSnackVisible(true);
    // call delete immediately (parent should remove from store)
    onDelete?.(item.id);

    // hide after 6s automatically
    snackTimerRef.current = (setTimeout(() => {
      setSnackVisible(false);
      snackTimerRef.current = null;
    }, 6000) as unknown) as number;
  };

  const doArchive = () => {
    swipeRef.current?.close();
    onArchive?.(item.id);
    // optional: small ephemeral feedback — use RN Animated scale or just ignore
  };

  const handleUndo = () => {
    // clear timer
    if (snackTimerRef.current) {
      clearTimeout(snackTimerRef.current);
      snackTimerRef.current = null;
    }
    setSnackVisible(false);
    onUndo?.(item);
  };

  const renderRightActions = () => {
    return (
      <Animated.View entering={Layout.duration(120)} style={styles.actionWrapRight}>
        <Pressable
          style={styles.actionBtnDelete}
          onPress={doDelete}
          android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
          accessibilityRole="button"
          accessibilityLabel={`Delete expense ${item.note ?? item.category ?? ''}`}
        >
          <Feather name="trash-2" size={18} color="#fff" />
          <Text style={styles.actionLabel}>Delete</Text>
        </Pressable>
      </Animated.View>
    );
  };

  const renderLeftActions = () => {
    return (
      <Animated.View entering={Layout.duration(120)} style={styles.actionWrapLeft}>
        <Pressable
          style={styles.actionBtnArchive}
          onPress={doArchive}
          android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
          accessibilityRole="button"
          accessibilityLabel={`Archive expense ${item.note ?? item.category ?? ''}`}
        >
          <Feather name="archive" size={18} color="#fff" />
          <Text style={styles.actionLabel}>Archive</Text>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <>
      <Animated.View
        entering={FadeInRight.duration(260)}
        exiting={FadeOutLeft.duration(220)}
        layout={Layout.springify()}
        style={styles.wrapper}
        testID={testID}
      >
        <Swipeable
          ref={swipeRef}
          friction={2}
          leftThreshold={30}
          rightThreshold={40}
          overshootLeft={false}
          overshootRight={false}
          renderLeftActions={renderLeftActions}
          renderRightActions={renderRightActions}
        >
          <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.85}
            style={styles.touchable}
          >
            <View style={styles.left}>
              <View style={[styles.categoryPill, { backgroundColor: getCategoryColor(item.category) }]} />
              <View style={styles.meta}>
                <Text numberOfLines={1} style={styles.title}>
                  {item.note ?? item.category ?? 'Expense'}
                </Text>
                <Text numberOfLines={1} style={styles.subtitle}>
                  {dateText}
                </Text>
              </View>
            </View>

            <View style={styles.right}>
              <Text style={styles.amount}>{formattedAmount}</Text>
            </View>
          </TouchableOpacity>
        </Swipeable>
      </Animated.View>

      {/* Undo Snackbar */}
      {snackVisible && (
        <UndoSnackbar onUndo={handleUndo} onDismiss={() => { setSnackVisible(false); if (snackTimerRef.current) { clearTimeout(snackTimerRef.current); snackTimerRef.current = null; } }} />
      )}
    </>
  );
}

/* Simple Undo Snackbar component rendered inline.
   It uses RN Animated to slide up and fade in.
   Props:
   - onUndo: called when user taps Undo
   - onDismiss: called when user presses close or after timeout
*/
function UndoSnackbar({ onUndo, onDismiss }: { onUndo: () => void; onDismiss?: () => void }) {
  const translateY = useRef(new RNAnimated.Value(80)).current;
  const opacity = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.timing(translateY, { toValue: 0, duration: 260, useNativeDriver: true }),
      RNAnimated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start();
    return () => {
      // on unmount, animate out quickly
      RNAnimated.parallel([
        RNAnimated.timing(translateY, { toValue: 80, duration: 160, useNativeDriver: true }),
        RNAnimated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }),
      ]).start();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RNAnimated.View
      style={[
        styles.snackContainer,
        { transform: [{ translateY }], opacity },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.snackInner}>
        <Text style={styles.snackText}>Expense deleted</Text>
        <Pressable onPress={onUndo} style={styles.snackUndo}><Text style={styles.snackUndoText}>Undo</Text></Pressable>
        <Pressable onPress={onDismiss} style={styles.snackClose} accessibilityRole="button">
          <Feather name="x" size={16} color={theme.colors.muted} />
        </Pressable>
      </View>
    </RNAnimated.View>
  );
}

/* Helper: map category name to color tokens (fallback to theme colors) */
function getCategoryColor(cat?: string) {
  if (!cat) return theme.colors.muted;
  const k = cat.toLowerCase();
  switch (k) {
    case 'food':
      return theme.colors.category?.food ?? '#4A90E2';
    case 'transport':
      return theme.colors.category?.transport ?? '#FFB74D';
    case 'college':
      return theme.colors.category?.college ?? '#7E57C2';
    case 'books':
      return theme.colors.category?.books ?? '#00C48C';
    case 'snacks':
      return theme.colors.category?.snacks ?? '#FF7AA2';
    default:
      return theme.colors.category?.other ?? theme.colors.muted;
  }
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: theme.spacing.sm / 2,
  },
  touchable: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryPill: {
    width: 12,
    height: 12,
    borderRadius: 8,
    marginRight: theme.spacing.md,
  },
  meta: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.muted,
  },
  right: {
    marginLeft: theme.spacing.md,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text,
  },

  /* Left (archive) action */
  actionWrapLeft: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    height: '100%',
  },
  actionBtnArchive: {
    backgroundColor: '#2D3748', // deep neutral; change if you want
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: theme.radii.md,
    height: '80%',
    minWidth: 96,
    flexDirection: 'row',
    gap: 8,
  },

  /* Right (delete) action */
  actionWrapRight: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    height: '100%',
  },
  actionBtnDelete: {
    backgroundColor: theme.colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: theme.radii.md,
    height: '80%',
    minWidth: 96,
    flexDirection: 'row',
    gap: 8,
  },
  actionLabel: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '700',
  },

  /* Snackbar */
  snackContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: Platform.OS === 'ios' ? 34 : 16,
    zIndex: 9999,
  },
  snackInner: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  snackText: {
    flex: 1,
    color: theme.colors.text,
  },
  snackUndo: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    marginLeft: 8,
  },
  snackUndoText: {
    color: '#fff',
    fontWeight: '700',
  },
  snackClose: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 8,
  },
});
