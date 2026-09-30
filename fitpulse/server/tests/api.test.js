import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { starterExercises } from '../src/seed/seedData.js';
import { Exercise } from '../src/models/Exercise.js';

let app;
let memberToken = '';
let adminToken = '';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await connectDB();
  app = createApp();

  // Populate starter exercises for deterministic engine testing
  for (const ex of starterExercises) {
    await Exercise.findOneAndUpdate({ name: ex.name }, ex, { upsert: true });
  }

  // Create test admin
  const admin = await User.create({
    name: 'Test Administrator',
    email: 'testadmin@fitpulse.local',
    password: 'Password123!',
    role: 'admin',
  });
}, 120000);

afterAll(async () => {
  await disconnectDB();
}, 60000);

describe('FitPulse Backend API Suite', () => {
  it('GET /api/health should return UP status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.platform).toBe('FitPulse API');
  });

  it('POST /api/auth/register should validate inputs and register a new member', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Taylor Test',
      email: 'taylor@fitpulse.local',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('taylor@fitpulse.local');
    expect(res.body.user.role).toBe('member');
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.confirmPassword).toBeUndefined();
    memberToken = res.body.token;
  });

  it('POST /api/auth/register should reject missing required fields', async () => {
    const res1 = await request(app).post('/api/auth/register').send({
      email: 'noname@fitpulse.local',
      password: 'Password123!',
    });
    expect(res1.status).toBe(400);

    const res2 = await request(app).post('/api/auth/register').send({
      name: 'No Email',
      password: 'Password123!',
    });
    expect(res2.status).toBe(400);

    const res3 = await request(app).post('/api/auth/register').send({
      name: 'No Password',
      email: 'nopass@fitpulse.local',
    });
    expect(res3.status).toBe(400);
  });

  it('POST /api/auth/register should reject invalid email format', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Bad Email',
      email: 'not-an-email',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/register should reject weak passwords', async () => {
    // Too short (<8 chars)
    const resShort = await request(app).post('/api/auth/register').send({
      name: 'Short Pass',
      email: 'short@fitpulse.local',
      password: 'Pass1!',
      confirmPassword: 'Pass1!',
    });
    expect(resShort.status).toBe(400);

    // Missing uppercase
    const resNoUpper = await request(app).post('/api/auth/register').send({
      name: 'No Upper',
      email: 'noupper@fitpulse.local',
      password: 'password123!',
      confirmPassword: 'password123!',
    });
    expect(resNoUpper.status).toBe(400);

    // Missing lowercase
    const resNoLower = await request(app).post('/api/auth/register').send({
      name: 'No Lower',
      email: 'nolower@fitpulse.local',
      password: 'PASSWORD123!',
      confirmPassword: 'PASSWORD123!',
    });
    expect(resNoLower.status).toBe(400);

    // Missing number
    const resNoNum = await request(app).post('/api/auth/register').send({
      name: 'No Num',
      email: 'nonum@fitpulse.local',
      password: 'Password!!!!',
      confirmPassword: 'Password!!!!',
    });
    expect(resNoNum.status).toBe(400);

    // Missing special character
    const resNoSpecial = await request(app).post('/api/auth/register').send({
      name: 'No Special',
      email: 'nospecial@fitpulse.local',
      password: 'Password1234',
      confirmPassword: 'Password1234',
    });
    expect(resNoSpecial.status).toBe(400);
  });

  it('POST /api/auth/register should reject password and confirmPassword mismatch', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Mismatch User',
      email: 'mismatch@fitpulse.local',
      password: 'Password123!',
      confirmPassword: 'DifferentPassword123!',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/passwords do not match/i);
  });

  it('POST /api/auth/register should allow valid matching passwords and securely hash password without storing confirmPassword in DB', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Secure Hashing Test',
      email: 'securehash@fitpulse.local',
      password: 'MySecurePass123!',
      confirmPassword: 'MySecurePass123!',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('securehash@fitpulse.local');
    expect(res.body.user.role).toBe('member');
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.confirmPassword).toBeUndefined();

    // Query database directly to verify password hash and confirmPassword
    const dbUser = await User.findOne({ email: 'securehash@fitpulse.local' }).select('+password');
    expect(dbUser).toBeDefined();
    // Verify bcrypt hash (starts with $2a$ or $2b$) and never stored as plaintext
    expect(dbUser.password).not.toBe('MySecurePass123!');
    expect(dbUser.password).toMatch(/^\$2[ab]\$\d+\$/);
    // Verify confirmPassword is never stored in DB
    expect(dbUser.confirmPassword).toBeUndefined();
    expect(dbUser.toObject().confirmPassword).toBeUndefined();
  });

  it('POST /api/auth/register should safely ignore role: "admin" and force "member" role', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Hacker Admin Attempt',
      email: 'hackeradmin@fitpulse.local',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      role: 'admin',
    });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('member');

    // Verify in database that account was created strictly as member
    const dbUser = await User.findOne({ email: 'hackeradmin@fitpulse.local' });
    expect(dbUser.role).toBe('member');
  });

  it('POST /api/auth/register should safely ignore role: "trainer" and force "member" role', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Hacker Trainer Attempt',
      email: 'hackertrainer@fitpulse.local',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      role: 'trainer',
    });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('member');

    const dbUser = await User.findOne({ email: 'hackertrainer@fitpulse.local' });
    expect(dbUser.role).toBe('member');
  });

  it('POST /api/auth/register should reject duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Taylor Duplicate',
      email: 'taylor@fitpulse.local',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login should reject invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'taylor@fitpulse.local',
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
  });

  it('POST /api/auth/login should authenticate valid admin', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'testadmin@fitpulse.local',
      password: 'Password123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('admin');
    adminToken = res.body.token;
  });

  it('GET /api/admin/stats should block unauthenticated users', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
  });

  it('GET /api/admin/stats should forbid member role (403)', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(403);
  });

  it('GET /api/admin/stats should allow admin role (200)', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats).toBeDefined();
  });

  it('GET /api/exercises should return starter exercises with filtering', async () => {
    const res = await request(app).get('/api/exercises?targetMuscleGroup=chest');
    expect(res.status).toBe(200);
    expect(res.body.exercises.length).toBeGreaterThan(0);
    expect(res.body.exercises[0].targetMuscleGroup).toBe('chest');
  });

  it('POST /api/profile should save fitness profile and generate deterministic workout plan', async () => {
    const res = await request(app)
      .post('/api/profile')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        age: 24,
        heightCm: 175,
        weightKg: 70,
        fitnessGoal: 'muscle_gain',
        experienceLevel: 'intermediate',
        plannedDaysPerWeek: 4,
        preferredSchedule: 'morning',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.profile.fitnessGoal).toBe('muscle_gain');
    expect(res.body.plan).toBeDefined();
    expect(res.body.plan.days.length).toBe(4);
  });

  it('POST /api/attendance/checkin and prevent duplicate active sessions', async () => {
    // 1st Check-in
    const res1 = await request(app)
      .post('/api/attendance/checkin')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ method: 'manual' });

    expect(res1.status).toBe(201);
    expect(res1.body.attendance.status).toBe('active');

    // Duplicate Check-in should fail
    const res2 = await request(app)
      .post('/api/attendance/checkin')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ method: 'manual' });

    expect(res2.status).toBe(400);
    expect(res2.body.message).toContain('already have an active gym check-in');

    // Check-out should succeed
    const resOut = await request(app)
      .post('/api/attendance/checkout')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({});

    expect(resOut.status).toBe(200);
    expect(resOut.body.attendance.status).toBe('completed');
  });

  it('GET /api/analytics/consistency should calculate planned vs actual attendance', async () => {
    const res = await request(app)
      .get('/api/analytics/consistency')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.report).toBeDefined();
    expect(res.body.report.attendance.consistencyPercentage).toBeDefined();
    expect(res.body.report.explanation).toBeDefined();
  });

  it('PATCH /api/admin/users/:id/role should forbid ordinary members from modifying user roles', async () => {
    const res = await request(app)
      .patch('/api/admin/users/60d0fe4f5311236168a109ca/role')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ role: 'admin' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('Legitimate authorized trainer accounts retain access and privileges', async () => {
    await User.create({
      name: 'Authorized Coach',
      email: 'coach@fitpulse.local',
      password: 'Password123!',
      role: 'trainer',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'coach@fitpulse.local',
      password: 'Password123!',
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.user.role).toBe('trainer');
  });
});
