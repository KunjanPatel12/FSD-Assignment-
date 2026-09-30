import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Lock, Mail, ArrowRight, Shield, AlertCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
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

  const handleDemoFill = (email) => {
    setFormData({
      email,
      password: 'DemoPassword123!',
    });
    setErrorMessage('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">FitPulse</span>
          </Link>
          <h2 className="text-2xl font-extrabold text-white">Sign In to Your Account</h2>
          <p className="mt-1 text-xs text-slate-400">
            Access your workout split, consistency records, and analytics.
          </p>
        </div>

        {/* Demo Fast-Fill Buttons */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-center gap-1">
            ⚡ Quick 1-Click Interactive Demo Fill:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('member@fitpulse.local')}
              className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-emerald-500/20 border border-slate-700 hover:border-emerald-500/60 text-xs font-semibold text-slate-200 transition-all active:scale-95"
            >
              Member
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('trainer@fitpulse.local')}
              className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-500/60 text-xs font-semibold text-slate-200 transition-all active:scale-95"
            >
              Trainer
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin@fitpulse.local')}
              className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-purple-500/20 border border-slate-700 hover:border-purple-500/60 text-xs font-semibold text-slate-200 transition-all active:scale-95"
            >
              Admin
            </button>
          </div>
        </div>

        <Card className="space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-300">{errorMessage}</p>
                <p className="text-[11px] text-slate-300 mt-1">
                  Don't have an account yet?{' '}
                  <Link
                    to={formData.email ? `/register?email=${encodeURIComponent(formData.email)}` : '/register'}
                    className="text-emerald-400 underline font-bold hover:text-emerald-300"
                  >
                    Click here to register
                  </Link>{' '}
                  or select a pre-seeded demo account above.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@fitpulse.local"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              variant="primary"
              size="lg"
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-slate-400">
          New to FitPulse?{' '}
          <Link
            to={formData.email ? `/register?email=${encodeURIComponent(formData.email)}` : '/register'}
            className="font-bold text-emerald-400 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
