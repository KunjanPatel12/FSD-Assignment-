import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Activity,
  Calendar,
  Clock,
  Save,
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';

export const AdminDashboard = () => {
  const { success, error: notifyError } = useNotification();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'schedule'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, scheduleRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers({ limit: 50 }),
        adminApi.getSchedule(),
      ]);
      setStats(statsRes.stats);
      setUsers(usersRes.users || []);
      setScheduleData(scheduleRes.schedules || []);
    } catch (err) {
      console.error(err);
      notifyError('Failed to load administrative data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminApi.updateUserRole(userId, { role: newRole });
      success('User role updated successfully.');
      fetchAdminData();
    } catch (err) {
      notifyError('Failed to change user role.');
    }
  };

  const handleToggleActive = async (userId, currentActive) => {
    try {
      await adminApi.updateUserRole(userId, { isActive: !currentActive });
      success(`User account ${!currentActive ? 'activated' : 'deactivated'}.`);
      fetchAdminData();
    } catch (err) {
      notifyError('Failed to update user status.');
    }
  };

  const handleScheduleChange = (index, field, value) => {
    setScheduleData((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const handleSaveSchedule = async () => {
    setSavingSchedule(true);
    try {
      await adminApi.updateSchedule({ schedules: scheduleData });
      success('Gym operating schedule updated.');
    } catch (err) {
      notifyError('Failed to update gym schedule.');
    } finally {
      setSavingSchedule(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Compiling administrative telemetry..." fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-white">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-2">
          <Shield className="w-3.5 h-3.5 text-emerald-600" /> Administrative Operations Center
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          System Overview & Facility Control
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage member accounts, gym operating hours, and platform telemetry.
        </p>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
        {[
          { id: 'overview', label: 'Platform Stats' },
          { id: 'users', label: `Users (${users.length})` },
          { id: 'schedule', label: 'Gym Operating Schedule' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              subtitle={`${stats?.totalMembers || 0} Members, ${stats?.totalTrainers || 0} Trainers`}
              icon={Users}
              color="emerald"
            />
            <StatCard
              title="Check-Ins Today"
              value={stats?.todayAttendances || 0}
              subtitle="Physical gym entries"
              icon={Calendar}
              color="emerald"
            />
            <StatCard
              title="Currently Active in Gym"
              value={stats?.activeCheckIns || 0}
              subtitle="Floor occupancy count"
              icon={Activity}
              color="emerald"
            />
            <StatCard
              title="Total Workouts Logged"
              value={stats?.totalWorkoutsCompleted || 0}
              subtitle={`${stats?.totalExercises || 0} Curated movements`}
              icon={Clock}
              color="emerald"
            />
          </div>

          <Card className="space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 pb-3 border-b border-gray-100">
              Platform Architecture Health
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-gray-200">
                <span className="text-slate-500 block text-[11px] font-semibold uppercase mb-1">
                  Database Status
                </span>
                <span className="text-emerald-700 font-bold text-xs sm:text-sm">
                  Connected (Mongoose Active)
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-gray-200">
                <span className="text-slate-500 block text-[11px] font-semibold uppercase mb-1">
                  Security Headers
                </span>
                <span className="text-emerald-700 font-bold text-xs sm:text-sm">
                  Helmet & Rate Limiting On
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-gray-200">
                <span className="text-slate-500 block text-[11px] font-semibold uppercase mb-1">
                  Workout Generator
                </span>
                <span className="text-emerald-700 font-bold text-xs sm:text-sm">
                  Deterministic Engine Ready
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Users Management */}
      {activeTab === 'users' && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-base font-bold text-slate-900">User Accounts & Roles</h3>
            <span className="text-xs text-slate-500">Total registered: {users.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="pb-3 pr-4">NAME</th>
                  <th className="pb-3 pr-4">EMAIL</th>
                  <th className="pb-3 pr-4">ROLE</th>
                  <th className="pb-3 pr-4">STATUS</th>
                  <th className="pb-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 pr-4 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3 pr-4 text-slate-500 font-mono text-xs">{u.email}</td>
                    <td className="py-3 pr-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-slate-800 text-xs capitalize focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                      >
                        <option value="member">member</option>
                        <option value="trainer">trainer</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={u.isActive ? 'emerald' : 'rose'} size="sm">
                        {u.isActive ? 'Active' : 'Disabled'}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleToggleActive(u._id, u.isActive)}
                        className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-colors ${
                          u.isActive
                            ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                            : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Gym Operating Schedule */}
      {activeTab === 'schedule' && (
        <Card className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Facility Operational Hours</h3>
              <p className="text-xs text-slate-500">
                Controls eligible open days for consistency analytics calculations.
              </p>
            </div>
            <Button
              onClick={handleSaveSchedule}
              isLoading={savingSchedule}
              variant="primary"
              size="sm"
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Schedule Changes
            </Button>
          </div>

          <div className="space-y-3">
            {scheduleData.map((s, idx) => (
              <div
                key={s.dayOfWeek}
                className="p-3.5 rounded-xl bg-slate-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm"
              >
                <div className="w-32 font-bold text-slate-900">{s.dayName}</div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={s.isOpen}
                      onChange={(e) => handleScheduleChange(idx, 'isOpen', e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 focus:ring-emerald-600"
                    />
                    <span
                      className={
                        s.isOpen
                          ? 'text-emerald-700 font-semibold text-xs sm:text-sm'
                          : 'text-slate-400 text-xs sm:text-sm'
                      }
                    >
                      {s.isOpen ? 'Facility Open' : 'Closed'}
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs text-slate-600">
                  <span>Open:</span>
                  <input
                    type="time"
                    disabled={!s.isOpen}
                    value={s.openTime}
                    onChange={(e) => handleScheduleChange(idx, 'openTime', e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-slate-800 disabled:opacity-40 disabled:bg-gray-100 focus:outline-none focus:border-emerald-600"
                  />
                  <span>Close:</span>
                  <input
                    type="time"
                    disabled={!s.isOpen}
                    value={s.closeTime}
                    onChange={(e) => handleScheduleChange(idx, 'closeTime', e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-slate-800 disabled:opacity-40 disabled:bg-gray-100 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
