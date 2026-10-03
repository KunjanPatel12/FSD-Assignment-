import React from 'react';

const starterExercises = [
  { name: 'Barbell Flat Bench Press', target: 'Chest', equipment: 'Barbell', setsReps: '4 sets × 8-10 reps' },
  { name: 'Incline Dumbbell Chest Press', target: 'Upper Chest', equipment: 'Dumbbells', setsReps: '3 sets × 10-12 reps' },
  { name: 'Lat Pulldown', target: 'Back (Lats)', equipment: 'Cable Machine', setsReps: '4 sets × 10-12 reps' },
  { name: 'Barbell Bent-Over Row', target: 'Upper Back', equipment: 'Barbell', setsReps: '4 sets × 8-10 reps' },
  { name: 'Barbell Back Squats', target: 'Quads & Glutes', equipment: 'Barbell', setsReps: '4 sets × 8-10 reps' },
  { name: 'Romanian Deadlifts (RDL)', target: 'Hamstrings & Posterior Chain', equipment: 'Barbell', setsReps: '4 sets × 8-10 reps' },
  { name: 'Overhead Dumbbell Shoulder Press', target: 'Deltoids', equipment: 'Dumbbells', setsReps: '4 sets × 8-10 reps' },
  { name: 'Dumbbell Lateral Raises', target: 'Side Deltoids', equipment: 'Dumbbells', setsReps: '4 sets × 12-15 reps' },
  { name: 'Triceps Overhead Extension', target: 'Triceps', equipment: 'Dumbbell / Cable', setsReps: '3 sets × 12 reps' },
  { name: 'Barbell Bicep Curls', target: 'Biceps', equipment: 'Barbell', setsReps: '3 sets × 10-12 reps' },
];

function ExerciseLibraryPage() {
  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded inline-block mb-2">
          Knowledge Base
        </span>
        <h1 className="text-2xl font-bold text-slate-900">Exercise Library</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Explore key gym movements, targeted muscle groups, and recommended execution ranges.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Exercise Name</th>
                <th className="py-3 px-4">Target Muscle</th>
                <th className="py-3 px-4">Equipment</th>
                <th className="py-3 px-4">Standard Prescribed Range</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {starterExercises.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-900">{item.name}</td>
                  <td className="py-3 px-4 text-emerald-700 font-medium text-xs">{item.target}</td>
                  <td className="py-3 px-4 text-slate-600 text-xs">{item.equipment}</td>
                  <td className="py-3 px-4 text-slate-700 font-mono text-xs">{item.setsReps}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

export default ExerciseLibraryPage;
