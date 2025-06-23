import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  athlete: { type: mongoose.Schema.Types.ObjectId, ref: 'Athlete', required: true },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'Recruiter', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('Match', matchSchema);
