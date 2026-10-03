import React, { useState, useEffect } from 'react';

function ProfilePage({ currentUser }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('fitpulse_token');
        const res = await fetch('/api/member/dashboard', {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const result = await res.json();
        if (result.status === 'success' && result.data) {
          setData(result.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const formatText = (text) => {
    if (!text) return '—';
    return text
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded inline-block mb-2">
          Account Settings
        </span>
        <h1 className="text-2xl font-bold text-slate-900">Member Profile</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Review your personal credentials and configured gym preferences.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-gray-100">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="p-3.5 bg-slate-50 border border-gray-200 rounded-md">
            <span className="text-xs text-slate-500 block">Full Name</span>
            <span className="font-semibold text-slate-900">
              {data?.member?.fullName || currentUser?.fullName || '—'}
            </span>
          </div>
          <div className="p-3.5 bg-slate-50 border border-gray-200 rounded-md">
            <span className="text-xs text-slate-500 block">Email Address</span>
            <span className="font-semibold text-slate-900">
              {data?.member?.email || currentUser?.email || '—'}
            </span>
          </div>
          <div className="p-3.5 bg-slate-50 border border-gray-200 rounded-md">
            <span className="text-xs text-slate-500 block">Current Goal</span>
            <span className="font-semibold text-emerald-700">
              {formatText(data?.currentGoal)}
            </span>
          </div>
          <div className="p-3.5 bg-slate-50 border border-gray-200 rounded-md">
            <span className="text-xs text-slate-500 block">Fitness Level</span>
            <span className="font-semibold text-slate-900">
              {formatText(data?.fitnessLevel)}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ProfilePage;
