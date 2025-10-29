// src/components/PrimaryButton.tsx
import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import theme from '../theme';

type Variant = 'primary' | 'ghost';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: Variant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
}

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
  icon,
  accessibilityLabel,
}: Props) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.ghost,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#fff' : theme.colors.primary} />
      ) : (
        <>
          {icon}
          <Text style={[isPrimary ? styles.primaryLabel : styles.ghostLabel, textStyle]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: theme.sizes.buttonHeight,
    minWidth: 120,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 3,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  primaryLabel: {
    color: '#FFFFFF',
    fontSize: theme.typography.body.fontSize,
    fontWeight: '700',
  },
  ghost: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.muted,
  },
  ghostLabel: {
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
});
