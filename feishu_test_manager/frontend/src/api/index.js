import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const casesAPI = {
  list: (params) => api.get('/cases', { params }),
  get: (id) => api.get(`/cases/${id}`),
  create: (data) => api.post('/cases', data),
  update: (id, data) => api.put(`/cases/${id}`, data),
  delete: (id) => api.delete(`/cases/${id}`)
}

export const tasksAPI = {
  list: (params) => api.get('/tasks', { params }),
  get: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  updateStatus: (id, status) => api.put(`/tasks/${id}/status`, { status })
}

export const executionsAPI = {
  list: (params) => api.get('/executions', { params }),
  create: (data) => api.post('/executions', data),
  update: (id, data) => api.put(`/executions/${id}`, data)
}

export const bugsAPI = {
  list: () => api.get('/bugs'),
  get: (id) => api.get(`/bugs/${id}`),
  create: (data) => api.post('/bugs', data),
  update: (id, data) => api.put(`/bugs/${id}`, data),
  updateStatus: (id, status) => api.put(`/bugs/${id}/status`, { status })
}

export const reportsAPI = {
  list: (params) => api.get('/reports', { params }),
  create: (data) => api.post('/reports', data),
  getByTask: (taskId) => api.get(`/reports/task/${taskId}`)
}

export const statsAPI = {
  dashboard: () => api.get('/stats/dashboard')
}

export default api