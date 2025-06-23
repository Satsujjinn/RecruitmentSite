import mongoose from 'mongoose';

const recruiterSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  bio: String,
}, { timestamps: true });

export default mongoose.model('Recruiter', recruiterSchema);
