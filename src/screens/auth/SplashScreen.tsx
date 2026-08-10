import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types/navigation.types';
import { colors, typography, radius, elevation } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { BRAND } from '../../constants/brand';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Animation values for fade in & dot pulsing
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dot1Scale = useRef(new Animated.Value(0.4)).current;
  const dot2Scale = useRef(new Animated.Value(0.4)).current;
  const dot3Scale = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Fade in content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Pulse animation loop for loading dots
    const pulseDot = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.4,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = pulseDot(dot1Scale, 0);
    const anim2 = pulseDot(dot2Scale, 150);
    const anim3 = pulseDot(dot3Scale, 300);

    anim1.start();
    anim2.start();
    anim3.start();

    if (!isLoading) {
      const timer = setTimeout(() => {
        if (!isAuthenticated) {
          navigation.replace('Welcome');
        }
      }, 1500);
      return () => {
        clearTimeout(timer);
        anim1.stop();
        anim2.stop();
        anim3.stop();
      };
    }
  }, [isLoading, isAuthenticated, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Ambient decorative lighting */}
      <View style={styles.ambientGlowTop} />
      <View style={styles.ambientGlowBottom} />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* 3D Elevated Logo Box */}
        <View style={styles.logoCard}>
          <Image
            source={require('../../../assets/arkient-logo.png')}
            style={styles.logoImage}
            resizeMode="cover"
          />
        </View>

        {/* Brand Title & Tagline */}
        <Text style={styles.title}>{BRAND.appName}</Text>
        <Text style={styles.tagline}>{BRAND.tagline}</Text>
      </Animated.View>

      {/* Bottom Loading Dots */}
      <View style={styles.loaderContainer}>
        <Animated.View style={[styles.loaderDot, { transform: [{ scale: dot1Scale }] }]} />
        <Animated.View style={[styles.loaderDot, { transform: [{ scale: dot2Scale }] }]} />
        <Animated.View style={[styles.loaderDot, { transform: [{ scale: dot3Scale }] }]} />
      </View>
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
  ambientGlowTop: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(230, 222, 255, 0.5)',
  },
  ambientGlowBottom: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(203, 190, 255, 0.4)',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoCard: {
    width: 120,
    height: 120,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(202, 190, 255, 0.4)',
    overflow: 'hidden',
    ...elevation.medium,
    shadowColor: '#6C4CE8',
    shadowOpacity: 0.15,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    ...typography.display,
    fontSize: 34,
    fontWeight: '800',
    color: '#532DCF',
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  tagline: {
    ...typography.bodyLarge,
    fontSize: 15,
    color: '#484555',
    textAlign: 'center',
    maxWidth: 240,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loaderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});
