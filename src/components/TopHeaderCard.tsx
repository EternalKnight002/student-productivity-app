// src/components/TopHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import theme from '../theme';

export interface TopHeaderProps {
  title?: string;
  onMenuPress?: () => void;
  onRightPress?: () => void;
  avatarUri?: string | null;
  rightType?: 'avatar' | 'settings';
}

export default function TopHeader({
  title = '',
  onMenuPress,
  onRightPress,
  avatarUri = null,
  rightType = 'settings',
}: TopHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: (insets.top || (Platform.OS === 'ios' ? 20 : 12)) + 4,
          backgroundColor: theme.colors.surface,
        },
      ]}
    >
      <TouchableOpacity
        onPress={onMenuPress}
        style={styles.leftButton}
        accessibilityRole="button"
        accessibilityLabel="Open menu"
      >
        <Feather name="menu" size={20} color={theme.colors.text} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.colors.text }]}>{title || 'Student Planner'}</Text>

      <TouchableOpacity
        onPress={onRightPress}
        style={styles.iconButton}
        accessibilityRole="button"
        accessibilityLabel="Open profile or settings"
      >
        {rightType === 'avatar' ? (
          avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>E</Text>
            </View>
          )
        ) : (
          <Ionicons name="settings-outline" size={22} color={theme.colors.text} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E6E9EE',
    // subtle shadow
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2 },
      android: { elevation: 2 },
    }),
  },
  leftButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatarInitial: {
    fontWeight: '700',
    color: theme.colors.text,
  },
});
