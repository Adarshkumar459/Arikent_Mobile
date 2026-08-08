import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius } from '../../theme';
import { PrimaryButton } from '../../components/buttons';

type Props = NativeStackScreenProps<AuthStackParamList, 'PasswordUpdated'>;

export const PasswordUpdatedScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.iconBox}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>

        <Text style={styles.title}>Password Updated{'\n'}Successfully</Text>

        <View style={styles.actions}>
          <PrimaryButton title="Continue" onPress={() => navigation.navigate('Login')} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.successBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  checkIcon: {
    fontSize: 36,
    color: colors.success,
    fontWeight: '800',
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  actions: {
    width: '100%',
  },
});
