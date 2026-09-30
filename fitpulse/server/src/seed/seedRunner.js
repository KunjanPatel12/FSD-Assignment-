import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { FitnessProfile } from '../models/FitnessProfile.js';
import { Exercise } from '../models/Exercise.js';
import { WorkoutPlan } from '../models/WorkoutPlan.js';
import { WorkoutSession } from '../models/WorkoutSession.js';
import { Attendance } from '../models/Attendance.js';
import { ProgressEntry } from '../models/ProgressEntry.js';
import { Achievement } from '../models/Achievement.js';
import { SupplementItem } from '../models/SupplementItem.js';
import { GymSchedule, GymSettings } from '../models/GymSchedule.js';
import { generateDeterministicPlan } from '../services/workoutEngine.js';
import { starterExercises, starterSupplements, defaultGymSchedule } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const seedDatabase = async () => {
  console.log('🌱 [FitPulse Seed] Starting database seeding process...');

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

    // 4. Seed Demo Accounts
    const demoPassword = process.env.DEMO_PASSWORD || 'DemoPassword123!';

    console.log('👤 Seeding default demo accounts (Admin, Trainer, Member)...');

    // Admin
    let admin = await User.findOne({ email: 'admin@fitpulse.local' });
    if (!admin) {
      admin = await User.create({
        name: 'Alex Rivera (Admin)',
        email: 'admin@fitpulse.local',
        password: demoPassword,
        role: 'admin',
      });
      console.log('   Created Admin: admin@fitpulse.local');
    }

    // Trainer
    let trainer = await User.findOne({ email: 'trainer@fitpulse.local' });
    if (!trainer) {
      trainer = await User.create({
        name: 'Sarah Connor (Head Coach)',
        email: 'trainer@fitpulse.local',
        password: demoPassword,
        role: 'trainer',
      });
      console.log('   Created Trainer: trainer@fitpulse.local');
    }

    // Member
    let member = await User.findOne({ email: 'member@fitpulse.local' });
    if (!member) {
      member = await User.create({
        name: 'Jordan Lee',
        email: 'member@fitpulse.local',
        password: demoPassword,
        role: 'member',
        assignedTrainerId: trainer._id,
      });
      console.log('   Created Member: member@fitpulse.local');
    }

    // 5. Seed Member Fitness Profile & Deterministic Workout Plan
    let memberProfile = await FitnessProfile.findOne({ userId: member._id });
    if (!memberProfile) {
      memberProfile = await FitnessProfile.create({
        userId: member._id,
        age: 26,
        heightCm: 178,
        weightKg: 75.5,
        fitnessGoal: 'muscle_gain',
        experienceLevel: 'intermediate',
        plannedDaysPerWeek: 4,
        preferredSchedule: 'morning',
        monthlySupplementBudget: 50,
        dietaryPreferences: 'High protein, mostly whole foods',
        healthNotes: 'Minor right shoulder tightness on heavy overhead movements.',
      });
      console.log('   Created Jordan Lee Fitness Profile.');
    }

    // Generate Plan for Member
    let memberPlan = await WorkoutPlan.findOne({ userId: member._id, isActive: true });
    if (!memberPlan) {
      const planData = await generateDeterministicPlan(member, memberProfile);
      memberPlan = await WorkoutPlan.create({
        userId: member._id,
        ...planData,
      });
      console.log(`   Generated Member Plan: ${memberPlan.title}`);
    }

    // 6. Seed Realistic Past Attendance & Workout Records for consistency demonstration
    const pastDaysCount = 14;
    const now = new Date();

    const existingAttendanceCount = await Attendance.countDocuments({ userId: member._id });
    if (existingAttendanceCount === 0) {
      console.log('📅 Populating sample attendance history and workout sessions...');

      for (let i = pastDaysCount; i >= 1; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayOfWeek = d.getDay(); // 0 is Sunday

        // Simulate member attending 4 days per week (e.g. Mon, Tue, Thu, Fri)
        if ([1, 2, 4, 5].includes(dayOfWeek)) {
          const y = d.getUTCFullYear();
          const m = String(d.getUTCMonth() + 1).padStart(2, '0');
          const dayStr = String(d.getUTCDate()).padStart(2, '0');
          const dateKey = `${y}-${m}-${dayStr}`;

          const checkIn = new Date(d);
          checkIn.setHours(7, 30, 0, 0);
          const checkOut = new Date(d);
          checkOut.setHours(8, 45, 0, 0);

          await Attendance.create({
            userId: member._id,
            checkInTime: checkIn,
            checkOutTime: checkOut,
            durationMinutes: 75,
            status: 'completed',
            method: i % 2 === 0 ? 'qr' : 'manual',
            dateKey,
          });

          // Log corresponding completed workout session
          await WorkoutSession.create({
            userId: member._id,
            planId: memberPlan._id,
            dayNumber: (i % 4) + 1,
            dayName: `Day ${(i % 4) + 1} Session`,
            durationMinutes: 60,
            rpeScore: 8,
            notes: 'Felt strong, good pump and energy!',
            dateKey,
            completedAt: checkOut,
          });
        }
      }

      // Add a couple progress weight entries
      await ProgressEntry.create([
        {
          userId: member._id,
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          dateKey: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          weightKg: 76.5,
          chestCm: 102,
          waistCm: 84,
          notes: 'Starting baseline measurement',
        },
        {
          userId: member._id,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          dateKey: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          weightKg: 76.0,
          chestCm: 102.5,
          waistCm: 83.5,
          notes: 'Waist down half cm, strength consistent',
        },
        {
          userId: member._id,
          date: new Date(),
          dateKey: new Date().toISOString().slice(0, 10),
          weightKg: 75.5,
          chestCm: 103,
          waistCm: 83,
          notes: 'Solid progress on 4-day split',
        },
      ]);

      // Seed Achievements
      await Achievement.create([
        {
          userId: member._id,
          badgeKey: 'first_workout',
          title: 'First Step Taken',
          description: 'Completed your very first structured workout session.',
          icon: 'Zap',
        },
        {
          userId: member._id,
          badgeKey: 'visits_5',
          title: 'Gym Regular',
          description: 'Logged 5 physical gym visits.',
          icon: 'Target',
        },
        {
          userId: member._id,
          badgeKey: 'streak_7',
          title: 'Momentum Builder',
          description: 'Maintained an unbroken 7-day fitness streak.',
          icon: 'Flame',
        },
      ]);

      console.log('✅ Realistic member metrics, attendance and achievements populated.');
    }

    console.log('🎉 [FitPulse Seed] All initial records populated successfully!');
  } catch (err) {
    console.error('❌ [FitPulse Seed] Error seeding database:', err);
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
