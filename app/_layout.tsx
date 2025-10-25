
import 'react-native-get-random-values';

import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View } from 'react-native';


export default function Layout() {
return (
<GestureHandlerRootView style={{ flex: 1 }}>
<SafeAreaProvider style={{ flex: 1 }}>
<Stack>
<Stack.Screen name="index" options={{ headerShown: false }} />
</Stack>
</SafeAreaProvider>
</GestureHandlerRootView>
);
}