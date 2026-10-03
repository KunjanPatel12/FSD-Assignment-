import React from 'react';

function Navbar({ currentView, onNavigate, currentUser, onLogout }) {
  return (
    <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
        {/* FitPulse Logo on the left */}
        <button
          type="button"
          onClick={() => onNavigate(currentUser ? 'dashboard' : 'landing')}
          className="flex items-center space-x-2 focus:outline-none cursor-pointer"
          aria-label="FitPulse Home"
        >
          <img src="/logo.svg" alt="FitPulse Logo" className="h-8 sm:h-9 w-auto" />
        </button>

        {/* Right side navigation actions */}
        <div className="flex items-center space-x-3">
          {currentUser ? (
            // Authenticated Navbar
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-900">{currentUser.fullName}</p>
                <p className="text-[11px] text-slate-500 capitalize">{currentUser.email}</p>
              </div>

              {/* Role badge */}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border capitalize ${
                  currentUser.role === 'admin'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : currentUser.role === 'trainer'
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {currentUser.role}
              </span>

              {/* Logout button */}
              <button
                type="button"
                onClick={onLogout}
                className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none cursor-pointer"
              >
                Log Out
              </button>
            </div>
          ) : (
            // Public Navbar
            <div className="flex items-center space-x-3">
              {currentView !== 'login' && (
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none cursor-pointer"
                >
                  Sign In
                </button>
              )}

              {currentView !== 'register' && (
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 focus:outline-none shadow-sm cursor-pointer"
                >
                  Get Started
                </button>
              )}

              {currentView !== 'landing' && (
                <button
                  type="button"
                  onClick={() => onNavigate('landing')}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 focus:outline-none cursor-pointer"
                >
                  Home
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
