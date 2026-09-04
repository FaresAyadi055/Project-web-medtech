let db = null
let currentUser = null
let token = null

async function loadDB() {
  if (db) return db
  const resp = await fetch('/seed-data.json')
  const data = await resp.json()
  db = {
    users: data.users || [],
    classes: data.classes || [],
    tasks: data.tasks || [],
    submissions: data.submissions || [],
  }
  return db
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

function matchQuery(item, query) {
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) continue
    if (item[key] !== value) return false
  }
  return true
}

function findBy(collection, query) {
  return db[collection].filter(item => matchQuery(item, query))
}

function findOne(collection, query) {
  return db[collection].find(item => matchQuery(item, query)) || null
}

function findById(collection, id) {
  return db[collection].find(item => item._id === id) || null
}

function populateUser(user) {
  if (!user) return null
  const { password, ...safe } = user
  return safe
}

function populateClass(cls) {
  if (!cls) return null
  const teacher = cls.teacher ? findById('users', cls.teacher) : null
  const students = (cls.students || []).map(sid => findById('users', sid)).filter(Boolean).map(populateUser)
  return {
    ...cls,
    teacher: teacher ? { _id: teacher._id, name: teacher.name, email: teacher.email } : null,
    students
  }
}

function populateTask(task) {
  if (!task) return null
  return {
    ...task,
    comments: (task.comments || []).map(c => ({
      ...c,
      author: c.author ? populateUser(findById('users', c.author)) : null
    }))
  }
}

function populateSubmission(s) {
  if (!s) return null
  const student = s.student ? populateUser(findById('users', s.student)) : null
  const task = s.task ? findById('tasks', s.task) : null
  return {
    ...s,
    student,
    task: task ? { _id: task._id, title: task.title } : null
  }
}

function saveDB() {
  try {
    localStorage.setItem('unitasks_db', JSON.stringify(db))
  } catch (e) {}
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem('unitasks_db')
    if (raw) {
      db = JSON.parse(raw)
      return true
    }
  } catch (e) {}
  return false
}

// Simulated API that matches axios-style responses
const api = {
  async get(url) {
    await loadDB()

    // Auth endpoints
    if (url === '/auth/me') {
      const stored = localStorage.getItem('uni_tasks_auth_user')
      if (!stored) throw { response: { data: { message: 'Not authenticated' } } }
      const parsed = JSON.parse(stored)
      const user = findById('users', parsed.uid)
      if (!user) throw { response: { data: { message: 'User not found' } } }
      return { data: { user: populateUser(user) } }
    }

    // Users
    if (url === '/users') {
      return { data: db.users.map(populateUser) }
    }

    // Classes
    if (url === '/classes') {
      return { data: db.classes.map(populateClass) }
    }

    // Tasks by class
    const taskClassMatch = url.match(/^\/tasks\/class\/(.+)$/)
    if (taskClassMatch) {
      const tasks = findBy('tasks', { class: taskClassMatch[1] })
      return { data: tasks.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)) }
    }

    // Single task
    const taskMatch = url.match(/^\/tasks\/([^/]+)$/)
    if (taskMatch) {
      const task = findById('tasks', taskMatch[1])
      if (!task) throw { response: { data: { message: 'Not found' } } }
      return { data: populateTask(task) }
    }

    // Submissions for task
    const subTaskMatch = url.match(/^\/submissions\/task\/(.+)$/)
    if (subTaskMatch) {
      const subs = findBy('submissions', { task: subTaskMatch[1] })
      return { data: subs.map(populateSubmission) }
    }

    // Submissions for student
    const subStudentMatch = url.match(/^\/submissions\/student(?:\/(.+))?$/)
    if (subStudentMatch) {
      const studentId = subStudentMatch[1] || currentUser?.uid
      const subs = findBy('submissions', { student: studentId })
      return { data: subs.map(populateSubmission) }
    }

    // All submissions
    if (url === '/submissions') {
      return { data: db.submissions.map(populateSubmission) }
    }

    return { data: null }
  },

  async post(url, body) {
    await loadDB()

    // Login
    if (url === '/auth/login') {
      const { email, password } = body
      const user = findOne('users', { email })
      if (!user) throw { response: { data: { message: 'Invalid credentials' } } }
      // In demo mode, accept the stored plaintext password from seed data
      const seedResp = await fetch('/seed-data.json')
      const seedData = await seedResp.json()
      const seedUser = seedData.users.find(u => u.email === email)
      if (!seedUser || seedUser.password !== password) {
        throw { response: { data: { message: 'Invalid credentials' } } }
      }
      const tk = 'demo_token_' + genId()
      return { data: { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token: tk } }
    }

    // Register (disabled in demo)
    if (url === '/auth/register') {
      throw { response: { data: { message: 'Registration disabled in demo mode' } } }
    }

    // Create class
    if (url === '/classes' && body.name) {
      const c = { _id: genId(), name: body.name, teacher: body.teacher || null, students: [], tasks: [] }
      db.classes.push(c)
      saveDB()
      return { data: c }
    }

    // Enroll student
    const enrollMatch = url.match(/^\/classes\/(.+)\/enroll$/)
    if (enrollMatch) {
      const cls = findById('classes', enrollMatch[1])
      if (!cls) throw { response: { data: { message: 'Class not found' } } }
      if (!cls.students.includes(body.studentId)) cls.students.push(body.studentId)
      const user = findById('users', body.studentId)
      if (user && !user.classes.includes(cls._id)) user.classes.push(cls._id)
      saveDB()
      return { data: populateClass(cls) }
    }

    // Enroll self
    const enrollSelfMatch = url.match(/^\/classes\/(.+)\/enroll-self$/)
    if (enrollSelfMatch) {
      const cls = findById('classes', enrollSelfMatch[1])
      if (!cls) throw { response: { data: { message: 'Class not found' } } }
      if (!cls.students.includes(currentUser.uid)) cls.students.push(currentUser.uid)
      const user = findById('users', currentUser.uid)
      if (user && !user.classes.includes(cls._id)) user.classes.push(cls._id)
      saveDB()
      return { data: populateClass(cls) }
    }

    // Remove student
    const removeStudentMatch = url.match(/^\/classes\/(.+)\/remove-student$/)
    if (removeStudentMatch) {
      const cls = findById('classes', removeStudentMatch[1])
      if (!cls) throw { response: { data: { message: 'Class not found' } } }
      cls.students = cls.students.filter(s => s !== body.studentId)
      saveDB()
      return { data: populateClass(cls) }
    }

    // Assign teacher
    const assignTeacherMatch = url.match(/^\/classes\/(.+)\/assign-teacher$/)
    if (assignTeacherMatch) {
      const cls = findById('classes', assignTeacherMatch[1])
      if (!cls) throw { response: { data: { message: 'Class not found' } } }
      cls.teacher = body.teacherId
      saveDB()
      return { data: populateClass(cls) }
    }

    // Remove teacher
    const removeTeacherMatch = url.match(/^\/classes\/(.+)\/remove-teacher$/)
    if (removeTeacherMatch) {
      const cls = findById('classes', removeTeacherMatch[1])
      if (!cls) throw { response: { data: { message: 'Class not found' } } }
      cls.teacher = null
      saveDB()
      return { data: populateClass(cls) }
    }

    // Create task
    if (url === '/tasks') {
      const t = { _id: genId(), title: body.title, description: body.description, class: body.classId, createdBy: currentUser.uid, attachments: [], comments: [], createdAt: new Date().toISOString() }
      db.tasks.push(t)
      const cls = findById('classes', body.classId)
      if (cls && !cls.tasks.includes(t._id)) cls.tasks.push(t._id)
      saveDB()
      return { data: t }
    }

    // Add comment
    const commentMatch = url.match(/^\/tasks\/(.+)\/comments$/)
    if (commentMatch) {
      const task = findById('tasks', commentMatch[1])
      if (!task) throw { response: { data: { message: 'Task not found' } } }
      const comment = { author: currentUser.uid, content: body.content, createdAt: new Date().toISOString() }
      if (!task.comments) task.comments = []
      task.comments.push(comment)
      saveDB()
      const author = findById('users', currentUser.uid)
      return { data: { ...comment, author: author ? { _id: author._id, name: author.name, profilePicture: author.profilePicture } : null } }
    }

    // Delete task
    const deleteTaskMatch = url.match(/^\/tasks\/(.+)$/)
    if (deleteTaskMatch && !url.includes('comments')) {
      db.tasks = db.tasks.filter(t => t._id !== deleteTaskMatch[1])
      saveDB()
      return { data: { message: 'deleted' } }
    }

    // Submit task
    if (url === '/submissions') {
      const s = { _id: genId(), task: body.taskId, student: currentUser.uid, content: body.content, attachments: [], status: 'pending', grade: null, feedback: null, gradedBy: null, submittedAt: new Date().toISOString() }
      db.submissions.push(s)
      saveDB()
      return { data: s }
    }

    // Grade submission
    const gradeMatch = url.match(/^\/submissions\/(.+)\/grade$/)
    if (gradeMatch) {
      const sub = findById('submissions', gradeMatch[1])
      if (!sub) throw { response: { data: { message: 'Submission not found' } } }
      sub.status = body.status
      sub.gradedBy = currentUser.uid
      if (typeof body.grade !== 'undefined') sub.grade = body.grade
      if (typeof body.feedback !== 'undefined') sub.feedback = body.feedback
      saveDB()
      return { data: sub }
    }

    return { data: null }
  },

  async put(url, body) {
    await loadDB()

    // Update user profile
    const userMatch = url.match(/^\/users\/(.+)$/)
    if (userMatch) {
      const user = findById('users', userMatch[1])
      if (!user) throw { response: { data: { message: 'Not found' } } }
      Object.assign(user, body)
      saveDB()
      return { data: populateUser(user) }
    }

    return { data: null }
  },

  async delete(url) {
    await loadDB()

    // Delete user
    const userMatch = url.match(/^\/users\/(.+)$/)
    if (userMatch) {
      db.users = db.users.filter(u => u._id !== userMatch[1])
      saveDB()
      return { data: { message: 'deleted' } }
    }

    // Delete class
    const classMatch = url.match(/^\/classes\/(.+)$/)
    if (classMatch) {
      db.classes = db.classes.filter(c => c._id !== classMatch[1])
      saveDB()
      return { data: { message: 'deleted' } }
    }

    return { data: null }
  }
}

// Set current user for requests
api.setCurrentUser = (user) => { currentUser = user }

export default api
