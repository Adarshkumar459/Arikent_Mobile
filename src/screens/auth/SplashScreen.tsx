import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types/navigation.types';
import { colors, typography, radius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { BRAND } from '../../constants/brand';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (!isAuthenticated) {
          navigation.replace('Welcome');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <Text style={styles.logoText}>A</Text>
      </View>
      <Text style={styles.title}>{BRAND.appName}</Text>
      <Text style={styles.tagline}>{BRAND.tagline}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.surface,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
