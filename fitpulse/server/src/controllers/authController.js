import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { FitnessProfile } from '../models/FitnessProfile.js';
import { AuditLog } from '../models/AuditLog.js';
import { registerSchema, loginSchema } from '../validators/authValidators.js';

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'fitpulse_super_secret_jwt_key_college_project_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id }, secret, { expiresIn });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      assignedTrainerId: user.assignedTrainerId,
      notificationPreferences: user.notificationPreferences,
    },
  });
};

export const register = async (req, res, next) => {
  try {
    const validated = registerSchema.parse(req.body);

    if (validated.confirmPassword && validated.password !== validated.confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    const existingUser = await User.findOne({ email: validated.email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Explicitly whitelist allowed fields and strictly assign role: 'member'
    // This prevents mass-assignment vulnerabilities and elevated role injection (e.g. admin or trainer)
    const user = await User.create({
      name: validated.name.trim(),
      email: validated.email.toLowerCase().trim(),
      password: validated.password,
      role: 'member',
    });

    await AuditLog.create({
      userId: user._id,
      userEmail: user.email,
      action: 'USER_REGISTERED',
      resource: 'User',
      details: { role: user.role },
      ipAddress: req.ip,
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const validated = loginSchema.parse(req.body);

    const user = await User.findOne({ email: validated.email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const isMatch = await user.comparePassword(validated.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact the administrator.',
      });
    }

    await AuditLog.create({
      userId: user._id,
      userEmail: user.email,
      action: 'USER_LOGIN',
      resource: 'User',
      ipAddress: req.ip,
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const profile = await FitnessProfile.findOne({ userId: req.user.id });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        assignedTrainerId: user.assignedTrainerId,
        notificationPreferences: user.notificationPreferences,
        hasProfile: !!profile,
        profile,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updatePreferences = async (req, res, next) => {
  try {
    const { notificationPreferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { notificationPreferences },
      { new: true }
    );
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};
