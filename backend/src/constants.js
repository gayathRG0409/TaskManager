export const TASK_STATUSES = ['todo', 'doing', 'done']
export const STATUS_SET = new Set(TASK_STATUSES)

export const BOARD_COLUMNS = [
  { id: 'todo', label: 'To do' },
  { id: 'doing', label: 'Doing' },
  { id: 'done', label: 'Done' },
]

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
