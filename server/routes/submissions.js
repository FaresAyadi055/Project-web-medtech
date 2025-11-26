import express from 'express'
import { listAllSubmissions, submitTask, listSubmissionsForTask, listSubmissionsForStudent, gradeSubmission } from '../controllers/submissionController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import upload from '../middleware/upload.js'

const router = express.Router()

router.use(requireAuth)
router.get('/', requireRole('admin'), listAllSubmissions)
router.post('/', requireRole('student'), upload.array('attachments', 6), submitTask)
router.get('/task/:taskId', requireRole('teacher','admin'), listSubmissionsForTask)
router.get('/student/:studentId?', requireAuth, listSubmissionsForStudent)
router.post('/:id/grade', requireRole('teacher'), gradeSubmission)

export default router
