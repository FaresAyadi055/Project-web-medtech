import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import store from '../store.js'

const JWT_SECRET = process.env.JWT_SECRET || 'demo-jwt-secret-key-2026'

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
}

export async function register(req, res) {
  const { name, email, password, role } = req.body
  if (!name || !email || !password) return res.status(400).json({ message: 'name, email and password required' })
  try {
    const existing = store.findOne('users', { email })
    if (existing) return res.status(409).json({ message: 'Email already in use' })
    const hashed = await bcrypt.hash(password, 10)
    const profilePicture = req.file ? `/uploads/${req.file.filename}` : undefined
    const user = store.createOne('users', { name, email, password: hashed, role: role || 'student', profilePicture, classes: [] })
    const token = generateToken(user)
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, profilePicture: user.profilePicture }, token })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export async function login(req, res) {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ message: 'email and password required' })
  try {
    const user = store.findOne('users', { email })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' })
    const token = generateToken(user)
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export async function me(req, res) {
  try {
    const user = store.findById('users', req.userId)
    if (!user) return res.status(404).json({ message: 'User not found' })
    const { password, ...safe } = user
    res.json({ user: safe })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
