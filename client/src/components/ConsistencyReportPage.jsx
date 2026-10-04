import React, { useState, useEffect } from 'react';

function ConsistencyReportPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchConsistency = async () => {
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
      }
    };
    fetchConsistency();
  }, []);

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded inline-block mb-2">
          Analytics
        </span>
        <h1 className="text-2xl font-bold text-slate-900">Consistency Report</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Review your attendance fidelity and adherence to planned workout days.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Consistency Percentage
          </span>
          <p className="text-3xl font-extrabold text-emerald-700">{data?.consistencyPercentage ?? 0}%</p>
          <p className="text-xs text-slate-500 mt-1">Attendance adherence rate</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Logged Attendance
          </span>
          <p className="text-3xl font-bold text-slate-900">{data?.thisMonthsAttendance ?? 0} Days</p>
          <p className="text-xs text-slate-500 mt-1">Attended sessions this month</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Weekly Target
          </span>
          <p className="text-3xl font-bold text-slate-900">{data?.plannedWorkoutDays ?? 5} Days</p>
          <p className="text-xs text-slate-500 mt-1">Goal frequency</p>
        </div>
      </div>
    </main>
  );
}

export default ConsistencyReportPage;
