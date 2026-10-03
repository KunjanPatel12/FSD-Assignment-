import React, { useState } from 'react';

function LoginPage({ onNavigate, onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid email or password.');
      }

      // Successful login: pass user object and token to app
      onAuthSuccess(data.data.user, data.data.token);
    } catch (err) {
      setError(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Helper for fast test filling
  const fillCredentials = (testEmail, testPassword) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setError(null);
  };

  return (
    <main className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 shadow-sm">
          {/* Card Header */}
          <div className="mb-6">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
              Authentication Portal
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Sign In to FitPulse</h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter your credentials to access your personalized role dashboard.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-700">
              <span className="font-semibold">Authentication Error:</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="you@fitpulse.com"
                className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
              </div>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 disabled:opacity-50 shadow-sm cursor-pointer transition-colors"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Test Account Helper */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">
              Quick Test Credentials:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('member@fitpulse.com', 'Member@12345!')}
                className="p-1.5 text-center border border-gray-200 rounded text-[11px] text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <span className="font-semibold block text-emerald-700">Member</span>
                Demo
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('trainer@fitpulse.com', 'Trainer@12345!')}
                className="p-1.5 text-center border border-gray-200 rounded text-[11px] text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <span className="font-semibold block text-blue-700">Trainer</span>
                Demo
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('admin@fitpulse.com', 'Admin@12345!')}
                className="p-1.5 text-center border border-gray-200 rounded text-[11px] text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <span className="font-semibold block text-amber-700">Admin</span>
                Demo
              </button>
            </div>
          </div>

          {/* Link to Registration */}
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-600">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                Sign Up as a Member
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;
