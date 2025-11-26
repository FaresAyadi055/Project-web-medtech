import ClassModel from '../models/Class.js'
import User from '../models/User.js'

export async function createClass(req, res) {
  const { name, teacher } = req.body
  const c = new ClassModel({ name, teacher })
  await c.save()
  // attach to teacher
  if (teacher) {
    await User.findByIdAndUpdate(teacher, { $addToSet: { classes: c._id } })
  }
  res.json(c)
}

export async function listClasses(req, res) {
  const classes = await ClassModel.find().populate('teacher', 'name email').populate('students', 'name email')
  res.json(classes)
}

export async function getClass(req, res) {
  const c = await ClassModel.findById(req.params.id).populate('teacher', 'name email').populate('students', 'name email')
  if (!c) return res.status(404).json({ message: 'Not found' })
  res.json(c)
}

export async function enrollStudent(req, res) {
  const { studentId } = req.body
  const c = await ClassModel.findByIdAndUpdate(req.params.id, { $addToSet: { students: studentId } }, { new: true })
  await User.findByIdAndUpdate(studentId, { $addToSet: { classes: c._id } })
  res.json(c)
}

export async function removeStudent(req, res) {
  const { studentId } = req.body
  const c = await ClassModel.findByIdAndUpdate(req.params.id, { $pull: { students: studentId } }, { new: true })
  await User.findByIdAndUpdate(studentId, { $pull: { classes: c._id } })
  res.json(c)
}

export async function enrollSelf(req, res) {
  const studentId = req.userId
  const c = await ClassModel.findByIdAndUpdate(req.params.id, { $addToSet: { students: studentId } }, { new: true })
  await User.findByIdAndUpdate(studentId, { $addToSet: { classes: c._id } })
  res.json(c)
}

export async function assignTeacher(req, res) {
  const { teacherId } = req.body
  const c = await ClassModel.findByIdAndUpdate(req.params.id, { teacher: teacherId }, { new: true })
  // Optionally update teacher's classes
  await User.findByIdAndUpdate(teacherId, { $addToSet: { classes: c._id } })
  res.json(c)
}

export async function removeTeacher(req, res) {
  const c = await ClassModel.findByIdAndUpdate(req.params.id, { teacher: null }, { new: true })
  res.json(c)
}

export async function deleteClass(req, res) {
  await ClassModel.findByIdAndDelete(req.params.id)
  res.json({ message: 'deleted' })
}
