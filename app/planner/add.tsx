// app/planner/add.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useTaskStore } from '../../src/stores/useTaskStore';
import { TaskPriority, TaskStatus } from '../../src/types/task';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

type FormValues = {
  title: string;
  description?: string;
  dueDate?: string;
  remindAt?: string;
  course?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
};

export default function AddTask() {
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { title: '', priority: 'medium', status: 'todo' },
  });
  const addTask = useTaskStore((s) => s.addTask);
  const router = useRouter();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const onSubmit = (data: FormValues) => {
    addTask({
      title: data.title,
      description: data.description,
      dueDate: selectedDate ? selectedDate.toISOString() : data.dueDate,
      remindAt: data.remindAt,
      course: data.course,
      priority: data.priority || 'medium',
      status: data.status || 'todo',
    });
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.h1}>Add Task</Text>

        <Text style={styles.label}>Title</Text>
        <Controller
          control={control}
          name="title"
          rules={{ required: true, minLength: 1 }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              style={styles.input}
              placeholder="e.g. Finish assignment"
            />
          )}
        />

        <Text style={styles.label}>Description</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              style={[styles.input, { height: 100 }]}
              multiline
              placeholder="Notes..."
            />
          )}
        />

        <Text style={styles.label}>Due Date</Text>
        <Pressable
          onPress={() => setShowDatePicker(true)}
          style={[styles.input, { justifyContent: 'center' }]}
        >
          <Text style={{ color: selectedDate ? '#000' : '#999' }}>
            {selectedDate
              ? selectedDate.toDateString()
              : 'Select due date from calendar'}
          </Text>
        </Pressable>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, date) => {
              setShowDatePicker(false);
              if (date) setSelectedDate(date);
            }}
          />
        )}

        <Text style={styles.label}>Course / Tag</Text>
        <Controller
          control={control}
          name="course"
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              style={styles.input}
              placeholder="e.g. CS101"
            />
          )}
        />

        <Pressable onPress={handleSubmit(onSubmit)} style={styles.saveBtn}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Save task</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  label: { marginTop: 8, marginBottom: 6, color: '#444' },
  input: {
    backgroundColor: '#F7F8FB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFEFF0',
  },
  saveBtn: {
    marginTop: 20,
    backgroundColor: '#3751FF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
});
