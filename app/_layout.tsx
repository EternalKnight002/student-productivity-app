// app/_layout.tsx (patched)
import 'react-native-get-random-values';
import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'react-native';

// global header (Gemini-style) — renders above the Stack so every screen sits below the notch
import TopHeader from '../src/components/TopHeaderCard';

export default function Layout(): React.ReactElement {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider style={{ flex: 1 }}>
        {/* StatusBar: translucent false so content doesn't draw under the system bar */}
        <StatusBar barStyle="dark-content" translucent={false} />

        {/* Global header shown on every screen. If a nested layout wants to hide it,
            render a new layout file inside that folder without the TopHeader. */}
        <TopHeader
          title="Student Planner"
          onMenuPress={() => console.log('menu pressed')}
          onRightPress={() => console.log('right pressed')}
          rightType="settings"
        />

        {/* Keep Stack so expo-router can render screens. We hide the header there because
            TopHeader is the visual header. */}
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
