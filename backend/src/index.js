import express from 'express'
import cors from 'cors'
import { config } from './config.js'
import { storageDriver } from './db.js'
import authRoutes from './routes/auth.js'
import boardRoutes from './routes/board.js'
import taskRoutes from './routes/tasks.js'
import userRoutes from './routes/users.js'

const app = express()

app.use(cors({ origin: true }))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'taskflow-api',
    version: '0.3.0',
    storage: storageDriver,
    features: ['auth', 'profile', 'tasks', 'board', 'kanban-move', 'supabase'],
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/board', boardRoutes)

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` })
})

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(config.port, () => {
  console.log(`TaskFlow API running on http://localhost:${config.port}`)
  console.log(`Storage: ${storageDriver}`)
})
