import React, { useState, useEffect } from 'react';

const EXERCISE_LIBRARY = [
  'Barbell Flat Bench Press', 'Incline Dumbbell Press', 'Push-Ups', 'Dumbbell Chest Flyes',
  'Wide-Grip Lat Pulldown', 'Bent-Over Barbell Row', 'Seated Cable Row', 'Single-Arm Dumbbell Row',
  'Barbell Back Squats', 'Dumbbell Goblet Squats', 'Conventional Barbell Deadlift', 'Romanian Deadlifts (RDL)',
  'Leg Press Machine', 'Walking Dumbbell Lunges', 'Standing Calf Raises',
  'Overhead Dumbbell Press', 'Dumbbell Lateral Raises', 'Standing Barbell Curls', 'Dumbbell Hammer Curls',
  'Cable Triceps Rope Pushdown', 'Parallel Bar Tricep Dips',
  'Isometric Core Plank', 'Hanging Knee Raises', 'Dynamic Mountain Climbers'
];

function WorkoutPlanPage() {
  const [recommendedPlan, setRecommendedPlan] = useState(null);
  const [customPlan, setCustomPlan] = useState(null);
  const [activePlanType, setActivePlanType] = useState('recommended'); // 'recommended' | 'custom'
  const [profile, setProfile] = useState(null);
  
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [completingDay, setCompletingDay] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Editable profile parameters for rule-based workout regeneration
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [formGoal, setFormGoal] = useState('muscle_gain');
  const [formLevel, setFormLevel] = useState('intermediate');
  const [formDays, setFormDays] = useState(5);

  // Custom Plan Builder State
  const [isBuildingCustom, setIsBuildingCustom] = useState(false);
  const [customPlanName, setCustomPlanName] = useState('My Custom Plan');
  const [customDays, setCustomDays] = useState([]);

  const plan = activePlanType === 'recommended' ? recommendedPlan : customPlan;

  const fetchWorkoutPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('fitpulse_token');
      const res = await fetch('/api/member/workout-plan', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to load workout plan');
      }

      if (result.status === 'success' && result.data) {
        setRecommendedPlan(result.data.recommendedPlan || null);
        setCustomPlan(result.data.customPlan || null);
        
        if (result.data.profile) {
          setProfile(result.data.profile);
          setFormGoal(result.data.profile.fitnessGoal || 'muscle_gain');
          setFormLevel(result.data.profile.experienceLevel || 'intermediate');
          setFormDays(result.data.profile.plannedDaysPerWeek || 5);
        }

        if (!result.data.recommendedPlan && !result.data.customPlan) {
          // Defaults to recommended
        } else if (result.data.recommendedPlan) {
          setActivePlanType('recommended');
        } else if (result.data.customPlan) {
          setActivePlanType('custom');
        }
      }
    } catch (err) {
      console.error('Error fetching workout plan:', err);
      setError(err.message || 'Error loading workout plan from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkoutPlan();
    // eslint-disable-next-line
  }, []);

  const handleUpdateProfileAndRegenerate = async (e) => {
    if (e) e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('fitpulse_token');
      const res = await fetch('/api/member/fitness-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          fitnessGoal: formGoal,
          experienceLevel: formLevel,
          plannedDaysPerWeek: Number(formDays),
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to update profile and generate plan');
      }

      if (result.data) {
        setRecommendedPlan(result.data.plan); 
        setProfile(result.data.profile);
        setSelectedDayIndex(0);
        setIsEditProfileOpen(false);
        setSuccessMessage(
          `New plan generated successfully for ${formatText(formLevel)} + ${formatText(formGoal)} (${formDays} Days/Week)!`
        );
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err) {
      console.error('Error updating workout plan:', err);
      setError(err.message || 'Failed to generate plan.');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleDayComplete = async (dayNumber) => {
    setCompletingDay(true);
    try {
      const token = localStorage.getItem('fitpulse_token');
      const res = await fetch(`/api/member/workout-plan/day/${dayNumber}/toggle-complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ planId: plan._id })
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to update completion status');
      }

      if (result.data && result.data.plan) {
        if (activePlanType === 'recommended') {
          setRecommendedPlan(result.data.plan);
        } else {
          setCustomPlan(result.data.plan);
        }
        const statusText = result.data.isCompleted ? 'marked as completed' : 'marked as incomplete';
        setSuccessMessage(`Day ${dayNumber} workout ${statusText}.`);
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      console.error('Error toggling day completion:', err);
      setError(err.message || 'Failed to toggle workout completion.');
    } finally {
      setCompletingDay(false);
    }
  };

  const handleSaveCustomPlan = async () => {
    setUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('fitpulse_token');
      const res = await fetch('/api/member/workout-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: customPlanName,
          daysPerWeek: customDays.length,
          days: customDays.map((d, i) => ({
            dayNumber: i + 1,
            dayName: d.dayName,
            focus: d.focus,
            exercises: d.exercises,
          })),
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to save custom plan');

      setSuccessMessage('Custom plan saved successfully!');
      setIsBuildingCustom(false);
      setSelectedDayIndex(0);
      fetchWorkoutPlan();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const addCustomDay = () => {
    setCustomDays([...customDays, {
      dayName: `Day ${customDays.length + 1}`,
      focus: 'Full Body',
      exercises: []
    }]);
  };

  const addCustomExercise = (dayIndex) => {
    const newDays = [...customDays];
    newDays[dayIndex].exercises.push({
      exerciseName: EXERCISE_LIBRARY[0],
      sets: 3,
      reps: '10',
      restSeconds: 60
    });
    setCustomDays(newDays);
  };

  const updateCustomExercise = (dayIndex, exIndex, field, value) => {
    const newDays = [...customDays];
    newDays[dayIndex].exercises[exIndex][field] = value;
    setCustomDays(newDays);
  };
  
  const removeCustomExercise = (dayIndex, exIndex) => {
    const newDays = [...customDays];
    newDays[dayIndex].exercises.splice(exIndex, 1);
    setCustomDays(newDays);
  };

  const formatText = (text) => {
    if (!text) return '—';
    return text
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  if (loading) {
    return (
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-emerald-600 rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium text-slate-600">Loading your workout plans...</p>
      </main>
    );
  }

  // Common UI: Tab Switching
  const renderTabSwitcher = () => (
    <div className="flex justify-center space-x-4 mb-8">
      <button
        onClick={() => { setActivePlanType('recommended'); setIsBuildingCustom(false); setSelectedDayIndex(0); }}
        className={`px-6 py-2 rounded-full font-semibold text-sm transition-colors cursor-pointer ${
          activePlanType === 'recommended'
            ? 'bg-emerald-600 text-white shadow-md'
            : 'bg-white text-slate-600 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        FitPulse Recommended Plan
      </button>
      <button
        onClick={() => { setActivePlanType('custom'); setSelectedDayIndex(0); }}
        className={`px-6 py-2 rounded-full font-semibold text-sm transition-colors cursor-pointer ${
          activePlanType === 'custom'
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-white text-slate-600 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        Create My Own Workout
      </button>
    </div>
  );

  // Render Custom Plan Builder
  if (activePlanType === 'custom' && isBuildingCustom) {
    return (
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {renderTabSwitcher()}
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Custom Plan Builder</h1>
          <button onClick={() => setIsBuildingCustom(false)} className="text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer">
            &larr; Back to plan view
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Name</label>
            <input
              type="text"
              value={customPlanName}
              onChange={(e) => setCustomPlanName(e.target.value)}
              className="w-full max-w-sm px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-6">
            {customDays.map((day, dIdx) => (
              <div key={dIdx} className="bg-slate-50 border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <input
                    type="text"
                    value={day.dayName}
                    onChange={(e) => {
                      const newDays = [...customDays];
                      newDays[dIdx].dayName = e.target.value;
                      setCustomDays(newDays);
                    }}
                    className="font-bold text-slate-900 bg-transparent border-b border-gray-300 focus:border-blue-600 focus:outline-none px-1"
                  />
                  <input
                    type="text"
                    value={day.focus}
                    onChange={(e) => {
                      const newDays = [...customDays];
                      newDays[dIdx].focus = e.target.value;
                      setCustomDays(newDays);
                    }}
                    placeholder="Focus (e.g. Chest)"
                    className="text-xs text-slate-600 bg-white border border-gray-300 rounded px-2 py-1"
                  />
                </div>

                <div className="space-y-3">
                  {day.exercises.map((ex, exIdx) => (
                    <div key={exIdx} className="flex flex-wrap items-center gap-2 bg-white p-2 border border-gray-200 rounded shadow-xs">
                      <select
                        value={ex.exerciseName}
                        onChange={(e) => updateCustomExercise(dIdx, exIdx, 'exerciseName', e.target.value)}
                        className="flex-1 min-w-[150px] text-xs px-2 py-1.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-blue-600"
                      >
                        {EXERCISE_LIBRARY.map(name => <option key={name} value={name}>{name}</option>)}
                      </select>
                      
                      <div className="flex items-center gap-1">
                        <label className="text-[10px] text-slate-500 font-semibold uppercase">Sets</label>
                        <input
                          type="number"
                          value={ex.sets}
                          onChange={(e) => updateCustomExercise(dIdx, exIdx, 'sets', Number(e.target.value))}
                          className="w-12 text-xs px-2 py-1.5 border border-gray-300 rounded text-center"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <label className="text-[10px] text-slate-500 font-semibold uppercase">Reps</label>
                        <input
                          type="text"
                          value={ex.reps}
                          onChange={(e) => updateCustomExercise(dIdx, exIdx, 'reps', e.target.value)}
                          className="w-16 text-xs px-2 py-1.5 border border-gray-300 rounded text-center"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <label className="text-[10px] text-slate-500 font-semibold uppercase">Rest(s)</label>
                        <input
                          type="number"
                          value={ex.restSeconds}
                          onChange={(e) => updateCustomExercise(dIdx, exIdx, 'restSeconds', Number(e.target.value))}
                          className="w-12 text-xs px-2 py-1.5 border border-gray-300 rounded text-center"
                        />
                      </div>
                      
                      <button onClick={() => removeCustomExercise(dIdx, exIdx)} className="text-red-500 hover:text-red-700 px-2 cursor-pointer">
                        &times;
                      </button>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => addCustomExercise(dIdx)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    + Add Exercise
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={addCustomDay}
              className="w-full py-3 border-2 border-dashed border-gray-300 text-sm font-semibold text-slate-500 rounded-lg hover:border-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              + Add Training Day
            </button>
          </div>
          
          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={handleSaveCustomPlan}
              disabled={updating || customDays.length === 0}
              className="w-full py-3 px-4 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-sm cursor-pointer"
            >
              {updating ? 'Saving...' : 'Save Custom Plan'}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // --- No Plan UI ---
  if (!plan) {
    if (activePlanType === 'recommended') {
      return (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {renderTabSwitcher()}
          <div className="bg-white border border-gray-200 rounded-lg p-10 shadow-sm text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No Recommended Plan Found</h2>
            <p className="text-slate-600 mb-6 text-sm">Set your fitness goals and we will generate a personalized rule-based plan for you instantly.</p>
            
            <form onSubmit={handleUpdateProfileAndRegenerate} className="text-left space-y-4 bg-slate-50 p-6 rounded-md border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fitness Goal</label>
                  <select value={formGoal} onChange={(e) => setFormGoal(e.target.value)} className="w-full text-xs sm:text-sm bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-emerald-600">
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="fat_loss">Fat Loss</option>
                    <option value="strength">Strength</option>
                    <option value="general_fitness">General Fitness</option>
                    <option value="endurance">Endurance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Experience Level</label>
                  <select value={formLevel} onChange={(e) => setFormLevel(e.target.value)} className="w-full text-xs sm:text-sm bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-emerald-600">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Planned Days</label>
                  <select value={formDays} onChange={(e) => setFormDays(Number(e.target.value))} className="w-full text-xs sm:text-sm bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-emerald-600">
                    <option value="2">2 Days</option>
                    <option value="3">3 Days</option>
                    <option value="4">4 Days</option>
                    <option value="5">5 Days</option>
                    <option value="6">6 Days</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={updating} className="w-full py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:opacity-50 cursor-pointer shadow-sm">
                {updating ? 'Generating...' : 'Save & Generate Plan'}
              </button>
            </form>
          </div>
        </main>
      );
    } else {
      return (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {renderTabSwitcher()}
          <div className="bg-white border border-gray-200 rounded-lg p-10 shadow-sm text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">You haven't built a plan yet</h2>
            <p className="text-slate-600 mb-6 text-sm">Create a completely custom workout routine step by step.</p>
            <button
              onClick={() => {
                setCustomDays([]);
                setCustomPlanName('My Custom Plan');
                setIsBuildingCustom(true);
              }}
              className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm cursor-pointer"
            >
              Start Building Now
            </button>
          </div>
        </main>
      );
    }
  }

  // --- View Plan UI ---
  const daysList = plan?.days || [];
  const currentDay = daysList[selectedDayIndex] || daysList[0] || null;
  const isCurrentDayCompleted = currentDay?.isCompleted || false;

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {renderTabSwitcher()}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm px-4 py-3 rounded-lg flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer">&times;</button>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded inline-block ${plan?.planType === 'custom' ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                {plan?.planType === 'custom' ? 'Custom Program' : 'Recommended Program'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Workout Plan</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              <strong className="text-slate-800 font-semibold">{plan?.name || 'Personalized Fitness Routine'}</strong> &bull; Structured {daysList.length}-day schedule.
            </p>
          </div>

          {activePlanType === 'recommended' && (
            <button
              onClick={() => setIsEditProfileOpen(!isEditProfileOpen)}
              className="self-start sm:self-auto px-4 py-2 text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              {isEditProfileOpen ? 'Close Settings' : 'Change Fitness Profile'}
            </button>
          )}

          {activePlanType === 'custom' && (
            <button
              onClick={() => {
                setCustomPlanName(plan.name);
                setCustomDays(plan.days);
                setIsBuildingCustom(true);
              }}
              className="self-start sm:self-auto px-4 py-2 text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors cursor-pointer"
            >
              Edit Custom Plan
            </button>
          )}
        </div>
      </div>

      {/* Fitness Profile Overview & Rule-Based Generator Settings */}
      {activePlanType === 'recommended' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Active Fitness Profile Configuration</h2>
            <span className="text-xs text-slate-500 font-medium">Rule-Based Generator</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-gray-200 rounded-md">
              <span className="text-xs text-slate-500 uppercase font-semibold block mb-0.5">Fitness Goal</span>
              <span className="text-sm font-bold text-slate-900">{formatText(profile?.fitnessGoal || plan?.goal)}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-gray-200 rounded-md">
              <span className="text-xs text-slate-500 uppercase font-semibold block mb-0.5">Experience Level</span>
              <span className="text-sm font-bold text-emerald-700">{formatText(profile?.experienceLevel || plan?.experienceLevel)}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-gray-200 rounded-md">
              <span className="text-xs text-slate-500 uppercase font-semibold block mb-0.5">Planned Days</span>
              <span className="text-sm font-bold text-slate-900">{profile?.plannedDaysPerWeek || plan?.daysPerWeek || daysList.length} Days / Week</span>
            </div>
          </div>
          {isEditProfileOpen && (
            <form onSubmit={handleUpdateProfileAndRegenerate} className="pt-4 border-t border-gray-200 space-y-4 bg-slate-50 p-4 rounded-md">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fitness Goal</label>
                  <select value={formGoal} onChange={(e) => setFormGoal(e.target.value)} className="w-full text-xs sm:text-sm bg-white border border-gray-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600">
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="fat_loss">Fat Loss</option>
                    <option value="strength">Strength</option>
                    <option value="general_fitness">General Fitness</option>
                    <option value="endurance">Endurance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Experience Level</label>
                  <select value={formLevel} onChange={(e) => setFormLevel(e.target.value)} className="w-full text-xs sm:text-sm bg-white border border-gray-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Planned Days</label>
                  <select value={formDays} onChange={(e) => setFormDays(Number(e.target.value))} className="w-full text-xs sm:text-sm bg-white border border-gray-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600">
                    <option value="2">2 Days</option>
                    <option value="3">3 Days</option>
                    <option value="4">4 Days</option>
                    <option value="5">5 Days</option>
                    <option value="6">6 Days</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setIsEditProfileOpen(false)} className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" disabled={updating} className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:opacity-50 cursor-pointer">
                  {updating ? 'Generating...' : 'Save & Generate'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Day Navigation Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Training Days ({daysList.length})</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {daysList.map((dayItem, idx) => {
            const isSelected = selectedDayIndex === idx;
            const isCompleted = dayItem.isCompleted;
            return (
              <button
                key={dayItem.dayNumber || idx}
                onClick={() => setSelectedDayIndex(idx)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-md text-xs sm:text-sm font-semibold transition-colors border cursor-pointer ${isSelected ? (activePlanType === 'custom' ? 'bg-blue-50 text-blue-800 border-blue-600' : 'bg-emerald-50 text-emerald-800 border-emerald-600') : 'bg-white text-slate-700 border-gray-200 hover:border-gray-300 hover:text-slate-900'}`}
              >
                <span>{dayItem.dayName || `Day ${idx + 1}`}</span>
                {isCompleted && <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${activePlanType === 'custom' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>✓ Done</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Routine */}
      {currentDay ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className={`text-xs font-bold uppercase tracking-wider ${activePlanType === 'custom' ? 'text-blue-700' : 'text-emerald-700'}`}>Day {currentDay.dayNumber}</span>
                <span className="text-xs text-slate-400">&bull;</span>
                <span className="text-xs text-slate-500">{currentDay.focus || 'Full Body'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{currentDay.dayName}</h2>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleToggleDayComplete(currentDay.dayNumber)}
                disabled={completingDay}
                className={`px-4 py-2.5 rounded-md text-xs sm:text-sm font-semibold transition-colors flex items-center space-x-2 cursor-pointer ${isCurrentDayCompleted ? (activePlanType === 'custom' ? 'bg-blue-50 text-blue-800 border border-blue-300 hover:bg-blue-100' : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100') : (activePlanType === 'custom' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-emerald-600 text-white hover:bg-emerald-700')} disabled:opacity-50`}
              >
                <span>{isCurrentDayCompleted ? '✓ Completed (Click to Undo)' : 'Mark as Completed'}</span>
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Prescribed Exercises ({currentDay.exercises?.length || 0})</h3>
            <div className="space-y-4">
              {currentDay.exercises && currentDay.exercises.length > 0 ? (
                currentDay.exercises.map((exercise, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 sm:p-5 bg-white shadow-xs flex flex-col sm:flex-row gap-4 items-start">
                    {exercise.imageUrl ? (
                      <img src={exercise.imageUrl} alt={exercise.exerciseName} className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 object-contain rounded border border-gray-200 bg-slate-50 p-1" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded border border-gray-200 bg-slate-50 flex items-center justify-center text-xs text-slate-400 font-bold">GYM</div>
                    )}
                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className="text-base sm:text-lg font-bold text-slate-900">{exercise.exerciseName}</h4>
                        {exercise.muscleGroup && (
                          <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 self-start sm:self-auto">{exercise.muscleGroup}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1 text-xs">
                        <div className="px-2.5 py-1 bg-slate-50 border border-gray-200 rounded text-slate-700"><span className="text-slate-500">Sets:</span> <span className="font-bold text-slate-900">{exercise.sets}</span></div>
                        <div className="px-2.5 py-1 bg-slate-50 border border-gray-200 rounded text-slate-700"><span className="text-slate-500">Reps:</span> <span className="font-bold text-slate-900 font-mono">{exercise.reps}</span></div>
                        <div className={`px-2.5 py-1 rounded ${activePlanType === 'custom' ? 'bg-blue-50 border border-blue-200 text-blue-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'}`}><span className={activePlanType === 'custom' ? 'text-blue-700' : 'text-emerald-700'}>Rest:</span> <span className="font-bold">{exercise.restSeconds}s</span></div>
                      </div>
                      {exercise.instructions && (
                        <div className="mt-2 text-xs sm:text-sm text-slate-600 bg-slate-50/70 border border-gray-100 rounded p-2.5 leading-relaxed">
                          <span className="font-semibold text-slate-800">Instruction: </span>{exercise.instructions}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-4">No exercises scheduled for this day.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-slate-500 text-sm">No workout day selected.</div>
      )}
    </main>
  );
}

export default WorkoutPlanPage;
