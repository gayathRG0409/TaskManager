import { Router } from 'express'
import { STATUS_SET } from '../constants.js'
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  moveTask,
  nextPosition,
  publicTask,
  updateTask,
} from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/', async (req, res) => {
  try {
    const tasks = (await listTasks(req.user.id)).map(publicTask)
    return res.json({ tasks })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to load tasks' })
  }
})

router.post('/', async (req, res) => {
  try {
    const title = String(req.body?.title || '').trim()
    const notes = String(req.body?.notes || '').trim()
    const status = String(req.body?.status || 'todo')
    const due = String(req.body?.due || '').trim()

    if (!title) {
      return res.status(400).json({ error: 'Title is required' })
    }
    if (!STATUS_SET.has(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const task = await createTask({
      userId: req.user.id,
      title,
      notes,
      status,
      due: due || null,
    })

    return res.status(201).json({ task: publicTask(task) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to create task' })
  }
})

router.patch('/:id/move', async (req, res) => {
  try {
    const status = String(req.body?.status || '')
    const position =
      req.body?.position === undefined || req.body?.position === null
        ? null
        : Number(req.body.position)

    if (!STATUS_SET.has(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }
    if (position !== null && (!Number.isFinite(position) || position < 0)) {
      return res.status(400).json({ error: 'Invalid position' })
    }

    const task = await moveTask(req.user.id, req.params.id, status, position)
    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }

    return res.json({ task: publicTask(task) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to move task' })
  }
})

router.patch('/:id', async (req, res) => {
  try {
    const existing = await getTask(req.user.id, req.params.id)
    if (!existing) {
      return res.status(404).json({ error: 'Task not found' })
    }

    const fields = {}

    if (req.body?.title !== undefined) {
      const title = String(req.body.title).trim()
      if (!title) return res.status(400).json({ error: 'Title is required' })
      fields.title = title
    }
    if (req.body?.notes !== undefined) {
      fields.notes = String(req.body.notes).trim()
    }
    if (req.body?.status !== undefined) {
      const status = String(req.body.status)
      if (!STATUS_SET.has(status)) {
        return res.status(400).json({ error: 'Invalid status' })
      }
      if (status !== existing.status) {
        fields.status = status
        fields.position = await nextPosition(req.user.id, status)
      }
    }
    if (req.body?.due !== undefined) {
      const due = String(req.body.due || '').trim()
      fields.due = due || null
    }
    if (req.body?.position !== undefined) {
      const position = Number(req.body.position)
      if (!Number.isFinite(position) || position < 0) {
        return res.status(400).json({ error: 'Invalid position' })
      }
      fields.position = position
    }

    const task = await updateTask(req.user.id, req.params.id, fields)
    return res.json({ task: publicTask(task) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to update task' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const ok = await deleteTask(req.user.id, req.params.id)
    if (!ok) {
      return res.status(404).json({ error: 'Task not found' })
    }
    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to delete task' })
  }
})

export default router
