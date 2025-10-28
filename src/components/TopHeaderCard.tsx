// src/components/TopHeader.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';

export interface TopHeaderProps {
  title?: string;
  onMenuPress?: () => void;    // left action (hamburger)
  onRightPress?: () => void;   // right action (profile/settings)
  avatarUri?: string | null;   // optional avatar
  rightType?: 'avatar' | 'settings'; // controls right side
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
        },
      ]}
    >
      <TouchableOpacity
        onPress={onMenuPress}
        style={styles.leftButton}
        accessibilityRole="button"
        accessibilityLabel="Open menu"
      >
        <Feather name="menu" size={22} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>{title || 'Student Planner'}</Text>

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
          <Ionicons name="settings-outline" size={24} color="#333" />
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
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
    // subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1.5,
    elevation: 1,
  },
  leftButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
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
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontWeight: '700',
    color: '#111827',
  },
});
