import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { useExpenseStore } from '../../src/stores/useExpenseStore';
import { v4 as uuidv4 } from 'uuid';


export default function AddExpense({ navigation }: any) {
const [amount, setAmount] = useState('');
const [category, setCategory] = useState('Food');
const add = useExpenseStore((s) => s.addExpense);


const onSave = async () => {
const expense = {
id: uuidv4(),
amount: Number(amount) || 0,
category,
date: new Date().toISOString(),
createdAt: new Date().toISOString(),
};
add(expense);
navigation?.goBack?.();
};


return (
<View style={{ flex: 1, padding: 16 }}>
<Text style={{ marginBottom: 8 }}>Amount (₹)</Text>
<TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" style={{ padding: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 12 }} />


<Text style={{ marginBottom: 8 }}>Category</Text>
<TextInput value={category} onChangeText={setCategory} style={{ padding: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 12 }} />


<Button title="Save" onPress={onSave} />
</View>
);
}