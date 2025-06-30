import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: false },
    role: { type: String, default: 'user' },
    isVerified: { type: Boolean, default: false },
    isSubscribed: { type: Boolean, default: false },
    avatar: String,
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
