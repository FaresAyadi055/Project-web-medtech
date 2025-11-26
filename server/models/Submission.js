import mongoose from 'mongoose'

const SubmissionSchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String },
  attachments: [{ type: String }], // file URLs
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  grade: { type: Number, min: 0, max: 100 }, // grade out of 100
  feedback: { type: String }, // feedback message when rejected
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submittedAt: { type: Date, default: null }
}, { timestamps: true })

export default mongoose.model('Submission', SubmissionSchema)
