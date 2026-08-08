import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GoalsStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { TextInput, DateInput, DropdownInput } from '../../components/inputs';
import { PrimaryButton } from '../../components/buttons';
import { GoalRepository } from '../../repositories/GoalRepository';
import { GoalCategory } from '../../services/api/goalApi';
import { ErrorState } from '../../components/states/ErrorState';

type Props = NativeStackScreenProps<GoalsStackParamList, 'AddGoal'>;

const CATEGORY_OPTIONS = [
  { label: 'Learning', value: 'learning' },
  { label: 'Money / Finance', value: 'money' },
  { label: 'Health & Fitness', value: 'health' },
  { label: 'Career', value: 'career' },
  { label: 'Personal', value: 'personal' },
  { label: 'Other', value: 'other' },
];

export const CreateGoalScreen: React.FC<Props> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('personal');
  const [targetValue, setTargetValue] = useState('');
  const [currentValue, setCurrentValue] = useState('0');
  const [unit, setUnit] = useState('₹');
  const [deadline, setDeadline] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!title.trim()) {
      setErrorMsg('Goal title is required');
      return;
    }
    const targetNum = parseFloat(targetValue);
    if (isNaN(targetNum) || targetNum <= 0) {
      setErrorMsg('Please enter a valid target value greater than 0');
      return;
    }
    const currentNum = parseFloat(currentValue) || 0;
    if (currentNum < 0) {
      setErrorMsg('Current value cannot be negative');
      return;
    }
    if (!unit.trim()) {
      setErrorMsg('Unit is required (e.g. ₹, hours, kg)');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    try {
      await GoalRepository.createGoal({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        targetValue: targetNum,
        currentValue: currentNum,
        unit: unit.trim(),
        deadline: deadline.trim() || undefined,
      });
      setIsLoading(false);
      navigation.goBack();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Failed to create goal');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Create Goal" onBackPress={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {errorMsg ? (
            <ErrorState title="Validation Error" message={errorMsg} onRetry={() => setErrorMsg(null)} retryLabel="Dismiss" />
          ) : null}

          <TextInput
            label="GOAL TITLE"
            placeholder="e.g. Save for emergency fund"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            label="DESCRIPTION"
            placeholder="Add details or strategy..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <DropdownInput
            label="CATEGORY"
            options={CATEGORY_OPTIONS}
            value={category}
            onSelect={(val) => setCategory(val as GoalCategory)}
          />

          <TextInput
            label="TARGET VALUE"
            placeholder="e.g. 50000"
            value={targetValue}
            onChangeText={setTargetValue}
            keyboardType="decimal-pad"
          />

          <TextInput
            label="CURRENT INITIAL VALUE"
            placeholder="e.g. 0"
            value={currentValue}
            onChangeText={setCurrentValue}
            keyboardType="decimal-pad"
          />

          <TextInput
            label="UNIT"
            placeholder="e.g. ₹, hours, kg, books"
            value={unit}
            onChangeText={setUnit}
          />

          <DateInput
            label="DEADLINE"
            placeholder="YYYY-MM-DD"
            value={deadline}
            onChangeDate={setDeadline}
          />

          <View style={styles.actionWrapper}>
            <PrimaryButton
              title="Create Goal"
              onPress={handleCreate}
              isLoading={isLoading}
              disabled={isLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  actionWrapper: {
    marginTop: spacing.md,
  },
});
