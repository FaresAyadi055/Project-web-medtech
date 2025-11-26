import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const api = axios.create({ baseURL, headers: { 'Content-Type': 'application/json' } })

// attach token automatically if present
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('uni_tasks_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch (e) {}
  return config
})

export default api
