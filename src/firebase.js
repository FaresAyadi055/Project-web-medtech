import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let app = null
let auth = null
let googleProvider = null
let db = null
let storage = null

try {
  // only initialize if a projectId is provided to avoid runtime errors during development
  if (firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    googleProvider = new GoogleAuthProvider()
    db = getFirestore(app)
    storage = getStorage(app)
    // Optional: connect to local Firebase emulators when requested via env
    // Set `VITE_USE_FIREBASE_EMULATOR=true` in your .env.local to enable.
    if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
      const emuHost = import.meta.env.VITE_FIREBASE_EMULATOR_HOST || 'localhost'
      const emuAuthPort = parseInt(import.meta.env.VITE_FIREBASE_EMULATOR_AUTH_PORT || '9099', 10)
      const emuFirestorePort = parseInt(import.meta.env.VITE_FIREBASE_EMULATOR_FIRESTORE_PORT || '8080', 10)
      const emuStoragePort = parseInt(import.meta.env.VITE_FIREBASE_EMULATOR_STORAGE_PORT || '9199', 10)

      try {
        connectAuthEmulator(auth, `http://${emuHost}:${emuAuthPort}`, { disableWarnings: true })
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Could not connect Auth emulator:', e)
      }

      try {
        connectFirestoreEmulator(db, emuHost, emuFirestorePort)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Could not connect Firestore emulator:', e)
      }

      try {
        connectStorageEmulator(storage, emuHost, emuStoragePort)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Could not connect Storage emulator:', e)
      }
    }
  } else {
    // Warn and export nulls; features that require Firebase will need proper env vars
    // This prevents the client from crashing when env vars are not yet configured.
    // Use `.env.local` to provide VITE_FIREBASE_* values.
    // eslint-disable-next-line no-console
    console.warn('Firebase not initialized: missing VITE_FIREBASE_PROJECT_ID in environment')
  }
} catch (e) {
  // eslint-disable-next-line no-console
  console.error('Error initializing Firebase:', e)
}

export { app, auth, googleProvider, db, storage }
