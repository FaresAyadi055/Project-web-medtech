import Submission from '../models/Submission.js'

export async function submitTask(req, res) {
  const { taskId, content } = req.body
  const s = new Submission({ task: taskId, student: req.userId, content })
  await s.save()
  res.json(s)
}

export async function listSubmissionsForTask(req, res) {
  const taskId = req.params.taskId
  const list = await Submission.find({ task: taskId }).populate('student', 'name email')
  res.json(list)
}

export async function listSubmissionsForStudent(req, res) {
  const studentId = req.params.studentId || req.userId
  const list = await Submission.find({ student: studentId }).populate('task')
  res.json(list)
}

export async function gradeSubmission(req, res) {
  const { id } = req.params
  const { status } = req.body
  const s = await Submission.findByIdAndUpdate(id, { status, gradedBy: req.userId }, { new: true })
  res.json(s)
}
