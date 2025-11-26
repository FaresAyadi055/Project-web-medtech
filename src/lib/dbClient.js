// dbClient: abstraction layer used by components. Routes to localDb for local-only mode.

import localDb from './localDb'
import api from '../api/client'

// decide runtime mode: when VITE_LOCAL_ONLY=true use localDb, when VITE_USE_API=true use server API
const envLocalOnly = import.meta.env.VITE_LOCAL_ONLY === 'true'
const envUseApi = import.meta.env.VITE_USE_API === 'true'
const isLocal = envLocalOnly || !envUseApi

async function ensureUserDoc(user) {
  if (isLocal) return localDb.ensureUser(user)
  // server will create user doc if missing
  const resp = await api.post('/users', { id: user.uid, name: user.displayName || user.email?.split('@')[0], email: user.email })
  return resp.data
}

async function fetchTasks() {
  if (isLocal) return localDb.listTasks()
  const resp = await api.get('/tasks/class/all')
  return resp.data
}

async function createTask(payload) {
  if (isLocal) return localDb.createTask(payload)
  // support file attachments when provided
  if (payload.attachments && payload.attachments.length > 0) {
    const form = new FormData()
    form.append('title', payload.title)
    form.append('description', payload.description || '')
    if (payload.class) form.append('classId', payload.class)
    for (const f of payload.attachments) form.append('attachments', f)
    const resp = await api.post('/tasks', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    return resp.data
  }
  const resp = await api.post('/tasks', { title: payload.title, description: payload.description, classId: payload.class })
  return resp.data
}

async function fetchTaskById(id) {
  if (isLocal) return localDb.getTask(id)
  const resp = await api.get(`/tasks/${id}`)
  return resp.data
}

async function getComments(taskId) {
  if (isLocal) return localDb.listCommentsForTask(taskId)
  const resp = await api.get(`/submissions/task/${taskId}`) // submissions endpoint returns submissions; comments not implemented server-side
  return resp.data
}

async function addComment(payload) {
  if (isLocal) return localDb.addComment(payload)
  const resp = await api.post(`/tasks/${payload.taskId}/comments`, { content: payload.content })
  return resp.data
}

async function getSubmissions(taskId) {
  if (isLocal) return localDb.listSubmissionsForTask(taskId)
  const resp = await api.get(`/submissions/task/${taskId}`)
  return resp.data
}

async function addSubmission(payload, files = []) {
  if (isLocal) {
    const uploaded = await localDb.uploadFiles(files)
    return localDb.addSubmission({ ...payload, files: uploaded })
  }
  const form = new FormData()
  form.append('taskId', payload.taskId)
  form.append('content', payload.content || '')
  for (const f of files) form.append('attachments', f)
  const resp = await api.post('/submissions', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  return resp.data
}

async function uploadFiles(files) {
  if (isLocal) return localDb.uploadFiles(files)
  const form = new FormData()
  for (const f of files) form.append('files', f)
  const resp = await api.post('/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  return resp.data.urls
}

async function saveProfile(uid, patch) {
  if (isLocal) return localDb.updateUser(uid, patch)
  const resp = await api.put(`/users/${uid}`, patch)
  return resp.data
}

const client = { ensureUserDoc, fetchTasks, createTask, fetchTaskById, getComments, addComment, getSubmissions, addSubmission, uploadFiles, saveProfile }
// Auth functions
export async function createUser(email, password, name) {
  if (isLocal) return localDb.createAuthUser(email, password, name)
  const resp = await api.post('/auth/register', { name, email, password })
  // store token locally
  if (resp.data?.token) {
    localStorage.setItem('uni_tasks_token', resp.data.token)
  }
  return resp.data.user
}

export async function signIn(email, password) {
  if (isLocal) return localDb.signInLocal(email, password)
  const resp = await api.post('/auth/login', { email, password })
  if (resp.data?.token) {
    localStorage.setItem('uni_tasks_token', resp.data.token)
  }
  return resp.data.user
}
client.createUser = createUser
client.signIn = signIn

export default client
