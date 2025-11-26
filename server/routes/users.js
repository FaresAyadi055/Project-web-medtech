import express from 'express'
import { listUsers, getUser, updateUser, deleteUser } from '../controllers/userController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = express.Router()

router.use(requireAuth)
router.get('/', requireRole('admin'), listUsers)
router.get('/:id', requireRole('admin'), getUser)
router.put('/:id', requireRole('admin'), updateUser)
router.delete('/:id', requireRole('admin'), deleteUser)

export default router
