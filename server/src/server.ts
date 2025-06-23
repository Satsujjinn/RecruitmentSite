import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import { createReadStream } from 'fs';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/talentscout';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error', err));

// Simple user schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  avatar: String,
});

const User = mongoose.model('User', userSchema);

// AWS S3 setup
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

const upload = multer({ dest: 'uploads/' });

app.get('/api/users', async (_req, res) => {
  const users = await User.find();
  res.json(users);
});

app.post('/api/users', upload.single('avatar'), async (req, res) => {
  try {
    let avatarUrl: string | undefined;
    if (req.file && process.env.AWS_BUCKET_NAME) {
      const key = `avatars/${Date.now()}_${req.file.originalname}`;
      await s3.send(new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: createReadStream(req.file.path),
      }));
      avatarUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    }
    const user = new User({ name: req.body.name, email: req.body.email, avatar: avatarUrl });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating user' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
