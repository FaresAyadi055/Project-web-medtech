import express from 'express'
import { submitTask, listSubmissionsForTask, listSubmissionsForStudent, gradeSubmission } from '../controllers/submissionController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = express.Router()

router.use(requireAuth)
router.post('/', requireRole('student'), submitTask)
router.get('/task/:taskId', requireRole('teacher','admin'), listSubmissionsForTask)
router.get('/student/:studentId?', requireAuth, listSubmissionsForStudent)
router.post('/:id/grade', requireRole('teacher'), gradeSubmission)

export default router
