import { createClient } from '@supabase/supabase-js'
import { config } from '../config.js'
import { mapProfileRow, mapTaskRow, sortByPosition } from './mappers.js'

let client

function supabase() {
  if (!client) {
    client = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return client
}

function throwDb(error, fallback = 'Database error') {
  const err = new Error(error?.message || fallback)
  err.cause = error
  if (error?.code === 'PGRST205' || /Could not find the table/i.test(error?.message || '')) {
    err.code = 'SCHEMA_MISSING'
    err.message =
      'Database tables are missing. Run docs/supabase-schema.sql in the Supabase SQL Editor, then try again.'
  }
  throw err
}

export const driver = 'supabase'

export async function findUserByEmail(email) {
  const { data, error } = await supabase()
    .from('profiles')
    .select('*')
    .eq('email', email)
    .maybeSingle()

  if (error) throwDb(error)
  return mapProfileRow(data)
}

export async function findUserById(id) {
  const { data, error } = await supabase()
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throwDb(error)
  return mapProfileRow(data)
}

export async function createUser({ name, email, passwordHash }) {
  const existing = await findUserByEmail(email)
  if (existing) {
    const err = new Error('Email already registered')
    err.code = 'EMAIL_TAKEN'
    throw err
  }

  const { data, error } = await supabase()
    .from('profiles')
    .insert({
      name,
      email,
      password_hash: passwordHash,
    })
    .select('*')
    .single()

  if (error) {
    if (error.code === '23505') {
      const err = new Error('Email already registered')
      err.code = 'EMAIL_TAKEN'
      throw err
    }
    throwDb(error)
  }

  return mapProfileRow(data)
}

export async function updateUser(id, fields) {
  const patch = {}
  if (fields.name !== undefined) patch.name = fields.name
  if (fields.email !== undefined) patch.email = fields.email
  if (fields.passwordHash !== undefined) patch.password_hash = fields.passwordHash

  if (fields.email) {
    const other = await findUserByEmail(fields.email)
    if (other && other.id !== id) {
      const err = new Error('Email already in use')
      err.code = 'EMAIL_TAKEN'
      throw err
    }
  }

  const { data, error } = await supabase()
    .from('profiles')
    .update(patch)
    .eq('id', id)
    .select('*')
    .maybeSingle()

  if (error) {
    if (error.code === '23505') {
      const err = new Error('Email already in use')
      err.code = 'EMAIL_TAKEN'
      throw err
    }
    throwDb(error)
  }

  return mapProfileRow(data)
}

export async function listTasks(userId) {
  const { data, error } = await supabase()
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throwDb(error)
  return sortByPosition((data || []).map(mapTaskRow))
}

export async function nextPosition(userId, status) {
  const { data, error } = await supabase()
    .from('tasks')
    .select('position')
    .eq('user_id', userId)
    .eq('status', status)

  if (error) throwDb(error)
  if (!data || data.length === 0) return 0
  return Math.max(...data.map((row) => Number(row.position) || 0)) + 1
}

export async function createTask({
  userId,
  title,
  notes,
  status,
  due,
  position,
}) {
  const pos =
    position === undefined || position === null
      ? await nextPosition(userId, status)
      : position

  const { data, error } = await supabase()
    .from('tasks')
    .insert({
      user_id: userId,
      title,
      notes: notes || '',
      status,
      due: due || null,
      position: pos,
    })
    .select('*')
    .single()

  if (error) throwDb(error)
  return mapTaskRow(data)
}

export async function getTask(userId, id) {
  const { data, error } = await supabase()
    .from('tasks')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throwDb(error)
  return mapTaskRow(data)
}

export async function updateTask(userId, id, fields) {
  const patch = { updated_at: new Date().toISOString() }
  if (fields.title !== undefined) patch.title = fields.title
  if (fields.notes !== undefined) patch.notes = fields.notes
  if (fields.due !== undefined) patch.due = fields.due
  if (fields.status !== undefined) patch.status = fields.status
  if (fields.position !== undefined) patch.position = fields.position

  const { data, error } = await supabase()
    .from('tasks')
    .update(patch)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .maybeSingle()

  if (error) throwDb(error)
  return mapTaskRow(data)
}

export async function moveTask(userId, id, status, position = null) {
  const task = await getTask(userId, id)
  if (!task) return null

  const targetPos =
    position === null || position === undefined
      ? await nextPosition(userId, status)
      : position

  const column = await listTasks(userId)
  const updates = []

  for (const item of column) {
    if (item.id === id) continue
    if (item.status !== status) continue
    const pos = Number(item.position) || 0
    if (pos >= targetPos) {
      updates.push(
        supabase()
          .from('tasks')
          .update({
            position: pos + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.id)
          .eq('user_id', userId),
      )
    }
  }

  if (updates.length) {
    const results = await Promise.all(updates)
    const failed = results.find((r) => r.error)
    if (failed?.error) throwDb(failed.error)
  }

  const { data, error } = await supabase()
    .from('tasks')
    .update({
      status,
      position: targetPos,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single()

  if (error) throwDb(error)
  return mapTaskRow(data)
}

export async function deleteTask(userId, id) {
  const { data, error } = await supabase()
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .select('id')

  if (error) throwDb(error)
  return Array.isArray(data) && data.length > 0
}

export async function taskStats(userId) {
  const tasks = await listTasks(userId)
  return {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    doing: tasks.filter((t) => t.status === 'doing').length,
    done: tasks.filter((t) => t.status === 'done').length,
  }
}
