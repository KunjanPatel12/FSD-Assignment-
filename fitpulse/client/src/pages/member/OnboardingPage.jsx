import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ShieldAlert,
  ArrowRight,
  User,
  CreditCard,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { profileApi, membershipApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import confetti from 'canvas-confetti';

export const OnboardingPage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [membership, setMembership] = useState(null);

  const [formData, setFormData] = useState({
    age: 21,
    heightCm: 175,
    weightKg: 70,
    fitnessGoal: 'muscle_gain',
    experienceLevel: 'intermediate',
    plannedDaysPerWeek: 4,
    preferredSchedule: 'morning',
    monthlySupplementBudget: 1500,
    dietaryPreferences: 'Balanced whole foods',
    healthNotes: '',
  });

  useEffect(() => {
    const loadProfileAndMembership = async () => {
      try {
        const res = await profileApi.getProfile();
        if (res.profile) {
          setFormData({
            age: res.profile.age || 21,
            heightCm: res.profile.heightCm || 175,
            weightKg: res.profile.weightKg || 70,
            fitnessGoal: res.profile.fitnessGoal || 'muscle_gain',
            experienceLevel: res.profile.experienceLevel || 'intermediate',
            plannedDaysPerWeek: res.profile.plannedDaysPerWeek || 4,
            preferredSchedule: res.profile.preferredSchedule || 'morning',
            monthlySupplementBudget: res.profile.monthlySupplementBudget || 1500,
            dietaryPreferences: res.profile.dietaryPreferences || 'Balanced whole foods',
            healthNotes: res.profile.healthNotes || '',
          });
        }
      } catch (err) {
        // No existing profile yet
      }

      try {
        const memRes = await membershipApi.getStatus();
        setMembership(memRes.membership);
      } catch (err) {
        // Membership not loaded
      }
    };

    loadProfileAndMembership();
  }, []);

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
      await profileApi.updateProfile({
        ...formData,
        regeneratePlan: true,
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });

      await refreshUser();
      success('Fitness profile saved & personalized workout plan updated!');
      navigate('/membership');
    } catch (err) {
      notifyError(err.message || 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 bg-white">
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> Member Fitness Profile & Preferences
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Personal Fitness Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
          Configure your baseline metrics, fitness goals, and preferred weekly schedule. Your workout split is dynamically generated from these parameters.
        </p>
      </div>

      {/* Membership Info Snippet if active */}
      {membership && membership.isActive && (
        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Active Plan: <strong>{membership.planName}</strong></span>
          </div>
          <span className="font-mono text-emerald-700 font-semibold">
            {membership.daysRemaining || 0} Days Remaining
          </span>
        </div>
      )}

      <Card className="p-6 sm:p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Biometrics */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center justify-center font-bold">
                1
              </span>
              Physical Measurements
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">Age (Years) *</label>
                <input
                  type="number"
                  name="age"
                  min="14"
                  max="100"
                  required
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-slate-900 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">Height (cm)</label>
                <input
                  type="number"
                  name="heightCm"
                  min="100"
                  max="250"
                  value={formData.heightCm}
                  onChange={handleChange}
                  placeholder="e.g. 175"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-slate-900 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  name="weightKg"
                  min="30"
                  max="250"
                  value={formData.weightKg}
                  onChange={handleChange}
                  placeholder="e.g. 70"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-slate-900 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Goal & Experience */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center justify-center font-bold">
                2
              </span>
              Fitness Goal & Training Level
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1.5">Primary Target</label>
                <select
                  name="fitnessGoal"
                  value={formData.fitnessGoal}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-slate-900 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none font-medium"
                >
                  <option value="muscle_gain">Muscle Gain (Hypertrophy, 8-12 reps)</option>
                  <option value="strength">Strength & Power (Compound lifts, 4-6 reps)</option>
                  <option value="fat_loss">Fat Loss & Conditioning (High tempo, 12-15 reps)</option>
                  <option value="general_fitness">General Fitness & Core Health</option>
                  <option value="endurance">Stamina & Athletic Endurance</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1.5">Experience Tier</label>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-slate-900 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none font-medium"
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
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center justify-center font-bold">
                3
              </span>
              Weekly Training Commitment
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-700 font-semibold">
                    Planned Days Per Week:
                  </label>
                  <span className="text-sm font-bold text-emerald-700 font-mono">
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
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                  <span>1 Day</span>
                  <span>4 Days (Split)</span>
                  <span>7 Days</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">Preferred Time of Day</label>
                <select
                  name="preferredSchedule"
                  value={formData.preferredSchedule}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-slate-900 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none font-medium"
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
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center justify-center font-bold">
                4
              </span>
              Nutrition & Supplement Budget (Optional)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">
                  Monthly Supplement Budget (₹ INR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  name="monthlySupplementBudget"
                  value={formData.monthlySupplementBudget}
                  onChange={handleChange}
                  placeholder="e.g. 1500"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-slate-900 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">Dietary Focus</label>
                <input
                  type="text"
                  name="dietaryPreferences"
                  value={formData.dietaryPreferences}
                  onChange={handleChange}
                  placeholder="e.g. Vegetarian, High protein"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-slate-900 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none placeholder-gray-400"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs text-slate-700 font-semibold block mb-1">
                Health Notes or Joint Sensitivities
              </label>
              <textarea
                rows="2"
                name="healthNotes"
                value={formData.healthNotes}
                onChange={handleChange}
                placeholder="e.g. Mild knee soreness during heavy squats..."
                className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-slate-900 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none placeholder-gray-400 resize-none"
              />
            </div>
          </div>

          {/* Non-medical disclaimer */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              FitPulse uses your parameters strictly for exercise selection and
              consistency math. We never prescribe medical advice or diagnosis. Always consult a
              physician for individual health assessments.
            </p>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            variant="primary"
            size="lg"
            className="w-full"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Save Profile & Update Workout Plan
          </Button>
        </form>
      </Card>
    </div>
  );
};
