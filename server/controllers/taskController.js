import Task from '../models/Task.js'
import ClassModel from '../models/Class.js'

export async function createTask(req, res) {
  const { title, description, classId } = req.body
  const t = new Task({ title, description, class: classId, createdBy: req.userId })
  await t.save()
  await ClassModel.findByIdAndUpdate(classId, { $addToSet: { tasks: t._id } })
  res.json(t)
}

export async function listTasksForClass(req, res) {
  const classId = req.params.classId
  const tasks = await Task.find({ class: classId }).sort({ createdAt: -1 })
  res.json(tasks)
}

export async function getTask(req, res) {
  const t = await Task.findById(req.params.id)
  if (!t) return res.status(404).json({ message: 'Not found' })
  res.json(t)
}

export async function deleteTask(req, res) {
  await Task.findByIdAndDelete(req.params.id)
  res.json({ message: 'deleted' })
}
