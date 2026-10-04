import React, { useState, useEffect } from 'react';

function AttendancePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
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
          setData(result.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded inline-block mb-2">
          Attendance Record
        </span>
        <h1 className="text-2xl font-bold text-slate-900">Attendance Log</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Monthly verified gym check-in sessions recorded in the database.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            This Month's Attendance
          </span>
          <p className="text-2xl font-bold text-emerald-700">{data?.thisMonthsAttendance ?? 0} Days</p>
          <p className="text-xs text-slate-500 mt-1">Total physical check-ins this month</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Planned Frequency
          </span>
          <p className="text-2xl font-bold text-slate-900">{data?.plannedWorkoutDays ?? 5} Days / Week</p>
          <p className="text-xs text-slate-500 mt-1">Weekly training commitment</p>
        </div>
      </div>
    </main>
  );
}

export default AttendancePage;
