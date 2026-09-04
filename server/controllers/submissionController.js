import store from '../store.js'

export async function listAllSubmissions(req, res) {
  const list = store.findAll('submissions').map(s => {
    const student = s.student ? store.findById('users', s.student) : null
    const task = s.task ? store.findById('tasks', s.task) : null
    return {
      ...s,
      student: student ? { _id: student._id, name: student.name, email: student.email, profilePicture: student.profilePicture } : null,
      task: task ? { _id: task._id, title: task.title } : null
    }
  })
  res.json(list)
}

export async function submitTask(req, res) {
  const { taskId, content } = req.body
  const s = store.createOne('submissions', {
    task: taskId,
    student: req.userId,
    content,
    attachments: [],
    status: 'pending',
    grade: null,
    feedback: null,
    gradedBy: null,
    submittedAt: new Date().toISOString()
  })
  res.json(s)
}

export async function listSubmissionsForTask(req, res) {
  const taskId = req.params.taskId
  const list = store.findAll('submissions', { task: taskId }).map(s => {
    const student = s.student ? store.findById('users', s.student) : null
    return {
      ...s,
      student: student ? { _id: student._id, name: student.name, email: student.email, profilePicture: student.profilePicture } : null
    }
  })
  res.json(list)
}

export async function listSubmissionsForStudent(req, res) {
  const studentId = req.params.studentId || req.userId
  const list = store.findAll('submissions', { student: studentId }).map(s => {
    const task = s.task ? store.findById('tasks', s.task) : null
    return { ...s, task: task ? { _id: task._id, title: task.title } : null }
  })
  res.json(list)
}

export async function gradeSubmission(req, res) {
  const { id } = req.params
  const { status, grade, feedback } = req.body
  const update = { status, gradedBy: req.userId }
  if (typeof grade !== 'undefined') update.grade = grade
  if (typeof feedback !== 'undefined') update.feedback = feedback
  const s = store.updateById('submissions', id, update)
  res.json(s)
}
