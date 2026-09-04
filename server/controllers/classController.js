import store from '../store.js'

export async function createClass(req, res) {
  const { name, teacher } = req.body
  const c = store.createOne('classes', { name, teacher: teacher || null, students: [], tasks: [] })
  if (teacher) {
    store.updateById('users', teacher, { $addToSet: { classes: c._id } })
  }
  res.json(c)
}

export async function listClasses(req, res) {
  const classes = store.findAll('classes').map(c => {
    const teacher = c.teacher ? store.findById('users', c.teacher) : null
    const students = (c.students || []).map(sid => store.findById('users', sid)).filter(Boolean).map(({ password, ...u }) => u)
    return { ...c, teacher: teacher ? { _id: teacher._id, name: teacher.name, email: teacher.email } : null, students }
  })
  res.json(classes)
}

export async function getClass(req, res) {
  const c = store.findById('classes', req.params.id)
  if (!c) return res.status(404).json({ message: 'Not found' })
  const teacher = c.teacher ? store.findById('users', c.teacher) : null
  const students = (c.students || []).map(sid => store.findById('users', sid)).filter(Boolean).map(({ password, ...u }) => u)
  res.json({ ...c, teacher: teacher ? { _id: teacher._id, name: teacher.name, email: teacher.email } : null, students })
}

export async function enrollStudent(req, res) {
  const { studentId } = req.body
  store.updateById('classes', req.params.id, { $addToSet: { students: studentId } })
  store.updateById('users', studentId, { $addToSet: { classes: req.params.id } })
  const c = store.findById('classes', req.params.id)
  res.json(c)
}

export async function removeStudent(req, res) {
  const { studentId } = req.body
  store.updateById('classes', req.params.id, { $pull: { students: studentId } })
  store.updateById('users', studentId, { $pull: { classes: req.params.id } })
  const c = store.findById('classes', req.params.id)
  res.json(c)
}

export async function enrollSelf(req, res) {
  const studentId = req.userId
  store.updateById('classes', req.params.id, { $addToSet: { students: studentId } })
  store.updateById('users', studentId, { $addToSet: { classes: req.params.id } })
  const c = store.findById('classes', req.params.id)
  res.json(c)
}

export async function assignTeacher(req, res) {
  const { teacherId } = req.body
  store.updateById('classes', req.params.id, { teacher: teacherId })
  store.updateById('users', teacherId, { $addToSet: { classes: req.params.id } })
  const c = store.findById('classes', req.params.id)
  res.json(c)
}

export async function removeTeacher(req, res) {
  store.updateById('classes', req.params.id, { teacher: null })
  const c = store.findById('classes', req.params.id)
  res.json(c)
}

export async function deleteClass(req, res) {
  store.deleteById('classes', req.params.id)
  res.json({ message: 'deleted' })
}
