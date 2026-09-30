import { Exercise } from '../models/Exercise.js';

export const getAllExercises = async (req, res, next) => {
  try {
    const { search, targetMuscleGroup, equipment, difficulty, limit = 50, page = 1 } = req.query;

    const query = {};

    if (search && search.trim() !== '') {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    if (targetMuscleGroup && targetMuscleGroup !== 'all') {
      query.targetMuscleGroup = targetMuscleGroup;
    }

    if (equipment && equipment !== 'all') {
      query.equipment = equipment;
    }

    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Exercise.countDocuments(query);
    const exercises = await Exercise.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: exercises.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      exercises,
    });
  } catch (err) {
    next(err);
  }
};

export const getExerciseById = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found.',
      });
    }
    res.status(200).json({ success: true, exercise });
  } catch (err) {
    next(err);
  }
};

export const createExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.create({
      ...req.body,
      createdBy: req.user.id,
      isCustom: true,
    });
    res.status(201).json({ success: true, exercise });
  } catch (err) {
    next(err);
  }
};

export const updateExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found.' });
    }
    res.status(200).json({ success: true, exercise });
  } catch (err) {
    next(err);
  }
};
