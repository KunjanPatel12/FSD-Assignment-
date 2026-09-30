import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  RotateCcw,
  CheckCircle2,
  ShieldAlert,
  Layers,
  Repeat,
  Clock,
} from 'lucide-react';
import { workoutApi, exerciseApi } from '../../services/api';
import { ExerciseIllustration } from '../../components/common/ExerciseIllustration';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';

export const WorkoutPlanView = () => {
  const { success, error: notifyError } = useNotification();
  const [plan, setPlan] = useState(null);
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Exercise details view modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState(null);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const res = await workoutApi.getCurrentPlan();
      setPlan(res.plan);
      if (res.plan && res.plan.days.length > 0) {
        setSelectedDayNumber(res.plan.days[0].dayNumber);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleRegeneratePlan = async () => {
    setGenerating(true);
    try {
      const res = await workoutApi.generatePlan();
      setPlan(res.plan);
      if (res.plan && res.plan.days.length > 0) {
        setSelectedDayNumber(res.plan.days[0].dayNumber);
      }
      success('Fresh personalized workout routine generated!');
    } catch (err) {
      notifyError(err.message || 'Plan generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenExerciseDetails = async (exerciseId) => {
    try {
      const res = await exerciseApi.getById(exerciseId);
      setSelectedExerciseDetail(res.exercise);
      setDetailModalOpen(true);
    } catch (err) {
      notifyError('Could not load exercise details.');
    }
  };

  const handleMarkCompleted = async () => {
    if (!currentDay || !plan) return;
    setCompleting(true);
    try {
      await workoutApi.logSession({
        planId: plan._id,
        dayNumber: currentDay.dayNumber,
        dayName: currentDay.dayName,
        durationMinutes: 45,
      });
      success(`${currentDay.dayName} recorded as completed!`);
    } catch (err) {
      notifyError(err.message || 'Failed to record workout completion.');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving workout split..." fullScreen />;
  }

  const currentDay = plan?.days?.find((d) => d.dayNumber === selectedDayNumber);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-white">
      {/* Top Breadcrumb Tag matching reference */}
      <div className="flex items-center gap-2">
        <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-[11px] font-bold uppercase tracking-wider">
          {plan?.level?.toUpperCase() || 'INTERMEDIATE'} ROUTINE
        </span>
        <span className="text-slate-300">•</span>
        <span className="text-xs text-slate-500 font-medium capitalize">
          {plan?.goal?.replace('_', ' ') || 'Muscle Gain'} Focus
        </span>
      </div>

      {/* Title & Action Row matching reference */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Your Workout Plan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            A structured {plan?.daysPerWeek || 4}-day weekly split designed from your fitness profile. Follow the exercises with proper form and stay consistent to achieve your goals.
          </p>
        </div>

        <button
          onClick={handleRegeneratePlan}
          disabled={generating}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shrink-0"
        >
          <RotateCcw className={`w-3.5 h-3.5 text-slate-600 ${generating ? 'animate-spin' : ''}`} />
          <span>Regenerate Routine</span>
        </button>
      </div>

      {/* Day Tabs matching reference */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-2">
        {plan?.days?.map((day) => (
          <button
            key={day.dayNumber}
            onClick={() => setSelectedDayNumber(day.dayNumber)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              selectedDayNumber === day.dayNumber
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-gray-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Day {day.dayNumber} <span className="font-normal opacity-85 text-[11px]">({day.exercises.length} Ex)</span>
          </button>
        ))}
      </div>

      {/* Daily Routine Card matching reference */}
      {currentDay && (
        <div className="bg-white border border-emerald-100 rounded-2xl p-6 sm:p-7 shadow-xs">
          {/* Card header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {currentDay.dayName}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Focus: {currentDay.focus}
                </p>
              </div>
            </div>

            <button
              onClick={handleMarkCompleted}
              disabled={completing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark as Completed</span>
            </button>
          </div>

          {/* Exercise Grid - 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {currentDay.exercises.map((ex, i) => (
              <div
                key={i}
                className="bg-[#F4FAF6] border border-emerald-100/70 rounded-xl p-4 flex gap-4 items-center"
              >
                {/* Exercise illustration on the left */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-lg p-1 border border-emerald-100/50 flex items-center justify-center shrink-0 overflow-hidden">
                  <ExerciseIllustration name={ex.exerciseName} muscleGroup={currentDay.focus} />
                </div>

                {/* Exercise details on the right */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <h3
                        onClick={() => handleOpenExerciseDetails(ex.exerciseId?._id || ex.exerciseId)}
                        className="text-sm font-bold text-slate-900 truncate hover:text-emerald-700 cursor-pointer"
                        title={ex.exerciseName}
                      >
                        {ex.exerciseName}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100/80 text-emerald-800 text-[10px] font-bold capitalize shrink-0">
                      {ex.exerciseId?.targetMuscleGroup || currentDay.focus?.split(' ')[0] || 'Chest'}
                    </span>
                  </div>

                  {/* Metric pills: Sets, Reps, Rest */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 font-medium">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-gray-200">
                      <Layers className="w-3 h-3 text-slate-400" /> {ex.sets} Sets
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-gray-200">
                      <Repeat className="w-3 h-3 text-slate-400" /> {ex.reps} Reps
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-gray-200">
                      <Clock className="w-3 h-3 text-slate-400" /> {ex.restSeconds} sec Rest
                    </span>
                  </div>

                  {/* Short instructions */}
                  <p className="text-[11px] text-slate-500 mt-2 line-clamp-1">
                    {ex.notes || 'Keep core braced and perform full range of motion.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer Banner matching reference */}
      <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-start gap-3 text-xs text-amber-900">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-bold text-amber-950">Disclaimer:</span> This workout program is algorithmically generated based on your input and is for educational/fitness tracking purposes. It does not constitute medical advice. Always use proper form and consult a qualified fitness professional if needed.
        </p>
      </div>

      {/* Exercise Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedExerciseDetail?.name || 'Exercise Details'}
        maxWidth="max-w-md"
      >
        {selectedExerciseDetail && (
          <div className="space-y-4 text-xs">
            <div className="flex gap-2">
              <Badge variant="cyan">{selectedExerciseDetail.targetMuscleGroup}</Badge>
              <Badge variant="slate">{selectedExerciseDetail.equipment}</Badge>
              <Badge variant="emerald">{selectedExerciseDetail.difficulty}</Badge>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 mb-1">Execution Steps:</h5>
              <ol className="list-decimal list-inside space-y-1 text-slate-600">
                {selectedExerciseDetail.instructions?.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>

            {selectedExerciseDetail.formCues?.length > 0 && (
              <div>
                <h5 className="font-bold text-slate-900 mb-1">Key Form Cues:</h5>
                <ul className="list-disc list-inside space-y-1 text-emerald-800">
                  {selectedExerciseDetail.formCues.map((cue, idx) => (
                    <li key={idx}>{cue}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
              <span className="font-bold">Precaution:</span>{' '}
              {selectedExerciseDetail.precautions}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
