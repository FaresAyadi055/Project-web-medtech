// dbClient: thin wrapper around the local API client
import api from '../api/client'

const client = {
  async fetchTasks() {
    const resp = await api.get('/tasks/class/all')
    return resp.data || []
  },
  async createTask(payload) {
    const resp = await api.post('/tasks', { title: payload.title, description: payload.description, classId: payload.class })
    return resp.data
  },
  async fetchTaskById(id) {
    const resp = await api.get(`/tasks/${id}`)
    return resp.data
  },
  async getComments(taskId) {
    const resp = await api.get(`/submissions/task/${taskId}`)
    return resp.data || []
  },
  async addComment(payload) {
    const resp = await api.post(`/tasks/${payload.taskId}/comments`, { content: payload.text || payload.content })
    return resp.data
  },
  async getSubmissions(taskId) {
    const resp = await api.get(`/submissions/task/${taskId}`)
    return resp.data || []
  },
  async addSubmission(payload) {
    const resp = await api.post('/submissions', { taskId: payload.taskId, content: payload.content || '' })
    return resp.data
  },
  async saveProfile(uid, patch) {
    const resp = await api.put(`/users/${uid}`, patch)
    return resp.data
  },
}

export default client
