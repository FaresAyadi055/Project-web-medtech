import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { loadSeedData } from './store.js'

import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import classRoutes from './routes/classes.js'
import taskRoutes from './routes/tasks.js'
import submissionRoutes from './routes/submissions.js'
import uploadRoutes from './routes/uploads.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.join(__dirname, '..')

const startServer = async () => {
  loadSeedData()

  const { default: bcrypt } = await import('bcrypt')
  const store = (await import('./store.js')).default
  const users = store.getCollection('users')
  for (const user of users) {
    if (user.password && !user.password.startsWith('$2')) {
      user.password = await bcrypt.hash(user.password, 10)
    }
  }

  const app = express()
  const PORT = process.env.PORT || 4000

  const corsOptions = {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    optionsSuccessStatus: 200,
  }

  app.use(cors(corsOptions))
  app.use(express.json({ limit: '5mb' }))

  app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`)
    next()
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/classes', classRoutes)
  app.use('/api/tasks', taskRoutes)
  app.use('/api/submissions', submissionRoutes)
  app.use('/api/uploads', uploadRoutes)

  // Serve built frontend in production
  const distPath = path.join(ROOT_DIR, 'dist')
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath))
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'))
    })
  } else {
    app.get('/', (req, res) => res.json({ ok: true, message: 'UniTasks API Server (Demo Mode)' }))
    app.use('*', (req, res) => {
      res.status(404).json({ message: 'Route not found' })
    })
  }

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('Error:', err)
    res.status(err.status || 500).json({
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    })
  })

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} (Demo Mode - No Database Required)`)
  })
}

startServer().catch(err => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
