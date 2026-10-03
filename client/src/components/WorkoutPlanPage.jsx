import React, { useState, useEffect } from 'react';

function WorkoutPlanPage() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const token = localStorage.getItem('fitpulse_token');
        const res = await fetch('/api/member/dashboard', {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const result = await res.json();
        if (result.status === 'success' && result.data) {
          setPlan(result.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, []);

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded inline-block mb-2">
          Member Program
        </span>
        <h1 className="text-2xl font-bold text-slate-900">Weekly Workout Plan</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Structured {plan?.plannedWorkoutDays || 5}-day workout regimen customized to your fitness goal.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 border-b border-gray-100 pb-3">
          Today's Scheduled Routine
        </h2>
        {plan?.todaysWorkout ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-semibold text-emerald-800">
                {plan.todaysWorkout.workoutName}
              </p>
              <span className="text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-medium">
                Focus: {plan.todaysWorkout.focus}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-2.5 px-3">Exercise</th>
                    <th className="py-2.5 px-3">Sets</th>
                    <th className="py-2.5 px-3">Target Reps</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {plan.todaysWorkout.exercises?.map((ex, i) => (
                    <tr key={i}>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{ex.exerciseName}</td>
                      <td className="py-2.5 px-3 text-slate-700">{ex.sets}</td>
                      <td className="py-2.5 px-3 text-slate-700 font-mono text-xs">{ex.reps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No workout scheduled for today.</p>
        )}
      </div>
    </main>
  );
}

export default WorkoutPlanPage;
