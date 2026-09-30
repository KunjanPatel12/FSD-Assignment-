import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
      index: true,
    },
    method: {
      type: String,
      enum: ['manual', 'qr', 'staff_override'],
      default: 'manual',
    },
    qrSessionToken: {
      type: String,
      default: null,
    },
    dateKey: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    loggedByStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure fast search for member active sessions
attendanceSchema.index({ userId: 1, status: 1 });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
