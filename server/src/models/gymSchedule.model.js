import mongoose from 'mongoose';

const gymScheduleSchema = new mongoose.Schema(
  {
    openDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    closedDays: {
      type: [String],
      default: ['Sunday'],
      required: true,
    },
    openingTime: {
      type: String,
      default: '06:00 AM',
      required: true,
      trim: true,
    },
    closingTime: {
      type: String,
      default: '10:00 PM',
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      default: 'Standard facility operating schedule',
      trim: true,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const GymSchedule = mongoose.model('GymSchedule', gymScheduleSchema);
export default GymSchedule;
