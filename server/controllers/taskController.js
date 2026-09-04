import store from '../store.js'

export async function createTask(req, res) {
  const { title, description, classId } = req.body
  const t = store.createOne('tasks', {
    title,
    description,
    class: classId,
    createdBy: req.userId,
    attachments: [],
    comments: [],
    createdAt: new Date().toISOString()
  })
  store.updateById('classes', classId, { $addToSet: { tasks: t._id } })
  res.json(t)
}

export async function listTasksForClass(req, res) {
  const classId = req.params.classId
  const tasks = store.findAll('tasks', { class: classId }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  res.json(tasks)
}

export async function getTask(req, res) {
  const t = store.findById('tasks', req.params.id)
  if (!t) return res.status(404).json({ message: 'Not found' })
  const populated = {
    ...t,
    comments: (t.comments || []).map(c => ({
      ...c,
      author: c.author ? store.findById('users', c.author) : null
    }))
  }
  if (populated.comments) {
    populated.comments = populated.comments.map(c => ({
      ...c,
      author: c.author ? { _id: c.author._id, name: c.author.name, profilePicture: c.author.profilePicture } : null
    }))
  }
  res.json(populated)
}

export async function deleteTask(req, res) {
  store.deleteById('tasks', req.params.id)
  res.json({ message: 'deleted' })
}

export async function addComment(req, res) {
  const { id } = req.params
  const { content } = req.body
  if (!content || !content.trim()) return res.status(400).json({ message: 'Content required' })
  const t = store.findById('tasks', id)
  if (!t) return res.status(404).json({ message: 'Task not found' })
  const comment = { author: req.userId, content, createdAt: new Date().toISOString() }
  if (!t.comments) t.comments = []
  t.comments.push(comment)
  const author = store.findById('users', req.userId)
  res.json({ ...comment, author: author ? { _id: author._id, name: author.name, profilePicture: author.profilePicture } : null })
}
