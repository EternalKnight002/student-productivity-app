import React from 'react';
import { View, Text, Button } from 'react-native';


export default function Settings() {
return (
<View style={{ flex: 1, padding: 16 }}>
<Text style={{ fontSize: 18, marginBottom: 12 }}>Settings</Text>
<Text>Backup & Sync, Theme, Export (placeholders)</Text>
</View>
);
}