import React, { useState } from 'react';

function App() {
  const [activeModal, setActiveModal] = useState(null);

  const handleAction = (actionName) => {
    setActiveModal(actionName);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          {/* Logo on the left */}
          <a href="/" className="flex items-center space-x-2 focus:outline-none" aria-label="FitPulse Home">
            <img src="/logo.svg" alt="FitPulse Logo" className="h-8 sm:h-9 w-auto" />
          </a>

          {/* Navigation Action Buttons on the right */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => handleAction('Sign In')}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleAction('Get Started')}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 shadow-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center">
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-18">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left side: Text */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              {/* Small green category label */}
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Fitness &amp; Wellness Platform
                </span>
              </div>

              {/* Large dark navy heading with green highlighted text */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Elevate Your Fitness Journey With{' '}
                <span className="text-emerald-600">FitPulse</span>
              </h1>

              {/* Short description */}
              <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                A modern gym management and personalized workout tracking platform. 
                Manage memberships, log your daily progress, and stay committed to reaching your physical fitness goals.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-row flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleAction('Get Started')}
                  className="px-6 py-3 text-sm sm:text-base font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 shadow-sm transition-colors"
                >
                  Get Started
                </button>
                <button
                  type="button"
                  onClick={() => handleAction('Sign In')}
                  className="px-6 py-3 text-sm sm:text-base font-semibold text-slate-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 shadow-sm transition-colors"
                >
                  Sign In
                </button>
              </div>
            </div>

            {/* Right side: Large gym image */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <div className="w-full max-w-lg lg:max-w-none overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-gray-50">
                <img
                  src="/gym-hero.jpg"
                  alt="Modern FitPulse Gym & Training Facility"
                  className="w-full h-[320px] sm:h-[400px] lg:h-[460px] object-cover block"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="w-full border-t border-gray-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>&copy; {new Date().getFullYear()} FitPulse. All rights reserved.</span>
          <span>Clean Full-Stack College Project</span>
        </div>
      </footer>

      {/* Placeholder Modal for Actions */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
        >
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-slate-900">{activeModal}</h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold leading-none p-1"
                aria-label="Close dialog"
              >
                &times;
              </button>
            </div>
            <div className="py-4 text-sm text-slate-600">
              <p>
                The <strong>{activeModal}</strong> portal is planned for the authentication phase.
              </p>
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-xs">
                Landing page UI foundation is active. Authentication and role-based dashboards will be integrated in subsequent milestones.
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-md hover:bg-emerald-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
