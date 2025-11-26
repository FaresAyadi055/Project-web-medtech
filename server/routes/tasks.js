import express from 'express'
import { createTask, listTasksForClass, getTask, deleteTask } from '../controllers/taskController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = express.Router()

router.use(requireAuth)
router.post('/', requireRole('teacher','admin'), createTask)
router.get('/class/:classId', requireAuth, listTasksForClass)
router.get('/:id', requireAuth, getTask)
router.delete('/:id', requireRole('teacher','admin'), deleteTask)

export default router
