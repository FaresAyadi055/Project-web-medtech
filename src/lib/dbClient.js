// dbClient: abstraction layer used by components. Routes to localDb for local-only mode.

import localDb from './localDb'

// This app is local-only now — all operations are routed to localDb
const isLocal = true

async function ensureUserDoc(user) {
  return localDb.ensureUser(user)
}

async function fetchTasks() {
  return localDb.listTasks()
}

async function createTask(payload) {
  return localDb.createTask(payload)
}

async function fetchTaskById(id) {
  return localDb.getTask(id)
}

async function getComments(taskId) {
  return localDb.listCommentsForTask(taskId)
}

async function addComment(payload) {
  return localDb.addComment(payload)
}

async function getSubmissions(taskId) {
  return localDb.listSubmissionsForTask(taskId)
}

async function addSubmission(payload, files = []) {
  const uploaded = await localDb.uploadFiles(files)
  return localDb.addSubmission({ ...payload, files: uploaded })
}

async function uploadFiles(files) {
  return localDb.uploadFiles(files)
}

async function saveProfile(uid, patch) {
  return localDb.updateUser(uid, patch)
}

const client = { ensureUserDoc, fetchTasks, createTask, fetchTaskById, getComments, addComment, getSubmissions, addSubmission, uploadFiles, saveProfile }
// Auth functions
export async function createUser(email, password, name) {
  return localDb.createAuthUser(email, password, name)
}

export async function signIn(email, password) {
  return localDb.signInLocal(email, password)
}
client.createUser = createUser
client.signIn = signIn

export default client
