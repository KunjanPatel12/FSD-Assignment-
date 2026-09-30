import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Exercise } from '../models/Exercise.js';
import { SupplementItem } from '../models/SupplementItem.js';
import { GymSchedule, GymSettings } from '../models/GymSchedule.js';
import { starterExercises, starterSupplements, defaultGymSchedule } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const seedDatabase = async () => {
  console.log('🌱 [FitPulse Seed] Starting database initialization process...');

  try {
    // 1. Seed Exercises (Idempotent: upsert by name)
    console.log('📦 Seeding starter exercises...');
    for (const ex of starterExercises) {
      await Exercise.findOneAndUpdate({ name: ex.name }, ex, { upsert: true, new: true });
    }
    const allExercises = await Exercise.find({});
    console.log(`✅ Loaded ${allExercises.length} starter exercises.`);

    // 2. Seed Gym Schedule
    console.log('⏰ Seeding gym operational schedule...');
    for (const s of defaultGymSchedule) {
      await GymSchedule.findOneAndUpdate({ dayOfWeek: s.dayOfWeek }, s, { upsert: true, new: true });
    }
    await GymSettings.findOneAndUpdate(
      { key: 'global_settings' },
      {
        holidays: [
          { dateKey: '2026-12-25', name: 'Christmas Day', isClosed: true },
          { dateKey: '2026-01-01', name: "New Year's Day", isClosed: true },
        ],
      },
      { upsert: true }
    );
    console.log('✅ Gym schedule & holiday closures populated.');

    // 3. Seed Supplements
    console.log('💊 Seeding educational supplement guide items...');
    for (const sup of starterSupplements) {
      await SupplementItem.findOneAndUpdate({ name: sup.name }, sup, { upsert: true, new: true });
    }
    console.log('✅ Educational supplement items populated.');

    // 4. Controlled Administrator & Trainer Provisioning
    const defaultPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Password123!';

    let admin = await User.findOne({ email: 'admin@fitpulse.local' });
    if (!admin) {
      admin = await User.create({
        name: 'FitPulse Administrator',
        email: 'admin@fitpulse.local',
        password: defaultPassword,
        role: 'admin',
      });
      console.log('👤 [Bootstrap] Admin provisioned: admin@fitpulse.local');
    }

    let trainer = await User.findOne({ email: 'trainer@fitpulse.local' });
    if (!trainer) {
      trainer = await User.create({
        name: 'FitPulse Trainer',
        email: 'trainer@fitpulse.local',
        password: defaultPassword,
        role: 'trainer',
      });
      console.log('👤 [Bootstrap] Trainer provisioned: trainer@fitpulse.local');
    }

    console.log('🎉 [FitPulse Seed] Reference data initialized successfully.');
  } catch (err) {
    console.error('❌ [FitPulse Seed] Error initializing database:', err);
    throw err;
  }
};

// If run directly from CLI
if (process.argv[1] && process.argv[1].endsWith('seedRunner.js')) {
  (async () => {
    await connectDB();
    await seedDatabase();
    await disconnectDB();
    process.exit(0);
  })();
}
