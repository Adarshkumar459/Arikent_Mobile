import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Switch } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';

type Props = NativeStackScreenProps<ProfileStackParamList, 'NotificationSettings'>;

export const NotificationSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [taskReminders, setTaskReminders] = useState(true);
  const [goalAlerts, setGoalAlerts] = useState(true);
  const [expenseSummaries, setExpenseSummaries] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Notifications" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.label}>Push Notifications</Text>
              <Text style={styles.sublabel}>Receive instant push alerts on your device</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.label}>Task Reminders</Text>
              <Text style={styles.sublabel}>Get notified before tasks are due</Text>
            </View>
            <Switch
              value={taskReminders}
              onValueChange={setTaskReminders}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.label}>Goal Progress Alerts</Text>
              <Text style={styles.sublabel}>Updates on your goal milestones & completion</Text>
            </View>
            <Switch
              value={goalAlerts}
              onValueChange={setGoalAlerts}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.label}>Expense Summary Reminders</Text>
              <Text style={styles.sublabel}>Weekly & monthly spending insights</Text>
            </View>
            <Switch
              value={expenseSummaries}
              onValueChange={setExpenseSummaries}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...elevation.small,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  rowText: {
    flex: 1,
    paddingRight: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  sublabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
});
