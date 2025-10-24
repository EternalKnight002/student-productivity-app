import React from 'react';
import { Text, View, Button } from 'react-native';
import { Link } from 'expo-router';


export default function Home() {
return (
<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
<Text style={{ fontSize: 20, marginBottom: 16 }}>Student Productivity App</Text>
<Link href="/expenses" asChild>
<Button title="Expenses" onPress={() => {}} />
</Link>
<View style={{ height: 12 }} />
<Link href="/notes" asChild>
<Button title="Notes" onPress={() => {}} />
</Link>
<View style={{ height: 12 }} />
<Link href="/planner" asChild>
<Button title="Planner" onPress={() => {}} />
</Link>
<View style={{ height: 12 }} />
<Link href="/settings" asChild>
<Button title="Settings" onPress={() => {}} />
</Link>
</View>
);
}