import React, { useState, useEffect } from 'react';

function MemberDashboard({ currentUser }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('fitpulse_token');
      const response = await fetch('/api/member/dashboard', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to load member dashboard');
      }

      setData(result.data);
    } catch (err) {
      console.error('Error fetching member dashboard:', err);
      setError(err.message || 'Network error while loading data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatText = (text) => {
    if (!text) return '—';
    return text
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  if (loading) {
    return (
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-emerald-600 rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium text-slate-600">Loading your member dashboard...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white border border-red-200 rounded-lg p-6 text-center max-w-lg mx-auto shadow-sm">
          <p className="text-sm font-semibold text-red-600 mb-2">Unable to load dashboard data</p>
          <p className="text-xs text-slate-600 mb-4">{error}</p>
          <button
            type="button"
            onClick={fetchDashboardData}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      </main>
    );
  }

  const memberName = data?.member?.fullName || currentUser?.fullName || 'Member';
  const currentGoal = formatText(data?.currentGoal);
  const fitnessLevel = formatText(data?.fitnessLevel);
  const plannedDays = data?.plannedWorkoutDays ?? 5;
  const attendanceDays = data?.thisMonthsAttendance ?? 0;
  const consistencyRate = data?.consistencyPercentage ?? 0;
  const todaysWorkout = data?.todaysWorkout;

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                Member Dashboard
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-500">Live Backend Data</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, {memberName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Here is your routine schedule and personal gym consistency overview.
            </p>
          </div>
        </div>
      </div>

      {/* 5 Simple Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Current Goal */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Current Goal
          </span>
          <p className="text-xl font-bold text-slate-900 truncate">{currentGoal}</p>
          <p className="text-xs text-slate-500 mt-1">Primary fitness objective</p>
        </div>

        {/* Card 2: Fitness Level */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Fitness Level
          </span>
          <p className="text-xl font-bold text-slate-900 truncate">{fitnessLevel}</p>
          <p className="text-xs text-slate-500 mt-1">Experience classification</p>
        </div>

        {/* Card 3: Planned Workout Days */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Planned Workout Days
          </span>
          <p className="text-xl font-bold text-slate-900">{plannedDays} Days / Week</p>
          <p className="text-xs text-slate-500 mt-1">Scheduled workout frequency</p>
        </div>

        {/* Card 4: This Month's Attendance */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            This Month's Attendance
          </span>
          <p className="text-xl font-bold text-emerald-700">{attendanceDays} Days</p>
          <p className="text-xs text-slate-500 mt-1">Total gym visits logged</p>
        </div>

        {/* Card 5: Consistency Percentage */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Consistency Percentage
          </span>
          <p className="text-xl font-bold text-emerald-700">{consistencyRate}%</p>
          <p className="text-xs text-slate-500 mt-1">Planned vs attended ratio</p>
        </div>
      </div>

      {/* Today's Workout Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
        <div className="border-b border-gray-200 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Today's Workout
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                {todaysWorkout?.workoutName || 'Rest & Recovery Day'}
              </h2>
            </div>
            {todaysWorkout?.focus && (
              <span className="inline-flex items-center px-3 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                Target Focus: {todaysWorkout.focus}
              </span>
            )}
          </div>
        </div>

        {/* Exercise Details List */}
        {todaysWorkout && todaysWorkout.exercises && todaysWorkout.exercises.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Exercise</th>
                  <th className="py-3 px-4">Sets</th>
                  <th className="py-3 px-4">Reps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {todaysWorkout.exercises.map((exercise, index) => (
                  <tr key={index} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-xs font-medium text-slate-400">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {exercise.exerciseName}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {exercise.sets} {exercise.sets === 1 ? 'set' : 'sets'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-mono text-xs">
                      {exercise.reps} reps
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-sm bg-slate-50/50 rounded-lg border border-dashed border-gray-200">
            <p className="font-medium text-slate-700">No workout scheduled for today.</p>
            <p className="text-xs text-slate-500 mt-1">Enjoy your active recovery and proper hydration!</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default MemberDashboard;
