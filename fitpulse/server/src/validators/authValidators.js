import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(60),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must contain at least 8 characters, including uppercase, lowercase, a number and a special character.')
      .max(64, 'Password cannot exceed 64 characters.')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
      .regex(/[0-9]/, 'Password must contain at least one number.')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character.'),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.confirmPassword !== undefined && data.confirmPassword !== null && data.confirmPassword !== '') {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: 'Passwords do not match.',
      path: ['confirmPassword'],
    }
  );

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const profileSchema = z.object({
  age: z.coerce.number().min(14, 'Must be at least 14 years old').max(100),
  heightCm: z.coerce.number().min(80).max(250).optional().nullable(),
  weightKg: z.coerce.number().min(30).max(300).optional().nullable(),
  fitnessGoal: z.enum([
    'muscle_gain',
    'fat_loss',
    'strength',
    'general_fitness',
    'endurance',
  ]),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  plannedDaysPerWeek: z.coerce.number().min(1).max(7),
  preferredSchedule: z.enum(['morning', 'afternoon', 'evening']).optional(),
  monthlySupplementBudget: z.coerce.number().min(0).optional(),
  dietaryPreferences: z.string().max(200).optional(),
  healthNotes: z.string().max(300).optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').max(60).optional(),
  phone: z.string().max(25).optional().nullable(),
});
