import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Key,
  Edit2,
  Check,
  X,
  Dumbbell,
  ShieldCheck,
  Activity,
  Lock,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { profileApi, membershipApi, authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export const MemberProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const { success, error: notifyError } = useNotification();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [membership, setMembership] = useState(null);

  // Form state
  const [accountData, setAccountData] = useState({
    name: '',
    phone: '',
  });

  const [fitnessData, setFitnessData] = useState({
    age: 21,
    heightCm: 175,
    weightKg: 70,
    fitnessGoal: 'general_fitness',
    experienceLevel: 'beginner',
    plannedDaysPerWeek: 3,
    preferredSchedule: 'morning',
    monthlySupplementBudget: 0,
    dietaryPreferences: 'Balanced whole foods',
    healthNotes: '',
  });

  // Change Password state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');

  // Initial load
  const loadProfileDetails = async () => {
    setLoading(true);
    try {
      const [profileRes, memRes] = await Promise.allSettled([
        profileApi.getProfile(),
        membershipApi.getStatus(),
      ]);

      if (profileRes.status === 'fulfilled') {
        const res = profileRes.value;
        if (res.user) {
          setAccountData({
            name: res.user.name || '',
            phone: res.user.phone || '',
          });
        } else if (user) {
          setAccountData({
            name: user.name || '',
            phone: user.phone || '',
          });
        }

        if (res.profile) {
          setFitnessData({
            age: res.profile.age ?? 21,
            heightCm: res.profile.heightCm ?? 175,
            weightKg: res.profile.weightKg ?? 70,
            fitnessGoal: res.profile.fitnessGoal || 'general_fitness',
            experienceLevel: res.profile.experienceLevel || 'beginner',
            plannedDaysPerWeek: res.profile.plannedDaysPerWeek ?? 3,
            preferredSchedule: res.profile.preferredSchedule || 'morning',
            monthlySupplementBudget: res.profile.monthlySupplementBudget ?? 0,
            dietaryPreferences: res.profile.dietaryPreferences || 'Balanced whole foods',
            healthNotes: res.profile.healthNotes || '',
          });
        }
      }

      if (memRes.status === 'fulfilled' && memRes.value.membership) {
        setMembership(memRes.value.membership);
      }
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileDetails();
  }, [user]);

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFitnessChange = (e) => {
    const { name, value } = e.target;
    setFitnessData((prev) => ({
      ...prev,
      [name]: ['age', 'heightCm', 'weightKg', 'plannedDaysPerWeek', 'monthlySupplementBudget'].includes(
        name
      )
        ? Number(value)
        : value,
    }));
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    loadProfileDetails();
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!accountData.name.trim() || accountData.name.trim().length < 2) {
      notifyError('Please enter a valid full name (minimum 2 characters).');
      return;
    }
    if (fitnessData.age < 14 || fitnessData.age > 100) {
      notifyError('Age must be between 14 and 100.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: accountData.name.trim(),
        phone: accountData.phone.trim(),
        ...fitnessData,
        regeneratePlan: true,
      };

      const res = await profileApi.updateProfile(payload);
      await refreshUser();
      setIsEditing(false);
      success('Profile and workout routine updated successfully!');
      if (res.user) {
        setAccountData({
          name: res.user.name || '',
          phone: res.user.phone || '',
        });
      }
    } catch (err) {
      notifyError(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!passwordForm.currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      success('Password changed successfully!');
      setPasswordModalOpen(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <LoadingSpinner text="Loading member account profile..." />
      </div>
    );
  }

  // Calculate initials
  const memberName = accountData.name || (user && user.name) || 'Gym Member';
  const memberInitials = memberName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'FP';

  const memberId = user && user.id ? `FP-${user.id.slice(-6).toUpperCase()}` : 'FP-MEMBER';
  const registrationDate = user && user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Active Member';

  // Format goal name for display
  const goalLabels = {
    muscle_gain: 'Muscle Gain',
    fat_loss: 'Fat Loss',
    strength: 'Strength & Power',
    general_fitness: 'General Fitness',
    endurance: 'Endurance & Cardio',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 1. Member Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-700 font-bold text-2xl sm:text-3xl flex items-center justify-center shrink-0">
              {memberInitials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {memberName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active Member
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-mono font-medium">
                  {memberId}
                </span>
              </div>
              <p className="text-sm text-slate-500 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-slate-400" />
                {user ? user.email : 'member@fitpulse.demo'}
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {!isEditing ? (
              <>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="primary"
                  className="rounded-lg bg-emerald-600 text-white flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </Button>
                <Button
                  onClick={() => {
                    setPasswordError('');
                    setPasswordModalOpen(true);
                  }}
                  variant="outline"
                  className="rounded-lg border-gray-200 text-slate-700 flex items-center gap-2"
                >
                  <Key className="w-4 h-4 text-slate-500" />
                  <span>Change Password</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  disabled={saving}
                  className="rounded-lg border-gray-200 text-slate-700 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  variant="primary"
                  disabled={saving}
                  className="rounded-lg bg-emerald-600 text-white flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Account & Fitness Profile */}
        <div className="lg:col-span-2 space-y-8">
          {/* 2. Account Information Section */}
          <Card className="p-6 border border-gray-200 bg-white">
            <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Account Information</h2>
                <p className="text-xs text-slate-500">Personal contact and registration data</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={accountData.name}
                    onChange={handleAccountChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    placeholder="Enter your full name"
                    required
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                    {accountData.name || 'Not provided'}
                  </p>
                )}
              </div>

              {/* Registered Email (Always Read-only for security) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Registered Email</span>
                  <span className="text-[10px] text-slate-400 font-normal flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" /> Read-only
                  </span>
                </label>
                <p className="text-sm font-mono text-slate-600 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg flex items-center justify-between">
                  <span>{user ? user.email : 'member@fitpulse.demo'}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </p>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={accountData.phone}
                    onChange={handleAccountChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    placeholder="e.g. +91 98765 43210"
                  />
                ) : (
                  <p className="text-sm text-slate-800 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{accountData.phone || 'Not provided'}</span>
                  </p>
                )}
              </div>

              {/* Member ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Member ID
                </label>
                <p className="text-sm font-mono font-semibold text-slate-900 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                  {memberId}
                </p>
              </div>

              {/* Registration Date */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Member Since
                </label>
                <p className="text-sm text-slate-700 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>{registrationDate}</span>
                </p>
              </div>
            </div>
          </Card>

          {/* 3. Fitness Profile Section */}
          <Card className="p-6 border border-gray-200 bg-white">
            <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Fitness Profile & Preferences</h2>
                <p className="text-xs text-slate-500">Biometrics and workout routine configuration</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
              {/* Age */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Age (Years)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="age"
                    min="14"
                    max="100"
                    value={fitnessData.age}
                    onChange={handleFitnessChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                ) : (
                  <p className="text-base font-bold text-slate-900 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                    {fitnessData.age} <span className="text-xs font-normal text-slate-500">yrs</span>
                  </p>
                )}
              </div>

              {/* Height */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Height (cm)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="heightCm"
                    min="80"
                    max="250"
                    value={fitnessData.heightCm}
                    onChange={handleFitnessChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                ) : (
                  <p className="text-base font-bold text-slate-900 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                    {fitnessData.heightCm} <span className="text-xs font-normal text-slate-500">cm</span>
                  </p>
                )}
              </div>

              {/* Weight */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Weight (kg)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="weightKg"
                    min="30"
                    max="300"
                    value={fitnessData.weightKg}
                    onChange={handleFitnessChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                ) : (
                  <p className="text-base font-bold text-slate-900 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                    {fitnessData.weightKg} <span className="text-xs font-normal text-slate-500">kg</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Fitness Goal */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Primary Fitness Goal
                </label>
                {isEditing ? (
                  <select
                    name="fitnessGoal"
                    value={fitnessData.fitnessGoal}
                    onChange={handleFitnessChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="fat_loss">Fat Loss</option>
                    <option value="strength">Strength & Power</option>
                    <option value="general_fitness">General Fitness</option>
                    <option value="endurance">Endurance & Cardio</option>
                  </select>
                ) : (
                  <p className="text-sm font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg">
                    {goalLabels[fitnessData.fitnessGoal] || fitnessData.fitnessGoal}
                  </p>
                )}
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Experience Level
                </label>
                {isEditing ? (
                  <select
                    name="experienceLevel"
                    value={fitnessData.experienceLevel}
                    onChange={handleFitnessChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="beginner">Beginner (0 - 6 months)</option>
                    <option value="intermediate">Intermediate (6 - 24 months)</option>
                    <option value="advanced">Advanced (2+ years)</option>
                  </select>
                ) : (
                  <p className="text-sm font-semibold capitalize text-slate-900 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                    {fitnessData.experienceLevel}
                  </p>
                )}
              </div>

              {/* Planned Days Per Week */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Weekly Training Days
                </label>
                {isEditing ? (
                  <select
                    name="plannedDaysPerWeek"
                    value={fitnessData.plannedDaysPerWeek}
                    onChange={handleFitnessChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Day' : 'Days'} per week
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                    {fitnessData.plannedDaysPerWeek} Days / Week
                  </p>
                )}
              </div>

              {/* Preferred Workout Schedule */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Preferred Workout Time
                </label>
                {isEditing ? (
                  <select
                    name="preferredSchedule"
                    value={fitnessData.preferredSchedule}
                    onChange={handleFitnessChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="morning">Morning (6:00 AM - 11:00 AM)</option>
                    <option value="afternoon">Afternoon (12:00 PM - 4:00 PM)</option>
                    <option value="evening">Evening (5:00 PM - 10:00 PM)</option>
                  </select>
                ) : (
                  <p className="text-sm capitalize font-semibold text-slate-900 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                    {fitnessData.preferredSchedule}
                  </p>
                )}
              </div>

              {/* Monthly Supplement Budget */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Optional Monthly Supplement Budget (INR)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="monthlySupplementBudget"
                    min="0"
                    step="250"
                    value={fitnessData.monthlySupplementBudget}
                    onChange={handleFitnessChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    placeholder="e.g. 1500"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                    ₹{fitnessData.monthlySupplementBudget.toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-normal text-slate-500">/ month</span>
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (1 Col): Membership & Pass Info */}
        <div className="space-y-8">
          {/* 4. Membership Details Card */}
          <Card className="p-6 border border-gray-200 bg-white">
            <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Membership Pass</h2>
                <p className="text-xs text-slate-500">Gym access & billing details</p>
              </div>
            </div>

            {membership ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[#F4FAF6] border border-emerald-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900">
                      {membership.planName || 'FitPulse Standard Monthly'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        membership.paymentStatus === 'successful'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {membership.paymentStatus === 'successful' ? 'Active' : membership.paymentStatus}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">
                    ₹{membership.amountInr?.toLocaleString('en-IN') || '1,499'}
                    <span className="text-xs font-normal text-slate-500"> / 30 Days</span>
                  </p>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between py-1 border-b border-gray-50">
                    <span className="text-slate-500">Start Date</span>
                    <span className="font-semibold text-slate-900">
                      {membership.startDate
                        ? new Date(membership.startDate).toLocaleDateString('en-IN')
                        : 'Current Cycle'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-gray-50">
                    <span className="text-slate-500">Valid Until</span>
                    <span className="font-semibold text-slate-900">
                      {membership.endDate
                        ? new Date(membership.endDate).toLocaleDateString('en-IN')
                        : '30 Days Remaining'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-gray-50">
                    <span className="text-slate-500">Payment Gateway</span>
                    <span className="font-medium text-slate-700">Demo Sandbox</span>
                  </div>
                </div>

                <Link to="/membership" className="block pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-lg border-gray-200 text-slate-700 flex items-center justify-center gap-1.5"
                  >
                    <span>Manage Membership</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-900 mb-1">
                  No Active Pass Found
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  Activate a membership pass to access the full gym floor and trainer support.
                </p>
                <Link to="/membership">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full rounded-lg bg-emerald-600 text-white"
                  >
                    Select Membership Plan
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Quick Shortcuts */}
          <Card className="p-6 border border-gray-200 bg-white">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Member Quick Links
            </h3>
            <div className="space-y-2">
              <Link
                to="/workouts"
                className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:bg-slate-50 text-xs font-semibold text-slate-800"
              >
                <span>View Today's Workout</span>
                <Dumbbell className="w-4 h-4 text-emerald-600" />
              </Link>
              <Link
                to="/attendance"
                className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:bg-slate-50 text-xs font-semibold text-slate-800"
              >
                <span>Check-in Logs</span>
                <Activity className="w-4 h-4 text-emerald-600" />
              </Link>
              <Link
                to="/consistency"
                className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:bg-slate-50 text-xs font-semibold text-slate-800"
              >
                <span>Consistency Report</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* 5. Change Password Modal */}
      <Modal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="Change Account Password"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <p className="text-xs text-slate-500 mb-4">
            Enter your current account password followed by a secure new password (minimum 8 characters).
          </p>

          {passwordError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{passwordError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Password (Min. 8 characters)
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPasswordModalOpen(false)}
              disabled={passwordLoading}
              className="rounded-lg border-gray-200 text-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={passwordLoading}
              className="rounded-lg bg-emerald-600 text-white"
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
