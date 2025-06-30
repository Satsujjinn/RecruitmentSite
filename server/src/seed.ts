import bcrypt from 'bcrypt';
import User from './models/User';
import Athlete from './models/Athlete';
import Recruiter from './models/Recruiter';
import Match from './models/Match';
import Message from './models/Message';

export async function seedDatabase(): Promise<void> {
  const existing = await User.countDocuments();
  if (existing > 0) {
    console.log('Database already seeded');
    return;
  }

  const passwordHash = await bcrypt.hash('password123', 10);
  const athleteUser = new User({
    name: 'Demo Athlete',
    email: 'athlete@example.com',
    passwordHash,
    role: 'athlete',
    isVerified: true,
  });
  const recruiterUser = new User({
    name: 'Demo Recruiter',
    email: 'recruiter@example.com',
    passwordHash,
    role: 'recruiter',
    isVerified: true,
  });
  await athleteUser.save();
  await recruiterUser.save();

  const athlete = new Athlete({
    user: athleteUser._id,
    sport: 'Soccer',
    position: 'Forward',
    bio: 'Demo athlete bio',
  });
  const recruiter = new Recruiter({
    user: recruiterUser._id,
    company: 'Acme Corp',
    bio: 'Demo recruiter bio',
  });
  await athlete.save();
  await recruiter.save();

  const match = new Match({ athlete: athlete._id, recruiter: recruiter._id, status: 'accepted' });
  await match.save();

  const message = new Message({ match: match._id, sender: athleteUser._id, text: 'Welcome to TalentScout!' });
  await message.save();

  console.log('Seed data created');
}

if (require.main === module) {
  // run as standalone script
  import('dotenv').then(({ default: dotenv }) => {
    dotenv.config();
    const mongoose = require('mongoose');
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/talentscout';
    mongoose
      .connect(uri)
      .then(() => seedDatabase())
      .then(() => mongoose.disconnect())
      .catch((err: any) => {
        console.error(err);
        process.exit(1);
      });
  });
}
