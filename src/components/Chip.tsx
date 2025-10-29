// src/components/Chip.tsx
import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle, TextStyle } from 'react-native';
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
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, selected ? styles.selectedLabel : {}, textStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radii.round,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  compact: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    minHeight: 30,
  },
  selected: {
    backgroundColor: theme.colors.primary,
    ...platformMicroShadow(),
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
    fontWeight: '700',
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
});

function platformMicroShadow() {
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  } as any;
}
