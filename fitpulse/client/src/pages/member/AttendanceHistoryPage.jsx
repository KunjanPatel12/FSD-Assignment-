import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { attendanceApi, analyticsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AttendanceHeatmap } from '../../components/attendance/AttendanceHeatmap';

export const AttendanceHistoryPage = () => {
  const { activeAttendance, checkAttendanceStatus } = useAuth();
  const { success, error: notifyError } = useNotification();
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [consistencyData, setConsistencyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [attRes, constRes] = await Promise.all([
        attendanceApi.getHistory({ page, limit: 15 }),
        analyticsApi.getConsistency(),
      ]);
      setRecords(attRes.records);
      setTotal(attRes.total);
      setConsistencyData(constRes.report);
    } catch (err) {
      console.error(err);
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
      success('Checked in successfully! Have an intense session.');
      fetchData();
    } catch (err) {
      notifyError(err.message || 'Check-in failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const res = await attendanceApi.checkOut();
      await checkAttendanceStatus();
      success(`Checked out! Session duration: ${res.durationMinutes} minutes. Great work!`);
      fetchData();
    } catch (err) {
      notifyError(err.message || 'Check-out failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && page === 1) {
    return <LoadingSpinner text="Loading attendance history..." fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Gym Attendance & Consistency Records
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Physical check-in timestamps, visit durations, and verified consistency metrics.
          </p>
        </div>

        {/* Inline Check-in / Check-out Controls */}
        <div className="flex items-center gap-3">
          {activeAttendance ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                In Session since {new Date(activeAttendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

      {/* Heatmap */}
      {consistencyData?.dailyHistory && (
        <AttendanceHeatmap
          dailyHistory={consistencyData.dailyHistory}
          title="30-Day Attendance Heatmap"
        />
      )}

      {/* Attendance History Table */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white">Visit History ({total} Total)</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="pb-3 font-semibold">DATE</th>
                <th className="pb-3 font-semibold">CHECK-IN</th>
                <th className="pb-3 font-semibold">CHECK-OUT</th>
                <th className="pb-3 font-semibold">DURATION</th>
                <th className="pb-3 font-semibold">METHOD</th>
                <th className="pb-3 font-semibold">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {records.map((r) => (
                <tr key={r._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 font-medium font-mono text-white">{r.dateKey}</td>
                  <td className="py-3.5">
                    {new Date(r.checkInTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3.5">
                    {r.checkOutTime
                      ? new Date(r.checkOutTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Active'}
                  </td>
                  <td className="py-3.5 font-mono text-emerald-400">
                    {r.durationMinutes ? `${r.durationMinutes} mins` : 'In Session'}
                  </td>
                  <td className="py-3.5">
                    <span className="inline-flex items-center gap-1 capitalize font-mono text-[11px] text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {r.method === 'staff_override' ? 'Staff' : 'Manual'}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <Badge variant={r.status === 'completed' ? 'emerald' : 'amber'} size="sm">
                      {r.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">
                    No attendance records logged yet. Check in to record your first visit!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 15 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
            <span className="text-slate-400">
              Showing page {page} of {Math.ceil(total / 15)}
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
