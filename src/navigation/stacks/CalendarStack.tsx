import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CalendarStackParamList } from '../types/navigation.types';
import { CalendarScreen } from '../../screens/calendar/CalendarScreen';
import { SelectedDateScreen } from '../../screens/calendar/SelectedDateScreen';
import { RemindersScreen } from '../../screens/reminders/RemindersScreen';
import { CreateReminderScreen } from '../../screens/reminders/CreateReminderScreen';
import { ReminderDetailsScreen } from '../../screens/reminders/ReminderDetailsScreen';
import { RemindersEmptyScreen } from '../../screens/reminders/RemindersEmptyScreen';
import { colors } from '../../theme';

const Stack = createNativeStackNavigator<CalendarStackParamList>();

export const CalendarStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.textPrimary }}>
      <Stack.Screen name="Calendar" component={CalendarScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SelectedDate" component={SelectedDateScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Reminders" component={RemindersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddReminder" component={CreateReminderScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ReminderDetails" component={ReminderDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RemindersEmpty" component={RemindersEmptyScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};
