// Lightweight in-browser local datastore for UI testing.
// Persists into localStorage under key `uni_tasks_localdb` so reload keeps data.

const STORAGE_KEY = 'uni_tasks_localdb_v1'

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { users: {}, tasks: {}, comments: {}, submissions: {} }
  } catch (e) {
    console.warn('localDb read failed', e)
    return { users: {}, tasks: {}, comments: {}, submissions: {} }
  }
}

function write(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch (e) {
    console.warn('localDb write failed', e)
  }
}

function makeId(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 9)
}

export function ensureUser(user) {
  const db = read()
  if (!db.users[user.uid]) {
    db.users[user.uid] = { id: user.uid, name: user.name || user.email?.split('@')[0] || 'User', email: user.email || '', role: 'student', major: '', createdAt: new Date().toISOString() }
    write(db)
  }
  return db.users[user.uid]
}

export function getUser(uid) {
  const db = read()
  return db.users[uid] || null
}

export function updateUser(uid, patch) {
  const db = read()
  db.users[uid] = { ...(db.users[uid] || { id: uid }), ...patch }
  write(db)
  return db.users[uid]
}

// Simple local auth helpers (local-only / development use)
export function createAuthUser(email, password, name) {
  const db = read()
  // check if one exists
  const existing = Object.values(db.users).find(u => u.email === email)
  if (existing) throw new Error('User already exists')
  const uid = makeId('u_')
  const doc = { id: uid, uid, name: name || email.split('@')[0], email, role: 'student', major: '', createdAt: new Date().toISOString(), password }
  db.users[uid] = doc
  write(db)
  return doc
}

export function signInLocal(email, password) {
  const db = read()
  const user = Object.values(db.users).find(u => u.email === email)
  if (!user) throw new Error('User not found')
  if (user.password !== password) throw new Error('Invalid credentials')
  return user
}


export function listTasks() {
  const db = read()
  return Object.values(db.tasks).sort((a,b)=> new Date(a.deadline || 0) - new Date(b.deadline || 0))
}

export function createTask(payload) {
  const db = read()
  const id = makeId('task_')
  const doc = { id, ...payload, createdAt: new Date().toISOString() }
  db.tasks[id] = doc
  write(db)
  return doc
}

export function getTask(id) {
  const db = read()
  return db.tasks[id] || null
}

export function listCommentsForTask(taskId) {
  const db = read()
  return Object.values(db.comments).filter(c => c.taskId === taskId).sort((a,b)=> new Date(a.timestamp) - new Date(b.timestamp))
}

export function addComment(payload) {
  const db = read()
  const id = makeId('c_')
  const doc = { id, ...payload, timestamp: new Date().toISOString() }
  db.comments[id] = doc
  write(db)
  return doc
}

export function listSubmissionsForTask(taskId) {
  const db = read()
  return Object.values(db.submissions).filter(s=> s.taskId === taskId).sort((a,b)=> new Date(a.createdAt) - new Date(b.createdAt))
}

export function addSubmission(payload) {
  const db = read()
  const id = makeId('sub_')
  const doc = { id, ...payload, createdAt: new Date().toISOString() }
  db.submissions[id] = doc
  write(db)
  return doc
}

// Simulated storage: create object URL for files so components can render links
export async function uploadFiles(files) {
  const uploaded = []
  for (const f of files) {
    // in-memory blob url
    const url = URL.createObjectURL(f)
    uploaded.push({ name: f.name, url })
  }
  return uploaded
}

export default { ensureUser, getUser, updateUser, listTasks, createTask, getTask, listCommentsForTask, addComment, listSubmissionsForTask, addSubmission, uploadFiles }
