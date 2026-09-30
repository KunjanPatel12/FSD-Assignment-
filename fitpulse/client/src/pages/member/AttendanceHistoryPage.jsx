import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  LogOut,
} from 'lucide-react';
import { attendanceApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AttendanceHistoryPage = () => {
  const { activeAttendance, checkAttendanceStatus } = useAuth();
  const { success, error: notifyError } = useNotification();
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const attRes = await attendanceApi.getHistory({ page, limit: 15 });
      setRecords(attRes.records || []);
      setTotal(attRes.total || 0);
    } catch (err) {
      console.error('Error fetching attendance history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await attendanceApi.checkIn({ method: 'manual' });
      await checkAttendanceStatus();
      success('Checked in successfully! Have a great workout session.');
      fetchData();
    } catch (err) {
      notifyError(err.message || 'Check-in failed. Please verify gym hours.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const res = await attendanceApi.checkOut();
      await checkAttendanceStatus();
      success(`Checked out! Session duration: ${res.durationMinutes} minutes.`);
      fetchData();
    } catch (err) {
      notifyError(err.message || 'Check-out failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Format date and time in user's local time (Asia/Kolkata default)
  const formatKolkataTime = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return new Date(dateStr).toLocaleTimeString();
    }
  };

  const formatKolkataDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading && page === 1) {
    return <LoadingSpinner text="Loading gym attendance records..." fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-white">
      {/* Header & Inline Check-In Controls */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono text-emerald-700 uppercase tracking-wider font-bold">
                Gym Floor Access
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">Asia/Kolkata Time (IST)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Gym Attendance & Session History
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Simple physical check-in timestamps and visit duration tracking.
            </p>
          </div>

          {/* Inline Check-In / Check-Out Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {activeAttendance ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  In Session since {formatKolkataTime(activeAttendance.checkInTime)}
                </span>
                <Button
                  onClick={handleCheckOut}
                  isLoading={actionLoading}
                  variant="danger"
                  size="md"
                  leftIcon={<LogOut className="w-4 h-4" />}
                >
                  Check Out of Gym
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleCheckIn}
                isLoading={actionLoading}
                variant="primary"
                size="md"
                leftIcon={<CalendarCheck className="w-4 h-4" />}
              >
                Check In to Gym
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Current Attendance State Card */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-medium">Current Status:</span>
          {activeAttendance ? (
            <Badge variant="emerald" size="sm">
              ACTIVE SESSION IN PROGRESS
            </Badge>
          ) : (
            <Badge variant="slate" size="sm">
              NOT CURRENTLY CHECKED IN
            </Badge>
          )}
        </div>

        <span className="text-slate-600 text-xs">
          Total Visits Logged: <strong className="text-slate-900">{total}</strong>
        </span>
      </div>

      {/* Attendance History Table */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="text-base font-bold text-slate-900">Attendance Log History</h3>
          <span className="text-xs text-slate-500 font-mono">Total {total} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-slate-500 font-mono">
                <th className="pb-3 font-semibold">DATE (IST)</th>
                <th className="pb-3 font-semibold">CHECK-IN</th>
                <th className="pb-3 font-semibold">CHECK-OUT</th>
                <th className="pb-3 font-semibold">VISIT DURATION</th>
                <th className="pb-3 font-semibold">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-600">
              {records.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 font-medium font-mono text-slate-900">
                    {formatKolkataDate(r.checkInTime || r.dateKey)}
                  </td>
                  <td className="py-3.5 font-mono">{formatKolkataTime(r.checkInTime)}</td>
                  <td className="py-3.5 font-mono">
                    {r.checkOutTime ? formatKolkataTime(r.checkOutTime) : (
                      <span className="text-emerald-700 font-bold">Active Now</span>
                    )}
                  </td>
                  <td className="py-3.5 font-mono text-emerald-700 font-medium">
                    {r.durationMinutes ? `${r.durationMinutes} mins` : 'In Session'}
                  </td>
                  <td className="py-3.5">
                    <Badge variant={r.status === 'completed' ? 'emerald' : 'amber'} size="sm">
                      {r.status === 'completed' ? 'Completed' : 'Active'}
                    </Badge>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-400">
                    No attendance records logged yet. Click "Check In to Gym" above to start your first session.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 15 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs">
            <span className="text-slate-500">
              Page {page} of {Math.ceil(total / 15)}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(total / 15)}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
