import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Calendar,
  Dumbbell,
  ArrowRight,
  LogOut,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { analyticsApi, workoutApi, attendanceApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AttendanceHeatmap } from '../../components/attendance/AttendanceHeatmap';

export const MemberDashboard = () => {
  const { user, profile, activeAttendance, checkAttendanceStatus } = useAuth();
  const { success, error: notifyError } = useNotification();
  const [data, setData] = useState(null);
  const [consistencyData, setConsistencyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attActionLoading, setAttActionLoading] = useState(false);
  const [workoutActionLoading, setWorkoutActionLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, constRes] = await Promise.all([
        analyticsApi.getDashboard(),
        analyticsApi.getConsistency(),
      ]);
      setData(dashRes.summary);
      setConsistencyData(constRes.report);
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
      success('Checked in successfully! Have an intense session.');
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
      success(`Checked out! Session duration: ${res.durationMinutes} minutes. Great work!`);
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
    return <LoadingSpinner text="Compiling your fitness dashboard..." fullScreen />;
  }

  // If user has not completed onboarding
  if (!profile && (!data || !data.profile)) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <Dumbbell className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Complete Your Fitness Profile</h2>
        <p className="text-xs text-slate-400">
          To receive your tailored workout plan and track consistency targets, please complete your
          1-minute onboarding.
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
  } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Personalized Dashboard
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400 font-mono capitalize">
              Goal: {profile?.fitnessGoal?.replace('_', ' ')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed italic">
            "{motivationalQuote}"
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          {activeAttendance ? (
            <Button
              onClick={handleCheckOut}
              isLoading={attActionLoading}
              variant="danger"
              size="md"
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              Checked In (Leave)
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

          {todaysWorkout && (
            <Button
              onClick={handleMarkTodayWorkoutComplete}
              isLoading={workoutActionLoading}
              variant="accent"
              size="md"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Mark Workout Complete
            </Button>
          )}
        </div>
      </div>

      {/* Primary KPI Grid: Focused on Consistency, Attendance & Workouts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Attendance Consistency"
          value={`${consistency?.percentage || 0}%`}
          subtitle={`${consistency?.actualAttendedDays || 0} of ${consistency?.eligiblePlannedDays || 0} planned days`}
          icon={CalendarCheck}
          color="emerald"
          trend={consistency?.ratingLabel}
        />

        <StatCard
          title="Monthly Attendance"
          value={`${consistency?.actualAttendedDays || 0} Visits`}
          subtitle={`${consistency?.eligiblePlannedDays || 0} target days this period`}
          icon={Calendar}
          color="teal"
        />

        <StatCard
          title="Workouts Completed"
          value={totalWorkouts || 0}
          subtitle={`Plan: ${activePlan ? `${activePlan.daysPerWeek} days/week` : 'None'}`}
          icon={Dumbbell}
          color="cyan"
        />
      </div>

      {/* Today's Workout Focus & Consistency Mathematics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Workout Card */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Suggested Today: {todaysWorkout?.dayName || 'Rest & Recovery'}</h3>
            </div>
            {todaysWorkout && (
              <Badge variant="cyan" size="sm">
                {todaysWorkout.focus}
              </Badge>
            )}
          </div>

          {todaysWorkout ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {todaysWorkout.exercises.map((ex, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{ex.exerciseName}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {ex.sets} sets × {ex.reps} reps
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {ex.restSeconds}s rest
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link to="/workouts" className="text-xs text-emerald-400 hover:underline font-medium">
                  View Full Weekly Split →
                </Link>
                <Button
                  onClick={handleMarkTodayWorkoutComplete}
                  isLoading={workoutActionLoading}
                  variant="primary"
                  size="sm"
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  Mark Completed
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              <p>No workout scheduled for today. Enjoy your rest and muscular recovery!</p>
            </div>
          )}
        </Card>

        {/* Consistency Formula Breakdown Card */}
        <Card className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Info className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-white">Consistency Mathematics</h4>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Target Training Days:</span>
              <span className="font-mono font-bold text-white">
                {profile?.plannedDaysPerWeek || 3} days/wk
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Eligible Target (30d):</span>
              <span className="font-mono font-bold text-white">
                {consistency?.eligiblePlannedDays || 0} days
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Actual Attended Visits:</span>
              <span className="font-mono font-bold text-emerald-400">
                {consistency?.actualAttendedDays || 0} days
              </span>
            </div>
            {consistency?.extraVisits > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">Bonus Extra Visits:</span>
                <span className="font-mono font-bold text-cyan-400">
                  +{consistency?.extraVisits} days
                </span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800">
            {consistencyData?.explanation ||
              'Based on planned days against actual open gym schedule without penalizing rest days.'}
          </p>
        </Card>
      </div>

      {/* 30-Day Attendance Heatmap */}
      {consistencyData?.dailyHistory && (
        <AttendanceHeatmap dailyHistory={consistencyData.dailyHistory} />
      )}
    </div>
  );
};
