import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Dumbbell,
  Target,
  Calendar,
  Flame,
  ShieldAlert,
  ArrowRight,
  Clock,
  Heart,
  DollarSign,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { profileApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import confetti from 'canvas-confetti';

export const OnboardingPage = () => {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotification();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    age: 24,
    heightCm: 175,
    weightKg: 72,
    fitnessGoal: 'muscle_gain',
    experienceLevel: 'intermediate',
    plannedDaysPerWeek: 4,
    preferredSchedule: 'morning',
    monthlySupplementBudget: 40,
    dietaryPreferences: 'Balanced whole foods',
    healthNotes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        ['age', 'heightCm', 'weightKg', 'plannedDaysPerWeek', 'monthlySupplementBudget'].includes(
          name
        )
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await profileApi.updateProfile({
        ...formData,
        regeneratePlan: true,
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });

      await refreshUser();
      success('Fitness profile saved & personalized workout plan generated!');
      navigate('/dashboard');
    } catch (err) {
      notifyError(err.message || 'Failed to complete profile onboarding.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> Step 1: Personalized Fitness Baseline
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Welcome to FitPulse! Let's tailor your routine
        </h2>
        <p className="text-xs text-slate-400 max-w-xl mx-auto">
          Our deterministic engine configures your sets, reps, split, and consistency targets
          based on your actual schedule and goal.
        </p>
      </div>

      <Card className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Biometrics */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">
                1
              </span>
              Basic Metrics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Age (Years) *</label>
                <input
                  type="number"
                  name="age"
                  min="14"
                  max="100"
                  required
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1">Height (cm)</label>
                <input
                  type="number"
                  name="heightCm"
                  min="100"
                  max="250"
                  value={formData.heightCm}
                  onChange={handleChange}
                  placeholder="e.g. 175"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  name="weightKg"
                  min="30"
                  max="250"
                  value={formData.weightKg}
                  onChange={handleChange}
                  placeholder="e.g. 72.5"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Goal & Experience */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-bold">
                2
              </span>
              Fitness Goal & Experience
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1.5">Primary Target</label>
                <select
                  name="fitnessGoal"
                  value={formData.fitnessGoal}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="muscle_gain">Muscle Gain (Hypertrophy, 8-12 reps)</option>
                  <option value="strength">Strength & Power (Compound lifts, 4-6 reps)</option>
                  <option value="fat_loss">Fat Loss & Conditioning (High tempo, 12-15 reps)</option>
                  <option value="general_fitness">General Fitness & Core Health</option>
                  <option value="endurance">Stamina & Athletic Endurance</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1.5">Experience Tier</label>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="beginner">Beginner (Foundational Movements)</option>
                  <option value="intermediate">Intermediate (Regular Training History)</option>
                  <option value="advanced">Advanced (High Intensity & Work Capacity)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Training Commitment */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">
                3
              </span>
              Training Commitment
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-300">
                    Planned Days Per Week:
                  </label>
                  <span className="text-sm font-bold text-emerald-400 font-mono">
                    {formData.plannedDaysPerWeek} Days
                  </span>
                </div>
                <input
                  type="range"
                  name="plannedDaysPerWeek"
                  min="1"
                  max="7"
                  value={formData.plannedDaysPerWeek}
                  onChange={handleChange}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>1 Day</span>
                  <span>4 Days (Split)</span>
                  <span>7 Days</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Preferred Time of Day</label>
                <select
                  name="preferredSchedule"
                  value={formData.preferredSchedule}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="morning">Morning (06:00 - 10:00)</option>
                  <option value="afternoon">Afternoon (12:00 - 16:00)</option>
                  <option value="evening">Evening (17:00 - 21:00)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Nutrition & Budget */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center font-bold">
                4
              </span>
              Nutrition & Notes (Optional)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  Monthly Supplement Budget ($)
                </label>
                <input
                  type="number"
                  min="0"
                  name="monthlySupplementBudget"
                  value={formData.monthlySupplementBudget}
                  onChange={handleChange}
                  placeholder="e.g. 50"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1">Dietary Focus</label>
                <input
                  type="text"
                  name="dietaryPreferences"
                  value={formData.dietaryPreferences}
                  onChange={handleChange}
                  placeholder="e.g. Vegetarian, High protein"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs text-slate-300 block mb-1">
                Health Notes or Joint Sensitivities
              </label>
              <textarea
                rows="2"
                name="healthNotes"
                value={formData.healthNotes}
                onChange={handleChange}
                placeholder="e.g. Mild knee soreness during heavy squats..."
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Non-medical disclaimer */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              FitPulse uses your parameters strictly for deterministic exercise selection and
              consistency math. We never prescribe medical advice or diagnosis. Always consult a
              physician for individual clinical assessments.
            </p>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            variant="primary"
            size="lg"
            className="w-full"
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Generate My Deterministic Workout Plan
          </Button>
        </form>
      </Card>
    </div>
  );
};
