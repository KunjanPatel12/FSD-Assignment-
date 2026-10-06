import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import FitnessProfile from '../models/fitnessProfile.model.js';
import WorkoutPlan from '../models/workoutPlan.model.js';
import Attendance from '../models/attendance.model.js';
import GymSchedule from '../models/gymSchedule.model.js';
import { generateRuleBasedPlan } from '../services/workoutGenerator.service.js';

export const seedDatabase = async () => {
  try {
    const demoPassword = 'Password123!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(demoPassword, salt);

    // 0. Seed default Gym Operating Schedule if not present
    let schedule = await GymSchedule.findOne();
    if (!schedule) {
      schedule = await GymSchedule.create({
        openDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        closedDays: ['Sunday'],
        openingTime: '06:00 AM',
        closingTime: '10:00 PM',
        notes: 'Standard facility operating schedule',
      });
      console.log('🗓️ [Seed] Default gym operating schedule created.');
    }

    // 1. Seed Trainer & Admin first so members can be linked
    let trainer = await User.findOne({ email: 'trainer@fitpulse.local' });
    if (!trainer) {
      trainer = await User.create({
        fullName: 'Marcus Vance',
        email: 'trainer@fitpulse.local',
        phone: '9876543211',
        password: hashedPassword,
        role: 'trainer',
      });
      console.log('🏋️‍♂️ [Seed] Demo trainer created: trainer@fitpulse.local');
    }

    let admin = await User.findOne({ email: 'admin@fitpulse.local' });
    if (!admin) {
      admin = await User.create({
        fullName: 'FitPulse Admin',
        email: 'admin@fitpulse.local',
        phone: '9876543212',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('🛡️ [Seed] Demo admin created: admin@fitpulse.local');
    }

    // 2. Trainees to seed
    const trainees = [
      {
        fullName: 'Alex Morgan',
        email: 'member@fitpulse.local',
        phone: '9876543210',
        age: 26,
        height: 178,
        weight: 75,
        fitnessGoal: 'muscle_gain',
        experienceLevel: 'intermediate',
        plannedDaysPerWeek: 5,
        preferredSchedule: 'morning',
        attendanceCount: 8,
      },
      {
        fullName: 'Jordan Reed',
        email: 'jordan@fitpulse.local',
        phone: '9876543214',
        age: 29,
        height: 168,
        weight: 78,
        fitnessGoal: 'fat_loss',
        experienceLevel: 'beginner',
        plannedDaysPerWeek: 3,
        preferredSchedule: 'evening',
        attendanceCount: 6,
      },
      {
        fullName: 'Sam Rivera',
        email: 'sam@fitpulse.local',
        phone: '9876543215',
        age: 32,
        height: 182,
        weight: 85,
        fitnessGoal: 'strength',
        experienceLevel: 'advanced',
        plannedDaysPerWeek: 4,
        preferredSchedule: 'morning',
        attendanceCount: 7,
      },
    ];

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    for (const t of trainees) {
      let member = await User.findOne({ email: t.email });
      if (!member) {
        member = await User.create({
          fullName: t.fullName,
          email: t.email,
          phone: t.phone,
          password: hashedPassword,
          role: 'member',
        });
        console.log(`👤 [Seed] Trainee member created: ${t.email}`);
      }

      // Ensure fitness profile
      let profile = await FitnessProfile.findOne({ userId: member._id });
      if (!profile) {
        profile = await FitnessProfile.create({
          userId: member._id,
          trainerId: trainer._id,
          age: t.age,
          height: t.height,
          weight: t.weight,
          fitnessGoal: t.fitnessGoal,
          experienceLevel: t.experienceLevel,
          plannedDaysPerWeek: t.plannedDaysPerWeek,
          preferredSchedule: t.preferredSchedule,
          membershipPlan: 'FitPulse Annual Pro',
          membershipStatus: 'Active',
          membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        });
      } else if (!profile.trainerId) {
        profile.trainerId = trainer._id;
        await profile.save();
      }

      // Ensure workout plan
      let plan = await WorkoutPlan.findOne({ userId: member._id, isActive: true });
      if (!plan || !plan.days || plan.days.length === 0) {
        const generated = generateRuleBasedPlan({
          fitnessGoal: t.fitnessGoal,
          experienceLevel: t.experienceLevel,
          plannedDaysPerWeek: t.plannedDaysPerWeek,
        });
        plan = await WorkoutPlan.create({
          userId: member._id,
          ...generated,
        });
      }

      // Ensure attendance records
      const existingAttendance = await Attendance.find({
        userId: member._id,
        checkInTime: { $gte: startOfMonth, $lte: endOfMonth },
      });

      if (existingAttendance.length === 0) {
        const records = [];
        const daysToLog = Math.min(now.getDate(), t.attendanceCount * 2);
        for (let d = 1; d <= daysToLog; d += 2) {
          const checkIn = new Date(now.getFullYear(), now.getMonth(), d, 8, 30, 0);
          const checkOut = new Date(now.getFullYear(), now.getMonth(), d, 9, 45, 0);
          records.push({
            userId: member._id,
            checkInTime: checkIn,
            checkOutTime: checkOut,
            durationMinutes: 75,
            status: 'completed',
            dateKey: checkIn.toISOString().slice(0, 10),
          });
        }
        if (records.length > 0) {
          await Attendance.insertMany(records);
        }
      }
    }

    console.log('✅ [Seed] Database successfully seeded with Trainer Marcus Vance and assigned trainees.');
  } catch (err) {
    console.error('[Seed Error]', err.message);
  }
};
