import React, { useState, useEffect } from 'react';

function ConsistencyReportPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Scenario simulator controls
  const [useCustomScenario, setUseCustomScenario] = useState(false);
  const [scenarioDaysPerWeek, setScenarioDaysPerWeek] = useState(5);
  const [scenarioActualVisits, setScenarioActualVisits] = useState(20);
  const [scenarioSundaysClosed, setScenarioSundaysClosed] = useState(true);

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
        setScenarioDaysPerWeek(result.data.plannedDaysPerWeek || 5);
        setScenarioActualVisits(result.data.actualGymVisits || 0);
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

  // Mathematical consistency calculation function
  const calculateMetrics = (plannedDays, actual, sundaysClosed) => {
    const totalDaysInMonth = report?.totalDaysInMonth || 31;
    const sundayCount = report?.sundayCount || 4;

    const gymClosedDays = sundaysClosed ? sundayCount : 0;
    const gymOpenDays = totalDaysInMonth - gymClosedDays;

    const maxWeeklyOpenDays = sundaysClosed ? 6 : 7;
    const effectivePlanned = Math.min(Math.max(1, Number(plannedDays)), maxWeeklyOpenDays);

    // Expected workout days = round(gymOpenDays * (effectivePlanned / maxWeeklyOpenDays))
    const expected = Math.max(1, Math.round(gymOpenDays * (effectivePlanned / maxWeeklyOpenDays)));

    // Consistency Percentage = (actual / expected) * 100
    const rawPct = (Number(actual) / expected) * 100;
    const percentage = Math.min(100, Math.round(rawPct));

    // Category determination
    let category = '';
    let motivationalMessage = '';
    let categoryStyle = '';

    if (percentage >= 85) {
      category = 'Excellent';
      motivationalMessage = 'Outstanding commitment! You are crushing your fitness goals with stellar consistency.';
      categoryStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    } else if (percentage >= 70) {
      category = 'Good';
      motivationalMessage = 'Great discipline! Keep this strong momentum going toward your personal best.';
      categoryStyle = 'bg-blue-50 text-blue-800 border-blue-200';
    } else if (percentage >= 50) {
      category = 'Moderate';
      motivationalMessage = "You're making steady progress. An extra session this week will elevate your results.";
      categoryStyle = 'bg-amber-50 text-amber-800 border-amber-200';
    } else {
      category = 'Needs Improvement';
      motivationalMessage = 'Every workout counts. Recommit to your schedule and take it one session at a time.';
      categoryStyle = 'bg-red-50 text-red-800 border-red-200';
    }

    return {
      totalDaysInMonth,
      gymClosedDays,
      gymOpenDays,
      effectivePlanned,
      expected,
      actual: Number(actual),
      percentage,
      category,
      motivationalMessage,
      categoryStyle,
    };
  };

  // Determine active displayed metrics (either live member data or custom scenario)
  const activeMetrics = useCustomScenario
    ? calculateMetrics(scenarioDaysPerWeek, scenarioActualVisits, scenarioSundaysClosed)
    : report
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
                <span className="text-slate-500 block">Gym Closed (Sundays):</span>
                <span className="text-base font-bold text-slate-900">{activeMetrics?.gymClosedDays} Days</span>
              </div>
              <div className="p-3 bg-slate-50 border border-gray-200 rounded-md">
                <span className="text-slate-500 block">Gym Open Days:</span>
                <span className="text-base font-bold text-slate-900">{activeMetrics?.gymOpenDays} Days</span>
              </div>
              <div className="p-3 bg-slate-50 border border-gray-200 rounded-md">
                <span className="text-slate-500 block">Planned Schedule:</span>
                <span className="text-base font-bold text-slate-900">{activeMetrics?.effectivePlanned} Days / Week</span>
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

          {/* Test Scenario Simulator */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Scenario Testing &amp; Manual Verification</h2>
                <p className="text-xs text-slate-500">
                  Test and manually verify consistency calculation across different workout schedules and attendance figures.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUseCustomScenario(!useCustomScenario)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                  useCustomScenario
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-gray-300 hover:bg-slate-50'
                }`}
              >
                {useCustomScenario ? 'Testing Custom Scenario (Active)' : 'Test Example Scenarios'}
              </button>
            </div>

            {useCustomScenario && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Select Planned Days */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Planned Schedule (Days / Week)
                    </label>
                    <select
                      value={scenarioDaysPerWeek}
                      onChange={(e) => setScenarioDaysPerWeek(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value={3}>3 Days / Week (Casual)</option>
                      <option value={4}>4 Days / Week (Upper/Lower)</option>
                      <option value={5}>5 Days / Week (Hypertrophy)</option>
                      <option value={6}>6 Days / Week (Push/Pull/Legs)</option>
                    </select>
                  </div>

                  {/* Input Actual Visits */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Actual Gym Visits This Month
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={31}
                      value={scenarioActualVisits}
                      onChange={(e) => setScenarioActualVisits(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Toggle Sundays Closed */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Gym Configuration
                    </label>
                    <div className="flex items-center h-[38px] space-x-2">
                      <input
                        id="sundays-closed-checkbox"
                        type="checkbox"
                        checked={scenarioSundaysClosed}
                        onChange={(e) => setScenarioSundaysClosed(e.target.checked)}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <label htmlFor="sundays-closed-checkbox" className="text-xs text-slate-700">
                        Sundays configured as closed
                      </label>
                    </div>
                  </div>
                </div>

                {/* Preset Scenario Buttons */}
                <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-2 text-xs">
                  <span className="text-slate-500 self-center mr-1 font-medium">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setScenarioDaysPerWeek(5);
                      setScenarioActualVisits(20);
                      setScenarioSundaysClosed(true);
                    }}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded hover:bg-emerald-100 cursor-pointer font-medium"
                  >
                    Scenario 1: 5 days/wk &bull; 20 visits (Excellent: ~87%)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScenarioDaysPerWeek(4);
                      setScenarioActualVisits(14);
                      setScenarioSundaysClosed(true);
                    }}
                    className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded hover:bg-blue-100 cursor-pointer font-medium"
                  >
                    Scenario 2: 4 days/wk &bull; 14 visits (Good: ~78%)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScenarioDaysPerWeek(3);
                      setScenarioActualVisits(8);
                      setScenarioSundaysClosed(true);
                    }}
                    className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded hover:bg-amber-100 cursor-pointer font-medium"
                  >
                    Scenario 3: 3 days/wk &bull; 8 visits (Moderate: ~57%)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScenarioDaysPerWeek(5);
                      setScenarioActualVisits(9);
                      setScenarioSundaysClosed(true);
                    }}
                    className="px-2.5 py-1 bg-red-50 text-red-800 border border-red-200 rounded hover:bg-red-100 cursor-pointer font-medium"
                  >
                    Scenario 4: 5 days/wk &bull; 9 visits (Needs Impr: ~39%)
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}

export default ConsistencyReportPage;
