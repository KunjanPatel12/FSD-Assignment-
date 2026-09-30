import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut,
  Menu,
  X,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Logo } from '../common/Logo';

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

  const isActive = (path) => {
    if (path === '/workouts' && location.pathname === '/workouts') return true;
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Official FitPulse Logo */}
        <Logo size="md" to="/" />

        {/* Center Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {user && user.role === 'member' && (
            <>
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-emerald-50 text-emerald-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/workouts"
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  isActive('/workouts')
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Workout Plan
              </Link>
              <Link
                to="/exercises"
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive('/exercises')
                    ? 'bg-emerald-50 text-emerald-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Exercise Library
              </Link>
              <Link
                to="/attendance"
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive('/attendance')
                    ? 'bg-emerald-50 text-emerald-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Attendance
              </Link>
              <Link
                to="/consistency"
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive('/consistency')
                    ? 'bg-emerald-50 text-emerald-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Consistency Report
              </Link>
              <Link
                to="/supplements"
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive('/supplements')
                    ? 'bg-emerald-50 text-emerald-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Supplement Guide
              </Link>
              <Link
                to="/profile"
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive('/profile')
                    ? 'bg-emerald-50 text-emerald-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Profile
              </Link>
            </>
          )}

          {user && user.role === 'trainer' && (
            <>
              <Link
                to="/trainer/dashboard"
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  isActive('/trainer/dashboard') ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600'
                }`}
              >
                Trainer Portal
              </Link>
              <Link
                to="/exercises"
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                  isActive('/exercises') ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600'
                }`}
              >
                Exercise Library
              </Link>
            </>
          )}

          {user && user.role === 'admin' && (
            <>
              <Link
                to="/admin/dashboard"
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  isActive('/admin/dashboard') ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600'
                }`}
              >
                Admin Center
              </Link>
              <Link
                to="/exercises"
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                  isActive('/exercises') ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600'
                }`}
              >
                Exercise Master
              </Link>
            </>
          )}

          {!user && (
            <div className="flex items-center gap-1">
              <Link
                to="/exercises"
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive('/exercises')
                    ? 'bg-emerald-50 text-emerald-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Exercise Library
              </Link>
              <Link
                to="/supplements"
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive('/supplements')
                    ? 'bg-emerald-50 text-emerald-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Supplement Guide
              </Link>
            </div>
          )}
        </nav>

        {/* Right Action / Auth Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {user ? (
            <div className="flex items-center gap-2.5">
              {/* Check In Action Pill matching reference */}
              {user.role === 'member' && (
                <Link
                  to="/attendance"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                    activeAttendance
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-white border-gray-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <MapPin className={`w-3.5 h-3.5 ${activeAttendance ? 'text-emerald-600' : 'text-slate-500'}`} />
                  {activeAttendance ? (
                    <span>In Gym ({elapsedMinutes}m)</span>
                  ) : (
                    <span>Check In</span>
                  )}
                </Link>
              )}

              {/* MEMBER Role Badge matching reference */}
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold tracking-wider uppercase">
                {user.role}
              </span>

              {/* Logout Button matching reference */}
              <button
                onClick={handleLogout}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-600" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm" className="rounded-lg border-gray-200 text-slate-700">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm" className="rounded-lg bg-emerald-600 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-1">
          {user ? (
            <>
              <div className="pb-3 mb-2 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold uppercase">
                  {user.role}
                </span>
              </div>

              {user.role === 'member' && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/workouts"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Workout Plan
                  </Link>
                  <Link
                    to="/exercises"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Exercise Library
                  </Link>
                  <Link
                    to="/attendance"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Attendance
                  </Link>
                  <Link
                    to="/consistency"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Consistency Report
                  </Link>
                  <Link
                    to="/supplements"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Supplement Guide
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Profile
                  </Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="w-full mt-4 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-600" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/exercises"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 font-medium"
              >
                Exercise Library
              </Link>
              <Link
                to="/supplements"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 font-medium"
              >
                Supplement Guide
              </Link>
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block">
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block">
                  <Button variant="primary" className="w-full bg-emerald-600 text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
