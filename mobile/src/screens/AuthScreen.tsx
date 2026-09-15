import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native'
import { useStore } from '../lib/store'
import { supabase } from '../lib/supabase'
import {
  checkBiometricsSupport,
  authenticateWithBiometrics,
  getSecureToken,
  storeSecureToken,
} from '../lib/biometrics'

export function AuthScreen() {
  const setUser = useStore((s) => s.setUser)
  const setAuthModalOpen = useStore((s) => s.setAuthModalOpen)
  const syncWithCloud = useStore((s) => s.syncWithCloud)

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [hasBiometrics, setHasBiometrics] = useState(false)
  const [biometricType, setBiometricType] = useState('Face ID / Fingerprint')

  useEffect(() => {
    checkBiometricsSupport().then((bio) => {
      if (bio.hasHardware && bio.isEnrolled) {
        setHasBiometrics(true)
        if (bio.supportedTypes.length > 0) {
          setBiometricType(bio.supportedTypes.join(' / '))
        }
      }
    })
  }, [])

  const handleAuth = async () => {
    setErrorMsg(null)
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.')
      return
    }

    setLoading(true)
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() || 'Student' },
          },
        })

        if (error) {
          setErrorMsg(error.message)
          setLoading(false)
          return
        }

        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email!,
            name: fullName.trim() || 'Student',
          })
          await storeSecureToken('user_session', data.user.id)
          setAuthModalOpen(false)
          syncWithCloud()
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

        if (error) {
          setErrorMsg(error.message)
          setLoading(false)
          return
        }

        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.full_name || 'Student',
          })
          await storeSecureToken('user_session', data.user.id)
          setAuthModalOpen(false)
          syncWithCloud()
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleBiometricUnlock = async () => {
    const success = await authenticateWithBiometrics('Unlock Day Draft with ' + biometricType)
    if (success) {
      const savedUserId = await getSecureToken('user_session')
      if (savedUserId) {
        setUser({
          id: savedUserId,
          email: 'biometric-user@daydraft.app',
          name: 'Biometric User',
        })
        setAuthModalOpen(false)
        syncWithCloud()
      } else {
        Alert.alert(
          'Biometrics Recognized',
          'Biometrics verified! Sign in with your Supabase email once to bind this device to your cloud account.'
        )
      }
    }
  }

  const handleGuestMode = () => {
    setUser({
      id: 'local_offline',
      email: 'offline@localhost',
      name: 'Offline Student',
    })
    setAuthModalOpen(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🌿</Text>
          <Text style={styles.brandTitle}>Day Draft</Text>
          <Text style={styles.brandSub}>
            Native mobile second-brain routine scheduler
          </Text>
        </View>

        {/* Biometrics Quick Button */}
        {hasBiometrics && (
          <TouchableOpacity
            style={styles.biometricBtn}
            onPress={handleBiometricUnlock}
          >
            <Text style={styles.biometricBtnText}>
              🛡 Unlock with {biometricType}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.card}>
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'signin' && styles.modeTabActive]}
              onPress={() => setMode('signin')}
            >
              <Text style={[styles.modeText, mode === 'signin' && styles.modeTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'signup' && styles.modeTabActive]}
              onPress={() => setMode('signup')}
            >
              <Text style={[styles.modeText, mode === 'signup' && styles.modeTextActive]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {errorMsg && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {mode === 'signup' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Ola Atolagbe"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitBtnText}>
                {mode === 'signin' ? 'Sign In to Cloud Vault' : 'Create Supabase Account'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.offlineBtn} onPress={handleGuestMode}>
          <Text style={styles.offlineBtnText}>Use Offline Local Mode (No Cloud)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoEmoji: {
    fontSize: 44,
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  biometricBtn: {
    backgroundColor: '#064e3b',
    borderWidth: 1,
    borderColor: '#059669',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  biometricBtnText: {
    color: '#34d399',
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modeRow: {
    flexDirection: 'row',
    marginBottom: 18,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 4,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeTabActive: {
    backgroundColor: '#334155',
  },
  modeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
  },
  modeTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#450a0a',
    borderWidth: 1,
    borderColor: '#991b1b',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#ffffff',
  },
  submitBtn: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    backgroundColor: '#064e3b',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  offlineBtn: {
    marginTop: 20,
    alignItems: 'center',
  },
  offlineBtnText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
})
