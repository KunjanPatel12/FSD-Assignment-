import React, { useState, useEffect } from 'react';

const ALL_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

function AdminSchedulePage({ currentUser, onNavigate }) {
  const [openDays, setOpenDays] = useState([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]);
  const [closedDays, setClosedDays] = useState(['Sunday']);
  const [openingTime, setOpeningTime] = useState('06:00 AM');
  const [closingTime, setClosingTime] = useState('10:00 PM');
  const [notes, setNotes] = useState('Standard facility operating schedule');
  const [lastUpdated, setLastUpdated] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Role guard: Only admin users allowed
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border border-red-200 rounded-lg p-8 text-center max-w-md mx-auto shadow-sm space-y-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
            Access Restricted
          </span>
          <h2 className="text-lg font-bold text-slate-900">Administrator Access Required</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            You do not have administrative privileges to configure the gym operating schedule.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('dashboard')}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Fetch current schedule from MongoDB
  const fetchSchedule = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('fitpulse_token');
      const res = await fetch('/api/admin/schedule', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const result = await res.json();
      if (res.ok && result.status === 'success' && result.data) {
        const data = result.data;
        const fetchedOpen = Array.isArray(data.openDays) && data.openDays.length > 0
          ? data.openDays
          : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const fetchedClosed = Array.isArray(data.closedDays)
          ? data.closedDays
          : ALL_DAYS.filter((d) => !fetchedOpen.includes(d));

        setOpenDays(fetchedOpen);
        setClosedDays(fetchedClosed);
        setOpeningTime(data.openingTime || '06:00 AM');
        setClosingTime(data.closingTime || '10:00 PM');
        setNotes(data.notes || 'Standard facility operating schedule');
        setLastUpdated(data.updatedAt || null);
      } else {
        throw new Error(result.message || 'Failed to load schedule from server.');
      }
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError(err.message || 'Network error while retrieving operating schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const showNotification = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage('');
    }, 4500);
  };

  // Toggle a day between Open and Closed
  const handleToggleDay = (day) => {
    setError('');
    if (openDays.includes(day)) {
      // Trying to close this day
      if (openDays.length <= 1) {
        setError('At least one day must remain open for the gym to operate.');
        return;
      }
      const newOpen = openDays.filter((d) => d !== day);
      const newClosed = [...closedDays.filter((d) => d !== day), day];
      setOpenDays(newOpen);
      setClosedDays(newClosed);
    } else {
      // Opening this day
      const newOpen = [...openDays, day];
      const newClosed = closedDays.filter((d) => d !== day);
      setOpenDays(newOpen);
      setClosedDays(newClosed);
    }
  };

  // Quick preset handlers
  const handleApplyPreset = (presetType) => {
    setError('');
    if (presetType === 'standard') {
      // Mon-Sat open, Sun closed
      setOpenDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
      setClosedDays(['Sunday']);
      setOpeningTime('06:00 AM');
      setClosingTime('10:00 PM');
    } else if (presetType === 'weekdays') {
      // Mon-Fri open, Sat & Sun closed
      setOpenDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
      setClosedDays(['Saturday', 'Sunday']);
      setOpeningTime('06:00 AM');
      setClosingTime('09:00 PM');
    } else if (presetType === 'all7') {
      // All 7 days open
      setOpenDays([...ALL_DAYS]);
      setClosedDays([]);
      setOpeningTime('06:00 AM');
      setClosingTime('10:00 PM');
    }
    showNotification(`Preset applied. Click "Save Operating Schedule" to commit changes.`);
  };

  // Save updated schedule to MongoDB
  const handleSaveSchedule = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (openDays.length === 0) {
      setError('Please select at least one open day for the facility.');
      return;
    }

    if (!openingTime.trim() || !closingTime.trim()) {
      setError('Opening and closing times are required.');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('fitpulse_token');
      const res = await fetch('/api/admin/schedule', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          openDays,
          closedDays,
          openingTime: openingTime.trim(),
          closingTime: closingTime.trim(),
          notes: notes.trim(),
        }),
      });

      const result = await res.json();
      if (res.ok && result.status === 'success') {
        setLastUpdated(result.data?.updatedAt || new Date().toISOString());
        showNotification('Gym operating schedule successfully saved to MongoDB. Consistency reports will now use this updated schedule.');
      } else {
        throw new Error(result.message || 'Failed to save schedule.');
      }
    } catch (err) {
      console.error('Save schedule error:', err);
      setError(err.message || 'Failed to update schedule in database.');
    } finally {
      setSaving(false);
    }
  };

  // Calculate live preview metrics for the current calendar month
  const now = new Date();
  const currentMonthDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  let estimatedClosedDays = 0;
  for (let d = 1; d <= currentMonthDays; d++) {
    const dayName = ALL_DAYS[(new Date(now.getFullYear(), now.getMonth(), d).getDay() + 6) % 7];
    // Map standard getDay (0=Sun, 1=Mon, ..., 6=Sat)
    const stdDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(now.getFullYear(), now.getMonth(), d).getDay()];
    if (closedDays.includes(stdDay) || !openDays.includes(stdDay)) {
      estimatedClosedDays++;
    }
  }
  const estimatedOpenDays = currentMonthDays - estimatedClosedDays;
  const weeklyOpen = Math.max(1, openDays.length);
  const sampleMemberExpected = Math.max(1, Math.round(estimatedOpenDays * (Math.min(5, weeklyOpen) / weeklyOpen)));

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                Admin Center &bull; Facility Operations
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-500">MongoDB Configuration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Gym Operating Schedule
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Configure open days, closed days, and facility hours. Member Consistency Reports automatically recalculate using this schedule.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={fetchSchedule}
              disabled={loading || saving}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-gray-300 rounded-md hover:bg-slate-50 shadow-sm cursor-pointer disabled:opacity-50"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={handleSaveSchedule}
              disabled={loading || saving}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center space-x-1"
            >
              {saving ? <span>Saving...</span> : <span>Save Schedule</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md text-xs sm:text-sm text-emerald-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-emerald-700">&check;</span>
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            className="text-emerald-700 font-bold ml-2 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-xs sm:text-sm text-red-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-red-700">&excl;</span>
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-700 font-bold ml-2 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-xs text-slate-500 shadow-sm">
          <div className="w-8 h-8 border-3 border-gray-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
          Loading gym operating schedule from database...
        </div>
      ) : (
        <>
          {/* Quick Schedule Presets */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Standard Schedule Presets</h2>
                <p className="text-xs text-slate-500">Quickly apply standard operational templates</p>
              </div>
              <span className="text-xs text-slate-400">
                {lastUpdated ? `Last updated: ${new Date(lastUpdated).toLocaleDateString()}` : 'Configured'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleApplyPreset('standard')}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md hover:bg-emerald-100 cursor-pointer"
              >
                Standard (Mon &ndash; Sat Open &bull; Sunday Closed)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('weekdays')}
                className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 rounded-md hover:bg-blue-100 cursor-pointer"
              >
                Weekdays Only (Mon &ndash; Fri Open &bull; Weekend Closed)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('all7')}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 rounded-md hover:bg-slate-200 cursor-pointer"
              >
                Full Week (All 7 Days Open)
              </button>
            </div>
          </div>

          {/* Section 1: Weekly Days Configuration (Open / Closed Days) */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Gym Working Days</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click on any day to toggle between Open and Closed states.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {openDays.length} Days Open
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  {closedDays.length} Days Closed
                </span>
              </div>
            </div>

            {/* 7 Days Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
              {ALL_DAYS.map((day) => {
                const isOpen = openDays.includes(day);
                return (
                  <div
                    key={day}
                    className={`p-4 rounded-md border flex flex-col justify-between transition-colors ${
                      isOpen
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : 'bg-slate-50 border-gray-200'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
                        {day.slice(0, 3)}
                      </span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{day}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200/60 flex flex-col space-y-2">
                      <span
                        className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-semibold border ${
                          isOpen
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                      >
                        {isOpen ? 'OPEN' : 'CLOSED'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleToggleDay(day)}
                        className={`w-full py-1 text-xs font-medium rounded border cursor-pointer transition-colors ${
                          isOpen
                            ? 'bg-white text-slate-700 border-gray-300 hover:bg-slate-50'
                            : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                        }`}
                      >
                        {isOpen ? 'Mark Closed' : 'Mark Open'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detailed summary breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                <span className="font-semibold text-emerald-900 block mb-0.5">Configured Open Days:</span>
                <span className="text-emerald-800 font-medium">
                  {openDays.length > 0 ? openDays.join(', ') : 'None'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-gray-200 rounded-md">
                <span className="font-semibold text-slate-900 block mb-0.5">Configured Closed Days:</span>
                <span className="text-slate-600 font-medium">
                  {closedDays.length > 0 ? closedDays.join(', ') : 'None (Open 7 Days)'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Facility Operating Hours */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Facility Operating Hours</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Set standard opening and closing times for trainees and staff.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Opening Time
                </label>
                <input
                  type="text"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  placeholder="e.g. 06:00 AM"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Facility doors unlock for training sessions
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Closing Time
                </label>
                <input
                  type="text"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  placeholder="e.g. 10:00 PM"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Final checkout and facility lockup
                </span>
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Schedule Note / Description
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Standard facility schedule"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Visible in administrative reports
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Live Consistency Impact Calculation Box */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded inline-block mb-1">
                Live Calculation Verification
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Consistency Report Impact ({now.toLocaleString('en-US', { month: 'long', year: 'numeric' })})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                The Member Consistency Report uses this formula dynamically:
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-gray-200 rounded-md font-mono text-xs text-slate-800 space-y-1">
              <p>Expected Training Days = Round(Gym Open Days In Month &times; (Planned Days / Weekly Open Days))</p>
              <p>Consistency Rate = (Actual Visits &divide; Expected Training Days) &times; 100</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 border border-gray-200 rounded-md">
                <span className="text-slate-500 block">Current Month Days:</span>
                <span className="text-base font-bold text-slate-900">{currentMonthDays} Days</span>
              </div>
              <div className="p-3 bg-slate-50 border border-gray-200 rounded-md">
                <span className="text-slate-500 block">Gym Closed Days:</span>
                <span className="text-base font-bold text-slate-900">{estimatedClosedDays} Days</span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                <span className="text-emerald-900 block font-medium">Gym Open Days:</span>
                <span className="text-base font-bold text-emerald-800">{estimatedOpenDays} Days</span>
              </div>
              <div className="p-3 bg-slate-50 border border-gray-200 rounded-md">
                <span className="text-slate-500 block">Sample 5-Day Trainee Target:</span>
                <span className="text-base font-bold text-slate-900">{sampleMemberExpected} Expected Days</span>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('dashboard')}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-gray-300 rounded-md hover:bg-slate-50 shadow-sm cursor-pointer"
            >
              Back to Admin Dashboard
            </button>
            <button
              type="button"
              onClick={handleSaveSchedule}
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Operating Schedule'}
            </button>
          </div>
        </>
      )}
    </main>
  );
}

export default AdminSchedulePage;
