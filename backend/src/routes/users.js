import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { isEmail } from '../constants.js'
import { publicUser, taskStats, updateUser } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/me', async (req, res) => {
  try {
    const stats = await taskStats(req.user.id)
    return res.json({ user: req.user, stats })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to load profile' })
  }
})

router.patch('/me', async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim()
    const email = String(req.body?.email || '').trim().toLowerCase()

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' })
    }
    if (!isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' })
    }

    const fields = { name, email }

    if (req.body?.password) {
      const password = String(req.body.password)
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be 6+ characters' })
      }
      fields.passwordHash = await bcrypt.hash(password, 10)
    }

    const user = await updateUser(req.user.id, fields)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.json({ user: publicUser(user) })
  } catch (err) {
    if (err.code === 'EMAIL_TAKEN') {
      return res.status(409).json({ error: 'Email already in use' })
    }
    console.error(err)
    return res.status(500).json({ error: 'Failed to update profile' })
  }
})

export default router
