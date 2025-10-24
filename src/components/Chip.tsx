// src/components/Chip.tsx
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
} from 'react-native';
import theme from '../theme';

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  compact?: boolean;
}

export default function Chip({
  label,
  selected = false,
  onPress,
  style,
  textStyle,
  accessibilityLabel,
  compact = false,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.base,
        selected ? styles.selected : styles.unselected,
        compact && styles.compact,
        pressed ? styles.pressed : undefined,
        style,
      ]}
    >
      <Text style={[styles.label, selected ? styles.selectedLabel : {}, textStyle]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radii.lg,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  compact: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    minHeight: 28,
  },
  selected: {
    backgroundColor: theme.colors.primary,
  },
  unselected: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.muted,
  },
  label: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  selectedLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
});
