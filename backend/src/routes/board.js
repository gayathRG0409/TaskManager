import { Router } from 'express'
import { BOARD_COLUMNS } from '../constants.js'
import { listTasks, publicTask } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/', async (req, res) => {
  try {
    const mine = await listTasks(req.user.id)

    const columns = BOARD_COLUMNS.map((column) => {
      const tasks = mine
        .filter((task) => task.status === column.id)
        .map(publicTask)
      return {
        id: column.id,
        label: column.label,
        count: tasks.length,
        tasks,
      }
    })

    return res.json({
      columns,
      totals: {
        total: mine.length,
        todo: columns[0].count,
        doing: columns[1].count,
        done: columns[2].count,
      },
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to load board' })
  }
})

export default router
