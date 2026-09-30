import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Clock,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Info,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { workoutApi, exerciseApi } from '../../services/api';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="emerald">{plan?.level?.toUpperCase()} ROUTINE</Badge>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400 capitalize">
              {plan?.goal?.replace('_', ' ')} Focus
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {plan?.title || 'Personalized Workout Plan'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic {plan?.daysPerWeek || 3}-day weekly split structured from your onboarding parameters.
          </p>
        </div>

        <Button
          onClick={handleRegeneratePlan}
          isLoading={generating}
          variant="outline"
          size="sm"
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          Regenerate Routine
        </Button>
      </div>

      {/* Days Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {plan?.days?.map((day) => (
          <button
            key={day.dayNumber}
            onClick={() => setSelectedDayNumber(day.dayNumber)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              selectedDayNumber === day.dayNumber
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>Day {day.dayNumber}</span>
            <span className="text-[10px] opacity-80 font-normal">
              ({day.exercises.length} Ex.)
            </span>
          </button>
        ))}
      </div>

      {/* Selected Day View */}
      {currentDay && (
        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">{currentDay.dayName}</h3>
                <p className="text-xs text-emerald-400 font-medium mt-0.5">
                  Focus: {currentDay.focus}
                </p>
              </div>

              <Button
                onClick={handleMarkCompleted}
                isLoading={completing}
                variant="primary"
                size="md"
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Mark as Completed
              </Button>
            </div>

            {/* Exercises List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentDay.exercises.map((ex, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                        Exercise {i + 1}
                      </span>
                      <h4
                        onClick={() =>
                          handleOpenExerciseDetails(ex.exerciseId?._id || ex.exerciseId)
                        }
                        className="text-sm font-bold text-white hover:text-emerald-400 cursor-pointer transition-colors"
                      >
                        {ex.exerciseName}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
                    <span className="px-2 py-1 rounded-md bg-slate-900 border border-slate-800">
                      {ex.sets} Sets
                    </span>
                    <span className="px-2 py-1 rounded-md bg-slate-900 border border-slate-800">
                      {ex.reps} Reps
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {ex.restSeconds}s Rest
                    </span>
                  </div>

                  {ex.notes && (
                    <p className="text-[11px] text-slate-400 italic">
                      "{ex.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Medical Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-bold text-white">Disclaimer:</span> {plan?.medicalDisclaimer ||
            'This workout program is algorithmically generated based on user input and is for educational/fitness tracking purposes. It does not constitute medical advice. Consult a healthcare professional before training.'}
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
              <h5 className="font-bold text-white mb-1">Execution Steps:</h5>
              <ol className="list-decimal list-inside space-y-1 text-slate-300">
                {selectedExerciseDetail.instructions?.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>

            {selectedExerciseDetail.formCues?.length > 0 && (
              <div>
                <h5 className="font-bold text-white mb-1">Key Form Cues:</h5>
                <ul className="list-disc list-inside space-y-1 text-emerald-300">
                  {selectedExerciseDetail.formCues.map((cue, idx) => (
                    <li key={idx}>{cue}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400">
              <span className="font-bold text-amber-400">Precaution:</span>{' '}
              {selectedExerciseDetail.precautions}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
