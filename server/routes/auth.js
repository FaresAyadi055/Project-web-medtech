import express from 'express'
import { register, login, me } from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'
import upload from '../middleware/upload.js'

const router = express.Router()

router.post('/register', upload.single('profilePicture'), register)
router.post('/login', login)
router.get('/me', requireAuth, me)

export default router
