import React, { useState, useEffect } from 'react';

function ConsistencyReportPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Scenario simulator controls removed

  // Fetch consistency report from backend
  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('fitpulse_token');
      const res = await fetch('/api/member/consistency', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const result = await res.json();
      if (res.ok && result.status === 'success' && result.data) {
        setReport(result.data);
      } else {
        setError(result.message || 'Failed to load consistency data.');
      }
    } catch (err) {
      console.error('Fetch consistency error:', err);
      setError('Unable to load consistency report. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  // Determine active displayed metrics from real report data
  const activeMetrics = report
    ? {
        totalDaysInMonth: report.totalDaysInMonth,
        gymClosedDays: report.gymClosedDays,
        gymOpenDays: report.gymOpenDays,
        effectivePlanned: report.plannedDaysPerWeek,
        expected: report.expectedWorkoutDays,
        actual: report.actualGymVisits,
        percentage: report.consistencyPercentage,
        category: report.category,
        motivationalMessage: report.motivationalMessage,
        categoryStyle:
          report.consistencyPercentage >= 85
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : report.consistencyPercentage >= 70
            ? 'bg-blue-50 text-blue-800 border-blue-200'
            : report.consistencyPercentage >= 50
            ? 'bg-amber-50 text-amber-800 border-amber-200'
            : 'bg-red-50 text-red-800 border-red-200',
      }
    : null;

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded inline-block mb-2">
          Member Portal &bull; Consistency Report
        </span>
        <h1 className="text-2xl font-bold text-slate-900">Workout Consistency</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Measure how consistently you follow your planned workout schedule relative to gym operating days.
        </p>
      </div>

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

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-xs text-slate-500 shadow-sm">
          Calculating monthly consistency metrics...
        </div>
      ) : (
        <>
          {/* 3 Core Metric Display Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Card 1: Expected Workout Days */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                  Expected Workout Days
                </span>
                <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
                  {activeMetrics?.expected} <span className="text-base font-medium text-slate-500">Days</span>
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-4 pt-3 border-t border-gray-100">
                Calculated from {activeMetrics?.effectivePlanned} planned days/week across open gym days.
              </p>
            </div>

            {/* Card 2: Actual Gym Visits */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                  Actual Gym Visits
                </span>
                <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
                  {activeMetrics?.actual} <span className="text-base font-medium text-slate-500">Visits</span>
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-4 pt-3 border-t border-gray-100">
                Verified check-in sessions recorded for this calendar month.
              </p>
            </div>

            {/* Card 3: Consistency Percentage */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Consistency Rate
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${activeMetrics?.categoryStyle}`}
                  >
                    {activeMetrics?.category}
                  </span>
                </div>
                <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 mt-1">
                  {activeMetrics?.percentage}%
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-4 pt-3 border-t border-gray-100 font-mono">
                Formula: ({activeMetrics?.actual} &divide; {activeMetrics?.expected}) &times; 100
              </p>
            </div>
          </div>

          {/* Motivational Message Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <span className="text-xl">&bull;</span>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                  Trainer Motivation
                </span>
                <p className="text-sm sm:text-base font-medium text-slate-900 mt-0.5">
                  &ldquo;{activeMetrics?.motivationalMessage}&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Simple Monthly Attendance Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-gray-100">
              Monthly Attendance Summary ({report?.monthName || 'Current Month'})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 border border-gray-200 rounded-md">
                <span className="text-slate-500 block">Calendar Days:</span>
                <span className="text-base font-bold text-slate-900">{activeMetrics?.totalDaysInMonth} Days</span>
              </div>
              <div className="p-3 bg-slate-50 border border-gray-200 rounded-md">
                <span className="text-slate-500 block">Gym Closed Days:</span>
                <span className="text-base font-bold text-slate-900">{activeMetrics?.gymClosedDays} Days</span>
                <span className="text-[11px] text-slate-500 block mt-0.5 truncate">
                  {report?.closedDays?.length > 0 ? report.closedDays.join(', ') : 'None'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-gray-200 rounded-md">
                <span className="text-slate-500 block">Gym Open Days:</span>
                <span className="text-base font-bold text-slate-900">{activeMetrics?.gymOpenDays} Days</span>
                <span className="text-[11px] text-slate-500 block mt-0.5 truncate">
                  {report?.openDays?.length || 6} days/wk ({report?.openingTime || '6 AM'} - {report?.closingTime || '10 PM'})
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-gray-200 rounded-md">
                <span className="text-slate-500 block">Planned Schedule:</span>
                <span className="text-base font-bold text-slate-900">{activeMetrics?.effectivePlanned} Days / Week</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Member target
                </span>
              </div>
            </div>
          </div>

          {/* Category Reference Guide */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-3">Consistency Categories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className={`p-3 rounded-md border ${activeMetrics?.category === 'Excellent' ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-500' : 'bg-slate-50 border-gray-200'}`}>
                <div className="font-bold text-emerald-800">85% &ndash; 100%</div>
                <div className="font-semibold text-slate-900 mt-1">Excellent</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Top-tier consistency and dedication</div>
              </div>

              <div className={`p-3 rounded-md border ${activeMetrics?.category === 'Good' ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-500' : 'bg-slate-50 border-gray-200'}`}>
                <div className="font-bold text-blue-800">70% &ndash; 84%</div>
                <div className="font-semibold text-slate-900 mt-1">Good</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Solid routine adhering to schedule</div>
              </div>

              <div className={`p-3 rounded-md border ${activeMetrics?.category === 'Moderate' ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-500' : 'bg-slate-50 border-gray-200'}`}>
                <div className="font-bold text-amber-800">50% &ndash; 69%</div>
                <div className="font-semibold text-slate-900 mt-1">Moderate</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Moderate attendance; room to improve</div>
              </div>

              <div className={`p-3 rounded-md border ${activeMetrics?.category === 'Needs Improvement' ? 'bg-red-50 border-red-300 ring-1 ring-red-500' : 'bg-slate-50 border-gray-200'}`}>
                <div className="font-bold text-red-800">Below 50%</div>
                <div className="font-semibold text-slate-900 mt-1">Needs Improvement</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Attendance below planned commitment</div>
              </div>
            </div>
          </div>


        </>
      )}
    </main>
  );
}

export default ConsistencyReportPage;
