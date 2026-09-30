# FitPulse Database Schema Documentation

FitPulse uses MongoDB with Mongoose ODM schemas. All models include timestamps (`createdAt`, `updatedAt`) and indexes optimized for common query paths.

---

## 1. Schema Summary Table

| Model | Collection | Primary Keys & Indexes | Key Relationships |
|---|---|---|---|
| **User** | `users` | `_id`, `email` (unique index), `role` | Referenced by all member/audit records |
| **FitnessProfile** | `fitnessprofiles` | `userId` (unique index) | 1-to-1 with `User` |
| **Exercise** | `exercises` | `name` (unique index), `targetMuscleGroup`, `equipment`, `difficulty` | Referenced in `WorkoutPlan` & `WorkoutSession` |
| **WorkoutPlan** | `workoutplans` | `userId`, `isActive` | References `User` & `Exercise` |
| **WorkoutSession** | `workoutsessions` | `userId`, `completedAt`, `dateKey` | References `User`, `WorkoutPlan`, `Exercise` |
| **Attendance** | `attendances` | `userId`, `status`, `checkInTime`, compound `(userId, status)` | References `User` |
| **ProgressEntry** | `progressentries` | `userId`, `date` (compound index) | References `User` |
| **Achievement** | `achievements` | compound `(userId, badgeKey)` (unique) | References `User` |
| **SupplementItem** | `supplementitems` | `category` (index) | Standalone catalog |
| **GymSchedule** | `gymschedules` | `dayOfWeek` (unique index) | System operational reference |
| **GymSettings** | `gymsettings` | `key` (unique) | Platform closures & settings |
| **AuditLog** | `auditlogs` | `createdAt` (index), `userId` | References `User` |

---

## 2. Model Schema Details

### 2.1 User (`User.js`)
- `name`: String (2-60 chars, required)
- `email`: String (lowercase, valid regex, unique index)
- `password`: String (bcrypt hashed, `select: false`)
- `role`: Enum `['member', 'trainer', 'admin']` (default: `'member'`)
- `assignedTrainerId`: ObjectId (ref: `'User'`, default: `null`)
- `isActive`: Boolean (default: `true`)
- `notificationPreferences`: Object with booleans (`motivationalAlerts`, `streakReminders`, `workoutTips`)

### 2.2 FitnessProfile (`FitnessProfile.js`)
- `userId`: ObjectId (ref: `'User'`, unique index, required)
- `age`: Number (14-100)
- `heightCm`: Number (optional)
- `weightKg`: Number (optional)
- `fitnessGoal`: Enum `['muscle_gain', 'fat_loss', 'strength', 'general_fitness', 'endurance']`
- `experienceLevel`: Enum `['beginner', 'intermediate', 'advanced']`
- `plannedDaysPerWeek`: Number (1-7, default: 3)
- `preferredSchedule`: Enum `['morning', 'afternoon', 'evening']`
- `monthlySupplementBudget`: Number (default: 0)
- `dietaryPreferences`: String
- `healthNotes`: String (educational/non-medical notes)
- `onboardingCompleted`: Boolean (default: `true`)

### 2.3 Exercise (`Exercise.js`)
- `name`: String (unique index, required)
- `targetMuscleGroup`: Enum `['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'full_body']`
- `secondaryMuscles`: Array of Strings
- `equipment`: Enum `['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'kettlebell']`
- `difficulty`: Enum `['beginner', 'intermediate', 'advanced']`
- `instructions`: Array of Strings (step-by-step)
- `formCues`: Array of Strings (cues)
- `precautions`: String (injury prevention guidance)
- `demoImageUrl`: String
- `isCustom`: Boolean (default: `false`)
- `createdBy`: ObjectId (ref: `'User'`)

### 2.4 WorkoutPlan (`WorkoutPlan.js`)
- `userId`: ObjectId (ref: `'User'`, index, required)
- `assignedBy`: ObjectId (ref: `'User'`, null for automated engine)
- `title`: String
- `goal`: String
- `level`: String
- `daysPerWeek`: Number (1-7)
- `days`: Array of workout day subdocuments:
  - `dayNumber`: Number
  - `dayName`: String
  - `focus`: String
  - `exercises`: Array of `{ exerciseId, exerciseName, sets, reps, restSeconds, order, notes }`
- `isActive`: Boolean (index)
- `generationType`: Enum `['rules_engine', 'trainer_assigned', 'custom']`
- `medicalDisclaimer`: String

### 2.5 WorkoutSession (`WorkoutSession.js`)
- `userId`: ObjectId (ref: `'User'`, index)
- `planId`: ObjectId (ref: `'WorkoutPlan'`)
- `dayNumber`: Number
- `dayName`: String
- `completedExercises`: Array of `{ exerciseId, exerciseName, setsCompleted: [{ setNumber, reps, weightKg, completed }], isFullyCompleted }`
- `durationMinutes`: Number
- `rpeScore`: Number (1-10 rate of perceived exertion)
- `notes`: String
- `dateKey`: String (`YYYY-MM-DD`, indexed)
- `completedAt`: Date (default: `Date.now`)

### 2.6 Attendance (`Attendance.js`)
- `userId`: ObjectId (ref: `'User'`, index)
- `checkInTime`: Date (default: `Date.now`)
- `checkOutTime`: Date (default: `null`)
- `durationMinutes`: Number (server-calculated)
- `status`: Enum `['active', 'completed']` (indexed)
- `method`: Enum `['manual', 'qr', 'staff_override']`
- `qrSessionToken`: String (ephemeral validation)
- `dateKey`: String (`YYYY-MM-DD`, indexed)
- `loggedByStaffId`: ObjectId (ref: `'User'`, audit trail)
- **Compound Index**: `{ userId: 1, status: 1 }` (enforces instantaneous check for active session)

### 2.7 ProgressEntry (`ProgressEntry.js`)
- `userId`: ObjectId (ref: `'User'`, index)
- `date`: Date
- `dateKey`: String (`YYYY-MM-DD`)
- `weightKg`: Number
- `bodyFatPercent`: Number (optional)
- `chestCm`, `waistCm`, `hipsCm`, `armsCm`: Numbers (optional)
- `notes`: String
- **Compound Index**: `{ userId: 1, date: -1 }`

### 2.8 Achievement (`Achievement.js`)
- `userId`: ObjectId (ref: `'User'`, index)
- `badgeKey`: String
- `title`: String
- `description`: String
- `icon`: String
- `unlockedAt`: Date
- **Compound Unique Index**: `{ userId: 1, badgeKey: 1 }` (prevents duplicate awards)

### 2.9 SupplementItem (`SupplementItem.js`)
- `name`: String
- `category`: Enum `['protein', 'creatine', 'pre_workout', 'recovery', 'micronutrients']` (indexed)
- `estimatedPriceMin`: Number
- `estimatedPriceMax`: Number
- `purpose`: String
- `usageGuidance`: String
- `foodAlternatives`: Array of Strings
- `allergenInfo`: Array of Strings
- `isIllustrative`: Boolean (default: `true`)
- `educationalDisclaimer`: String

### 2.10 GymSchedule & GymSettings (`GymSchedule.js`)
- `GymSchedule`:
  - `dayOfWeek`: Number (0-6, unique)
  - `dayName`: String
  - `isOpen`: Boolean
  - `openTime`: String (`"06:00"`)
  - `closeTime`: String (`"22:00"`)
- `GymSettings`:
  - `key`: `"global_settings"` (unique)
  - `holidays`: Array of `{ dateKey, name, isClosed }`
  - `allowLateEntryMinutes`: Number

### 2.11 AuditLog (`AuditLog.js`)
- `userId`: ObjectId (ref: `'User'`)
- `userEmail`: String
- `action`: String (e.g. `USER_REGISTERED`, `ADMIN_UPDATE_GYM_SCHEDULE`, `STAFF_MANUAL_ATTENDANCE`)
- `resource`: String
- `details`: Mixed Object
- `ipAddress`: String
- `createdAt`: Date (indexed)
