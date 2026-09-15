import * as LocalAuthentication from 'expo-local-authentication'
import * as SecureStore from 'expo-secure-store'

export async function checkBiometricsSupport(): Promise<{
  hasHardware: boolean
  isEnrolled: boolean
  supportedTypes: string[]
}> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync()
    const isEnrolled = await LocalAuthentication.isEnrolledAsync()
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync()
    
    const supportedTypes = types.map((t) => {
      switch (t) {
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          return 'Face ID'
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          return 'Fingerprint / Touch ID'
        case LocalAuthentication.AuthenticationType.IRIS:
          return 'Iris Scan'
        default:
          return 'Biometric'
      }
    })

    return { hasHardware, isEnrolled, supportedTypes }
  } catch (err) {
    console.warn('Failed to check biometrics:', err)
    return { hasHardware: false, isEnrolled: false, supportedTypes: [] }
  }
}

export async function authenticateWithBiometrics(
  reason: string = 'Unlock Day Draft vault'
): Promise<boolean> {
  try {
    const { hasHardware, isEnrolled } = await checkBiometricsSupport()
    if (!hasHardware || !isEnrolled) {
      return false
    }

    const res = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      fallbackLabel: 'Enter Passcode',
      disableDeviceFallback: false,
    })

    return res.success
  } catch (err) {
    console.warn('Biometrics authentication failed:', err)
    return false
  }
}

export async function storeSecureToken(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value)
  } catch (e) {
    console.warn('Failed to save secure token:', e)
  }
}

export async function getSecureToken(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key)
  } catch (e) {
    console.warn('Failed to read secure token:', e)
    return null
  }
}

export async function removeSecureToken(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key)
  } catch (e) {
    console.warn('Failed to remove secure token:', e)
  }
}
