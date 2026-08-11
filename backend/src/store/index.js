import * as supabaseStore from './supabaseStore.js'
import { publicTask, publicUser, sortByPosition } from './mappers.js'

export const store = supabaseStore
export const storageDriver = supabaseStore.driver

export { publicTask, publicUser, sortByPosition }

export async function findUserByEmail(email) {
  return supabaseStore.findUserByEmail(email)
}

export async function findUserById(id) {
  return supabaseStore.findUserById(id)
}

export async function createUser(input) {
  return supabaseStore.createUser(input)
}

export async function updateUser(id, fields) {
  return supabaseStore.updateUser(id, fields)
}

export async function listTasks(userId) {
  return supabaseStore.listTasks(userId)
}

export async function nextPosition(userId, status) {
  return supabaseStore.nextPosition(userId, status)
}

export async function createTask(input) {
  return supabaseStore.createTask(input)
}

export async function getTask(userId, id) {
  return supabaseStore.getTask(userId, id)
}

export async function updateTask(userId, id, fields) {
  return supabaseStore.updateTask(userId, id, fields)
}

export async function moveTask(userId, id, status, position) {
  return supabaseStore.moveTask(userId, id, status, position)
}

export async function deleteTask(userId, id) {
  return supabaseStore.deleteTask(userId, id)
}

export async function taskStats(userId) {
  return supabaseStore.taskStats(userId)
}
