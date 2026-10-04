import React, { useState, useEffect } from 'react';

function AttendancePage() {
  const [records, setRecords] = useState([]);
  const [thisMonthVisits, setThisMonthVisits] = useState(0);
  const [activeCheckIn, setActiveCheckIn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Fetch attendance data on component mount (and on page refresh)
  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('fitpulse_token');
      const res = await fetch('/api/member/attendance', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const result = await res.json();
      if (res.ok && result.status === 'success' && result.data) {
        setRecords(result.data.records || []);
        setThisMonthVisits(result.data.thisMonthVisits || 0);
        setActiveCheckIn(result.data.activeCheckIn || null);
      } else {
        setError(result.message || 'Failed to load attendance records.');
      }
    } catch (err) {
      console.error('Fetch attendance error:', err);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // Handle Check In
  const handleCheckIn = async () => {
    setError(null);
    setMessage(null);
    setActionLoading(true);

    try {
      const token = localStorage.getItem('fitpulse_token');
      const res = await fetch('/api/member/attendance/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to check in.');
      }

      setMessage('Checked in successfully! Have a great workout session.');
      // Refresh attendance records to update table and active state
      await fetchAttendance();
    } catch (err) {
      setError(err.message || 'Check-in failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Check Out
  const handleCheckOut = async () => {
    setError(null);
    setMessage(null);
    setActionLoading(true);

    try {
      const token = localStorage.getItem('fitpulse_token');
      const res = await fetch('/api/member/attendance/check-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to check out.');
      }

      const duration = result.data?.durationMinutes || 0;
      setMessage(`Checked out successfully! Total session duration: ${formatDuration(duration, false)}.`);
      // Refresh attendance records to update table and active state
      await fetchAttendance();
    } catch (err) {
      setError(err.message || 'Check-out failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format time helper
  const formatTime = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Format duration helper
  const formatDuration = (minutes, isActive) => {
    if (isActive) return 'In Progress';
    if (minutes === undefined || minutes === null || minutes < 1) return '< 1 min';
    if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'}`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs} hr ${mins} min${mins === 1 ? '' : 's'}` : `${hrs} hr${hrs === 1 ? '' : 's'}`;
  };

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded inline-block mb-2">
          Member Portal &bull; Attendance
        </span>
        <h1 className="text-2xl font-bold text-slate-900">Gym Attendance</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Record your gym visits, track active workouts, and view your complete visit history.
        </p>
      </div>

      {/* Alert Messages */}
      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-md text-xs sm:text-sm text-emerald-800 flex items-center justify-between">
          <span>{message}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-md text-xs sm:text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-900 font-bold ml-2 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Summary and Check-In/Check-Out Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Simple Summary: This Month Total Gym Visits */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                This Month
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
            <h2 className="text-xs sm:text-sm font-medium text-slate-600">Total Gym Visits</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
              {loading ? '...' : `${thisMonthVisits} ${thisMonthVisits === 1 ? 'Visit' : 'Visits'}`}
            </p>
          </div>
          <p className="text-xs text-slate-500 mt-4 pt-3 border-t border-gray-100">
            Recorded physical check-ins for the current calendar month.
          </p>
        </div>

        {/* Check In / Check Out Action Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Session Status
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                  activeCheckIn
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-50 text-slate-600 border-gray-200'
                }`}
              >
                {activeCheckIn ? 'In Gym (Active)' : 'Not Checked In'}
              </span>
            </div>

            <h2 className="text-base font-bold text-slate-900">
              {activeCheckIn ? 'Active Workout Session' : 'Ready to Workout?'}
            </h2>

            <p className="text-xs text-slate-600 mt-1">
              {activeCheckIn
                ? `You checked in today at ${formatTime(activeCheckIn.checkInTime)}. Remember to check out before leaving the gym.`
                : 'Click Check In when you arrive at the gym to record your attendance.'}
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-3">
            {activeCheckIn ? (
              <button
                id="check-out-btn"
                type="button"
                disabled={actionLoading}
                onClick={handleCheckOut}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 text-white text-xs sm:text-sm font-semibold rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1 disabled:opacity-50 cursor-pointer shadow-sm transition-colors"
              >
                {actionLoading ? 'Processing...' : 'Check Out'}
              </button>
            ) : (
              <button
                id="check-in-btn"
                type="button"
                disabled={actionLoading}
                onClick={handleCheckIn}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 text-white text-xs sm:text-sm font-semibold rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 disabled:opacity-50 cursor-pointer shadow-sm transition-colors"
              >
                {actionLoading ? 'Processing...' : 'Check In'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Attendance History Table Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Attendance History</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical record of your gym check-ins, check-outs, and session durations.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {records.length} {records.length === 1 ? 'Record' : 'Records'}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            Loading attendance records...
          </div>
        ) : records.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 bg-slate-50 border border-dashed border-gray-200 rounded-md">
            No attendance records logged yet. Check in above to start your gym visit history!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check In</th>
                  <th className="py-3 px-4">Check Out</th>
                  <th className="py-3 px-4">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-800">
                {records.map((rec) => {
                  const isActive = !rec.checkOutTime || rec.status === 'active';
                  return (
                    <tr
                      key={rec._id || rec.id}
                      className={isActive ? 'bg-emerald-50/40 font-medium' : 'hover:bg-slate-50/60'}
                    >
                      <td className="py-3 px-4 text-slate-900 whitespace-nowrap">
                        {formatDate(rec.checkInTime)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {formatTime(rec.checkInTime)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isActive ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          formatTime(rec.checkOutTime)
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isActive ? (
                          <span className="text-emerald-700 font-semibold">In Progress</span>
                        ) : (
                          <span className="font-mono text-xs text-slate-700">
                            {formatDuration(rec.durationMinutes, false)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

export default AttendancePage;
