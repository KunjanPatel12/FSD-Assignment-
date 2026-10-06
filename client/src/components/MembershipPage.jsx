import React, { useState } from 'react';

function MembershipPage({ currentUser, onNavigate }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const PLANS = [
    { id: '1_month', name: '1 Month', duration: 1, price: 999 },
    { id: '3_months', name: '3 Months', duration: 3, price: 2499 },
    { id: '6_months', name: '6 Months', duration: 6, price: 4499 },
    { id: '12_months', name: '12 Months', duration: 12, price: 7999 },
  ];

  const handleSimulatePayment = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('fitpulse_token');
      const res = await fetch('/api/member/membership/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          durationMonths: selectedPlan.duration,
          amount: selectedPlan.price,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Payment simulation failed');
      }

      setSuccess(true);
      setTimeout(() => {
        onNavigate('dashboard');
      }, 3000);
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred during payment simulation.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center">
        <div className="bg-white border border-emerald-200 rounded-lg p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
          <p className="text-sm text-slate-600 mb-6">
            Your {selectedPlan.name} membership is now active. Unlocking gym features...
          </p>
          <div className="w-6 h-6 border-2 border-gray-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Choose Your Membership</h1>
        <p className="text-sm text-slate-600">
          Select a plan to unlock all gym features, including workout plans, exercise library, attendance, and consistency reports.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm max-w-2xl mx-auto text-center">
          {error}
        </div>
      )}

      {!selectedPlan ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative"
            >
              {plan.id === '6_months' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-slate-900 text-center mb-1">{plan.name}</h3>
              <div className="text-center mb-6">
                <span className="text-3xl font-bold text-emerald-700">₹{plan.price}</span>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                {[
                  'Basic gym access',
                  'Workout access',
                  'Attendance',
                  'Consistency report',
                  'Trainer support',
                ].map((feature, i) => (
                  <div key={i} className="flex items-start space-x-2 text-sm text-slate-600">
                    <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setSelectedPlan(plan)}
                className="w-full py-2.5 px-4 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                Select Plan
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-slate-900">Membership Summary</h2>
            <button
              onClick={() => setSelectedPlan(null)}
              className="text-xs text-slate-500 hover:text-slate-700 underline"
            >
              Change Plan
            </button>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Selected Plan</span>
              <span className="font-semibold text-slate-900">{selectedPlan.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Duration</span>
              <span className="font-semibold text-slate-900">{selectedPlan.duration} Months</span>
            </div>
            <div className="flex justify-between text-sm pt-4 border-t border-gray-100">
              <span className="font-bold text-slate-900">Total Amount</span>
              <span className="font-bold text-emerald-700 text-lg">₹{selectedPlan.price}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSimulatePayment}
            disabled={loading}
            className="w-full py-3 px-4 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading ? 'Processing Payment...' : 'Simulate Payment'}
          </button>
          <p className="text-center text-[10px] text-slate-400 mt-4">
            This is a simulated payment flow for educational purposes. No real transaction takes place.
          </p>
        </div>
      )}
    </main>
  );
}

export default MembershipPage;
