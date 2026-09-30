import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const Navbar = () => {
  const { user, logout, activeAttendance } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  // Live timer for active check-in
  useEffect(() => {
    if (!activeAttendance || !activeAttendance.checkInTime) {
      setElapsedMinutes(0);
      return;
    }
    const updateTimer = () => {
      const ms = Date.now() - new Date(activeAttendance.checkInTime).getTime();
      setElapsedMinutes(Math.max(0, Math.floor(ms / (1000 * 60))));
    };
    updateTimer();
    const interval = setInterval(updateTimer, 30000);
    return () => clearInterval(interval);
  }, [activeAttendance]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-white tracking-tight flex items-center gap-1.5">
              FitPulse
              <span className="text-emerald-400 font-mono text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                PRO
              </span>
            </span>
            <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
              Consistency Platform
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {user && user.role === 'member' && (
            <>
              <Link
                to="/dashboard"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-slate-800 text-emerald-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/workouts"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive('/workouts')
                    ? 'bg-slate-800 text-emerald-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                Workout Plan
              </Link>
              <Link
                to="/exercises"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive('/exercises')
                    ? 'bg-slate-800 text-emerald-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                Exercises
              </Link>
              <Link
                to="/attendance"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive('/attendance')
                    ? 'bg-slate-800 text-emerald-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                Attendance
              </Link>
              <Link
                to="/supplements"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive('/supplements')
                    ? 'bg-slate-800 text-emerald-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                Nutrition & Guide
              </Link>
            </>
          )}

          {user && user.role === 'trainer' && (
            <>
              <Link
                to="/trainer/dashboard"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive('/trainer/dashboard')
                    ? 'bg-slate-800 text-emerald-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                Trainer Portal
              </Link>
              <Link
                to="/exercises"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive('/exercises')
                    ? 'bg-slate-800 text-emerald-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                Exercise Library
              </Link>
              <Link
                to="/supplements"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive('/supplements')
                    ? 'bg-slate-800 text-emerald-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                Supplements
              </Link>
            </>
          )}

          {user && user.role === 'admin' && (
            <>
              <Link
                to="/admin/dashboard"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive('/admin/dashboard')
                    ? 'bg-slate-800 text-emerald-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                Admin Center
              </Link>
              <Link
                to="/exercises"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive('/exercises')
                    ? 'bg-slate-800 text-emerald-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                Exercise Master
              </Link>
              <Link
                to="/supplements"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive('/supplements')
                    ? 'bg-slate-800 text-emerald-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                Supplement Master
              </Link>
            </>
          )}
        </nav>

        {/* Right Action / Auth Buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Active Gym Check-in Badge */}
              {user.role === 'member' && (
                <Link
                  to="/attendance"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                    activeAttendance
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 animate-pulse hover:bg-emerald-500/25'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeAttendance ? 'bg-emerald-400' : 'bg-slate-500'
                    }`}
                  />
                  {activeAttendance ? (
                    <span>In Gym ({elapsedMinutes}m)</span>
                  ) : (
                    <span>Check In</span>
                  )}
                </Link>
              )}

              {/* User Role Badge */}
              <Badge
                variant={
                  user.role === 'admin'
                    ? 'purple'
                    : user.role === 'trainer'
                    ? 'cyan'
                    : 'emerald'
                }
                size="sm"
                className="hidden sm:inline-flex uppercase font-mono"
              >
                {user.role}
              </Badge>

              {/* Logout Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                leftIcon={<LogOut className="w-3.5 h-3.5" />}
                className="hidden sm:inline-flex"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Join FitPulse
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          {user ? (
            <>
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
                <Badge variant="emerald">{user.role}</Badge>
              </div>

              {user.role === 'member' && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/workouts"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
                  >
                    Workout Plan
                  </Link>
                  <Link
                    to="/exercises"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
                  >
                    Exercise Library
                  </Link>
                  <Link
                    to="/attendance"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
                  >
                    Attendance
                  </Link>
                  <Link
                    to="/supplements"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
                  >
                    Nutrition Guide
                  </Link>
                </>
              )}

              {user.role === 'trainer' && (
                <>
                  <Link
                    to="/trainer/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
                  >
                    Trainer Portal
                  </Link>
                  <Link
                    to="/exercises"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
                  >
                    Exercise Library
                  </Link>
                </>
              )}

              {user.role === 'admin' && (
                <>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
                  >
                    Admin Center
                  </Link>
                  <Link
                    to="/exercises"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
                  >
                    Exercise Master
                  </Link>
                </>
              )}

              <Button
                variant="danger"
                size="sm"
                onClick={handleLogout}
                className="w-full mt-4"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block">
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block">
                <Button variant="primary" className="w-full">
                  Join FitPulse
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
