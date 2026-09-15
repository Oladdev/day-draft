/**
 * WebAuthn & Windows Hello Biometric Authentication Helper
 * Uses standard FIDO2 / WebAuthn APIs supported natively by Windows Hello, Touch ID, and modern browsers.
 */

export async function isBiometricsAvailable(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return false
  }
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch (e) {
    return false
  }
}

export async function registerBiometricCredential(email: string): Promise<boolean> {
  if (!window.PublicKeyCredential) return false

  try {
    const challenge = new Uint8Array(32)
    window.crypto.getRandomValues(challenge)

    const userId = new TextEncoder().encode(email)

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: 'Day Draft Desktop',
          id: window.location.hostname,
        },
        user: {
          id: userId,
          name: email,
          displayName: email.split('@')[0],
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
        },
        timeout: 60000,
        attestation: 'none',
      },
    })

    if (credential) {
      localStorage.setItem('daydraft_biometric_enabled', 'true')
      localStorage.setItem('daydraft_biometric_email', email)
      return true
    }
    return false
  } catch (err) {
    console.warn('Biometric registration error:', err)
    return false
  }
}

export async function authenticateWithBiometrics(): Promise<{ success: boolean; email?: string }> {
  if (!window.PublicKeyCredential) return { success: false }

  const storedEmail = localStorage.getItem('daydraft_biometric_email')
  if (!storedEmail) return { success: false }

  try {
    const challenge = new Uint8Array(32)
    window.crypto.getRandomValues(challenge)

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        timeout: 60000,
        userVerification: 'required',
        rpId: window.location.hostname,
      },
    })

    if (assertion) {
      return { success: true, email: storedEmail }
    }
    return { success: false }
  } catch (err) {
    console.warn('Biometric authentication failed:', err)
    return { success: false }
  }
}
