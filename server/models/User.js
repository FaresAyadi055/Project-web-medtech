import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }]
}, { timestamps: true })

export default mongoose.model('User', UserSchema)
