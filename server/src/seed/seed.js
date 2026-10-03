import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import FitnessProfile from '../models/fitnessProfile.model.js';
import WorkoutPlan from '../models/workoutPlan.model.js';
import Attendance from '../models/attendance.model.js';

export const seedDatabase = async () => {
  try {
    const demoPassword = 'Password123!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(demoPassword, salt);

    // 1. Seed Demo Member
    let member = await User.findOne({ email: 'member@fitpulse.local' });
    if (!member) {
      member = await User.create({
        fullName: 'Alex Morgan',
        email: 'member@fitpulse.local',
        phone: '9876543210',
        password: hashedPassword,
        role: 'member',
      });
      console.log('👤 [Seed] Demo member created: member@fitpulse.local');
    }

    // Ensure member has fitness profile
    let profile = await FitnessProfile.findOne({ userId: member._id });
    if (!profile) {
      profile = await FitnessProfile.create({
        userId: member._id,
        fitnessGoal: 'muscle_gain',
        experienceLevel: 'intermediate',
        plannedDaysPerWeek: 5,
        preferredSchedule: 'morning',
      });
      console.log('📋 [Seed] Fitness profile created for Alex Morgan');
    }

    // Ensure member has workout plan
    let plan = await WorkoutPlan.findOne({ userId: member._id });
    if (!plan) {
      plan = await WorkoutPlan.create({
        userId: member._id,
        name: 'Hypertrophy 5-Day Workout Split',
        goal: 'muscle_gain',
        daysPerWeek: 5,
        isActive: true,
        days: [
          {
            dayNumber: 1,
            dayName: 'Upper Body Power (Chest & Triceps)',
            focus: 'Chest, Shoulders & Triceps',
            exercises: [
              { exerciseName: 'Barbell Flat Bench Press', sets: 4, reps: '8-10', restSeconds: 90 },
              { exerciseName: 'Incline Dumbbell Press', sets: 3, reps: '10-12', restSeconds: 60 },
              { exerciseName: 'Cable Chest Flyes', sets: 3, reps: '12-15', restSeconds: 60 },
              { exerciseName: 'Overhead Triceps Extension', sets: 3, reps: '12', restSeconds: 60 },
              { exerciseName: 'Triceps Rope Pushdowns', sets: 3, reps: '15', restSeconds: 45 },
            ],
          },
          {
            dayNumber: 2,
            dayName: 'Upper Body Pull (Back & Biceps)',
            focus: 'Lats, Rhomboids & Biceps',
            exercises: [
              { exerciseName: 'Wide-Grip Lat Pulldowns', sets: 4, reps: '10-12', restSeconds: 75 },
              { exerciseName: 'Bent-Over Barbell Rows', sets: 4, reps: '8-10', restSeconds: 90 },
              { exerciseName: 'Seated Cable Row', sets: 3, reps: '10-12', restSeconds: 60 },
              { exerciseName: 'Barbell Bicep Curls', sets: 3, reps: '10-12', restSeconds: 60 },
              { exerciseName: 'Incline Dumbbell Hammer Curls', sets: 3, reps: '12-15', restSeconds: 45 },
            ],
          },
          {
            dayNumber: 3,
            dayName: 'Lower Body Strength (Quads & Core)',
            focus: 'Quads, Calves & Abdominals',
            exercises: [
              { exerciseName: 'Barbell Back Squats', sets: 4, reps: '8-10', restSeconds: 120 },
              { exerciseName: 'Leg Press Machine', sets: 3, reps: '10-12', restSeconds: 90 },
              { exerciseName: 'Leg Extensions', sets: 3, reps: '12-15', restSeconds: 60 },
              { exerciseName: 'Standing Calf Raises', sets: 4, reps: '15-20', restSeconds: 45 },
              { exerciseName: 'Hanging Knee Raises', sets: 3, reps: '15', restSeconds: 60 },
            ],
          },
          {
            dayNumber: 4,
            dayName: 'Shoulder & Arm Hypertrophy',
            focus: 'Deltoids & Arms',
            exercises: [
              { exerciseName: 'Overhead Dumbbell Shoulder Press', sets: 4, reps: '8-10', restSeconds: 90 },
              { exerciseName: 'Dumbbell Lateral Raises', sets: 4, reps: '12-15', restSeconds: 45 },
              { exerciseName: 'Cable Face Pulls', sets: 3, reps: '15', restSeconds: 60 },
              { exerciseName: 'EZ-Bar Preacher Curls', sets: 3, reps: '10-12', restSeconds: 60 },
              { exerciseName: 'Parallel Bar Dips', sets: 3, reps: '10-12', restSeconds: 60 },
            ],
          },
          {
            dayNumber: 5,
            dayName: 'Posterior Chain & Core',
            focus: 'Hamstrings, Glutes & Lower Back',
            exercises: [
              { exerciseName: 'Romanian Deadlifts (RDL)', sets: 4, reps: '8-10', restSeconds: 90 },
              { exerciseName: 'Lying Hamstring Leg Curls', sets: 3, reps: '10-12', restSeconds: 60 },
              { exerciseName: 'Bulgarian Split Squats', sets: 3, reps: '10 each leg', restSeconds: 75 },
              { exerciseName: 'Abdominal Cable Crunches', sets: 3, reps: '15', restSeconds: 45 },
            ],
          },
        ],
      });
      console.log('🏋️ [Seed] 5-day workout plan initialized for Alex Morgan');
    }

    // Ensure member has realistic attendance for current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const existingAttendance = await Attendance.find({
      userId: member._id,
      checkInTime: { $gte: startOfMonth, $lte: endOfMonth },
    });

    if (existingAttendance.length === 0) {
      const records = [];
      const daysToLog = Math.min(now.getDate(), 14);
      for (let d = 1; d <= daysToLog; d += 2) {
        const checkIn = new Date(now.getFullYear(), now.getMonth(), d, 9, 0, 0);
        const checkOut = new Date(now.getFullYear(), now.getMonth(), d, 10, 15, 0);
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
        console.log(`📅 [Seed] Loaded ${records.length} attendance sessions for current month`);
      }
    }

    // 2. Seed Trainer & Admin
    let trainer = await User.findOne({ email: 'trainer@fitpulse.local' });
    if (!trainer) {
      trainer = await User.create({
        fullName: 'Marcus Vance',
        email: 'trainer@fitpulse.local',
        phone: '9876543211',
        password: hashedPassword,
        role: 'trainer',
      });
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
    }
  } catch (err) {
    console.error('[Seed Error]', err.message);
  }
};
