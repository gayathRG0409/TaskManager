import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { isEmail } from '../constants.js'
import {
  createUser,
  findUserByEmail,
  publicUser,
} from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

function signToken(userId) {
  return jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: '7d' })
}

router.post('/register', async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim()
    const email = String(req.body?.email || '').trim().toLowerCase()
    const password = String(req.body?.password || '')

    if (!name || !email || password.length < 6) {
      return res.status(400).json({
        error: 'Name, email, and password (6+ chars) are required',
      })
    }
    if (!isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await createUser({ name, email, passwordHash })

    return res.status(201).json({ token: signToken(user.id), user: publicUser(user) })
  } catch (err) {
    if (err.code === 'EMAIL_TAKEN') {
      return res.status(409).json({ error: 'Email already registered' })
    }
    if (err.code === 'SCHEMA_MISSING') {
      console.error(err)
      return res.status(503).json({ error: err.message })
    }
    console.error(err)
    return res.status(500).json({ error: 'Registration failed' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase()
    const password = String(req.body?.password || '')

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = await findUserByEmail(email)
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    return res.json({ token: signToken(user.id), user: publicUser(user) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Login failed' })
  }
})

router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: req.user })
})

export default router
