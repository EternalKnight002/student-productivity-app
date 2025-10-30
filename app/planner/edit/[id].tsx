// app/planner/edit/[id].tsx
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { useTaskStore } from '../../../src/stores/useTaskStore';
import { Task } from '../../../src/types/task';
import DateTimePicker from '@react-native-community/datetimepicker';

type Params = { id: string };
type FormValues = {
  title: string;
  description?: string;
  dueDate?: string;
  remindAt?: string;
  course?: string;
  priority?: string;
  status?: string;
};

export default function EditTask() {
  const { id } = useLocalSearchParams<Params>();
  const router = useRouter();
  const task = useTaskStore((s) => (id ? s.getById(id) : undefined));
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      dueDate: '',
      course: '',
      priority: 'medium',
      status: 'todo',
    },
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description ?? '',
        dueDate: task.dueDate ?? '',
        remindAt: task.remindAt ?? '',
        course: task.course ?? '',
        priority: task.priority,
        status: task.status,
      });
      if (task.dueDate) setSelectedDate(new Date(task.dueDate));
    }
  }, [task, reset]);

  if (!task) {
    return (
      <SafeAreaView
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text>Task not found</Text>
      </SafeAreaView>
    );
  }

  const onSave = (values: FormValues) => {
    updateTask(task.id, {
      title: values.title,
      description: values.description,
      dueDate: selectedDate
        ? selectedDate.toISOString()
        : values.dueDate || undefined,
      course: values.course,
      priority: (values.priority as any) || 'medium',
      status: (values.status as any) || 'todo',
    } as Partial<Task>);
    router.back();
  };

  const onDelete = () => {
    Alert.alert('Delete task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteTask(task.id);
          router.push('/planner');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.h1}>Edit Task</Text>

        <Text style={styles.label}>Title</Text>
        <Controller
          control={control}
          name="title"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              style={styles.input}
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

        <Text style={styles.label}>Course</Text>
        <Controller
          control={control}
          name="course"
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              style={styles.input}
            />
          )}
        />

        <Pressable onPress={handleSubmit(onSave)} style={styles.saveBtn}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Save</Text>
        </Pressable>

        <Pressable onPress={onDelete} style={styles.deleteBtn}>
          <Text style={{ color: '#FF4D4D', fontWeight: '600' }}>Delete</Text>
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
  deleteBtn: { marginTop: 12, alignItems: 'center' },
});
