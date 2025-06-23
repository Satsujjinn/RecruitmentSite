import mongoose from 'mongoose';

const athleteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sport: { type: String, required: true },
  position: String,
  bio: String,
}, { timestamps: true });

export default mongoose.model('Athlete', athleteSchema);
