import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { trainerApi, workoutApi } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';

export const TrainerDashboard = () => {
  const { success, error: notifyError } = useNotification();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected member inspection
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberDetails, setMemberDetails] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Assign Plan Modal
  const [assignPlanModalOpen, setAssignPlanModalOpen] = useState(false);
  const [planForm, setPlanForm] = useState({
    title: 'Trainer Custom Strength Protocol',
    goal: 'strength',
    level: 'intermediate',
    daysPerWeek: 3,
  });

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await trainerApi.getMembers();
      setMembers(res.members);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleInspectMember = async (memberCard) => {
    setSelectedMember(memberCard);
    setDetailLoading(true);
    try {
      const res = await trainerApi.getMemberDetails(memberCard.user._id);
      setMemberDetails(res);
    } catch {
      notifyError('Failed to load member performance details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAssignPlan = async (e) => {
    e.preventDefault();
    try {
      // Create sample assigned days
      const days = [
        {
          dayNumber: 1,
          dayName: 'Day 1: Heavy Compound Pushing',
          focus: 'Chest & Shoulders',
          exercises: [
            {
              exerciseId: memberDetails.activePlan?.days[0]?.exercises[0]?.exerciseId?._id || memberDetails.activePlan?.days[0]?.exercises[0]?.exerciseId,
              exerciseName: 'Barbell Flat Bench Press',
              sets: 4,
              reps: '5-6',
              restSeconds: 120,
              notes: 'Coach instruction: RPE 8.5 target',
            },
          ],
        },
      ];

      await workoutApi.assignPlan({
        memberId: selectedMember.user._id,
        title: planForm.title,
        goal: planForm.goal,
        level: planForm.level,
        daysPerWeek: Number(planForm.daysPerWeek),
        days,
      });

      success(`Assigned ${planForm.title} to ${selectedMember.user.name}!`);
      setAssignPlanModalOpen(false);
      handleInspectMember(selectedMember);
    } catch (err) {
      notifyError(err.message || 'Failed to assign plan.');
    }
  };

  const filteredMembers = members.filter((m) =>
    m.user.name.toLowerCase().includes(search.toLowerCase()) ||
    m.user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
          <Users className="w-3.5 h-3.5" /> Head Coach & Trainer Portal
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Member Roster & Routine Management
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor your assigned athletes, review their gym attendance consistency, and assign tailored splits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Member Roster list */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-base font-bold text-white">Active Athletes ({members.length})</h3>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search member..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {filteredMembers.map((m) => (
              <div
                key={m.user._id}
                onClick={() => handleInspectMember(m)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  selectedMember?.user._id === m.user._id
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-200'
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-white">{m.user.name}</p>
                  <p className="text-[11px] text-slate-400">{m.user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {m.totalWorkouts} Workouts Completed
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            ))}
          </div>
        </Card>

        {/* Right: Selected Member Deep Dive */}
        <div className="lg:col-span-2 space-y-6">
          {detailLoading ? (
            <LoadingSpinner text="Loading athlete analytics..." />
          ) : memberDetails ? (
            <>
              {/* Member overview card */}
              <Card className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-xl font-bold text-white">{memberDetails.member.name}</h3>
                    <p className="text-xs text-slate-400">{memberDetails.member.email}</p>
                  </div>

                  <Button
                    onClick={() => setAssignPlanModalOpen(true)}
                    variant="primary"
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Assign Custom Workout Plan
                  </Button>
                </div>

                {/* Profile pill stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] uppercase font-mono text-slate-500">Goal</span>
                    <p className="text-xs font-bold text-white capitalize mt-0.5">
                      {memberDetails.profile?.fitnessGoal?.replace('_', ' ') || 'None'}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] uppercase font-mono text-slate-500">Level</span>
                    <p className="text-xs font-bold text-emerald-400 capitalize mt-0.5">
                      {memberDetails.profile?.experienceLevel || 'Beginner'}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] uppercase font-mono text-slate-500">Target</span>
                    <p className="text-xs font-bold text-white font-mono mt-0.5">
                      {memberDetails.profile?.plannedDaysPerWeek || 3} Days/Wk
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] uppercase font-mono text-slate-500">
                      Consistency
                    </span>
                    <p className="text-xs font-bold text-cyan-400 font-mono mt-0.5">
                      {memberDetails.consistency?.attendance?.consistencyPercentage || 0}%
                    </p>
                  </div>
                </div>

                {/* Current Active Plan summary */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <span className="text-xs font-semibold uppercase text-slate-400">
                    Active Assigned Plan:
                  </span>
                  <p className="text-sm font-bold text-white">
                    {memberDetails.activePlan?.title || 'No active plan assigned.'}
                  </p>
                  {memberDetails.activePlan && (
                    <div className="flex gap-2 pt-1">
                      <Badge variant="cyan">{memberDetails.activePlan.days.length} Days Split</Badge>
                      <Badge variant="slate">
                        Type: {memberDetails.activePlan.generationType}
                      </Badge>
                    </div>
                  )}
                </div>
              </Card>

              {/* Recent completed workout sessions */}
              <Card className="space-y-4">
                <h4 className="text-sm font-bold text-white pb-2 border-b border-slate-800">
                  Recent Workout Logs
                </h4>
                <div className="space-y-2">
                  {memberDetails.recentSessions?.map((s) => (
                    <div
                      key={s._id}
                      className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-white">{s.dayName}</p>
                        <p className="text-[11px] text-slate-400">
                          {s.completedExercises.length} Exercises completed • {s.durationMinutes} mins • RPE {s.rpeScore}
                        </p>
                      </div>
                      <span className="font-mono text-slate-400">{s.dateKey}</span>
                    </div>
                  ))}
                  {(!memberDetails.recentSessions || memberDetails.recentSessions.length === 0) && (
                    <p className="text-xs text-slate-500 text-center py-4">No completed sessions logged yet.</p>
                  )}
                </div>
              </Card>
            </>
          ) : (
            <Card className="text-center py-16 text-slate-400 text-xs">
              <Users className="w-8 h-8 mx-auto text-slate-500 mb-2" />
              Select an athlete from the roster to inspect their consistency data and assign customized workouts.
            </Card>
          )}
        </div>
      </div>

      {/* Assign Plan Modal */}
      <Modal
        isOpen={assignPlanModalOpen}
        onClose={() => setAssignPlanModalOpen(false)}
        title="Assign Custom Workout Plan"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAssignPlan} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Plan Title</label>
            <input
              type="text"
              required
              value={planForm.title}
              onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 block mb-1">Focus Goal</label>
              <select
                value={planForm.goal}
                onChange={(e) => setPlanForm({ ...planForm, goal: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
              >
                <option value="strength">Strength</option>
                <option value="muscle_gain">Hypertrophy</option>
                <option value="fat_loss">Fat Loss</option>
                <option value="endurance">Endurance</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Weekly Days</label>
              <input
                type="number"
                min="1"
                max="7"
                value={planForm.daysPerWeek}
                onChange={(e) => setPlanForm({ ...planForm, daysPerWeek: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full">
            Assign Plan to Member
          </Button>
        </form>
      </Modal>
    </div>
  );
};
