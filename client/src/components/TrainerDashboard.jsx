import React, { useState, useEffect } from 'react';

function TrainerDashboard({ currentUser }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeDayTab, setActiveDayTab] = useState(1);

  // Fetch assigned members for the logged-in trainer
  const fetchAssignedMembers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('fitpulse_token');
      const res = await fetch('/api/trainer/members', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const result = await res.json();
      if (res.ok && result.status === 'success' && Array.isArray(result.data)) {
        setMembers(result.data);
        // Automatically select first member if available
        if (result.data.length > 0 && !selectedMemberId) {
          selectMember(result.data[0].id);
        }
      } else {
        setError(result.message || 'Failed to load assigned members.');
      }
    } catch (err) {
      console.error('Failed to fetch assigned members:', err);
      setError('Network error while connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific member's fitness profile and workout plan
  const selectMember = async (memberId) => {
    setSelectedMemberId(memberId);
    setLoadingDetails(true);
    setActiveDayTab(1);
    try {
      const token = localStorage.getItem('fitpulse_token');
      const res = await fetch(`/api/trainer/members/${memberId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const result = await res.json();
      if (res.ok && result.status === 'success' && result.data) {
        setSelectedDetails(result.data);
      } else {
        console.error('Failed to load member details:', result.message);
      }
    } catch (err) {
      console.error('Error fetching member details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchAssignedMembers();
  }, []);

  const formatText = (text) => {
    if (!text) return '—';
    return text
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  // Calculate trainer aggregate stats
  const totalTrainees = members.length;
  const avgConsistency =
    totalTrainees > 0
      ? Math.round(
          members.reduce((acc, m) => acc + (m.consistencyPercentage || 0), 0) / totalTrainees
        )
      : 0;

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                Trainer Portal
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-500 font-medium">Instructor Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Welcome, {currentUser?.fullName || 'Trainer'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Review assigned trainees, monitor workout schedules, and inspect monthly adherence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchAssignedMembers}
              disabled={loading}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-md border border-gray-300 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              Refresh Trainees
            </button>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="p-4 bg-slate-50 border border-gray-200 rounded-md">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Assigned Trainees
            </span>
            <div className="text-2xl font-bold text-slate-900">{totalTrainees} Members</div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Active clients under your supervision
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-gray-200 rounded-md">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Average Adherence
            </span>
            <div className="text-2xl font-bold text-emerald-700">{avgConsistency}%</div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Based on monthly attendance check-ins
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-gray-200 rounded-md">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Facility Access
            </span>
            <div className="text-2xl font-bold text-slate-900">Instructor Standard</div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Full client workout inspection privileges
            </span>
          </div>
        </div>
      </div>

      {/* Error alert banner */}
      {error && (
        <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-md text-sm font-medium">
          {error}
        </div>
      )}

      {/* Assigned Members Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Assigned Trainees</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a member below to inspect their comprehensive fitness profile and current workout routine.
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            {members.length} {members.length === 1 ? 'Member' : 'Members'}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-900">Loading assigned members...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 border border-gray-200 rounded-md">
            <p className="text-sm font-semibold text-slate-700">No members currently assigned.</p>
            <p className="text-xs text-slate-500 mt-1">
              Members enrolled in personal training programs will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Trainee Name</th>
                  <th className="py-3 px-4">Fitness Goal</th>
                  <th className="py-3 px-4">Experience Level</th>
                  <th className="py-3 px-4">Planned Days</th>
                  <th className="py-3 px-4">Attendance / Consistency</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.map((member) => {
                  const isSelected = selectedMemberId === member.id;
                  return (
                    <tr
                      key={member.id}
                      onClick={() => selectMember(member.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-50/80 font-medium'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{member.fullName}</div>
                        <div className="text-xs text-slate-500">{member.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {formatText(member.fitnessGoal)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {formatText(member.experienceLevel)}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {member.plannedDaysPerWeek} Days / wk
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-2 rounded-full"
                              style={{ width: `${Math.min(100, member.consistencyPercentage || 0)}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-800">
                            {member.consistencyPercentage || 0}%
                          </span>
                          <span className="text-[11px] text-slate-500">
                            ({member.attendanceCount || 0} visits)
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectMember(member.id);
                          }}
                          className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-gray-300'
                          }`}
                        >
                          {isSelected ? 'Viewing' : 'Select'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Member Details & Workout Plan View */}
      {selectedMemberId && (
        <div className="space-y-6">
          {loadingDetails ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-900">Loading trainee profile and workout plan...</p>
            </div>
          ) : selectedDetails ? (
            <>
              {/* Member Basic Fitness Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-gray-100 gap-2">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded inline-block mb-1">
                      Trainee Overview
                    </span>
                    <h2 className="text-xl font-bold text-slate-900">
                      {selectedDetails.account?.fullName}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Contact: {selectedDetails.account?.phone} &bull; Email: {selectedDetails.account?.email} &bull; Member since {formatDate(selectedDetails.account?.memberSince)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Status: {selectedDetails.fitness?.membershipStatus || 'Active'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="p-3 bg-slate-50 border border-gray-200 rounded-md">
                    <span className="text-xs text-slate-500 block">Age</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {selectedDetails.fitness?.age || 25} yrs
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-gray-200 rounded-md">
                    <span className="text-xs text-slate-500 block">Height</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {selectedDetails.fitness?.height || 175} cm
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-gray-200 rounded-md">
                    <span className="text-xs text-slate-500 block">Weight</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {selectedDetails.fitness?.weight || 72} kg
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-gray-200 rounded-md">
                    <span className="text-xs text-slate-500 block">Primary Goal</span>
                    <span className="font-bold text-emerald-700 text-sm">
                      {formatText(selectedDetails.fitness?.fitnessGoal)}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-gray-200 rounded-md">
                    <span className="text-xs text-slate-500 block">Experience</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {formatText(selectedDetails.fitness?.experienceLevel)}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-gray-200 rounded-md">
                    <span className="text-xs text-slate-500 block">Planned Days</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {selectedDetails.fitness?.plannedDaysPerWeek} Days / wk
                    </span>
                  </div>
                </div>
              </div>

              {/* Member Workout Plan View */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-gray-100 gap-2">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Active Workout Plan: {selectedDetails.workoutPlan?.name || 'Assigned Plan'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Goal: {formatText(selectedDetails.workoutPlan?.goal)} &bull; {selectedDetails.workoutPlan?.daysPerWeek || 5}-Day Training Structure
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Trainer View Mode
                  </span>
                </div>

                {/* Day Tabs */}
                {selectedDetails.workoutPlan?.days && selectedDetails.workoutPlan.days.length > 0 ? (
                  <div>
                    <div className="flex items-center space-x-1 border-b border-gray-200 pb-2 overflow-x-auto">
                      {selectedDetails.workoutPlan.days.map((day) => {
                        const isDayActive = activeDayTab === day.dayNumber;
                        return (
                          <button
                            key={day.dayNumber}
                            type="button"
                            onClick={() => setActiveDayTab(day.dayNumber)}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                              isDayActive
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-gray-200'
                            }`}
                          >
                            Day {day.dayNumber}: {day.dayName.split('(')[0].trim()}
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Day Content */}
                    {(() => {
                      const day =
                        selectedDetails.workoutPlan.days.find((d) => d.dayNumber === activeDayTab) ||
                        selectedDetails.workoutPlan.days[0];
                      if (!day) return null;

                      return (
                        <div className="mt-4 space-y-4">
                          <div className="p-3.5 bg-slate-50 border border-gray-200 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h3 className="text-sm font-bold text-slate-900">{day.dayName}</h3>
                              <p className="text-xs text-slate-600 mt-0.5">
                                Focus Area: <span className="font-semibold text-emerald-800">{day.focus}</span>
                              </p>
                            </div>
                            <span className="text-xs font-medium text-slate-500">
                              {(day.exercises || []).length} Prescribed Exercises
                            </span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                              <thead>
                                <tr className="border-b border-gray-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                  <th className="py-2.5 px-3">#</th>
                                  <th className="py-2.5 px-3">Exercise Name</th>
                                  <th className="py-2.5 px-3">Target Muscle</th>
                                  <th className="py-2.5 px-3">Sets</th>
                                  <th className="py-2.5 px-3">Target Reps</th>
                                  <th className="py-2.5 px-3">Rest</th>
                                  <th className="py-2.5 px-3">Execution Guidance</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {(day.exercises || []).map((ex, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="py-2.5 px-3 text-xs font-mono text-slate-400">
                                      {idx + 1}
                                    </td>
                                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                                      {ex.exerciseName}
                                    </td>
                                    <td className="py-2.5 px-3 text-xs text-slate-600">
                                      {ex.targetMuscle || day.focus}
                                    </td>
                                    <td className="py-2.5 px-3 font-medium text-slate-800">
                                      {ex.sets}
                                    </td>
                                    <td className="py-2.5 px-3 font-medium text-slate-800">
                                      {ex.reps}
                                    </td>
                                    <td className="py-2.5 px-3 text-xs text-slate-500">
                                      {ex.restSeconds}s
                                    </td>
                                    <td className="py-2.5 px-3 text-xs text-slate-600 max-w-xs">
                                      {ex.instructions || 'Perform with strict form and tempo.'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No structured workout plan available for this member.</p>
                )}
              </div>
            </>
          ) : null}
        </div>
      )}
    </main>
  );
}

export default TrainerDashboard;
