#!/usr/bin/env node
// seeds a running Firebase Emulator Suite with test data using the Admin SDK
// Usage:
//  set SERVICE_ACCOUNT_PATH="C:\path\to\serviceAccount.json";
//  set FIRESTORE_EMULATOR_HOST=localhost:8080; set FIREBASE_AUTH_EMULATOR_HOST=localhost:9099;
//  node scripts/seedEmulator.js

const fs = require('fs')
const path = require('path')

const serviceAccountPath = process.env.SERVICE_ACCOUNT_PATH || process.argv[2]
if (!serviceAccountPath) {
  console.error('ERROR: SERVICE_ACCOUNT_PATH not provided. Set env var or pass path as first arg.')
  process.exit(1)
}

if (!fs.existsSync(serviceAccountPath)) {
  console.error('ERROR: service account file not found at', serviceAccountPath)
  process.exit(1)
}

// Require firebase-admin locally so it's only used for dev/seeding
const admin = require('firebase-admin')

// When targeting the emulator, ensure the emulator host env vars are present
const firestoreEmu = process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_FIRESTORE_EMULATOR_HOST
const authEmu = process.env.FIREBASE_AUTH_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST

if (!firestoreEmu || !authEmu) {
  console.warn('Warning: FIRESTORE_EMULATOR_HOST or FIREBASE_AUTH_EMULATOR_HOST not set. Ensure emulators are running and env vars are exported.')
}

const serviceAccount = require(path.resolve(serviceAccountPath))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

async function seed() {
  console.log('Seeding emulator...')

  try {
    // Create a test user in Auth
    const user = await admin.auth().createUser({
      email: 'student1@test.local',
      emailVerified: true,
      password: 'password123',
      displayName: 'Student One',
    })
    console.log('Created test user:', user.uid)

    // Create a corresponding user doc in Firestore
    await db.collection('users').doc(user.uid).set({
      id: user.uid,
      name: user.displayName,
      email: user.email,
      role: 'student',
      major: 'Computer Science',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    // Add sample task
    const taskRef = db.collection('tasks').doc()
    await taskRef.set({
      id: taskRef.id,
      title: 'Sample Task for Local Testing',
      description: 'This task was created by seed script.',
      professorId: null,
      tags: ['example','seed'],
      deadline: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 3600 * 1000)),
      attachments: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    console.log('Seed complete.')
    process.exit(0)
  } catch (err) {
    console.error('Seeding failed:', err)
    process.exit(2)
  }
}

seed()
