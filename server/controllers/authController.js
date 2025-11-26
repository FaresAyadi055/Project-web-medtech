import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })
}

export async function register(req, res) {
  const { name, email, password, role } = req.body
  if (!name || !email || !password) return res.status(400).json({ message: 'name, email and password required' })
  try {
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ message: 'Email already in use' })
    const hashed = await bcrypt.hash(password, 10)
    const profilePicture = req.file ? `/uploads/${req.file.filename}` : undefined
    const user = new User({ name, email, password: hashed, role: role || 'student', profilePicture })
    await user.save()
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
    const user = await User.findOne({ email })
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
    const user = await User.findById(req.userId).select('-password')
    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
