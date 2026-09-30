import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Dumbbell,
  ArrowRight,
  LogOut,
  Info,
  CheckCircle2,
  BookOpen,
  CreditCard,
  UserCheck,
  TrendingUp,
} from 'lucide-react';
import { analyticsApi, workoutApi, attendanceApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ExerciseIllustration } from '../../components/common/ExerciseIllustration';

export const MemberDashboard = () => {
  const { user, profile, activeAttendance, checkAttendanceStatus } = useAuth();
  const { success, error: notifyError } = useNotification();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attActionLoading, setAttActionLoading] = useState(false);
  const [workoutActionLoading, setWorkoutActionLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await analyticsApi.getDashboard();
      setData(res.summary);
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleCheckIn = async () => {
    setAttActionLoading(true);
    try {
      await attendanceApi.checkIn({ method: 'manual' });
      await checkAttendanceStatus();
      success('Checked in successfully! Session is now active.');
      fetchDashboard();
    } catch (err) {
      notifyError(err.message || 'Check-in failed.');
    } finally {
      setAttActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setAttActionLoading(true);
    try {
      const res = await attendanceApi.checkOut();
      await checkAttendanceStatus();
      success(`Checked out! Session duration: ${res.durationMinutes} minutes.`);
      fetchDashboard();
    } catch (err) {
      notifyError(err.message || 'Check-out failed.');
    } finally {
      setAttActionLoading(false);
    }
  };

  const handleMarkTodayWorkoutComplete = async () => {
    if (!todaysWorkout || !activePlan) return;
    setWorkoutActionLoading(true);
    try {
      await workoutApi.logSession({
        planId: activePlan._id,
        dayNumber: todaysWorkout.dayNumber,
        dayName: todaysWorkout.dayName,
        durationMinutes: 45,
      });
      success(`Today's workout (${todaysWorkout.dayName}) marked as completed!`);
      fetchDashboard();
    } catch (err) {
      notifyError(err.message || 'Failed to record workout completion.');
    } finally {
      setWorkoutActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading member dashboard..." fullScreen />;
  }

  // If user has not completed onboarding
  if (!profile && (!data || !data.profile)) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4 bg-white">
        <div className="w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
          <Dumbbell className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Complete Your Fitness Profile</h2>
        <p className="text-sm text-slate-600">
          To receive your tailored workout plan and set up your gym schedule, please complete your
          onboarding profile.
        </p>
        <Link to="/onboarding">
          <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Start Onboarding
          </Button>
        </Link>
      </div>
    );
  }

  const {
    activePlan,
    todaysWorkout,
    consistency,
    totalWorkouts,
    motivationalQuote,
    membership,
  } = data || {};

  const currentGoal = profile?.fitnessGoal || data?.profile?.fitnessGoal || 'general_fitness';
  const currentLevel = profile?.experienceLevel || data?.profile?.experienceLevel || 'beginner';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-white">
      {/* Top Welcome Card */}
      <Card className="p-6 sm:p-7 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="emerald" size="sm">
                GOAL: {currentGoal.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge variant="slate" size="sm">
                LEVEL: {currentLevel.toUpperCase()}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-sm text-slate-600 italic">
              "{motivationalQuote || 'Keep stepping in! Every workout builds long-term consistency.'}"
            </p>
          </div>

          {/* Inline Quick Attendance Action */}
          <div className="flex items-center gap-3 shrink-0">
            {activeAttendance ? (
              <Button
                onClick={handleCheckOut}
                isLoading={attActionLoading}
                variant="danger"
                size="md"
                leftIcon={<LogOut className="w-4 h-4" />}
              >
                Check Out of Gym
              </Button>
            ) : (
              <Button
                onClick={handleCheckIn}
                isLoading={attActionLoading}
                variant="primary"
                size="md"
                leftIcon={<CalendarCheck className="w-4 h-4" />}
              >
                Check In to Gym
              </Button>
            )}
          </div>
        </div>

        {/* Membership Status Bar */}
        <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-500 font-medium">Gym Membership:</span>
            {membership && membership.isActive ? (
              <span className="font-semibold text-emerald-700">
                {membership.planName} (Active • Valid until{' '}
                {new Date(membership.endDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
                )
              </span>
            ) : (
              <span className="font-semibold text-amber-700">No Active Membership Plan</span>
            )}
          </div>

          <Link
            to="/membership"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline"
          >
            {membership && membership.isActive ? 'View Membership Details' : 'Select Plan & Pay'} →
          </Link>
        </div>
      </Card>

      {/* Primary Consistency & Attendance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Consistency Percentage */}
        <Card className="p-5 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Consistency Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {consistency?.percentage || 0}%
            </span>
            <Badge variant={consistency?.badgeColor || 'emerald'} size="sm">
              {consistency?.ratingLabel || 'Calculating'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500">
            {consistency?.actualAttendedDays || 0} of {consistency?.eligiblePlannedDays || 0} eligible planned days
          </p>
        </Card>

        {/* Monthly Attendance */}
        <Card className="p-5 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Monthly Attendance
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-emerald-700 font-mono">
              {consistency?.actualAttendedDays || 0}
            </span>
            <span className="text-xs text-slate-500 font-medium ml-1">Visits Logged</span>
          </div>
          <p className="text-xs text-slate-500">
            Target: {consistency?.eligiblePlannedDays || 0} training days this period
          </p>
        </Card>

        {/* Total Workouts Completed */}
        <Card className="p-5 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Workouts Logged
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {totalWorkouts || 0}
            </span>
            <span className="text-xs text-slate-500 font-medium ml-1">Sessions</span>
          </div>
          <p className="text-xs text-slate-500">
            Plan: {activePlan ? `${activePlan.daysPerWeek} days/week` : 'None assigned'}
          </p>
        </Card>
      </div>

      {/* Today's Suggested Workout Card */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              Today's Workout: {todaysWorkout?.dayName || 'Rest & Recovery Day'}
            </h3>
          </div>
          {todaysWorkout && (
            <Badge variant="emerald" size="sm">
              Focus: {todaysWorkout.focus}
            </Badge>
          )}
        </div>

        {todaysWorkout ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {todaysWorkout.exercises?.map((ex, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-[#F4FAF6] border border-emerald-100/70 flex items-center gap-3"
                >
                  <div className="w-12 h-12 bg-white rounded-lg p-1 border border-emerald-100/50 flex items-center justify-center shrink-0 overflow-hidden">
                    <ExerciseIllustration name={ex.exerciseName} muscleGroup={todaysWorkout.focus} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{ex.exerciseName}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {ex.sets} sets × {ex.reps} reps
                    </p>
                    <span className="text-[10px] text-emerald-700 font-mono">
                      {ex.restSeconds}s rest
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <Link to="/workouts" className="text-xs text-emerald-700 hover:underline font-semibold">
                View Full Weekly Workout Plan →
              </Link>
              <Button
                onClick={handleMarkTodayWorkoutComplete}
                isLoading={workoutActionLoading}
                variant="primary"
                size="sm"
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Mark Today's Workout Complete
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500 text-xs">
            <p>No workout is scheduled for today. Enjoy your rest and physical recovery!</p>
          </div>
        )}
      </Card>

      {/* Useful Action Buttons Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Member Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            to="/workouts"
            className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm text-center flex flex-col items-center justify-center gap-2 text-slate-800"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <Dumbbell className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">Workout Plan</span>
          </Link>

          <Link
            to="/exercises"
            className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm text-center flex flex-col items-center justify-center gap-2 text-slate-800"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">Exercise Library</span>
          </Link>

          <Link
            to="/attendance"
            className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm text-center flex flex-col items-center justify-center gap-2 text-slate-800"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">Attendance</span>
          </Link>

          <Link
            to="/consistency"
            className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm text-center flex flex-col items-center justify-center gap-2 text-slate-800"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">Consistency</span>
          </Link>

          <Link
            to="/supplements"
            className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm text-center flex flex-col items-center justify-center gap-2 text-slate-800"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <Info className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">Supplement Guide</span>
          </Link>

          <Link
            to="/onboarding"
            className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm text-center flex flex-col items-center justify-center gap-2 text-slate-800"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">Edit Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
