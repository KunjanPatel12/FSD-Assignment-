import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    checkInTime: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    durationMinutes: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
    },
    dateKey: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Attendance =
  mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);

export default Attendance;
