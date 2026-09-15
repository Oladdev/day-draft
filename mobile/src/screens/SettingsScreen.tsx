import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native'
import { useStore } from '../lib/store'
import { fmtDur } from '../lib/time'
import { checkBiometricsSupport } from '../lib/biometrics'

export function SettingsScreen() {
  const user = useStore((s) => s.user)
  const setUser = useStore((s) => s.setUser)
  const settings = useStore((s) => s.settings)
  const syncStatus = useStore((s) => s.syncStatus)
  const syncWithCloud = useStore((s) => s.syncWithCloud)
  const setAuthModalOpen = useStore((s) => s.setAuthModalOpen)

  const [biometricsEnabled, setBiometricsEnabled] = useState(true)
  const [bioInfo, setBioInfo] = useState<string>('Face ID / Biometrics')

  useEffect(() => {
    checkBiometricsSupport().then((b) => {
      if (b.supportedTypes.length > 0) {
        setBioInfo(b.supportedTypes.join(' / '))
      }
    })
  }, [])

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          setUser(null)
          setAuthModalOpen(true)
        },
      },
    ])
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account & Settings</Text>
        <Text style={styles.headerSub}>Workspace preferences and cloud synchronization</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* User Card */}
        <View style={styles.card}>
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || '👤'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || 'Local Vault User'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'Offline session'}</Text>
            </View>
          </View>

          <View style={styles.syncRow}>
            <Text style={styles.syncLabel}>Sync State:</Text>
            <View style={styles.syncPill}>
              <Text style={styles.syncPillText}>
                {syncStatus === 'synced' && '🟢 Cloud Synced (PostgreSQL)'}
                {syncStatus === 'syncing' && '🔄 Synchronizing...'}
                {syncStatus === 'idle' && '⚪ Ready'}
                {syncStatus === 'error' && '🔴 Sync Error'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.syncBtn} onPress={syncWithCloud}>
            <Text style={styles.syncBtnText}>Force Cloud Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Biometrics Preference */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Security & Hardware</Text>
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Native Biometrics</Text>
              <Text style={styles.settingSub}>
                Unlock workspace using {bioInfo}
              </Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={setBiometricsEnabled}
              trackColor={{ false: '#cbd5e1', true: '#10b981' }}
            />
          </View>
        </View>

        {/* Schedule Engine Boundaries */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Day Schedule Bounds</Text>

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>Day Begins</Text>
              <Text style={styles.settingSub}>Earliest morning routine start</Text>
            </View>
            <Text style={styles.settingValue}>07:00 AM</Text>
          </View>

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>Day Concludes</Text>
              <Text style={styles.settingSub}>Night sleep boundary</Text>
            </View>
            <Text style={styles.settingValue}>11:00 PM</Text>
          </View>

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>Protected Free Buffer</Text>
              <Text style={styles.settingSub}>Guaranteed unscheduled downtime</Text>
            </View>
            <Text style={styles.settingValue}>{fmtDur(settings.targetFreeMin)}</Text>
          </View>
        </View>

        {/* Sign In / Sign Out Action */}
        {user ? (
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out of Workspace</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => setAuthModalOpen(true)}
          >
            <Text style={styles.signInText}>Sign In with Supabase Account</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 60,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  userEmail: {
    fontSize: 12,
    color: '#64748b',
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  syncLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  syncPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  syncPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  syncBtn: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  syncBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  settingSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
  },
  signOutBtn: {
    backgroundColor: '#fee2e2',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '700',
  },
  signInBtn: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  signInText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
})
