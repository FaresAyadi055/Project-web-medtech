# UniTasks — University Task Manager

A production-ready React + Firebase app for university task management with zero uptime cost (uses Firebase free tier).

Features
- Google and email/password authentication (Firebase Auth)
- Roles: professor / student stored in `users` collection
- Tasks (`tasks`), Comments (`comments`), Submissions (`submissions`) in Firestore
- File uploads stored in Firebase Storage
- Dark modern UI built with React + TailwindCSS

Important: This repo is a client-heavy app that uses Firestore and Storage directly from the browser and deploys to Firebase Hosting (free tier). Follow the steps below to configure and deploy.

## Quickstart (local)

1. Install dependencies

```powershell
npm install
```

2. Create a Firebase project at https://console.firebase.google.com/

3. Enable Authentication
- Email/Password: enable in Auth > Sign-in methods
- Google: enable and configure OAuth consent screen

4. Enable Firestore (in test or follow the security rules provided)
5. Enable Firebase Storage

6. Add environment variables (create `.env.local`)

Copy `.env.example` to `.env.local` and fill values from Firebase project settings.

Optional: To test fully offline using the Firebase Emulator Suite, set `VITE_USE_FIREBASE_EMULATOR=true` in `.env.local` and run the emulators locally. Default emulator ports are included in the example file.

7. Run locally

```powershell
npm run dev
```

Open http://localhost:5173

## Deploy to Firebase Hosting

1. Install Firebase CLI (if not already)

```powershell
npm install -g firebase-tools
```

2. Login

```powershell
firebase login
```

3. Init hosting in the project folder (select existing project)

```powershell
firebase init
```

- Choose Hosting, Firestore (optional), Storage rules
- Set build output to `dist`

4. Build and deploy

```powershell
npm run build
firebase deploy --only hosting
```

### CI / GitHub Actions

This repo includes a GitHub Actions workflow at `.github/workflows/firebase-deploy.yml` that builds and deploys the app to Firebase Hosting on `main` branch pushes.

Before using the workflow:

- Set your Firebase project id in `.firebaserc` (replace `your-project-id`).
- Create a CI token locally and add it to the repository secrets as `FIREBASE_TOKEN`:

```powershell
# Requires firebase-tools installed locally
firebase login:ci
# Copy the printed token and add it to GitHub > Settings > Secrets > Actions > NEW SECRET named FIREBASE_TOKEN
```

The workflow runs `npm ci`, `npm run build` and then `firebase deploy --only hosting` using the token.

## Environment variables
Create `.env.local` with these values (example in `.env.example`):

- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID

## Security / Rules
Files included:
- `firebase.firestore.rules` — example Firestore rules
- `firebase.storage.rules` — example Storage rules

Carefully review and adapt rules before using in production.

## Data model overview
- users: id, name, email, role, major
- tasks: id, title, description, professorId, tags[], deadline, attachments[]
- comments: id, taskId, userId, text, timestamp
- submissions: id, taskId, studentId, files[], status

## Next steps and improvements
- Real-time listeners (onSnapshot) for comments and tasks
- Paginated queries and indexing for large datasets
- Email or role-based invitations for professors
- Add tests and CI for deploy

---
This project is a reference implementation. Adjust rules, indexes, and storage paths to fit your institution's requirements.
