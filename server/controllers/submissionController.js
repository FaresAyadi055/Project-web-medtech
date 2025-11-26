import Submission from '../models/Submission.js'
import path from 'path'

export async function listAllSubmissions(req, res) {
  const list = await Submission.find().populate('student', 'name email profilePicture').populate('task', 'title')
  res.json(list)
}

export async function submitTask(req, res) {
  const { taskId, content } = req.body
  const attachments = (req.files || []).map(f => `/uploads/${path.basename(f.path)}`)
  const s = new Submission({ task: taskId, student: req.userId, content, attachments, submittedAt: new Date() })
  await s.save()
  res.json(s)
}

export async function listSubmissionsForTask(req, res) {
  const taskId = req.params.taskId
  const list = await Submission.find({ task: taskId }).populate('student', 'name email profilePicture')
  res.json(list)
}

export async function listSubmissionsForStudent(req, res) {
  const studentId = req.params.studentId || req.userId
  const list = await Submission.find({ student: studentId }).populate('task')
  res.json(list)
}

export async function gradeSubmission(req, res) {
  const { id } = req.params
  const { status, grade, feedback } = req.body
  const update = { status, gradedBy: req.userId }
  if (typeof grade !== 'undefined') update.grade = grade
  if (typeof feedback !== 'undefined') update.feedback = feedback
  const s = await Submission.findByIdAndUpdate(id, update, { new: true })
  res.json(s)
}
