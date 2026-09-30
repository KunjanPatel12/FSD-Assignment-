import React from 'react';

/**
 * Clean SVG-based exercise illustrations matching the reference anatomy/fitness line drawings.
 * Renders crisp, responsive vector graphics with muscle highlight accents.
 */
export const ExerciseIllustration = ({ name = '', muscleGroup = 'chest', className = 'w-full h-full' }) => {
  const normalized = name.toLowerCase();

  // 1. Bench Press
  if (normalized.includes('bench press') || normalized.includes('chest press')) {
    return (
      <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="120" fill="white" rx="8" />
        {/* Bench rack */}
        <line x1="22" y1="95" x2="98" y2="95" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="26" y="55" width="4" height="40" fill="#64748B" rx="1" />
        <rect x="90" y="55" width="4" height="40" fill="#64748B" rx="1" />
        {/* Bench pad */}
        <rect x="36" y="68" width="48" height="6" fill="#334155" rx="2" />
        <rect x="58" y="74" width="4" height="21" fill="#64748B" rx="1" />
        {/* Lifter Body */}
        <path d="M42 66 C42 62, 54 60, 60 62 C66 60, 78 62, 78 66 Z" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5" />
        <circle cx="60" cy="56" r="5" fill="#CBD5E1" stroke="#475569" strokeWidth="1.5" />
        {/* Chest highlight */}
        <path d="M52 64 C56 61, 64 61, 68 64 Z" fill="#F87171" opacity="0.8" />
        {/* Arms pressing up */}
        <path d="M44 64 L34 46 L30 44" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M76 64 L86 46 L90 44" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Barbell & Plates */}
        <line x1="16" y1="44" x2="104" y2="44" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
        <rect x="18" y="32" width="5" height="24" fill="#0F172A" rx="2" />
        <rect x="24" y="35" width="4" height="18" fill="#334155" rx="1.5" />
        <rect x="92" y="35" width="4" height="18" fill="#334155" rx="1.5" />
        <rect x="97" y="32" width="5" height="24" fill="#0F172A" rx="2" />
      </svg>
    );
  }

  // 2. Pull-Up
  if (normalized.includes('pull-up') || normalized.includes('pull up') || normalized.includes('chin-up')) {
    return (
      <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="120" fill="white" rx="8" />
        {/* Pull up bar frame */}
        <line x1="18" y1="26" x2="102" y2="26" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="26" y1="26" x2="26" y2="105" stroke="#94A3B8" strokeWidth="2.5" />
        <line x1="94" y1="26" x2="94" y2="105" stroke="#94A3B8" strokeWidth="2.5" />
        {/* Head */}
        <circle cx="60" cy="30" r="5" fill="#CBD5E1" stroke="#475569" strokeWidth="1.5" />
        {/* Arms gripping bar */}
        <path d="M42 26 L46 36 L52 42" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M78 26 L74 36 L68 42" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Torso & Lats highlight */}
        <path d="M52 42 L68 42 L64 68 L56 68 Z" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5" />
        <path d="M53 43 C58 48, 62 48, 67 43 L65 58 C62 55, 58 55, 55 58 Z" fill="#F87171" opacity="0.8" />
        {/* Legs hanging */}
        <path d="M57 68 L57 96 L54 100" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
        <path d="M63 68 L63 96 L66 100" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  // 3. Overhead Shoulder Press
  if (normalized.includes('overhead') || normalized.includes('shoulder press') || normalized.includes('military press')) {
    return (
      <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="120" fill="white" rx="8" />
        {/* Barbell pushed overhead */}
        <line x1="16" y1="24" x2="104" y2="24" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
        <rect x="18" y="14" width="5" height="20" fill="#0F172A" rx="2" />
        <rect x="97" y="14" width="5" height="20" fill="#0F172A" rx="2" />
        {/* Arms pushing straight up */}
        <path d="M38 24 L48 42 L52 48" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M82 24 L72 42 L68 48" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Head */}
        <circle cx="60" cy="40" r="5" fill="#CBD5E1" stroke="#475569" strokeWidth="1.5" />
        {/* Shoulders highlight */}
        <circle cx="50" cy="46" r="3.5" fill="#F87171" opacity="0.85" />
        <circle cx="70" cy="46" r="3.5" fill="#F87171" opacity="0.85" />
        {/* Torso & Bench */}
        <path d="M52 48 L68 48 L65 74 L55 74 Z" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5" />
        <rect x="52" y="74" width="16" height="4" fill="#334155" rx="1" />
        <path d="M56 78 L56 102" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M64 78 L64 102" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  // 4. Bicep Curl / Dumbbell
  if (normalized.includes('bicep') || normalized.includes('curl') || normalized.includes('arm')) {
    return (
      <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="120" fill="white" rx="8" />
        {/* Head */}
        <circle cx="60" cy="24" r="5.5" fill="#CBD5E1" stroke="#475569" strokeWidth="1.5" />
        {/* Torso */}
        <path d="M50 34 L70 34 L66 64 L54 64 Z" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5" />
        {/* Biceps highlight */}
        <ellipse cx="44" cy="44" rx="3.5" ry="5" fill="#F87171" opacity="0.85" />
        <ellipse cx="76" cy="44" rx="3.5" ry="5" fill="#F87171" opacity="0.85" />
        {/* Arms holding dumbbells */}
        <path d="M50 34 L44 45 L38 52" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M70 34 L76 45 L82 52" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dumbbells in hand */}
        <g transform="translate(34, 48)">
          <rect x="0" y="0" width="3" height="8" fill="#0F172A" rx="1" />
          <line x1="3" y1="4" x2="9" y2="4" stroke="#64748B" strokeWidth="2" />
          <rect x="9" y="0" width="3" height="8" fill="#0F172A" rx="1" />
        </g>
        <g transform="translate(78, 48)">
          <rect x="0" y="0" width="3" height="8" fill="#0F172A" rx="1" />
          <line x1="3" y1="4" x2="9" y2="4" stroke="#64748B" strokeWidth="2" />
          <rect x="9" y="0" width="3" height="8" fill="#0F172A" rx="1" />
        </g>
        {/* Legs standing */}
        <path d="M55 64 L53 100 L50 102" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
        <path d="M65 64 L67 100 L70 102" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  // 5. Squats / Legs
  if (normalized.includes('squat') || normalized.includes('leg') || normalized.includes('quad')) {
    return (
      <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="120" fill="white" rx="8" />
        {/* Barbell on upper traps */}
        <line x1="20" y1="36" x2="100" y2="36" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
        <rect x="22" y="24" width="5" height="24" fill="#0F172A" rx="2" />
        <rect x="93" y="24" width="5" height="24" fill="#0F172A" rx="2" />
        {/* Head */}
        <circle cx="60" cy="30" r="5" fill="#CBD5E1" stroke="#475569" strokeWidth="1.5" />
        {/* Hands gripping bar */}
        <path d="M42 36 L48 42 L52 46" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
        <path d="M78 36 L72 42 L68 46" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
        {/* Torso angled in squat */}
        <path d="M52 44 L68 44 L64 66 L54 66 Z" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5" />
        {/* Quad / Glute highlight */}
        <path d="M46 68 L60 66 L50 82 Z" fill="#F87171" opacity="0.85" />
        <path d="M74 68 L60 66 L70 82 Z" fill="#F87171" opacity="0.85" />
        {/* Deep squat knees and shins */}
        <path d="M54 66 L42 74 L48 98" stroke="#475569" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M66 66 L78 74 L72 98" stroke="#475569" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="38" y1="98" x2="52" y2="98" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
        <line x1="68" y1="98" x2="82" y2="98" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // 6. Deadlift / Row / Back
  if (normalized.includes('deadlift') || normalized.includes('row') || normalized.includes('back')) {
    return (
      <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="120" fill="white" rx="8" />
        {/* Lifter in hip hinge position */}
        <circle cx="74" cy="32" r="5" fill="#CBD5E1" stroke="#475569" strokeWidth="1.5" />
        {/* Torso hinged at 45 degrees */}
        <path d="M72 36 L52 56 L46 52 L66 32 Z" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5" />
        {/* Back / Erector spinae highlight */}
        <path d="M68 36 L54 50 L50 48 L64 34 Z" fill="#F87171" opacity="0.85" />
        {/* Arms reaching down to bar */}
        <path d="M68 36 L64 68" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        {/* Barbell at mid shin */}
        <line x1="28" y1="72" x2="98" y2="72" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
        <rect x="30" y="60" width="5" height="24" fill="#0F172A" rx="2" />
        <rect x="91" y="60" width="5" height="24" fill="#0F172A" rx="2" />
        {/* Legs with slight knee flexion */}
        <path d="M48 54 L44 76 L42 98" stroke="#475569" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M52 54 L52 76 L52 98" stroke="#475569" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="36" y1="98" x2="58" y2="98" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // Generic fallback fitness illustration
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" fill="white" rx="8" />
      <circle cx="60" cy="30" r="7" fill="#CBD5E1" stroke="#475569" strokeWidth="1.5" />
      <path d="M52 42 L68 42 L64 70 L56 70 Z" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5" />
      {/* Muscle accent */}
      <circle cx="60" cy="50" r="5" fill="#10B981" opacity="0.4" />
      {/* Arms holding dumbbell */}
      <path d="M52 42 L42 54 L36 52" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M68 42 L78 54 L84 52" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Legs */}
      <path d="M56 70 L54 100" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
      <path d="M64 70 L66 100" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
      {/* Dumbbells */}
      <rect x="32" y="48" width="4" height="8" fill="#1E293B" rx="1" />
      <rect x="84" y="48" width="4" height="8" fill="#1E293B" rx="1" />
    </svg>
  );
};
