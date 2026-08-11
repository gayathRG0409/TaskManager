export function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  }
}

export function publicTask(task) {
  return {
    id: task.id,
    title: task.title,
    notes: task.notes || '',
    status: task.status,
    due: task.due || null,
    position: Number.isFinite(Number(task.position)) ? Number(task.position) : 0,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  }
}

export function sortByPosition(tasks) {
  return [...tasks].sort((a, b) => {
    const pos = (Number(a.position) || 0) - (Number(b.position) || 0)
    if (pos !== 0) return pos
    return String(a.createdAt).localeCompare(String(b.createdAt))
  })
}

/** Map Supabase snake_case row → app camelCase user */
export function mapProfileRow(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  }
}

/** Map Supabase snake_case row → app camelCase task */
export function mapTaskRow(row) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    notes: row.notes || '',
    status: row.status,
    due: row.due || null,
    position: Number(row.position) || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
