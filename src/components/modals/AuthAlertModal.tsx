import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { Button } from '../buttons/Button';

export type AlertVariant = 'error' | 'success' | 'warning' | 'info';

export interface ActionConfig {
  label: string;
  onPress: () => void;
}

export interface AuthAlertModalProps {
  visible: boolean;
  variant?: AlertVariant;
  title: string;
  message: string;
  primaryAction?: ActionConfig;
  secondaryAction?: ActionConfig;
  onDismiss?: () => void;
}

const variantStyles: Record<AlertVariant, { bg: string; border: string; iconBg: string; iconColor: string; icon: string }> = {
  error: {
    bg: '#FEF2F2',
    border: '#FEE2E2',
    iconBg: '#EF4444',
    iconColor: '#FFFFFF',
    icon: '✕',
  },
  success: {
    bg: '#F0FDF4',
    border: '#DCFCE7',
    iconBg: '#16A34A',
    iconColor: '#FFFFFF',
    icon: '✓',
  },
  warning: {
    bg: '#FFFBEB',
    border: '#FEF3C7',
    iconBg: '#F59E0B',
    iconColor: '#FFFFFF',
    icon: '!',
  },
  info: {
    bg: '#EFF6FF',
    border: '#DBEAFE',
    iconBg: '#3B82F6',
    iconColor: '#FFFFFF',
    icon: 'i',
  },
};

export const AuthAlertModal: React.FC<AuthAlertModalProps> = ({
  visible,
  variant = 'error',
  title,
  message,
  primaryAction,
  secondaryAction,
  onDismiss,
}) => {
  const currentVariant = variantStyles[variant];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalCard, { backgroundColor: currentVariant.bg, borderColor: currentVariant.border }]}>
              <View style={[styles.iconCircle, { backgroundColor: currentVariant.iconBg }]}>
                <Text style={[styles.iconText, { color: currentVariant.iconColor }]}>{currentVariant.icon}</Text>
              </View>

              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              <View style={styles.actionContainer}>
                {primaryAction && (
                  <Button
                    variant="primary"
                    label={primaryAction.label}
                    onPress={() => {
                      primaryAction.onPress();
                      if (onDismiss) onDismiss();
                    }}
                    style={styles.fullWidthBtn}
                  />
                )}
                {secondaryAction && (
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => {
                      secondaryAction.onPress();
                      if (onDismiss) onDismiss();
                    }}
                  >
                    <Text style={styles.secondaryBtnText}>{secondaryAction.label}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.xs,
    ...elevation.medium,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  iconText: {
    fontSize: 24,
    fontWeight: '800',
  },
  title: {
    ...typography.heading2,
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '800',
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  actionContainer: {
    width: '100%',
    gap: spacing.sm,
  },
  fullWidthBtn: {
    width: '100%',
  },
  secondaryBtn: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  secondaryBtnText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
});
