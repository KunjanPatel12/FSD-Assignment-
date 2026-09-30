# FitPulse — Personalized Gym & Fitness Consistency Management Platform

FitPulse is a production-minded full-stack web application designed for gym members, trainers, and facility administrators. It addresses the core problem of gym attendance drop-off and routine fatigue through a **deterministic rules-based workout engine**, **transparent mathematical consistency analytics**, **physical check-in tracking with rotating QR codes**, and **educational nutrition guidance**.

---

## 1. Technology Stack

- **Frontend**: React.js (v19), Vite (v8), Tailwind CSS (v4), React Router (v7), Lucide React, Recharts, Canvas Confetti, QRCode.react.
- **Backend**: Node.js (v24), Express.js (v4), Mongoose (v8), JWT, BcryptJS, Cookie-Parser, Helmet, CORS, Express-Rate-Limit, Zod.
- **Database**: MongoDB with automatic embedded fallback (`mongodb-memory-server`) for zero-config local execution, with full support for local MongoDB and MongoDB Atlas.
- **Testing**: Vitest, React Testing Library, Supertest (19/19 tests passing).

---

## 2. Pre-Seeded Interactive Demo Accounts

All demo accounts use password: **`DemoPassword123!`** (configured in `.env`).

| Role | Demo Email | Access Permissions & Responsibilities |
|---|---|---|
| **Member** | `member@fitpulse.local` | 4-Day Muscle Gain split, 7-day streak, check-in, set logger, metrics |
| **Trainer** | `trainer@fitpulse.local` | Head Coach portal, athlete inspection, custom plan assignments |
| **Admin** | `admin@fitpulse.local` | Facility schedule management, user roles, security audit logs |

> **Quick Login**: The Login screen features 1-click demo fill buttons to test any role instantly without typing.

---

## 3. Quick Start & Execution Commands

### Prerequisites
- Node.js `v18+` (Installed: `v24.14.0`)
- npm `v9+` (Installed: `v11.18.0`)

### Installation & Run

1. **Clone or navigate to the project directory**:
   ```bash
   cd C:\Users\kunja\OneDrive\Desktop\FSD\fitpulse
   ```

2. **Launch the Full Application (Client + Server concurrently)**:
   ```bash
   npm run dev
   ```
   - Client UI: **`http://localhost:5173`**
   - Backend API: **`http://localhost:5000`**
   - Healthcheck: **`http://localhost:5000/api/health`**

3. **Run the Full Test Suite (19 tests)**:
   ```bash
   npm run test
   ```

4. **Production Build**:
   ```bash
   npm run build
   ```

5. **Re-seed Sample Data Manually (Optional)**:
   ```bash
   npm run seed
   ```

---

## 4. Database Setup & Configurations

FitPulse supports three database modes:

### Mode A: Zero-Config Embedded Engine (Default)
Leave `MONGODB_URI=` empty in `server/.env`. The application will automatically initialize an embedded MongoDB engine in memory. No external daemons or services are required.

### Mode B: Local Docker MongoDB
If Docker is installed, start a local MongoDB container:
```bash
docker compose up -d
```
Then set in `server/.env`:
```env
MONGODB_URI=mongodb://fitpulse_user:fitpulse_password@localhost:27017/fitpulse?authSource=admin
```

### Mode C: MongoDB Atlas Cloud
In `server/.env`, set:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/fitpulse?retryWrites=true&w=majority
```

---

## 5. Architectural Data Flow

```mermaid
sequenceDiagram
    participant Member as User in Browser
    participant React as React 19 SPA
    participant ClientAPI as api.js Client
    participant Express as Express Middleware & Controllers
    participant Service as Consistency & Engine Services
    participant DB as MongoDB

    Member->>React: Performs Action (Check In, Log Set, Update Plan)
    React->>ClientAPI: Invokes API Function
    ClientAPI->>Express: Sends HTTP Request with Bearer Token
    Express->>Express: Validates Helmet, CORS, Rate Limit, & JWT Token
    Express->>Service: Executes Rules or Mathematics
    Service->>DB: Mongoose Query or Upsert
    DB-->>Service: Updated Records
    Service-->>Express: Business Result
    Express-->>ClientAPI: Standardized JSON { success: true, ... }
    ClientAPI-->>React: Updates Context State
    React-->>Member: Renders Updated UI with Toast Alerts & Visual Feedback
```

---

## 6. Feature Implementation & Verification Checklist

| # | Feature Area | Status | Verification Detail |
|---|---|---|---|
| 1 | **Authentication & Security** | **Implemented & Tested** | Bcrypt hashing, JWT tokens, role guards, rate limiting, helmet |
| 2 | **Member Onboarding & Profile** | **Implemented & Tested** | Goals, experience tier, planned days, biometrics, auto-plan trigger |
| 3 | **Deterministic Workout Engine** | **Implemented & Tested** | 1-7 day splits, sets/reps mapped to hypertrophy/strength/conditioning |
| 4 | **Exercise Library** | **Implemented & Tested** | Search, muscle group tabs, equipment & difficulty filters, form cues |
| 5 | **Gym Check-In & Check-Out** | **Implemented & Tested** | Duplicate active session prevention, duration math, rotating QR code |
| 6 | **Consistency Analytics** | **Implemented & Tested** | Planned vs attended ratio, gym open days factor, extra visit reporting |
| 7 | **Streaks & Motivation** | **Implemented & Tested** | Rest-day tolerant streaks, automated badge unlocking, non-guilt copy |
| 8 | **Body Metric Progress** | **Implemented & Tested** | Weight tracking with Recharts interactive line chart, measurements |
| 9 | **Supplement Guide** | **Implemented & Tested** | Budget filter, food alternatives, non-medical educational disclaimer |
| 10 | **Member Dashboard** | **Implemented & Tested** | KPI stat cards, today's workout preview, 30-day attendance heatmap |
| 11 | **Trainer Portal** | **Implemented & Tested** | Member roster, athlete inspection, custom split assignment |
| 12 | **Admin Operations** | **Implemented & Tested** | Real-time stats, user roles, gym operational hours, audit logs |

---

## 7. Documentation Index

- [Architecture & Diagrams](docs/architecture.md)
- [Database Schema & Models](docs/database-schema.md)
- [API Reference](docs/api.md)
- [Testing Report (19/19 Passed)](docs/testing-report.md)
- [Project Directory Tree](docs/project-tree.md)
