import { Exercise } from '../models/Exercise.js';

export const generateDeterministicPlan = async (user, profile) => {
  const { fitnessGoal, experienceLevel, plannedDaysPerWeek } = profile;
  const daysCount = Math.min(Math.max(Number(plannedDaysPerWeek) || 3, 1), 7);

  // Fetch exercises from database
  const exercises = await Exercise.find({});

  // Helper to find exercise by criteria or fallback
  const getExercise = (muscle, equipmentPreference = 'barbell', difficultyPref = experienceLevel) => {
    let matches = exercises.filter((ex) => ex.targetMuscleGroup === muscle);
    if (matches.length === 0) {
      matches = exercises.filter((ex) => ex.targetMuscleGroup === 'full_body' || ex.targetMuscleGroup === 'core');
    }
    if (matches.length === 0) return exercises[0];

    // Priority match
    const diffMatch = matches.find((ex) => ex.difficulty === difficultyPref);
    if (diffMatch) return diffMatch;
    return matches[0];
  };

  // Determine sets, reps, and rest based on goal & level
  let defaultSets = 3;
  let defaultReps = '10-12';
  let defaultRest = 60;

  if (fitnessGoal === 'strength') {
    defaultSets = experienceLevel === 'advanced' ? 5 : 4;
    defaultReps = '4-6';
    defaultRest = 120;
  } else if (fitnessGoal === 'muscle_gain') {
    defaultSets = experienceLevel === 'advanced' ? 4 : 3;
    defaultReps = '8-12';
    defaultRest = 90;
  } else if (fitnessGoal === 'fat_loss' || fitnessGoal === 'endurance') {
    defaultSets = 3;
    defaultReps = '12-15';
    defaultRest = 45;
  } else {
    // general_fitness
    defaultSets = 3;
    defaultReps = '10-12';
    defaultRest = 60;
  }

  const generatedDays = [];

  // Structure workout days depending on days count
  if (daysCount <= 2) {
    // Full Body routines
    const templates = [
      {
        dayNumber: 1,
        dayName: 'Full Body Activation A',
        focus: 'Chest, Back, Quads, Core',
        muscles: ['chest', 'back', 'legs', 'core', 'arms'],
      },
      {
        dayNumber: 2,
        dayName: 'Full Body Compound B',
        focus: 'Shoulders, Hamstrings, Back, Arms',
        muscles: ['shoulders', 'legs', 'back', 'arms', 'core'],
      },
    ];
    for (let i = 0; i < daysCount; i++) {
      const t = templates[i];
      const dayExercises = t.muscles.map((m, idx) => {
        const ex = getExercise(m);
        return {
          exerciseId: ex._id,
          exerciseName: ex.name,
          sets: defaultSets,
          reps: defaultReps,
          restSeconds: defaultRest,
          order: idx + 1,
          notes: `Focus on controlled tempo and form (${m}).`,
        };
      });
      generatedDays.push({
        dayNumber: t.dayNumber,
        dayName: t.dayName,
        focus: t.focus,
        exercises: dayExercises,
      });
    }
  } else if (daysCount === 3) {
    // 3-Day Push / Pull / Legs or Full Body
    const templates = [
      {
        dayNumber: 1,
        dayName: 'Day 1: Push (Chest, Shoulders & Triceps)',
        focus: 'Upper Body Pushing Mechanics',
        muscles: ['chest', 'shoulders', 'arms', 'core'],
      },
      {
        dayNumber: 2,
        dayName: 'Day 2: Pull (Back, Rear Delts & Biceps)',
        focus: 'Posterior Chain Pulling',
        muscles: ['back', 'back', 'arms', 'core'],
      },
      {
        dayNumber: 3,
        dayName: 'Day 3: Legs & Core Power',
        focus: 'Lower Body Strength & Stability',
        muscles: ['legs', 'legs', 'core', 'full_body'],
      },
    ];
    templates.forEach((t) => {
      const dayExercises = t.muscles.map((m, idx) => {
        const ex = getExercise(m);
        return {
          exerciseId: ex._id,
          exerciseName: ex.name,
          sets: defaultSets,
          reps: defaultReps,
          restSeconds: defaultRest,
          order: idx + 1,
          notes: `Target: ${m}. Maintain strict cadence.`,
        };
      });
      generatedDays.push({
        dayNumber: t.dayNumber,
        dayName: t.dayName,
        focus: t.focus,
        exercises: dayExercises,
      });
    });
  } else if (daysCount === 4) {
    // 4-Day Upper / Lower Split
    const templates = [
      {
        dayNumber: 1,
        dayName: 'Day 1: Upper Body Power',
        focus: 'Chest, Lats & Heavy Shoulders',
        muscles: ['chest', 'back', 'shoulders', 'arms'],
      },
      {
        dayNumber: 2,
        dayName: 'Day 2: Lower Body Strength',
        focus: 'Quads, Calves & Core Stability',
        muscles: ['legs', 'legs', 'core', 'core'],
      },
      {
        dayNumber: 3,
        dayName: 'Day 3: Upper Body Hypertrophy',
        focus: 'Volume Chest, Upper Back & Arms',
        muscles: ['chest', 'back', 'arms', 'shoulders'],
      },
      {
        dayNumber: 4,
        dayName: 'Day 4: Lower Body Posterior & Core',
        focus: 'Glutes, Hamstrings & Trunk',
        muscles: ['legs', 'legs', 'core', 'full_body'],
      },
    ];
    templates.forEach((t) => {
      const dayExercises = t.muscles.map((m, idx) => {
        const ex = getExercise(m);
        return {
          exerciseId: ex._id,
          exerciseName: ex.name,
          sets: defaultSets,
          reps: defaultReps,
          restSeconds: defaultRest,
          order: idx + 1,
          notes: `Keep core braced and perform full range of motion.`,
        };
      });
      generatedDays.push({
        dayNumber: t.dayNumber,
        dayName: t.dayName,
        focus: t.focus,
        exercises: dayExercises,
      });
    });
  } else {
    // 5 to 7 Days Split (Push, Pull, Legs, Upper, Lower, Active Recovery)
    const baseTemplates = [
      { dayNumber: 1, dayName: 'Day 1: Push Intensity', focus: 'Chest & Deltoids', muscles: ['chest', 'shoulders', 'arms'] },
      { dayNumber: 2, dayName: 'Day 2: Pull Foundation', focus: 'Back & Biceps', muscles: ['back', 'back', 'arms'] },
      { dayNumber: 3, dayName: 'Day 3: Leg Hypertrophy', focus: 'Quadriceps & Calves', muscles: ['legs', 'legs', 'core'] },
      { dayNumber: 4, dayName: 'Day 4: Upper Body Sculpt', focus: 'Incline Chest, Traps & Arms', muscles: ['chest', 'back', 'arms', 'shoulders'] },
      { dayNumber: 5, dayName: 'Day 5: Lower Body Posterior Chain', focus: 'Hamstrings & Glutes', muscles: ['legs', 'legs', 'core'] },
      { dayNumber: 6, dayName: 'Day 6: Functional Conditioning & Core', focus: 'Core Endurance & Mobility', muscles: ['core', 'core', 'full_body'] },
      { dayNumber: 7, dayName: 'Day 7: Active Recovery & Mobility', focus: 'Joint Mobility & Light Stretching', muscles: ['core', 'full_body'] },
    ];
    for (let i = 0; i < daysCount; i++) {
      const t = baseTemplates[i];
      const dayExercises = t.muscles.map((m, idx) => {
        const ex = getExercise(m);
        return {
          exerciseId: ex._id,
          exerciseName: ex.name,
          sets: defaultSets,
          reps: defaultReps,
          restSeconds: defaultRest,
          order: idx + 1,
          notes: `Consistency focus: Day ${i + 1} of ${daysCount}.`,
        };
      });
      generatedDays.push({
        dayNumber: t.dayNumber,
        dayName: t.dayName,
        focus: t.focus,
        exercises: dayExercises,
      });
    }
  }

  const titlePrefix =
    fitnessGoal === 'muscle_gain'
      ? 'Hypertrophy Builder'
      : fitnessGoal === 'strength'
      ? 'Max Strength & Power'
      : fitnessGoal === 'fat_loss'
      ? 'Lean Conditioning & Shred'
      : fitnessGoal === 'endurance'
      ? 'Stamina & Athletic Endurance'
      : 'Core & Functional Fitness';

  return {
    title: `${titlePrefix} (${daysCount}-Day ${experienceLevel.toUpperCase()})`,
    goal: fitnessGoal,
    level: experienceLevel,
    daysPerWeek: daysCount,
    days: generatedDays,
    generationType: 'rules_engine',
  };
};
