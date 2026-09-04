import store from '../store.js'

export async function listUsers(req, res) {
  const users = store.findAll('users').map(({ password, ...u }) => u)
  res.json(users)
}

export async function getUser(req, res) {
  const u = store.findById('users', req.params.id)
  if (!u) return res.status(404).json({ message: 'Not found' })
  const { password, ...safe } = u
  res.json(safe)
}

export async function updateUser(req, res) {
  const patch = { ...req.body }
  delete patch.password
  const u = store.updateById('users', req.params.id, patch)
  if (!u) return res.status(404).json({ message: 'Not found' })
  const { password, ...safe } = u
  res.json(safe)
}

export async function deleteUser(req, res) {
  store.deleteById('users', req.params.id)
  res.json({ message: 'deleted' })
}
