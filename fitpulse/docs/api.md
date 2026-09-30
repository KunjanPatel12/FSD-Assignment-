# FitPulse REST API Specification

Base URL: `http://localhost:5000/api`

All protected endpoints accept either:
1. `Authorization: Bearer <JWT_TOKEN>` header
2. HTTP-Only `token` cookie

---

## 1. System & Health

### `GET /api/health`
Returns service availability, timestamp, and runtime environment.
- **Auth**: Public
- **Response `200`**:
  ```json
  {
    "status": "UP",
    "platform": "FitPulse API",
    "timestamp": "2026-09-28T13:30:00.000Z",
    "uptime": 124.5,
    "environment": "development"
  }
  ```

---

## 2. Authentication & Identity

### `POST /api/auth/register`
Creates an account with bcrypt password hashing. All public registrations are automatically assigned `role: "member"`.
- **Auth**: Public (Rate-limited: 30 req / 15m)
- **Body**:
  ```json
  {
    "name": "Alex Morgan",
    "email": "alex@example.com",
    "password": "Password123!",
    "confirmPassword": "Password123!"
  }
  ```
- **Response `201`**: `{ success: true, token, user: { id, name, email, role: "member" } }`

### `POST /api/auth/login`
Validates credentials and issues signed JWT + HTTP-Only cookie.
- **Auth**: Public (Rate-limited)
- **Body**: `{ "email": "alex@example.com", "password": "Password123!" }`
- **Response `200`**: `{ success: true, token, user }`

### `POST /api/auth/logout`
Clears HTTP-only authentication cookie.
- **Auth**: Public
- **Response `200`**: `{ success: true, message: "Logged out successfully." }`

### `GET /api/auth/me`
Retrieves authenticated user session, assigned trainer, and profile status.
- **Auth**: Protected (Any Role)
- **Response `200`**: `{ success: true, user: { id, name, email, role, hasProfile, profile } }`

---

## 3. Fitness Profile

### `GET /api/profile`
Fetches the member's current fitness profile.
- **Auth**: Protected (Member)
- **Response `200`**: `{ success: true, hasProfile: true, profile: { ... } }`

### `POST /api/profile`
Saves fitness onboarding parameters and automatically generates a deterministic workout plan.
- **Auth**: Protected (Member)
- **Body**:
  ```json
  {
    "age": 25,
    "heightCm": 178,
    "weightKg": 75,
    "fitnessGoal": "muscle_gain",
    "experienceLevel": "intermediate",
    "plannedDaysPerWeek": 4,
    "preferredSchedule": "morning",
    "monthlySupplementBudget": 50,
    "regeneratePlan": true
  }
  ```
- **Response `200`**: `{ success: true, profile, plan, message }`

---

## 4. Exercise Library

### `GET /api/exercises`
Queries exercises with search and multi-facet filtering.
- **Auth**: Public
- **Query Params**:
  - `search`: String (e.g. `"press"`)
  - `targetMuscleGroup`: `"chest"` | `"back"` | `"legs"` | `"shoulders"` | `"arms"` | `"core"` | `"full_body"`
  - `equipment`: `"barbell"` | `"dumbbell"` | `"cable"` | `"machine"` | `"bodyweight"`
  - `difficulty`: `"beginner"` | `"intermediate"` | `"advanced"`
- **Response `200`**: `{ success: true, count, total, page, exercises: [...] }`

### `GET /api/exercises/:id`
Retrieves full exercise instructions, form cues, precautions, and equipment tags.
- **Auth**: Public
- **Response `200`**: `{ success: true, exercise }`

---

## 5. Workout Plans & Execution

### `GET /api/workout-plans/current`
Retrieves member's active plan.
- **Auth**: Protected (Member / Trainer / Admin)
- **Response `200`**: `{ success: true, hasPlan: true, plan: { title, days: [...] } }`

### `POST /api/workout-plans/generate`
Re-runs the deterministic rules engine to generate a refreshed split.
- **Auth**: Protected (Member)
- **Response `201`**: `{ success: true, plan, message }`

### `POST /api/workout-plans/substitute`
Swaps an exercise in the active plan for an alternative targeting the same muscle group.
- **Auth**: Protected (Member)
- **Body**: `{ "planId": "...", "dayNumber": 1, "oldExerciseId": "...", "newExerciseId": "..." }`
- **Response `200`**: `{ success: true, plan }`

### `POST /api/workout-sessions`
Persists a completed workout session with kg/reps for each set, RPE score, and notes. Triggers achievement checking.
- **Auth**: Protected (Member)
- **Body**:
  ```json
  {
    "planId": "...",
    "dayNumber": 1,
    "dayName": "Day 1: Upper Body",
    "completedExercises": [
      {
        "exerciseId": "...",
        "exerciseName": "Barbell Bench Press",
        "setsCompleted": [{ "setNumber": 1, "reps": 10, "weightKg": 60, "completed": true }]
      }
    ],
    "durationMinutes": 60,
    "rpeScore": 8,
    "notes": "Solid lift"
  }
  ```
- **Response `201`**: `{ success: true, session, newAchievements: [...] }`

---

## 6. Attendance & Gym Check-In

### `GET /api/attendance/status`
Checks if the member currently has an open, active gym visit session.
- **Auth**: Protected (Member)
- **Response `200`**: `{ success: true, isCheckedIn: true/false, activeSession }`

### `POST /api/attendance/checkin`
Starts a gym check-in session. Prevents duplicate active check-ins (returns `400`).
- **Auth**: Protected (Member)
- **Body**: `{ "method": "manual" }` or `{ "method": "qr", "qrToken": "..." }`
- **Response `201`**: `{ success: true, attendance }`

### `POST /api/attendance/checkout`
Closes the active check-in session, calculates visit duration in minutes server-side.
- **Auth**: Protected (Member)
- **Response `200`**: `{ success: true, attendance, durationMinutes, newAchievements: [...] }`

### `GET /api/attendance/history`
Returns chronological attendance logs with pagination.
- **Auth**: Protected (Member / Trainer / Admin)
- **Response `200`**: `{ success: true, total, records: [...] }`

### `GET /api/attendance/qr-token`
Generates a dynamic 60-second rotating gym kiosk QR verification token.
- **Auth**: Protected
- **Response `200`**: `{ success: true, qrToken, expiresAt, gymName }`

---

## 7. Consistency Analytics

### `GET /api/analytics/consistency`
Calculates member attendance consistency against planned weekly days and facility open days.
- **Auth**: Protected (Member / Trainer / Admin)
- **Query Params**: `startDate`, `endDate`, `month`, `year`
- **Response `200`**:
  ```json
  {
    "success": true,
    "report": {
      "reportingPeriod": { "totalCalendarDays": 30, "gymOpenDaysCount": 26 },
      "memberProfile": { "plannedDaysPerWeek": 4, "eligiblePlannedDays": 17 },
      "attendance": {
        "actualAttendedDays": 16,
        "extraVisits": 0,
        "consistencyPercentage": 94,
        "ratingLabel": "Excellent",
        "badgeColor": "emerald"
      },
      "dailyHistory": [...],
      "explanation": "Calculated from 16 attended days against 17 target planned training days..."
    },
    "streaks": { "currentStreak": 7, "longestStreak": 14 },
    "motivationalQuote": "Incredible momentum!"
  }
  ```

### `GET /api/analytics/dashboard`
Aggregated telemetry endpoint powering the primary member dashboard.
- **Auth**: Protected (Member)
- **Response `200`**: `{ success: true, summary: { profile, activePlan, todaysWorkout, streaks, consistency, totalWorkouts, achievements, recentProgress, motivationalQuote } }`

---

## 8. Body Metric Progress

### `GET /api/progress`
Returns chronological weight and measurement logs for charts.
- **Auth**: Protected (Member)
- **Response `200`**: `{ success: true, count, entries: [...] }`

### `POST /api/progress`
Logs body weight and measurements.
- **Auth**: Protected (Member)
- **Body**: `{ "weightKg": 75.5, "bodyFatPercent": 14.5, "chestCm": 103, "waistCm": 83, "notes": "..." }`
- **Response `201`**: `{ success: true, progress }`

### `DELETE /api/progress/:id`
Deletes a progress entry.
- **Auth**: Protected (Owner)
- **Response `200`**: `{ success: true, message: "Progress entry deleted." }`

---

## 9. Educational Supplement Guide

### `GET /api/supplements`
Catalog of fitness supplements with illustrative prices, food alternatives, and budget filtering.
- **Auth**: Public
- **Query Params**: `category`, `maxBudget`
- **Response `200`**: `{ success: true, count, items: [...], disclaimer }`

---

## 10. Trainer Operations

### `GET /api/trainer/members`
Returns athlete roster assigned to the trainer.
- **Auth**: Protected (`trainer`, `admin`)
- **Response `200`**: `{ success: true, count, members: [...] }`

### `GET /api/trainer/members/:memberId`
Inspects member's profile, active plan, consistency score, streaks, and session history.
- **Auth**: Protected (`trainer`, `admin`)
- **Response `200`**: `{ success: true, member, profile, activePlan, consistency, streaks, recentSessions }`

---

## 11. Administrator Operations

### `GET /api/admin/stats`
Telemetry metrics (total users, active check-ins, workouts completed, exercises count).
- **Auth**: Protected (`admin`)
- **Response `200`**: `{ success: true, stats: { ... } }`

### `GET /api/admin/users`
Paginated user accounts with search and role filters.
- **Auth**: Protected (`admin`)
- **Response `200`**: `{ success: true, total, page, users: [...] }`

### `PATCH /api/admin/users/:id/role`
Updates user role (`member`, `trainer`, `admin`) or toggles active status.
- **Auth**: Protected (`admin`)
- **Body**: `{ "role": "trainer", "isActive": true }`
- **Response `200`**: `{ success: true, user }`

### `GET /api/admin/schedule` & `PUT /api/admin/schedule`
Reads or updates facility operational hours and holiday closures.
- **Auth**: Protected (`admin`)
- **Response `200`**: `{ success: true, message: "Gym operating schedule updated." }`

### `GET /api/admin/audit-logs`
Security audit trail recording registration, role updates, and staff actions.
- **Auth**: Protected (`admin`)
- **Response `200`**: `{ success: true, total, logs: [...] }`
