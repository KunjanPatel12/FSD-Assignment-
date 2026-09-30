# FitPulse Project Directory Tree & Folder Purposes

Absolute Project Location:  
`C:\Users\kunja\OneDrive\Desktop\FSD\fitpulse`

```
fitpulse/
├── client/                                 # Frontend SPA Tier (React 19, Vite, Tailwind CSS)
│   ├── public/
│   │   └── favicon.svg                     # Pulse heartbeat SVG icon
│   ├── src/
│   │   ├── components/                     # Modular Reusable React Components
│   │   │   ├── common/                     # Design system primitives
│   │   │   │   ├── Badge.jsx               # Color-coded status tags (emerald, cyan, amber, etc.)
│   │   │   │   ├── Button.jsx              # Variant-driven buttons with loading spinner & icons
│   │   │   │   ├── Card.jsx                # Glassmorphic dark cards with subtle glows
│   │   │   │   ├── EmptyState.jsx          # Friendly states when data is empty
│   │   │   │   ├── ErrorBoundary.jsx       # Global React error boundary catching exceptions
│   │   │   │   ├── LoadingSpinner.jsx      # Animated spinner for async states
│   │   │   │   ├── Modal.jsx               # Accessible dialog with ESC listener & backdrop
│   │   │   │   └── StatCard.jsx            # KPI metric cards with icons and delta badges
│   │   │   ├── layout/                     # Persistent frame layouts
│   │   │   │   ├── Navbar.jsx              # Top bar with live in-gym timer, role tabs, & logout
│   │   │   │   └── Footer.jsx              # System footer with educational disclaimers
│   │   │   ├── attendance/                 # Attendance features
│   │   │   │   ├── CheckInModal.jsx        # 1-click manual and rotating QR gym check-in modal
│   │   │   │   └── AttendanceHeatmap.jsx   # 30-day visual consistency grid
│   │   │   ├── workouts/                   # Workout logging features
│   │   │   │   ├── WorkoutSessionLogger.jsx# Interactive sets/reps/weight logger with confetti
│   │   │   │   └── ExerciseSubstitutionModal.jsx # Swap exercises targeting matching muscle groups
│   │   │   └── progress/                   # Progress analytics
│   │   │       ├── ProgressChart.jsx       # Recharts interactive line chart
│   │   │       └── AddProgressModal.jsx    # Weight and tape measurement entry modal
│   │   ├── context/                        # Global State Management
│   │   │   ├── AuthContext.jsx             # User credentials, JWT session, active check-in
│   │   │   └── NotificationContext.jsx     # Floating toast notifications (success, error, etc.)
│   │   ├── pages/                          # Role-Specific & Public SPA Screens
│   │   │   ├── public/
│   │   │   │   └── LandingPage.jsx         # Hero, features, deterministic engine showcase, architecture
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx           # Secure credential sign-in with role-based routing
│   │   │   │   └── RegisterPage.jsx        # Public member account registration with password rules
│   │   │   ├── member/
│   │   │   │   ├── OnboardingPage.jsx      # Multi-step fitness baseline & goal onboarding
│   │   │   │   ├── MemberDashboard.jsx     # Primary dashboard (metrics, today's workout, streaks)
│   │   │   │   ├── WorkoutPlanView.jsx     # Full weekly split, exercise instructions, substitutes
│   │   │   │   ├── ExerciseLibraryPage.jsx # Search, muscle group pills, equipment & level filters
│   │   │   │   ├── AttendanceHistoryPage.jsx # Paginated visit records & durations
│   │   │   │   ├── ProgressTrackerPage.jsx # Weight trend charts & measurement history
│   │   │   │   └── SupplementGuidePage.jsx # Educational supplement index with budget slider
│   │   │   ├── trainer/
│   │   │   │   └── TrainerDashboard.jsx    # Member roster, athlete inspection, plan assignment
│   │   │   └── admin/
│   │   │       └── AdminDashboard.jsx      # Telemetry stats, user roles, gym hours, audit logs
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx          # Route guard checking authentication and role
│   │   ├── services/
│   │   │   └── api.js                      # REST API client with credentials & token injection
│   │   ├── test/
│   │   │   ├── setup.js                    # Vitest setup with @testing-library/jest-dom
│   │   │   └── client.test.jsx             # React component test suite (7 tests)
│   │   ├── App.jsx                         # Main client routing configuration
│   │   ├── index.css                       # Global Tailwind CSS v4 and glassmorphism utilities
│   │   └── main.jsx                        # React root bootstrap
│   ├── index.html                          # HTML shell with Google Fonts & dark theme
│   ├── package.json                        # Client dependencies and build scripts
│   └── vite.config.js                      # Vite config with React, Tailwind, proxy, & Vitest
│
├── server/                                 # Backend API Tier (Node.js, Express, Mongoose)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                       # Mongoose connection with embedded fallback
│   │   ├── models/                         # Mongoose ODM Database Schemas (11 models)
│   │   │   ├── User.js                     # Users, bcrypt passwords, role enum
│   │   │   ├── FitnessProfile.js           # Goals, metrics, schedule, onboarding flag
│   │   │   ├── Exercise.js                 # Exercise definitions, cues, equipment, difficulty
│   │   │   ├── WorkoutPlan.js              # Weekly splits, sets, reps, rest intervals
│   │   │   ├── WorkoutSession.js           # Completed sessions, logged sets, RPE scores
│   │   │   ├── Attendance.js               # Check-in/out timestamps, duration, method, status
│   │   │   ├── ProgressEntry.js            # Body weight, body fat %, measurements
│   │   │   ├── Achievement.js              # Unlocked badges and milestone records
│   │   │   ├── SupplementItem.js           # Supplement catalog, food alternatives, price range
│   │   │   ├── GymSchedule.js              # Operating days/hours, holiday closures
│   │   │   └── AuditLog.js                 # Security and administrative action audit trail
│   │   ├── controllers/                    # HTTP Request Handlers
│   │   │   ├── authController.js           # Register, login, logout, getMe, preferences
│   │   │   ├── profileController.js        # Read/update profile, plan auto-generation
│   │   │   ├── exerciseController.js       # Search, filter, CRUD
│   │   │   ├── workoutPlanController.js    # Fetch active plan, generate, substitute
│   │   │   ├── workoutSessionController.js # Record completed sessions, history
│   │   │   ├── attendanceController.js     # Check-in/out, duplicate guard, QR rotation
│   │   │   ├── analyticsController.js      # Consistency formula report & dashboard summary
│   │   │   ├── progressController.js       # Log metrics, history, delete entry
│   │   │   ├── supplementController.js     # Query catalog with budget filter
│   │   │   ├── trainerController.js        # Roster, athlete inspection, custom assignment
│   │   │   └── adminController.js          # Stats, user roles, gym hours, audit logs
│   │   ├── services/                       # Business Logic Layer
│   │   │   ├── workoutEngine.js            # Deterministic rules-based workout generator
│   │   │   ├── consistencyService.js       # Mathematical consistency algorithm
│   │   │   └── streakAndAchievementService.js # Streak calculation & badge unlocks
│   │   ├── routes/                         # Express Route Definitions
│   │   │   ├── authRoutes.js
│   │   │   ├── profileRoutes.js
│   │   │   ├── exerciseRoutes.js
│   │   │   ├── workoutPlanRoutes.js
│   │   │   ├── workoutSessionRoutes.js
│   │   │   ├── attendanceRoutes.js
│   │   │   ├── analyticsRoutes.js
│   │   │   ├── progressRoutes.js
│   │   │   ├── supplementRoutes.js
│   │   │   ├── trainerRoutes.js
│   │   │   └── adminRoutes.js
│   │   ├── middleware/                     # Express Middlewares
│   │   │   ├── auth.js                     # JWT verification & role authorization guards
│   │   │   └── errorHandler.js             # Centralized error handler & 404 catcher
│   │   ├── validators/                     # Request Validation Schemas
│   │   │   └── authValidators.js           # Zod schemas for auth & profiles
│   │   ├── seed/                           # Database Seeding
│   │   │   ├── seedData.js                 # Starter exercises, supplements, gym schedule
│   │   │   └── seedRunner.js               # Idempotent seed script for starter reference data
│   │   ├── app.js                          # Express app configuration, helmet, cors, parsers
│   │   └── server.js                       # Server entrypoint with DB connection & shutdown
│   ├── tests/
│   │   └── api.test.js                     # Supertest + Vitest integration suite (12 tests)
│   ├── .env                                # Local development environment configuration
│   ├── .env.example                        # Documented environment template
│   └── package.json                        # Server scripts and dependencies
│
├── docs/                                   # Project Documentation
│   ├── architecture.md                     # System architecture & Mermaid sequence diagrams
│   ├── database-schema.md                  # Comprehensive Mongoose model specifications
│   ├── api.md                              # REST API endpoints, parameters, and responses
│   ├── testing-report.md                   # Automated testing results and coverage report
│   └── project-tree.md                     # Directory structure and purpose guide
│
├── .gitignore                              # Git exclusion rules for logs, node_modules, .env
├── docker-compose.yml                      # Optional local MongoDB container setup
├── package.json                            # Root orchestrator scripts (dev, test, build, seed)
└── README.md                               # Comprehensive project documentation & guide
```
