/**
 * security/AppLockGate.tsx — Centralized security gate for the authenticated app.
 *
 * Renders AppLockScreen when the app is LOCKED/AUTHENTICATING/ERROR,
 * or renders children when the app is UNLOCKED/DISABLED.
 *
 * NO navigation transitions are used. The gate replaces children with the
 * lock screen at the React render level, preventing any flash of protected
 * content before the lock screen appears.
 *
 * Placement in the tree:
 *   RootNavigator
 *     └── [authenticated] → AppLockGate
 *                               ├── [LOCKED/AUTHENTICATING/ERROR] → AppLockScreen
 *                               └── [UNLOCKED/DISABLED]           → MainNavigator
 *
 * Privacy overlay:
 * When AppState is 'inactive' (iOS app switcher, notification center) and the
 * app is unlocked, an opaque overlay is shown to prevent sensitive content from
 * appearing in OS app previews. The overlay is NOT shown during AUTHENTICATING
 * (biometric dialog) to avoid conflicting with the auth UI.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, AppState, AppStateStatus, ActivityIndicator } from 'react-native';
import { useAppLock } from './AppLockContext';
import { AppLockScreen } from './AppLockScreen';
import { colors } from '../theme';

interface AppLockGateProps {
  children: React.ReactNode;
}

export const AppLockGate: React.FC<AppLockGateProps> = ({ children }) => {
  const { lockState } = useAppLock();
  const [isInactive, setIsInactive] = useState(
    () => AppState.currentState === 'inactive',
  );

  // Track AppState for privacy overlay (separate from the context subscription)
  useEffect(() => {
    const handleChange = (next: AppStateStatus) => {
      setIsInactive(next === 'inactive');
    };
    const sub = AppState.addEventListener('change', handleChange);
    return () => sub.remove();
  }, []);

  // ── LOADING: show minimal spinner while SecureStore is being read ────────
  if (lockState === 'LOADING') {
    return (
      <View style={styles.loading} accessible={false}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // ── UNLOCKED / DISABLED: render the protected content ───────────────────
  if (lockState === 'UNLOCKED' || lockState === 'DISABLED') {
    // Privacy overlay: when app is inactive (app switcher), cover content
    // so it doesn't appear in OS app preview screenshots.
    // Not shown during AUTHENTICATING (handled separately below).
    const showPrivacyOverlay = isInactive;

    return (
      <View style={styles.flex}>
        {children}
        {showPrivacyOverlay && <View style={styles.privacyOverlay} />}
      </View>
    );
  }

  // ── LOCKED / AUTHENTICATING / ERROR / BACKGROUND: show lock screen ──────
  // AppLockScreen handles ERROR and LOCKED states with appropriate UI.
  return <AppLockScreen />;
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  privacyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    // Slight opacity so the transition is less jarring
    opacity: 0.98,
  },
});
