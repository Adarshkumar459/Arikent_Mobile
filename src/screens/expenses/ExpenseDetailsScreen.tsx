import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExpensesStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { ExpenseRepository } from '../../repositories/ExpenseRepository';
import { ExpenseItem } from '../../services/api/expenseApi';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';

type Props = NativeStackScreenProps<ExpensesStackParamList, 'ExpenseDetails'>;

export const ExpenseDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { expenseId } = route.params;
  const [expense, setExpense] = useState<ExpenseItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const fetchDetails = async () => {
    setIsLoading(true);
    try {
      const data = await ExpenseRepository.getExpenseById(expenseId);
      setExpense(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load expense details');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchDetails();
    });
    return unsubscribe;
  }, [navigation, expenseId]);

  const handleDelete = async () => {
    if (!expense) return;
    try {
      await ExpenseRepository.deleteExpense(expense.id);
      setIsDeleteModalVisible(false);
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete expense');
    }
  };

  if (isLoading || !expense) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const formattedDate = expense.date
    ? new Date(expense.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Not Specified';

  const categoryLabel = expense.category
    ? expense.category.charAt(0).toUpperCase() + expense.category.slice(1)
    : 'Expense';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ScreenHeader matching Goal & Calendar pages SAME TO SAME */}
      <ScreenHeader
        title="Expense Details"
        rightAction={
          <TouchableOpacity
            onPress={() => setIsDeleteModalVisible(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={{ fontSize: 18 }}>🗑️</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Primary Expense Card */}
        <View style={styles.primaryCard}>
          {/* Left Category Accent Line */}
          <View style={styles.accentLine} />

          {/* Amount & Title Section */}
          <View style={styles.primaryTopSection}>
            <Text style={styles.amountText}>₹{expense.amount.toLocaleString('en-IN')}</Text>
            <Text style={styles.titleText}>{expense.note || categoryLabel}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeIcon}>🧾</Text>
              <Text style={styles.categoryBadgeText}>{categoryLabel}</Text>
            </View>
          </View>

          {/* Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Text style={styles.detailIcon}>📅</Text>
                <Text style={styles.detailLabel}>Date</Text>
              </View>
              <Text style={styles.detailValue}>{formattedDate}</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Text style={styles.detailIcon}>🏦</Text>
                <Text style={styles.detailLabel}>Payment Method</Text>
              </View>
              <Text style={styles.detailValue}>{expense.paymentMethod || 'Cash'}</Text>
            </View>

            {expense.note ? (
              <View style={styles.notesGroup}>
                <View style={styles.detailLeft}>
                  <Text style={styles.detailIcon}>📝</Text>
                  <Text style={styles.detailLabel}>Notes</Text>
                </View>
                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>{expense.note}</Text>
                </View>
              </View>
            ) : null}

            <View style={[styles.detailRow, styles.createdRow]}>
              <Text style={styles.createdLabel}>Created</Text>
              <Text style={styles.createdValue}>
                {expense.createdAt ? new Date(expense.createdAt).toLocaleString() : formattedDate}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditExpense', { expenseId: expense.id })}
            activeOpacity={0.8}
          >
            <Text style={styles.editButtonText}>Edit Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => setIsDeleteModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteButtonText}>Delete Expense</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={isDeleteModalVisible}
        title="Delete Expense?"
        message={`Are you sure you want to delete this ${categoryLabel} record? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 60,
  },
  primaryCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.outlineVariant + '20',
    marginBottom: spacing.xl,
    ...elevation.small,
  },
  accentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.secondaryContainer,
  },
  primaryTopSection: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
    marginBottom: spacing.md,
  },
  amountText: {
    ...typography.display,
    fontSize: 36,
    color: colors.onSurface,
    marginBottom: 4,
  },
  titleText: {
    ...typography.heading3,
    fontSize: 18,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
    gap: 4,
    marginTop: 4,
  },
  categoryBadgeIcon: {
    fontSize: 12,
  },
  categoryBadgeText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  detailsGrid: {
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailIcon: {
    fontSize: 16,
  },
  detailLabel: {
    ...typography.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  detailValue: {
    ...typography.heading4,
    fontSize: 15,
    color: colors.onSurface,
  },
  notesGroup: {
    gap: spacing.xs,
    paddingVertical: 4,
  },
  notesBox: {
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginTop: 4,
  },
  notesText: {
    ...typography.body,
    fontSize: 14,
    color: colors.onSurface,
    lineHeight: 20,
  },
  createdRow: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceVariant,
    paddingTop: spacing.md,
    marginTop: spacing.xs,
  },
  createdLabel: {
    ...typography.caption,
    fontSize: 12,
    color: colors.outline,
  },
  createdValue: {
    ...typography.caption,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  actionsContainer: {
    gap: spacing.md,
  },
  editButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    ...typography.heading3,
    fontSize: 15,
    color: colors.primaryContainer,
  },
  deleteButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.errorContainer + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    ...typography.heading3,
    fontSize: 15,
    color: colors.error,
  },
});
