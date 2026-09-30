import React, { useState, useEffect } from 'react';
import {
  Search,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { exerciseApi } from '../../services/api';
import { ExerciseIllustration } from '../../components/common/ExerciseIllustration';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const ExerciseLibraryPage = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Modal for detail view
  const [activeExercise, setActiveExercise] = useState(null);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const res = await exerciseApi.getAll({
        search,
        targetMuscleGroup: selectedMuscle,
        equipment: selectedEquipment,
        difficulty: selectedDifficulty,
        limit: 100,
      });
      setExercises(res.exercises);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExercises();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedMuscle, selectedEquipment, selectedDifficulty]);

  const muscleGroups = ['all', 'chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'full_body'];
  const equipmentOptions = ['all', 'barbell', 'dumbbell', 'cable', 'machine', 'bodyweight'];
  const difficultyOptions = ['all', 'beginner', 'intermediate', 'advanced'];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-white">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Curated Exercise Library
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore gym movements with strict biomechanical form cues, setup steps, and safety precautions.
        </p>
      </div>

      {/* Search & Filters */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search exercise by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-gray-200 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 placeholder-gray-400"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs text-slate-800 capitalize focus:outline-none focus:border-emerald-600 font-medium"
            >
              <option value="all">All Equipment</option>
              {equipmentOptions.slice(1).map((eq) => (
                <option key={eq} value={eq}>
                  {eq}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs text-slate-800 capitalize focus:outline-none focus:border-emerald-600 font-medium"
            >
              <option value="all">All Levels</option>
              {difficultyOptions.slice(1).map((dif) => (
                <option key={dif} value={dif}>
                  {dif}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Muscle group pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {muscleGroups.map((muscle) => (
            <button
              key={muscle}
              onClick={() => setSelectedMuscle(muscle)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                selectedMuscle === muscle
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {muscle.replace('_', ' ')}
            </button>
          ))}
        </div>
      </Card>

      {/* Grid of Exercises */}
      {loading ? (
        <LoadingSpinner text="Searching exercise library..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exercises.map((ex) => (
            <div
              key={ex._id}
              onClick={() => setActiveExercise(ex)}
              className="bg-[#F4FAF6] border border-emerald-100/70 rounded-xl p-4 flex gap-4 items-center cursor-pointer transition-colors"
            >
              {/* Exercise illustration */}
              <div className="w-20 h-20 bg-white rounded-lg p-1 border border-emerald-100/50 flex items-center justify-center shrink-0 overflow-hidden">
                <ExerciseIllustration name={ex.name} muscleGroup={ex.targetMuscleGroup} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {ex.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-emerald-100/80 text-emerald-800 text-[10px] font-bold capitalize shrink-0">
                    {ex.targetMuscleGroup}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                  <span className="capitalize">Equip: {ex.equipment}</span>
                  <span>•</span>
                  <span className="capitalize">Tier: {ex.difficulty}</span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-2">
                  <span>View Form Guide & Steps</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}

          {exercises.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400 text-xs">
              No exercises match your filter criteria.
            </div>
          )}
        </div>
      )}

      {/* Exercise Modal */}
      <Modal
        isOpen={!!activeExercise}
        onClose={() => setActiveExercise(null)}
        title={activeExercise?.name || ''}
        maxWidth="max-w-lg"
      >
        {activeExercise && (
          <div className="space-y-4 text-xs">
            <div className="flex flex-wrap gap-2">
              <Badge variant="emerald">Target: {activeExercise.targetMuscleGroup}</Badge>
              <Badge variant="slate">Equipment: {activeExercise.equipment}</Badge>
              <Badge variant="emerald">Difficulty: {activeExercise.difficulty}</Badge>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 text-sm mb-1.5">Instructions</h5>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 leading-relaxed">
                {activeExercise.instructions.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>

            {activeExercise.formCues?.length > 0 && (
              <div>
                <h5 className="font-bold text-slate-900 text-sm mb-1.5">Key Form Cues</h5>
                <ul className="list-disc list-inside space-y-1 text-emerald-800">
                  {activeExercise.formCues.map((cue, i) => (
                    <li key={i}>{cue}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 leading-relaxed">
              <span className="font-bold flex items-center gap-1 mb-1">
                <ShieldAlert className="w-4 h-4 text-amber-600" /> Safety Guidance:
              </span>
              {activeExercise.precautions}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
