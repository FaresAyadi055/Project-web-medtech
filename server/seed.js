import dotenv from 'dotenv'
dotenv.config()

import connectDB from './config/db.js'
import User from './models/User.js'
import ClassModel from './models/Class.js'
import Task from './models/Task.js'
import Submission from './models/Submission.js'
import bcrypt from 'bcrypt'

const seed = async () => {
  await connectDB()
  console.log('Seeding demo data...')

  // Clear existing
  await User.deleteMany({})
  await ClassModel.deleteMany({})
  await Task.deleteMany({})
  await Submission.deleteMany({})

  const hash = await bcrypt.hash('password123', 10)
  const admin = await User.create({ name: 'Admin User', email: 'admin@local', password: hash, role: 'admin' })
  const teacher = await User.create({ name: 'Prof Alice', email: 'alice@local', password: hash, role: 'teacher' })
  const student = await User.create({ name: 'Student Bob', email: 'bob@local', password: hash, role: 'student' })

  const klass = await ClassModel.create({ name: 'CS101', teacher: teacher._id, students: [student._id] })

  teacher.classes.push(klass._id)
  student.classes.push(klass._id)
  await teacher.save()
  await student.save()

  const task = await Task.create({ title: 'Intro Assignment', description: 'Write hello world', class: klass._id, createdBy: teacher._id })
  klass.tasks.push(task._id)
  await klass.save()

  await Submission.create({ task: task._id, student: student._id, content: 'My solution', status: 'pending' })

  console.log('Seed complete: admin@local / alice@local / bob@local (all password: password123)')
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
