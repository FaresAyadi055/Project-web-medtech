import express from 'express'
import { createClass, listClasses, getClass, enrollStudent, removeStudent, enrollSelf, assignTeacher, removeTeacher, deleteClass } from '../controllers/classController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = express.Router()

router.use(requireAuth)
// Admin routes
router.post('/', requireRole('admin'), createClass)
router.get('/', requireRole('admin','teacher'), listClasses)
router.get('/:id', requireRole('admin','teacher'), getClass)
router.post('/:id/enroll', requireRole('teacher','admin'), enrollStudent)
router.post('/:id/remove-student', requireRole('teacher','admin'), removeStudent)
router.post('/:id/enroll-self', requireRole('student'), enrollSelf)
router.post('/:id/assign-teacher', requireRole('admin'), assignTeacher)
router.post('/:id/remove-teacher', requireRole('admin'), removeTeacher)
router.delete('/:id', requireRole('admin'), deleteClass)

export default router
