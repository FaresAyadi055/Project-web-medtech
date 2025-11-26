import express from 'express'
import upload from '../middleware/upload.js'
const router = express.Router()

// POST /api/uploads - upload multiple files and return urls
router.post('/', upload.array('files', 12), (req, res) => {
  const urls = (req.files || []).map(f => `/uploads/${f.filename}`)
  res.json({ urls })
})

export default router
