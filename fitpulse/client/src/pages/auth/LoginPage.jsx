import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Logo } from '../../components/common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { error: notifyError } = useNotification();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await login(formData);
      if (res.user.role === 'admin') navigate('/admin/dashboard');
      else if (res.user.role === 'trainer') navigate('/trainer/dashboard');
      else {
        if (res.user.hasProfile === false) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'Invalid email or password. Please verify credentials or create an account.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-white">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <Logo size="lg" to="/" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Sign In to Your Account</h2>
          <p className="mt-1 text-sm text-slate-500">
            Access your workout split, consistency records, and profile.
          </p>
        </div>

        <Card className="p-8 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-800">{errorMessage}</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Don't have an account yet?{' '}
                  <Link
                    to={formData.email ? `/register?email=${encodeURIComponent(formData.email)}` : '/register'}
                    className="text-emerald-700 underline font-semibold"
                  >
                    Click here to register
                  </Link>
                  .
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="text-xs text-slate-700 font-semibold block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3 py-2 rounded-lg bg-white border border-gray-300 text-slate-900 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="text-xs text-slate-700 font-semibold block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="login-password"
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2 rounded-lg bg-white border border-gray-300 text-slate-900 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none placeholder-gray-400"
                />
              </div>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              variant="primary"
              size="lg"
              className="w-full mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-slate-600">
          New to FitPulse?{' '}
          <Link
            to={formData.email ? `/register?email=${encodeURIComponent(formData.email)}` : '/register'}
            className="font-semibold text-emerald-600 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
