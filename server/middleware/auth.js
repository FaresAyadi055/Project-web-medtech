import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ message: 'Missing Authorization header' })
  const token = authHeader.replace(/^Bearer\s+/, '')
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = payload.id
    req.userRole = payload.role
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export function requireRole(...allowed) {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId)
      if (!user) return res.status(404).json({ message: 'User not found' })
      if (!allowed.includes(user.role)) return res.status(403).json({ message: 'Forbidden' })
      next()
    } catch (err) {
      next(err)
    }
  }
}
