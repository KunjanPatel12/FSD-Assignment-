import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Activity,
  Calendar,
  Lock,
  Clock,
  Save,
  CheckCircle2,
  XCircle,
  FileText,
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
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'schedule' | 'logs'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, scheduleRes, logsRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers({ limit: 50 }),
        adminApi.getSchedule(),
        adminApi.getAuditLogs({ limit: 50 }),
      ]);
      setStats(statsRes.stats);
      setUsers(usersRes.users);
      setScheduleData(scheduleRes.schedules || []);
      setAuditLogs(logsRes.logs || []);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold mb-2">
          <Shield className="w-3.5 h-3.5" /> Administrative Operations Center
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          System Overview & Facility Control
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage member accounts, gym operating hours, security logs, and platform telemetry.
        </p>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'overview', label: 'Platform Stats' },
          { id: 'users', label: `Users (${users.length})` },
          { id: 'schedule', label: 'Gym Operating Schedule' },
          { id: 'logs', label: `Security Audit Logs (${auditLogs.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
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
              color="purple"
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
              color="cyan"
            />
            <StatCard
              title="Total Workouts Logged"
              value={stats?.totalWorkoutsCompleted || 0}
              subtitle={`${stats?.totalExercises || 0} Curated movements`}
              icon={Clock}
              color="amber"
            />
          </div>

          <Card className="space-y-3">
            <h3 className="text-sm font-bold text-white pb-2 border-b border-slate-800">
              Platform Architecture Health
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">Database Status</span>
                <span className="text-emerald-400 font-bold">Connected (Mongoose Active)</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">Security Headers</span>
                <span className="text-cyan-400 font-bold">Helmet & Rate Limiting On</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">Workout Generator</span>
                <span className="text-purple-400 font-bold">Deterministic Engine Ready</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Users Management */}
      {activeTab === 'users' && (
        <Card className="space-y-4">
          <h3 className="text-base font-bold text-white pb-2 border-b border-slate-800">
            User Accounts & Roles
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="pb-3 font-semibold">NAME</th>
                  <th className="pb-3 font-semibold">EMAIL</th>
                  <th className="pb-3 font-semibold">ROLE</th>
                  <th className="pb-3 font-semibold">STATUS</th>
                  <th className="pb-3 font-semibold text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 font-bold text-white">{u.name}</td>
                    <td className="py-3 text-slate-400 font-mono">{u.email}</td>
                    <td className="py-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white font-mono text-[11px] capitalize focus:outline-none"
                      >
                        <option value="member">member</option>
                        <option value="trainer">trainer</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="py-3">
                      <Badge variant={u.isActive ? 'emerald' : 'rose'} size="sm">
                        {u.isActive ? 'Active' : 'Disabled'}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleToggleActive(u._id, u.isActive)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                          u.isActive
                            ? 'border-rose-500/40 text-rose-400 hover:bg-rose-500/10'
                            : 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'
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
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Facility Operational Hours</h3>
              <p className="text-xs text-slate-400">
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
                className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="w-32 font-bold text-white">{s.dayName}</div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={s.isOpen}
                      onChange={(e) => handleScheduleChange(idx, 'isOpen', e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    <span className={s.isOpen ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                      {s.isOpen ? 'Facility Open' : 'Closed'}
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-2 font-mono">
                  <span>Open:</span>
                  <input
                    type="time"
                    disabled={!s.isOpen}
                    value={s.openTime}
                    onChange={(e) => handleScheduleChange(idx, 'openTime', e.target.value)}
                    className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white disabled:opacity-40"
                  />
                  <span>Close:</span>
                  <input
                    type="time"
                    disabled={!s.isOpen}
                    value={s.closeTime}
                    onChange={(e) => handleScheduleChange(idx, 'closeTime', e.target.value)}
                    className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white disabled:opacity-40"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 4: Security Audit Logs */}
      {activeTab === 'logs' && (
        <Card className="space-y-4">
          <h3 className="text-base font-bold text-white pb-2 border-b border-slate-800">
            Security & Administrative Audit Trails
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="pb-3 font-semibold">TIMESTAMP</th>
                  <th className="pb-3 font-semibold">ACTION</th>
                  <th className="pb-3 font-semibold">USER / OPERATOR</th>
                  <th className="pb-3 font-semibold">RESOURCE</th>
                  <th className="pb-3 font-semibold">IP ADDRESS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 font-mono text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-slate-800 text-purple-300 border border-purple-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-white">{log.userEmail}</td>
                    <td className="py-2.5 text-slate-400">{log.resource}</td>
                    <td className="py-2.5 font-mono text-slate-500">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
