# UniTasks — University Task Manager

Lightweight React app for managing university tasks. This workspace has been converted to run fully locally for UI and functional testing — it stores data in the browser using localStorage.

Features
- Local mock auth and data stored in localStorage (no remote services required)
- Roles: professor / student (local-only)
- Tasks, Comments, Submissions stored locally for quick UI prototyping
- Dark modern UI built with React + TailwindCSS

## Quickstart (local)

1. Install dependencies

```powershell
npm install
```

2. Local-only setup

Copy `.env.example` to `.env.local` and set one of the flags below when developing locally:

- VITE_FORCE_MOCK_USER=true — immediately signs in a mock user to inspect the UI
- VITE_LOCAL_ONLY=true — run the app entirely using the browser's localStorage; no external services

Local-only mode (no remote services)
If you'd like to run the app purely locally for UI testing, the project includes a built-in local datastore and mock storage that persist to your browser's localStorage.

- Set either `VITE_FORCE_MOCK_USER=true` (quick mock authenticated user) or `VITE_LOCAL_ONLY=true` (full local datastore) in `.env.local`. The latter will run the app without calling remote services for reads/writes or storage uploads.
- Restart the dev server after changing the env file.
- To reset the local in-browser database, open DevTools → Application → Local Storage and remove the key `uni_tasks_localdb_v1`.

This is useful when you want to iterate on the UI quickly without remote dependencies.

7. Run locally

```powershell
npm run dev
```

Open http://localhost:5173

## Local testing

Run the app locally using Vite and use local-only mode to avoid the need for any remote services.

```powershell
npm install
npm run dev
```

Open http://localhost:5173 to view the app.

## Environment variables (local-only)
Copy `.env.example` to `.env.local` and configure the `VITE_FORCE_MOCK_USER` or `VITE_LOCAL_ONLY` flags to control local-only behavior.

Seeding local demo data

For local UI testing you can populate the app manually (create a user and tasks via the UI) or use your browser console to write a JSON sample into localStorage under the key `uni_tasks_localdb_v1`.

Example snippet you can run in DevTools → Console to add a sample user and a sample task:

```js
const db = JSON.parse(localStorage.getItem('uni_tasks_localdb_v1') || '{}')
db.users = db.users || {}
db.tasks = db.tasks || {}
const uid = 'local_user_1'
db.users[uid] = { id: uid, uid, name: 'Local Student', email: 'student1@test.local', role: 'student', major: 'Computer Science', createdAt: new Date().toISOString() }
const taskId = 'task_local_1'
db.tasks[taskId] = { id: taskId, title: 'Local Test Task', description: 'Created in local mode', professorId: null, tags: ['sample'], deadline: new Date(Date.now()+7*24*3600*1000).toISOString(), attachments: [], createdAt: new Date().toISOString() }
localStorage.setItem('uni_tasks_localdb_v1', JSON.stringify(db))
```

Reload the app and sign in (if needed) to see the data.

## Security / Data
This project is now fully local. Data persists to your browser's localStorage under the key `uni_tasks_localdb_v1`. Clear it to reset demo data.

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
