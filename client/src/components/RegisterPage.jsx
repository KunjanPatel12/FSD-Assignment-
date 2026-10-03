import React, { useState } from 'react';

function RegisterPage({ onNavigate, onAuthSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  // Password criteria checklist
  const criteria = [
    { label: 'Minimum 8 characters', met: formData.password.length >= 8 },
    { label: 'At least one uppercase letter (A-Z)', met: /[A-Z]/.test(formData.password) },
    { label: 'At least one lowercase letter (a-z)', met: /[a-z]/.test(formData.password) },
    { label: 'At least one number (0-9)', met: /[0-9]/.test(formData.password) },
    { label: 'At least one special character (!@#$...)', met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password) },
  ];

  const passwordsMatch = formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Client-side validations
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const allCriteriaMet = criteria.every((c) => c.met);
    if (!allCriteriaMet) {
      setError('Please ensure your password satisfies all security criteria.');
      return;
    }

    setLoading(true);

    try {
      // NOTE: Strictly no role property is passed to backend from frontend registration!
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed. Please try again.');
      }

      // Successful registration: passes user & token to root handler
      onAuthSuccess(data.data.user, data.data.token);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-md">
        {/* Registration Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 shadow-sm">
          {/* Header */}
          <div className="mb-6">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
              Public Registration
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Create Member Account</h1>
            <p className="text-xs text-slate-500 mt-1">
              Join FitPulse today to track workouts and access member facilities.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-700">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Sarah Connor"
                className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="member@fitpulse.com"
                className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 555-0199"
                className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Password Security Criteria Guide */}
            {formData.password.length > 0 && (
              <div className="p-3 bg-slate-50 border border-gray-200 rounded-md space-y-1">
                <p className="text-[11px] font-semibold text-slate-700 mb-1">Password Requirements:</p>
                {criteria.map((c, i) => (
                  <div key={i} className="flex items-center text-[11px] space-x-1.5">
                    <span className={c.met ? 'text-emerald-600 font-bold' : 'text-slate-400 font-bold'}>
                      {c.met ? '✓' : '○'}
                    </span>
                    <span className={c.met ? 'text-emerald-800' : 'text-slate-500'}>
                      {c.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-3 py-2 text-sm bg-white border rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 ${
                  formData.confirmPassword && !passwordsMatch
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                }`}
              />
              {formData.confirmPassword && (
                <p className={`text-[11px] mt-1 ${passwordsMatch ? 'text-emerald-600' : 'text-red-500'}`}>
                  {passwordsMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
                </p>
              )}
            </div>

            {/* Role Notice */}
            <div className="pt-1">
              <p className="text-[11px] text-slate-500 italic">
                * Note: All public registrations are automatically assigned the <strong>Member</strong> role.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 disabled:opacity-50 shadow-sm cursor-pointer transition-colors"
            >
              {loading ? 'Creating Member Account...' : 'Complete Member Registration'}
            </button>
          </form>

          {/* Navigation link to Login */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-slate-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                Sign In here
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default RegisterPage;
