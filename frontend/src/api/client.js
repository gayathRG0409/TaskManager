import { config } from '../config'

const TOKEN_KEY = 'taskflow_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const auth = token ?? getToken()
  if (auth) headers.Authorization = `Bearer ${auth}`

  const response = await fetch(`${config.apiBase}/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 204) return null

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`)
  }
  return data
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: () => request('/auth/me'),
  getProfile: () => request('/users/me'),
  updateProfile: (payload) => request('/users/me', { method: 'PATCH', body: payload }),
  getBoard: () => request('/board'),
  getTasks: () => request('/tasks'),
  createTask: (payload) => request('/tasks', { method: 'POST', body: payload }),
  updateTask: (id, payload) =>
    request(`/tasks/${id}`, { method: 'PATCH', body: payload }),
  moveTask: (id, payload) =>
    request(`/tasks/${id}/move`, { method: 'PATCH', body: payload }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
}
