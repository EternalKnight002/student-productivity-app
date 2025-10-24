// src/components/PrimaryButton.tsx
import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import theme from '../theme';

type Variant = 'primary' | 'ghost';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: Variant;
  style?: any;
  textStyle?: any;
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
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.ghost,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
      accessibilityLabel={accessibilityLabel || title}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : theme.colors.primary} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              variant === 'primary' ? styles.primaryLabel : styles.ghostLabel,
              icon && styles.label,
              textStyle,
            ]}
          >
            {title}
          </Text>
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
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 2,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  primaryLabel: {
    color: '#FFFFFF',
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.typography.body.fontWeight,
  },
  ghost: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.muted,
  },
  ghostLabel: {
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
  label: {
    marginLeft: 8,
  },
});
