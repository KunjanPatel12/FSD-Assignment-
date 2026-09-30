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
      setMembers(res.members || []);
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
              exerciseId:
                memberDetails.activePlan?.days[0]?.exercises[0]?.exerciseId?._id ||
                memberDetails.activePlan?.days[0]?.exercises[0]?.exerciseId,
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

  const filteredMembers = members.filter(
    (m) =>
      m.user.name.toLowerCase().includes(search.toLowerCase()) ||
      m.user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-white">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-2">
          <Users className="w-3.5 h-3.5 text-emerald-600" /> Head Coach & Trainer Portal
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Member Roster & Routine Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor your assigned athletes, review their gym attendance consistency, and assign tailored splits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Member Roster list */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-base font-bold text-slate-900">Active Athletes ({members.length})</h3>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search member by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-gray-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
            />
          </div>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {filteredMembers.map((m) => {
              const isSelected = selectedMember?.user._id === m.user._id;
              return (
                <div
                  key={m.user._id}
                  onClick={() => handleInspectMember(m)}
                  className={`p-3 rounded-xl border cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-500 text-slate-900 shadow-sm'
                      : 'bg-white border-gray-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">{m.user.name}</p>
                    <p className="text-xs text-slate-500">{m.user.email}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        {m.totalWorkouts} Workouts Completed
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`}
                  />
                </div>
              );
            })}
            {filteredMembers.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500">
                {members.length === 0 ? 'No members registered yet.' : `No athletes match "${search}".`}
              </div>
            )}
          </div>
        </Card>

        {/* Right: Selected Member Deep Dive */}
        <div className="lg:col-span-2 space-y-6">
          {detailLoading ? (
            <Card className="p-12 text-center">
              <LoadingSpinner text="Loading athlete analytics..." />
            </Card>
          ) : memberDetails ? (
            <>
              {/* Member overview card */}
              <Card className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                        {memberDetails.member.name}
                      </h3>
                      <Badge variant="emerald" size="sm">
                        ATHLETE
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">{memberDetails.member.email}</p>
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
                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 text-center">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block">Goal</span>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 capitalize mt-1">
                      {memberDetails.profile?.fitnessGoal?.replace('_', ' ') || 'None'}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 text-center">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block">Level</span>
                    <p className="text-xs sm:text-sm font-bold text-emerald-700 capitalize mt-1">
                      {memberDetails.profile?.experienceLevel || 'Beginner'}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 text-center">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block">Target</span>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 font-mono mt-1">
                      {memberDetails.profile?.plannedDaysPerWeek || 3} Days/Wk
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 text-center">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                      Consistency
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-emerald-700 font-mono mt-1">
                      {memberDetails.consistency?.attendance?.consistencyPercentage || 0}%
                    </p>
                  </div>
                </div>

                {/* Current Active Plan summary */}
                <div className="p-4 rounded-xl bg-slate-50 border border-gray-200 space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                    Active Assigned Plan:
                  </span>
                  <p className="text-sm sm:text-base font-bold text-slate-900">
                    {memberDetails.activePlan?.title || 'No active plan assigned.'}
                  </p>
                  {memberDetails.activePlan && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Badge variant="emerald">
                        {memberDetails.activePlan.days.length} Days Split
                      </Badge>
                      <Badge variant="slate">
                        Type: {memberDetails.activePlan.generationType}
                      </Badge>
                    </div>
                  )}
                </div>
              </Card>

              {/* Recent completed workout sessions */}
              <Card className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 pb-3 border-b border-gray-100">
                  Recent Workout Logs
                </h4>
                <div className="space-y-2.5">
                  {memberDetails.recentSessions?.map((s) => (
                    <div
                      key={s._id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-gray-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{s.dayName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {s.completedExercises.length} Exercises completed • {s.durationMinutes} mins • RPE {s.rpeScore}
                        </p>
                      </div>
                      <span className="font-mono text-slate-500 text-xs font-medium bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                        {s.dateKey}
                      </span>
                    </div>
                  ))}
                  {(!memberDetails.recentSessions || memberDetails.recentSessions.length === 0) && (
                    <p className="text-xs sm:text-sm text-slate-500 text-center py-6">
                      No completed sessions logged yet.
                    </p>
                  )}
                </div>
              </Card>
            </>
          ) : (
            /* Improved empty state panel */
            <Card className="text-center py-16 sm:py-20 px-6 space-y-3 bg-white border-dashed border-2 border-gray-200">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Select an Athlete from the Roster</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                Choose an athlete on the left to inspect attendance consistency, review recent workout logs, and assign customized workout plans.
              </p>
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
            <label className="text-slate-700 font-semibold block mb-1">Plan Title</label>
            <input
              type="text"
              required
              value={planForm.title}
              onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-medium block mb-1">Focus Goal</label>
              <select
                value={planForm.goal}
                onChange={(e) => setPlanForm({ ...planForm, goal: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              >
                <option value="strength">Strength</option>
                <option value="muscle_gain">Hypertrophy</option>
                <option value="fat_loss">Fat Loss</option>
                <option value="endurance">Endurance</option>
              </select>
            </div>

            <div>
              <label className="text-slate-700 font-medium block mb-1">Weekly Days</label>
              <input
                type="number"
                min="1"
                max="7"
                value={planForm.daysPerWeek}
                onChange={(e) => setPlanForm({ ...planForm, daysPerWeek: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
              Assign Plan to Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
