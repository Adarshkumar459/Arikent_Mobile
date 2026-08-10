import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { colors, spacing, typography, radius, elevation } from '../../theme';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'error' | 'success' | 'warning' | 'info';
  buttons?: AlertButton[];
  onClose: () => void;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type = 'error',
  buttons = [{ text: 'OK' }],
  onClose,
}) => {
  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '🎉';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'error':
      default:
        return '⚠️';
    }
  };

  const getHeaderColor = () => {
    switch (type) {
      case 'success':
        return '#007856';
      case 'warning':
        return '#D97706';
      case 'info':
        return '#532DCF';
      case 'error':
      default:
        return '#BA1A1A';
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.alertCard}>
              {/* Icon Circle */}
              <View style={[styles.iconCircle, { backgroundColor: getHeaderColor() + '15' }]}>
                <Text style={styles.iconText}>{getIcon()}</Text>
              </View>

              {/* Title & Message */}
              <Text style={[styles.title, { color: getHeaderColor() }]}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              {/* Buttons Row */}
              <View style={styles.buttonContainer}>
                {buttons.map((btn, index) => {
                  const isPrimary = !btn.variant || btn.variant === 'primary';
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.button,
                        isPrimary ? styles.primaryBtn : styles.secondaryBtn,
                      ]}
                      onPress={() => {
                        onClose();
                        if (btn.onPress) btn.onPress();
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={isPrimary ? styles.primaryBtnText : styles.secondaryBtnText}>
                        {btn.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
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
    backgroundColor: 'rgba(27, 27, 29, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  alertCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: radius['2xl'],
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E4F5',
    ...elevation.large,
    shadowColor: '#6C4CE8',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    ...typography.heading2,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.body,
    fontSize: 14,
    color: '#484555',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.sm,
  },
  button: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: '#6C4CE8',
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryBtn: {
    backgroundColor: '#F0EFFF',
    borderWidth: 1,
    borderColor: '#CABEFF',
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#532DCF',
  },
});
