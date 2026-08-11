import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { findUserById, publicUser } from '../db.js'

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret)
    const user = await findUserById(payload.sub)
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }
    req.user = publicUser(user)
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
