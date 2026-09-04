import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SEED_FILE = path.join(__dirname, 'seed-data.json')

let db = { users: [], classes: [], tasks: [], submissions: [] }

export function loadSeedData() {
  const raw = fs.readFileSync(SEED_FILE, 'utf-8')
  const data = JSON.parse(raw)
  db.users = data.users || []
  db.classes = data.classes || []
  db.tasks = data.tasks || []
  db.submissions = data.submissions || []
  console.log(`Loaded seed data: ${db.users.length} users, ${db.classes.length} classes, ${db.tasks.length} tasks, ${db.submissions.length} submissions`)
}

export function getCollection(name) {
  return db[name] || []
}

function genId(prefix) {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 10)
  return `${prefix}${ts}${rand}`.slice(0, 24)
}

export function findAll(collection, query = {}) {
  let items = db[collection] || []
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) continue
    items = items.filter(item => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return JSON.stringify(item[key]) === JSON.stringify(value)
      }
      return item[key] === value
    })
  }
  return items
}

export function findById(collection, id) {
  return (db[collection] || []).find(item => item._id === id) || null
}

export function findOne(collection, query) {
  return (db[collection] || []).find(item => {
    return Object.entries(query).every(([key, value]) => item[key] === value)
  }) || null
}

export function createOne(collection, data) {
  const doc = { _id: data._id || genId('doc'), ...data }
  db[collection].push(doc)
  return doc
}

export function updateById(collection, id, update) {
  const idx = (db[collection] || []).findIndex(item => item._id === id)
  if (idx === -1) return null

  const item = db[collection][idx]

  for (const [key, value] of Object.entries(update)) {
    if (key === '$addToSet') {
      for (const [field, val] of Object.entries(value)) {
        if (!Array.isArray(item[field])) item[field] = []
        if (!item[field].includes(val)) item[field].push(val)
      }
    } else if (key === '$pull') {
      for (const [field, val] of Object.entries(value)) {
        if (Array.isArray(item[field])) {
          item[field] = item[field].filter(v => v !== val)
        }
      }
    } else if (key === '$set') {
      Object.assign(item, value)
    } else {
      item[key] = value
    }
  }

  return item
}

export function deleteById(collection, id) {
  const idx = (db[collection] || []).findIndex(item => item._id === id)
  if (idx === -1) return false
  db[collection].splice(idx, 1)
  return true
}

export function deleteAll(collection) {
  db[collection] = []
}

export default {
  loadSeedData,
  getCollection,
  findAll,
  findById,
  findOne,
  createOne,
  updateById,
  deleteById,
  deleteAll,
}
