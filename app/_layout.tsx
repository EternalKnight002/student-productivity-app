
import 'react-native-get-random-values';

import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';


export default function Layout() {
return (
<SafeAreaProvider>
<Stack>
<Stack.Screen name="index" options={{ headerShown: false }} />
</Stack>
</SafeAreaProvider>
);
}