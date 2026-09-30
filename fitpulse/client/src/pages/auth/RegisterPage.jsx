import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Activity, Lock, Mail, User, ArrowRight, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { error: notifyError } = useNotification();

  const [formData, setFormData] = useState({
    name: '',
    email: searchParams.get('email') || '',
    password: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const qEmail = searchParams.get('email');
    if (qEmail) {
      setFormData((prev) => ({ ...prev, email: qEmail }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Password validation rules
  const passwordRules = [
    {
      id: 'length',
      label: '8 to 64 characters',
      valid: formData.password.length >= 8 && formData.password.length <= 64,
    },
    {
      id: 'upper',
      label: 'At least one uppercase letter (A-Z)',
      valid: /[A-Z]/.test(formData.password),
    },
    {
      id: 'lower',
      label: 'At least one lowercase letter (a-z)',
      valid: /[a-z]/.test(formData.password),
    },
    {
      id: 'number',
      label: 'At least one number (0-9)',
      valid: /[0-9]/.test(formData.password),
    },
    {
      id: 'special',
      label: 'At least one special character (!@#$%^&*)',
      valid: /[^A-Za-z0-9]/.test(formData.password),
    },
  ];

  const isPasswordValid = passwordRules.every((r) => r.valid);
  const passwordsMatch = Boolean(
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword
  );

  const getPasswordError = () => {
    if (!touched.password || !formData.password) return null;
    if (!isPasswordValid) {
      return 'Password must contain at least 8 characters, including uppercase, lowercase, a number and a special character.';
    }
    return null;
  };

  const getConfirmPasswordError = () => {
    if (!touched.confirmPassword) return null;
    if (!formData.confirmPassword) {
      return 'Please confirm your password.';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match.';
    }
    return null;
  };

  const passwordError = getPasswordError();
  const confirmPasswordError = getConfirmPasswordError();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setTouched({ password: true, confirmPassword: true });

    if (!formData.name.trim() || !formData.email.trim()) {
      notifyError('Please fill in all required fields.');
      return;
    }

    if (!isPasswordValid) {
      notifyError(
        'Password must contain at least 8 characters, including uppercase, lowercase, a number and a special character.'
      );
      return;
    }

    if (!formData.confirmPassword) {
      notifyError('Please confirm your password.');
      return;
    }

    if (!passwordsMatch) {
      notifyError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      // All public registrations are automatically Gym Members
      navigate('/onboarding');
    } catch {
      // Notification handled in context; preserve user inputs
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">FitPulse</span>
          </Link>
          <h2 className="text-2xl font-extrabold text-white">Create Your Account</h2>
          <p className="mt-1 text-xs text-slate-400">
            Join the consistency platform to manage your workouts and gym check-ins.
          </p>
        </div>

        <Card className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="reg-name" className="text-xs text-slate-300 font-semibold block mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="reg-name"
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Morgan"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="reg-email" className="text-xs text-slate-300 font-semibold block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="text-xs text-slate-300 font-semibold block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="reg-password"
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  placeholder="Create a strong password"
                  className={`w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800/80 border text-white text-xs focus:outline-none transition-colors ${
                    passwordError
                      ? 'border-rose-500/80 focus:border-rose-500'
                      : 'border-slate-700 focus:border-emerald-500'
                  }`}
                />
              </div>

              {/* Password Requirements Checklist */}
              <div className="mt-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                <p className="text-[11px] font-medium text-slate-400">Password requirements:</p>
                <div className="grid grid-cols-1 gap-1 text-[11px]">
                  {passwordRules.map((rule) => {
                    const isMet = rule.valid;
                    const showSuccess = formData.password.length > 0 && isMet;
                    return (
                      <div
                        key={rule.id}
                        className={`flex items-center gap-1.5 transition-colors ${
                          showSuccess
                            ? 'text-emerald-400'
                            : formData.password.length > 0
                            ? 'text-slate-500'
                            : 'text-slate-400'
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                            showSuccess
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {showSuccess ? <Check className="w-2.5 h-2.5" /> : '•'}
                        </span>
                        <span>{rule.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {passwordError && (
                <div className="mt-1.5 flex items-center gap-1 text-[11px] text-rose-400">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm-password" className="text-xs text-slate-300 font-semibold block mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="reg-confirm-password"
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="Re-enter your password"
                  className={`w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800/80 border text-white text-xs focus:outline-none transition-colors ${
                    confirmPasswordError
                      ? 'border-rose-500/80 focus:border-rose-500'
                      : passwordsMatch
                      ? 'border-emerald-500/80 focus:border-emerald-500'
                      : 'border-slate-700 focus:border-emerald-500'
                  }`}
                />
              </div>

              {confirmPasswordError && (
                <div className="mt-1.5 flex items-center gap-1 text-[11px] text-rose-400">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{confirmPasswordError}</span>
                </div>
              )}

              {!confirmPasswordError && passwordsMatch && (
                <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-400">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Passwords match</span>
                </div>
              )}
            </div>

            {/* Informational Note */}
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>New accounts are registered as <strong>Gym Members</strong>.</span>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              disabled={loading}
              variant="primary"
              size="lg"
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Register & Continue
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-emerald-400 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
