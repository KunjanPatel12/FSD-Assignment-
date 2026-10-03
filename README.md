# FitPulse - Full-Stack Fitness & Wellness Platform

FitPulse is a clean, modular full-stack application built with React, Tailwind CSS, Node.js, Express, and MongoDB.

## Project Structure

```text
FS/
├── client/                     # Frontend React application
│   ├── public/                 # Static assets (logo.svg, etc.)
│   ├── src/                    # React source code
│   │   ├── App.jsx             # Main Application Component
│   │   ├── index.css           # Global Tailwind CSS styles
│   │   └── main.jsx            # Application entrypoint
│   ├── index.html              # HTML template
│   ├── package.json            # Client dependencies and scripts
│   └── vite.config.js          # Vite configuration with proxy to backend
├── server/                     # Backend Express server
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # MongoDB connection & status handler
│   │   ├── routes/
│   │   │   └── health.routes.js# Health check routes
│   │   ├── app.js              # Express app setup & middleware
│   │   └── server.js           # Server entrypoint
│   ├── .env                    # Local environment variables
│   ├── .env.example            # Environment variables template
│   └── package.json            # Server dependencies and scripts
├── .env.example                # Root environment template
├── .gitignore                  # Git ignore rules
├── package.json                # Root package scripts
└── README.md                   # Project documentation
```

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (local community server or MongoDB Atlas URI)

### 2. Environment Configuration
Backend environment variables are located in `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/fitpulse
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Running the Backend Server
In the root directory or inside `server/`:
```bash
cd server
npm install
npm run dev
```
The server will start at `http://localhost:5000` with the health check available at `http://localhost:5000/api/health`.

### 4. Running the Frontend Application
In a separate terminal:
```bash
cd client
npm install
npm run dev
```
The React development server will start at `http://localhost:5173`.

### 5. API Health Check Endpoint
- **URL**: `GET /api/health`
- **Response**:
```json
{
  "status": "ok",
  "message": "FitPulse API is operational",
  "timestamp": "2026-10-03T14:00:00.000Z",
  "uptimeSeconds": 10,
  "environment": "development",
  "database": {
    "state": "connected",
    "readyState": 1,
    "isConnected": true,
    "host": "127.0.0.1",
    "name": "fitpulse"
  }
}
```
