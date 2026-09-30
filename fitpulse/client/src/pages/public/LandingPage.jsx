import React from 'react';
import { Link } from 'react-router-dom';
import {
  Dumbbell,
  CalendarCheck,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import gymHeroImage from '../../assets/campus_gym_hero.jpg';

export const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="bg-white min-h-screen">
      {/* Split-Screen Hero Section matching reference */}
      <section className="relative w-full border-b border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-4rem)] items-stretch">
          {/* Left Column: Content & Actions */}
          <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12 lg:py-20 bg-white order-2 lg:order-1">
            <div className="max-w-xl">
              {/* Small pale-green category label */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-6">
                <span>College Gym Management</span>
              </div>

              {/* Large bold navy heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08] mb-6">
                Your campus fitness,<br />
                <span className="text-emerald-600">simplified.</span>
              </h1>

              {/* Short readable description */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
                Manage your gym membership, follow personalized day-wise workout plans, and track your
                daily campus gym attendance with transparent consistency reports.
              </p>

              {/* Clear action buttons */}
              <div className="flex flex-wrap items-center gap-3.5">
                {user ? (
                  <Link
                    to={
                      user.role === 'admin'
                        ? '/admin/dashboard'
                        : user.role === 'trainer'
                        ? '/trainer/dashboard'
                        : '/dashboard'
                    }
                  >
                    <Button
                      size="lg"
                      variant="primary"
                      className="rounded-lg bg-emerald-600 text-white font-semibold px-6 py-3.5 flex items-center gap-2"
                    >
                      <span>Go To Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/register">
                      <Button
                        size="lg"
                        variant="primary"
                        className="rounded-lg bg-emerald-600 text-white font-semibold px-6 py-3.5 flex items-center gap-2"
                      >
                        <span>Get Started Free</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button
                        size="lg"
                        variant="outline"
                        className="rounded-lg border-gray-300 text-slate-700 font-semibold px-6 py-3.5"
                      >
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Full-Height Gym Photograph */}
          <div className="relative w-full h-[360px] sm:h-[480px] lg:h-auto min-h-[360px] lg:min-h-full overflow-hidden bg-slate-100 order-1 lg:order-2">
            <img
              src={gymHeroImage}
              alt="FitPulse Campus Fitness Center"
              className="w-full h-full object-cover object-center"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* Three-Feature Cards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Everything You Need For Campus Fitness
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            A straightforward fitness platform designed for students and college gym members.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3 border border-gray-200 bg-white">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <Dumbbell className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Personalized Workouts</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Rules-based exercise routines tailored to your fitness goal, experience tier, and
              chosen weekly training days.
            </p>
          </Card>

          <Card className="p-6 space-y-3 border border-gray-200 bg-white">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Gym Attendance</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Simple 1-click check-in and check-out logs. Automatically track your session duration
              and complete visit history.
            </p>
          </Card>

          <Card className="p-6 space-y-3 border border-gray-200 bg-white">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Consistency Reports</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Transparent monthly consistency percentage calculated from your actual visits versus
              scheduled gym days.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
};
