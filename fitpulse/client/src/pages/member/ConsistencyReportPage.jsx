import React, { useState, useEffect } from 'react';
import {
  Info,
  ArrowLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { analyticsApi } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const ConsistencyReportPage = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [reportData, setReportData] = useState(null);
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await analyticsApi.getConsistency({
        month: selectedMonth,
        year: selectedYear,
      });
      setReportData(res.report);
      setMotivationalQuote(res.motivationalQuote);
    } catch (err) {
      console.error('Error fetching consistency report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedMonth, selectedYear]);

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const {
    reportingPeriod,
    memberProfile,
    attendance,
  } = reportData || {};

  const expectedDays = memberProfile?.eligiblePlannedDays || 0;
  const actualDays = attendance?.actualAttendedDays || 0;
  const missedDays = Math.max(0, expectedDays - actualDays);
  const consistencyPercent = attendance?.consistencyPercentage || 0;

  // Simple feedback tier for college viva demonstration
  const getRatingFeedback = (percent) => {
    if (percent >= 85) {
      return {
        label: 'Excellent Consistency',
        badge: 'emerald',
        message: 'Superb routine adhesion! You are consistently meeting your weekly workout commitments.',
      };
    }
    if (percent >= 70) {
      return {
        label: 'Good Consistency',
        badge: 'cyan',
        message: 'Good consistency! You have established a solid training habit.',
      };
    }
    if (percent >= 50) {
      return {
        label: 'Moderate Consistency',
        badge: 'amber',
        message: 'Decent effort. Keep improving your routine to reach the target frequency.',
      };
    }
    return {
      label: 'Keep Improving Your Routine',
      badge: 'rose',
      message: 'Consistency takes time to build. Step in for your next planned session to regain rhythm.',
    };
  };

  const ratingInfo = getRatingFeedback(consistencyPercent);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 mb-2 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Member Consistency Report
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Mathematical comparison of actual gym attendances versus expected training days.
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 font-medium"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 font-medium"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Calculating monthly consistency metrics..." fullScreen={false} />
      ) : (
        <div className="space-y-6">
          {/* Consistency Percentage Banner */}
          <Card className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Adherence Score ({months.find((m) => m.value === selectedMonth)?.label} {selectedYear})
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-mono">
                    {consistencyPercent}%
                  </span>
                  <Badge variant={ratingInfo.badge} size="md">
                    {ratingInfo.label}
                  </Badge>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-500 block">Planned Target</span>
                <span className="text-sm font-bold text-emerald-700 font-mono">
                  {memberProfile?.plannedDaysPerWeek || 3} Days / Week
                </span>
              </div>
            </div>

            {/* Simple Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${Math.min(consistencyPercent, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>0% Adherence</span>
                <span>Target: 100% Eligible Days</span>
              </div>
            </div>

            {/* Motivational message */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 italic">
              "{motivationalQuote || ratingInfo.message}"
            </div>
          </Card>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4">
              <span className="text-xs text-slate-500 block">Expected Workout Days</span>
              <span className="text-2xl font-bold text-slate-900 font-mono mt-1 block">
                {expectedDays} Days
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Based on gym schedule and your target
              </span>
            </Card>

            <Card className="p-4">
              <span className="text-xs text-slate-500 block">Actual Gym Visits</span>
              <span className="text-2xl font-bold text-emerald-700 font-mono mt-1 block">
                {actualDays} Visits
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Physical check-ins verified in MongoDB
              </span>
            </Card>

            <Card className="p-4">
              <span className="text-xs text-slate-500 block">Missed Scheduled Days</span>
              <span className="text-2xl font-bold text-amber-700 font-mono mt-1 block">
                {missedDays} Days
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Planned workouts not attended
              </span>
            </Card>
          </div>

          {/* College Viva Explanation Card */}
          <Card className="p-6 space-y-3 bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Info className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900">How This Formula Works (Viva Explanation)</h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Unlike simplistic gym apps that penalize scheduled rest days or gym holiday closures, FitPulse
              uses an unbiased mathematical formula:
            </p>

            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 font-mono text-xs text-emerald-800 font-semibold">
              Consistency % = (Actual Attended Days ÷ Expected Eligible Days) × 100
            </div>

            <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
              <li>
                <strong>Eligible Days:</strong> Calculated from your planned days/week against actual facility open
                days in this month ({reportingPeriod?.gymOpenDaysCount || 0} open days).
              </li>
              <li>
                <strong>Rest Days:</strong> Rest days are excluded so members are not penalized for recovery.
              </li>
              <li>
                <strong>Bonus Visits:</strong> If you visit more than planned, the score caps at 100% and acknowledges
                extra sessions without distorting the percentage.
              </li>
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
};
