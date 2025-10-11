import React from 'react';
import { View } from 'react-native';


export default function Card({ children }: { children: React.ReactNode }) {
return (
<View style={{ backgroundColor: '#fff', padding: 12, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 }}>
{children}
</View>
);
}