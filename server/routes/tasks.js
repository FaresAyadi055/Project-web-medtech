import express from 'express'
import { createTask, listTasksForClass, getTask, deleteTask, addComment } from '../controllers/taskController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import upload from '../middleware/upload.js'

const router = express.Router()

router.use(requireAuth)
router.post('/', requireRole('teacher','admin'), upload.array('attachments', 6), createTask)
router.get('/class/:classId', requireAuth, listTasksForClass)
router.get('/:id', requireAuth, getTask)
router.post('/:id/comments', requireAuth, addComment)
router.delete('/:id', requireRole('teacher','admin'), deleteTask)

export default router
