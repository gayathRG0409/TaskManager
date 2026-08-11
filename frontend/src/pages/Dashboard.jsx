import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { api } from '../api/client'
import AddTaskModal from '../components/AddTaskModal'
import { KanbanColumn } from '../components/KanbanBoard'
import { useNotify } from '../context/NotifyContext'

const COLUMNS = [
  { id: 'todo', label: 'To do' },
  { id: 'doing', label: 'Doing' },
  { id: 'done', label: 'Done' },
]

const STATUS_LABEL = {
  todo: 'To do',
  doing: 'Doing',
  done: 'Done',
}

export default function Dashboard() {
  const { notify, notifyPromise } = useNotify()
  const [tasks, setTasks] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [defaultStatus, setDefaultStatus] = useState('todo')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [activeTask, setActiveTask] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  )

  const loadTasks = useCallback(async () => {
    setError('')
    try {
      const data = await api.getBoard()
      const flat = data.columns.flatMap((column) => column.tasks)
      setTasks(flat)
    } catch (err) {
      const message = err.message || 'Failed to load board'
      setError(message)
      notify({
        type: 'error',
        title: 'Board load failed',
        message,
      })
    } finally {
      setLoading(false)
    }
  }, [notify])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const grouped = useMemo(() => {
    const map = { todo: [], doing: [], done: [] }
    for (const task of tasks) {
      if (map[task.status]) map[task.status].push(task)
      else map.todo.push(task)
    }
    for (const key of Object.keys(map)) {
      map[key].sort(
        (a, b) =>
          (Number(a.position) || 0) - (Number(b.position) || 0) ||
          String(a.createdAt).localeCompare(String(b.createdAt)),
      )
    }
    return map
  }, [tasks])

  const counts = useMemo(
    () => ({
      total: tasks.length,
      todo: grouped.todo.length,
      doing: grouped.doing.length,
      done: grouped.done.length,
    }),
    [tasks.length, grouped],
  )

  function openAdd(status = 'todo') {
    setDefaultStatus(status)
    setModalOpen(true)
  }

  async function removeTask(id) {
    const current = tasks.find((task) => task.id === id)
    setBusyId(id)
    setError('')
    try {
      await notifyPromise(api.deleteTask(id), {
        loadingTitle: 'Deleting task…',
        loadingMessage: current?.title || 'Removing from board',
        successTitle: 'Task deleted',
        successMessage: current
          ? `"${current.title}" was removed`
          : 'Task removed from the board',
        errorTitle: 'Delete failed',
      })
      setTasks((prev) => prev.filter((task) => task.id !== id))
    } catch (err) {
      setError(err.message || 'Failed to delete task')
    } finally {
      setBusyId(null)
    }
  }

  async function addTask(payload) {
    setError('')
    try {
      const data = await notifyPromise(
        api.createTask({
          ...payload,
          status: payload.status || defaultStatus,
        }),
        {
          loadingTitle: 'Creating task…',
          loadingMessage: payload.title || 'Saving to board',
          successTitle: 'Task created',
          successMessage: (result) =>
            `"${result.task.title}" added to ${
              STATUS_LABEL[result.task.status] || result.task.status
            }`,
          errorTitle: 'Create failed',
        },
      )
      setTasks((prev) => [data.task, ...prev])
      setModalOpen(false)
    } catch (err) {
      setError(err.message || 'Failed to create task')
      throw err
    }
  }

  function findTask(id) {
    return tasks.find((task) => task.id === id)
  }

  function resolveStatus(overId) {
    if (COLUMNS.some((col) => col.id === overId)) return overId
    const overTask = findTask(overId)
    return overTask?.status || null
  }

  async function moveTask(taskId, nextStatus, position = null) {
    const current = findTask(taskId)
    if (!current || (current.status === nextStatus && position === null)) return

    const previous = tasks
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: nextStatus,
              position: position ?? task.position,
            }
          : task,
      ),
    )
    setBusyId(taskId)
    setError('')

    try {
      const payload = { status: nextStatus }
      if (position !== null) payload.position = position
      const data = await notifyPromise(api.moveTask(taskId, payload), {
        loadingTitle: 'Moving task…',
        loadingMessage: `"${current.title}" → ${STATUS_LABEL[nextStatus]}`,
        successTitle: 'Task moved',
        successMessage: (result) =>
          `"${result.task.title}" is now in ${
            STATUS_LABEL[result.task.status] || result.task.status
          }`,
        errorTitle: 'Move failed',
      })
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? data.task : task)),
      )
    } catch (err) {
      setTasks(previous)
      setError(err.message || 'Failed to move task')
    } finally {
      setBusyId(null)
    }
  }

  function handleDragStart(event) {
    setActiveTask(findTask(event.active.id) || null)
  }

  function handleDragEnd(event) {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return

    const nextStatus = resolveStatus(over.id)
    if (!nextStatus) return
    moveTask(active.id, nextStatus)
  }

  function handleDragCancel() {
    setActiveTask(null)
  }

  return (
    <div className="board-page">
      <div className="page-head">
        <div>
          <h1>Board</h1>
          <p>
            {loading
              ? 'Loading board…'
              : `${counts.total} ${
                  counts.total === 1 ? 'task' : 'tasks'
                } · drag cards between columns`}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => openAdd('todo')}
        >
          Add task
        </button>
      </div>

      <div className="board-summary" aria-label="Board summary">
        <div className="board-stat board-stat-todo">
          <span className="board-stat-label">
            <span className="status-dot status-dot-todo" aria-hidden="true" />
            To do
          </span>
          <strong>{counts.todo}</strong>
        </div>
        <div className="board-stat board-stat-doing">
          <span className="board-stat-label">
            <span className="status-dot status-dot-doing" aria-hidden="true" />
            Doing
          </span>
          <strong>{counts.doing}</strong>
        </div>
        <div className="board-stat board-stat-done">
          <span className="board-stat-label">
            <span className="status-dot status-dot-done" aria-hidden="true" />
            Done
          </span>
          <strong>{counts.done}</strong>
        </div>
      </div>

      {error ? (
        <p className="form-error" role="alert" style={{ marginBottom: 12 }}>
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="empty-state">
          <h2>Loading</h2>
          <p>Building your board…</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="kanban-board">
            {COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={grouped[column.id]}
                busyId={busyId}
                onDelete={removeTask}
                onAdd={openAdd}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeTask ? (
              <div
                className={`kanban-card kanban-card-${activeTask.status} is-overlay`}
              >
                <div className="kanban-card-rail" aria-hidden="true" />
                <div className="kanban-card-body">
                  <h3>{activeTask.title}</h3>
                  {activeTask.notes ? <p>{activeTask.notes}</p> : null}
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <button
        type="button"
        className="fab"
        onClick={() => openAdd('todo')}
        aria-label="Add task"
      >
        +
      </button>

      <AddTaskModal
        open={modalOpen}
        defaultStatus={defaultStatus}
        onClose={() => setModalOpen(false)}
        onSubmit={addTask}
      />
    </div>
  )
}
