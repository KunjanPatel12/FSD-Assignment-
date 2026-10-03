import React from 'react';

function LandingPage({ onNavigate }) {
  return (
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
                onClick={() => onNavigate('register')}
                className="px-6 py-3 text-sm sm:text-base font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 shadow-sm transition-colors cursor-pointer"
              >
                Get Started
              </button>
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="px-6 py-3 text-sm sm:text-base font-semibold text-slate-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 shadow-sm transition-colors cursor-pointer"
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
  );
}

export default LandingPage;
