import React, { useEffect } from 'react';
import { View, Text, FlatList, Button } from 'react-native';
import { Link } from 'expo-router';
import { useExpenseStore } from '../../src/stores/useExpenseStore';


export default function ExpensesList() {
const expenses = useExpenseStore((s) => s.expenses);
const load = useExpenseStore((s) => s.loadFromStorage);


useEffect(() => {
load();
}, []);


return (
<View style={{ flex: 1, padding: 16 }}>
<Text style={{ fontSize: 18, marginBottom: 12 }}>Expenses</Text>


<FlatList
data={expenses}
keyExtractor={(item) => item.id}
renderItem={({ item }) => (
<View style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee' }}>
<Text>{item.category} - ₹{item.amount}</Text>
<Text style={{ color: '#666', fontSize: 12 }}>{new Date(item.date).toLocaleString()}</Text>
</View>
)}
ListEmptyComponent={() => <Text>No expenses yet</Text>}
/>


<View style={{ height: 12 }} />
<Link href="/expenses/add" asChild>
<Button title="Add Expense" onPress={() => {}} />
</Link>
</View>
);
}