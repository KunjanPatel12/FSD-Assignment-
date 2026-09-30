import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Dumbbell,
  CalendarCheck,
  TrendingUp,
  Award,
  ShieldCheck,
  ArrowRight,
  Flame,
  CheckCircle2,
  Sparkles,
  Users,
  Compass,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';

export const LandingPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemoLogin = async (email) => {
    try {
      await login({ email, password: 'DemoPassword123!' });
      if (email.includes('admin')) navigate('/admin/dashboard');
      else if (email.includes('trainer')) navigate('/trainer/dashboard');
      else navigate('/dashboard');
    } catch {
      navigate('/login');
    }
  };

  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Deterministic Fitness Engine & Consistency Analytics</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none">
          Build Real Fitness Consistency{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Without The Guesswork
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          FitPulse turns your training schedule, physical gym check-ins, and deterministic workout
          splits into transparent momentum. Designed for members, coaches, and gym operators.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {user ? (
            <Link to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'trainer' ? '/trainer/dashboard' : '/dashboard'}>
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Go To My Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/register">
                <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Start Free Fitness Profile
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">
                  Sign In to Account
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* 1-Click Quick Demo Login Showcase */}
        {!user && (
          <div className="mt-12 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              1-Click Interactive Demo Access (Pre-seeded Accounts)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleQuickDemoLogin('member@fitpulse.local')}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-emerald-500/10 border border-slate-700 hover:border-emerald-500/50 text-left transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">Jordan Lee</span>
                  <Badge variant="emerald" size="sm">
                    Member
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400">4-Day Split, 7-Day Streak</p>
              </button>

              <button
                onClick={() => handleQuickDemoLogin('trainer@fitpulse.local')}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-cyan-500/10 border border-slate-700 hover:border-cyan-500/50 text-left transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">Sarah Connor</span>
                  <Badge variant="cyan" size="sm">
                    Trainer
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400">Coach Member Portal</p>
              </button>

              <button
                onClick={() => handleQuickDemoLogin('admin@fitpulse.local')}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-purple-500/10 border border-slate-700 hover:border-purple-500/50 text-left transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">Alex Rivera</span>
                  <Badge variant="purple" size="sm">
                    Admin
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400">System, Hours & Logs</p>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Core Architectural Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="emerald" className="mb-2">
            ENGINEERED PLATFORM
          </Badge>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Designed for Measurable Physical Progress
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            A genuinely full-stack architecture solving gym attendance drop-off and routine fatigue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card hoverEffect glow="emerald" className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Dumbbell className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Deterministic Workout Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Rules-based routine generation tailored to your exact goal (Hypertrophy, Strength, Shred, Endurance),
              experience tier, and weekly schedule. No hallucinated routines or medical claims.
            </p>
          </Card>

          <Card hoverEffect glow="cyan" className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Real Check-In & Streak Analytics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Physical gym attendance tracking with 1-click manual and rotating QR flow.
              Streak calculations account for scheduled rest days, gym holiday closures, and actual logs.
            </p>
          </Card>

          <Card hoverEffect glow="amber" className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Transparent Consistency Formula</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculates eligible scheduled days against your attendance. Extra visits are acknowledged
              separately, avoiding artificially capped or misleading metrics.
            </p>
          </Card>
        </div>
      </section>

      {/* Feature Breakdown Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/60 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <Badge variant="cyan">MEMBER EXPERIENCE</Badge>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Everything Needed to Stay In Rhythm
            </h3>
            <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Curated starter exercise library with step-by-step form cues & precautions</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Personalized workout plans with day-wise splits, exercise instructions & sets</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Verified physical gym attendance tracking and monthly consistency reporting</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Educational Nutrition & Supplement Guide with budget filters and food alternatives</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-emerald-400 font-bold">API & Consistency Flow</span>
              <span className="text-[10px] text-slate-500">Mongoose Pipeline</span>
            </div>
            <p className="text-slate-400">
              Member Action → React UI → REST Client → Express Auth → Rules Service → MongoDB
            </p>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <p className="text-emerald-400 font-bold">Consistency Formula:</p>
              <p>Planned Days = Target Days/Wk × (Range Days / 7)</p>
              <p>Eligible Target = Min(Planned Days, Gym Open Days)</p>
              <p>Score = Min(Round((Actual / Eligible) × 100), 100%)</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
