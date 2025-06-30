import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import { createReadStream } from 'fs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import Athlete from './models/Athlete';
import Recruiter from './models/Recruiter';
import Match from './models/Match';
import Message from './models/Message';
import User from './models/User';
import { seedDatabase } from './seed';

dotenv.config();

export const app = express();
app.use(express.json());

const server = createServer(app);
const io = new SocketIOServer(server, { path: '/socket.io', cors: { origin: '*' } });

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/talentscout';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    if (process.env.SEED_DB === 'true') {
      await seedDatabase();
    }
  })
  .catch((err) => console.error('MongoDB connection error', err));

// AWS S3 setup
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

const upload = multer({ dest: 'uploads/' });

io.on('connection', (socket) => {
  const { roomId } = socket.handshake.query as { roomId?: string };
  if (roomId) {
    socket.join(roomId.toString());
  }
  socket.on('join', (id: string) => {
    socket.join(id);
  });
  socket.on('message', async (data: { roomId: string; text: string; senderId: string }) => {
    if (!data.roomId || !data.text || !data.senderId) return;
    const message = new Message({ match: data.roomId, text: data.text, sender: data.senderId });
    await message.save();
    io.to(data.roomId).emit('message', data);
  });
});

function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Unauthorized' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

function requireFields(fields: string[]) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    for (const field of fields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `Missing field ${field}` });
      }
    }
    next();
  };
}

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role = 'user', sport } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({ name, email, passwordHash, role });
  await user.save();
  if (role === 'athlete' && sport && process.env.NODE_ENV !== 'test') {
    const athlete = new Athlete({ user: user._id, sport });
    await athlete.save();
  }
  const verifyToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });
  console.log(`Verification token for ${email}: ${verifyToken}`);
  const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      isVerified: user.isVerified,
      isSubscribed: user.isSubscribed,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    verifyToken,
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.passwordHash) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      isVerified: user.isVerified,
      isSubscribed: user.isSubscribed,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

app.post('/api/auth/verify', async (req, res) => {
  const { token } = req.body;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findByIdAndUpdate(payload.userId, { isVerified: true }, { new: true });
    if (!user) return res.status(400).json({ message: 'Invalid token' });
    res.json({ message: 'User verified' });
  } catch {
    res.status(400).json({ message: 'Invalid token' });
  }
});

app.get('/api/users', authMiddleware, async (_req, res) => {
  const users = await User.find();
  res.json(users);
});

app.post('/api/users', authMiddleware, upload.single('avatar'), async (req, res) => {
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
    const userData: any = { name: req.body.name, email: req.body.email, avatar: avatarUrl };
    if (req.body.password) {
      userData.passwordHash = await bcrypt.hash(req.body.password, 10);
    }
    const user = new User(userData);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Athlete CRUD
app.get('/api/athletes', authMiddleware, async (_req, res) => {
  const athletes = await Athlete.find().populate('user');
  res.json(athletes);
});

app.post('/api/athletes', authMiddleware, requireFields(['sport']), async (req, res) => {
  const athlete = new Athlete({
    user: (req as any).user.userId,
    sport: req.body.sport,
    position: req.body.position,
    bio: req.body.bio,
  });
  await athlete.save();
  res.status(201).json(athlete);
});

app.put('/api/athletes/:id', authMiddleware, async (req, res) => {
  const athlete = await Athlete.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!athlete) return res.status(404).json({ message: 'Not found' });
  res.json(athlete);
});

app.delete('/api/athletes/:id', authMiddleware, async (req, res) => {
  await Athlete.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

// Recruiter CRUD
app.get('/api/recruiters', authMiddleware, async (_req, res) => {
  const recruiters = await Recruiter.find().populate('user');
  res.json(recruiters);
});

app.post('/api/recruiters', authMiddleware, requireFields(['company']), async (req, res) => {
  const recruiter = new Recruiter({
    user: (req as any).user.userId,
    company: req.body.company,
    bio: req.body.bio,
  });
  await recruiter.save();
  res.status(201).json(recruiter);
});

app.put('/api/recruiters/:id', authMiddleware, async (req, res) => {
  const recruiter = await Recruiter.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!recruiter) return res.status(404).json({ message: 'Not found' });
  res.json(recruiter);
});

app.delete('/api/recruiters/:id', authMiddleware, async (req, res) => {
  await Recruiter.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

// Match endpoints
app.get('/api/matches', authMiddleware, async (_req, res) => {
  const matches = await Match.find().populate('athlete recruiter');
  res.json(matches);
});

app.post('/api/matches', authMiddleware, requireFields(['athlete', 'recruiter']), async (req, res) => {
  const match = new Match({
    athlete: req.body.athlete,
    recruiter: req.body.recruiter,
  });
  await match.save();
  res.status(201).json(match);
});

app.put('/api/matches/:id', authMiddleware, async (req, res) => {
  const match = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!match) return res.status(404).json({ message: 'Not found' });
  res.json(match);
});

// Message endpoints
app.get('/api/messages/:matchId', authMiddleware, async (req, res) => {
  const messages = await Message.find({ match: req.params.matchId }).sort({ createdAt: 1 });
  res.json(messages);
});

app.post('/api/messages', authMiddleware, requireFields(['match', 'text']), async (req, res) => {
  const message = new Message({
    match: req.body.match,
    sender: (req as any).user.userId,
    text: req.body.text,
  });
  await message.save();
  io.to(req.body.match).emit('message', { roomId: req.body.match, text: req.body.text, senderId: (req as any).user.userId });
  res.status(201).json(message);
});

// Payment endpoints
app.post('/api/payments/subscribe', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID || '',
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscribe?success=true`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscribe?canceled=true`,
    });
    await User.findByIdAndUpdate(userId, { isSubscribed: true });
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create checkout session' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

export default app;
export { User };
