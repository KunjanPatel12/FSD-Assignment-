import mongoose from 'mongoose';

const holidayClosureSchema = new mongoose.Schema({
  dateKey: { type: String, required: true }, // YYYY-MM-DD
  name: { type: String, required: true },
  isClosed: { type: Boolean, default: true },
});

const gymScheduleSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
      unique: true,
    },
    dayName: {
      type: String,
      required: true,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    openTime: {
      type: String,
      default: '06:00',
    },
    closeTime: {
      type: String,
      default: '22:00',
    },
  },
  {
    timestamps: true,
  }
);

export const GymSchedule = mongoose.model('GymSchedule', gymScheduleSchema);

const gymSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'global_settings', unique: true },
    holidays: [holidayClosureSchema],
    allowLateEntryMinutes: { type: Number, default: 30 },
    qrRefreshIntervalSeconds: { type: Number, default: 60 },
  },
  { timestamps: true }
);

export const GymSettings = mongoose.model('GymSettings', gymSettingsSchema);
