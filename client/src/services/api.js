import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

export async function getProducts() {
  const { data } = await api.get('/products')
  return data
}

export async function getProductById(id) {
  const { data } = await api.get(`/products/${id}`)
  return data
}

export async function createOrder(payload) {
  const { data } = await api.post('/orders', payload)
  return data
}

export async function loginUser(payload) {
  const { data } = await api.post('/auth/login', payload)
  return data
}

export async function registerUser(payload) {
  const { data } = await api.post('/auth/register', payload)
  return data
}

export async function getMe() {
  const { data } = await api.get('/auth/me')
  return data
}

export async function getAdminOrders() {
  const { data } = await api.get('/admin/orders')
  return data
}

export async function getAdminOrderById(id) {
  const { data } = await api.get(`/admin/orders/${id}`)
  return data
}

export async function updateAdminOrderStatus(id, status) {
  const { data } = await api.patch(`/admin/orders/${id}/status`, { status })
  return data
}

export async function getAdminProducts() {
  const { data } = await api.get('/admin/products')
  return data
}

export async function createAdminProduct(payload) {
  const { data } = await api.post('/admin/products', payload)
  return data
}

export async function updateAdminProduct(id, payload) {
  const { data } = await api.patch(`/admin/products/${id}`, payload)
  return data
}

export async function deleteAdminProduct(id) {
  await api.delete(`/admin/products/${id}`)
}

export async function getAdminUsers() {
  const { data } = await api.get('/admin/users')
  return data
}

export async function getAdminUserById(id) {
  const { data } = await api.get(`/admin/users/${id}`)
  return data
}

export async function createAdminUser(payload) {
  const { data } = await api.post('/admin/users', payload)
  return data
}

export async function updateAdminUser(id, payload) {
  const { data } = await api.patch(`/admin/users/${id}`, payload)
  return data
}

export async function deleteAdminUser(id) {
  await api.delete(`/admin/users/${id}`)
}

export async function getAdminRoles() {
  const { data } = await api.get('/admin/roles')
  return data
}

export async function createAdminRole(payload) {
  const { data } = await api.post('/admin/roles', payload)
  return data
}

export async function updateAdminRole(id, payload) {
  const { data } = await api.patch(`/admin/roles/${id}`, payload)
  return data
}

export async function deleteAdminRole(id) {
  await api.delete(`/admin/roles/${id}`)
}

export async function getAdminPermissions() {
  const { data } = await api.get('/admin/permissions')
  return data
}

export async function createAdminPermission(payload) {
  const { data } = await api.post('/admin/permissions', payload)
  return data
}

export async function updateAdminPermission(id, payload) {
  const { data } = await api.patch(`/admin/permissions/${id}`, payload)
  return data
}

export async function deleteAdminPermission(id) {
  await api.delete(`/admin/permissions/${id}`)
}
