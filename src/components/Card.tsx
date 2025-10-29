// src/components/Card.tsx
import React from 'react';
import { LayoutRectangle, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import theme from '../theme';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
  onLayout?: (layout: LayoutRectangle) => void;
  testID?: string;
  elevated?: boolean;
}

export default function Card({
  children,
  title,
  subtitle,
  style,
  onLayout,
  testID,
  elevated = true,
}: CardProps) {
  return (
    <View
      style={[styles.container, elevated ? styles.elevated : undefined, style]}
      onLayout={(e) => onLayout && onLayout(e.nativeEvent.layout)}
      testID={testID}
      accessibilityRole="summary"
    >
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
  },
  elevated: {
    ...PlatformShadow(),
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.muted,
    marginBottom: theme.spacing.md,
  },
  content: {},
});

/** small helper to keep shadow consistent cross-platform */
function PlatformShadow() {
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  } as ViewStyle;
}
