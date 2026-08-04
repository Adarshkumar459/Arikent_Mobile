import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BRAND } from '../constants/brand';
import { colors, spacing, typography, radius, elevation } from '../theme';
import { Button } from '../components/buttons/Button';
import { Loading } from '../components/feedback/Loading';
import { EmptyState } from '../components/feedback/EmptyState';
import { apiClient } from '../services/api/client';

export const HomeScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'components'>('overview');
  const [buttonLoading, setButtonLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState(false);

  const handleTestPress = () => {
    setButtonLoading(true);
    setTimeout(() => setButtonLoading(false), 1500);
  };

  const handleTestBackendConnection = async () => {
    setApiLoading(true);
    setApiStatus(null);
    try {
      const response = await apiClient.get<{ success: boolean; message: string }>('/health');
      if (response.data && response.data.success) {
        setApiStatus(`CONNECTED! Response: "${response.data.message}"`);
      } else {
        setApiStatus('Unexpected response structure');
      }
    } catch (error: any) {
      setApiStatus(`CONNECTION FAILED: ${error.message || 'Network Error'}`);
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.headerCard}>
        <Text style={styles.brandTitle}>{BRAND.appName}</Text>
        <Text style={styles.brandTagline}>{BRAND.tagline}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Phase 0 Foundation Ready</Text>
        </View>
      </View>

      {/* Segmented Control */}
      <View style={styles.tabContainer}>
        <Button
          variant={activeTab === 'overview' ? 'primary' : 'ghost'}
          label="Overview"
          onPress={() => setActiveTab('overview')}
          style={styles.tabButton}
        />
        <Button
          variant={activeTab === 'components' ? 'primary' : 'ghost'}
          label="Design Tokens"
          onPress={() => setActiveTab('components')}
          style={styles.tabButton}
        />
      </View>

      {activeTab === 'overview' ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Architecture Verification</Text>
          <Text style={styles.bodyText}>
            ARKIENT mobile foundation is running with centralized Design Tokens, React Navigation setup, Axios client abstraction, and offline repository abstractions.
          </Text>

          <View style={styles.buttonRow}>
            <Button
              variant="secondary"
              label="Ping Backend API Health (/api/v1/health)"
              isLoading={apiLoading}
              onPress={handleTestBackendConnection}
            />
          </View>

          {apiStatus ? (
            <View style={[
              styles.statusBanner,
              { backgroundColor: apiStatus.includes('CONNECTED!') ? colors.primaryLight : '#FEE2E2' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: apiStatus.includes('CONNECTED!') ? colors.primary : colors.error }
              ]}>
                {apiStatus}
              </Text>
            </View>
          ) : null}

          <EmptyState
            title="Module Placeholder Verification"
            description="Domain modules (Auth, Tasks, Goals, Habits, etc.) will be built module-by-module in future phases."
          />
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ARKIENT Button System</Text>

          <View style={styles.buttonRow}>
            <Button
              variant="primary"
              label="Primary Button"
              isLoading={buttonLoading}
              onPress={handleTestPress}
            />
          </View>

          <View style={styles.buttonRow}>
            <Button
              variant="secondary"
              label="Secondary Variant"
              onPress={handleTestPress}
            />
          </View>

          <View style={styles.buttonRow}>
            <Button
              variant="outline"
              label="Outline Variant"
              onPress={handleTestPress}
            />
          </View>

          <View style={styles.buttonRow}>
            <Button
              variant="danger"
              label="Danger Variant"
              onPress={handleTestPress}
            />
          </View>

          <View style={styles.buttonRow}>
            <Button
              variant="primary"
              label="Disabled State"
              disabled
            />
          </View>

          {buttonLoading ? <Loading message="Testing Button Async State..." /> : null}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  headerCard: {
    backgroundColor: colors.surface,
    padding: spacing['2xl'],
    borderRadius: radius.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...elevation.medium,
  },
  brandTitle: {
    ...typography.display,
    color: colors.primary,
  },
  brandTagline: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginTop: spacing.md,
  },
  badgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.xs,
    borderRadius: radius.lg,
    marginBottom: spacing.xl,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
  section: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.lg,
    ...elevation.small,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  bodyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  statusBanner: {
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  statusText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  buttonRow: {
    marginBottom: spacing.md,
  },
});
