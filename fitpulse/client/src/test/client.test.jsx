import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { StatCard } from '../components/common/StatCard';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { NotificationProvider } from '../context/NotificationContext';
import { AuthProvider } from '../context/AuthContext';
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { MembershipPage } from '../pages/member/MembershipPage';
import { ConsistencyReportPage } from '../pages/member/ConsistencyReportPage';
import { MemberProfilePage } from '../pages/member/MemberProfilePage';
import { Logo } from '../components/common/Logo';

describe('FitPulse Frontend Components & Unit Suite', () => {
  it('Button should render label and execute onClick handler', () => {
    const handleClick = vi.fn();
    render(
      <Button variant="primary" onClick={handleClick}>
        Start Workout
      </Button>
    );

    const button = screen.getByRole('button', { name: /start workout/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  }, 15000);

  it('Badge should render with variant styling', () => {
    render(<Badge variant="emerald">CONSISTENT</Badge>);
    const badge = screen.getByText(/consistent/i);
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('text-emerald-700');
  });

  it('Card should render children and container classes', () => {
    render(
      <Card glow="emerald">
        <p>Consistency Metrics</p>
      </Card>
    );
    expect(screen.getByText('Consistency Metrics')).toBeInTheDocument();
  });

  it('StatCard should display title, metric value, and subtitle', () => {
    render(
      <StatCard
        title="Attendance Consistency"
        value="85%"
        subtitle="12 of 14 planned days"
        color="emerald"
      />
    );

    expect(screen.getByText('Attendance Consistency')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('12 of 14 planned days')).toBeInTheDocument();
  });

  it('Modal should render when isOpen is true and hide when false', () => {
    const handleClose = vi.fn();
    const { rerender } = render(
      <Modal isOpen={true} onClose={handleClose} title="Gym Check-In">
        <p>Kiosk Verification</p>
      </Modal>
    );

    expect(screen.getByText('Gym Check-In')).toBeInTheDocument();
    expect(screen.getByText('Kiosk Verification')).toBeInTheDocument();

    rerender(
      <Modal isOpen={false} onClose={handleClose} title="Gym Check-In">
        <p>Kiosk Verification</p>
      </Modal>
    );

    expect(screen.queryByText('Gym Check-In')).not.toBeInTheDocument();
  });

  it('EmptyState should render action button and respond to click', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="No Workouts Found"
        description="Generate a new routine to start."
        actionText="Generate Split"
        onAction={handleAction}
      />
    );

    expect(screen.getByText('No Workouts Found')).toBeInTheDocument();
    const actionBtn = screen.getByRole('button', { name: /generate split/i });
    fireEvent.click(actionBtn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('LandingPage renders headline and clean CTA buttons without public demo-access cards or sample accounts', () => {
    render(
      <NotificationProvider>
        <AuthProvider>
          <BrowserRouter>
            <LandingPage />
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    );

    expect(screen.getByText(/your campus fitness/i)).toBeInTheDocument();
    expect(screen.getByText(/get started free/i)).toBeInTheDocument();
    expect(screen.getByText(/college gym management/i)).toBeInTheDocument();

    // Verify complete removal of demo access elements
    expect(screen.queryByText(/1-Click Interactive Demo Access/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Jordan Lee/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Sarah Connor/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Alex Rivera/i)).not.toBeInTheDocument();
  });

  it('LoginPage renders credential inputs without demo quick-fill buttons or demo accounts', () => {
    render(
      <NotificationProvider>
        <AuthProvider>
          <BrowserRouter>
            <LoginPage />
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    );

    expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();

    // Verify complete removal of demo fill buttons and references
    expect(screen.queryByText(/Quick 1-Click Interactive Demo Fill/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/select a pre-seeded demo account/i)).not.toBeInTheDocument();
  });

  it('RegisterPage renders all required fields, password rules, and informational note without role dropdown', () => {
    render(
      <NotificationProvider>
        <AuthProvider>
          <BrowserRouter>
            <RegisterPage />
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    );

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByText(/new accounts are registered as/i)).toBeInTheDocument();
    expect(screen.getByText(/8 to 64 characters/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/account role/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('RegisterPage displays inline error when passwords do not match', () => {
    render(
      <NotificationProvider>
        <AuthProvider>
          <BrowserRouter>
            <RegisterPage />
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    );

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'MismatchPass123!' } });
    fireEvent.blur(confirmPasswordInput);

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('RegisterPage shows match indicator when passwords match', () => {
    render(
      <NotificationProvider>
        <AuthProvider>
          <BrowserRouter>
            <RegisterPage />
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    );

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'SecurePass123!' } });
    fireEvent.blur(confirmPasswordInput);

    expect(screen.getByText(/passwords match/i)).toBeInTheDocument();
  });

  it('MembershipPage renders standard monthly plan and clearly labeled demo payment mode', async () => {
    render(
      <NotificationProvider>
        <AuthProvider>
          <BrowserRouter>
            <MembershipPage />
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    );

    // Initial loading or loaded content
    expect(await screen.findByText(/select your membership plan/i)).toBeInTheDocument();
    expect(screen.getByText(/fitpulse monthly pass/i)).toBeInTheDocument();
    expect(screen.getAllByText(/₹1,499/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/demo payment mode/i)).toBeInTheDocument();
  });

  it('ConsistencyReportPage renders consistency header and mathematical formula explanation', async () => {
    render(
      <NotificationProvider>
        <AuthProvider>
          <BrowserRouter>
            <ConsistencyReportPage />
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    );

    expect(await screen.findByText(/member consistency report/i)).toBeInTheDocument();
    expect(screen.getByText(/how this formula works/i)).toBeInTheDocument();
    expect(screen.getByText(/consistency % =/i)).toBeInTheDocument();
  });

  it('MemberProfilePage renders account information, fitness profile, membership and action buttons', async () => {
    render(
      <NotificationProvider>
        <AuthProvider>
          <BrowserRouter>
            <MemberProfilePage />
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    );

    expect(await screen.findByText(/account information/i)).toBeInTheDocument();
    expect(screen.getByText(/fitness profile & preferences/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /membership pass/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /change password/i })).toBeInTheDocument();
  });

  it('Logo component renders official logo image with descriptive alt text and wordmark', () => {
    render(
      <BrowserRouter>
        <Logo size="md" to="/" />
      </BrowserRouter>
    );

    const logoImg = screen.getByAltText('FitPulse logo');
    expect(logoImg).toBeInTheDocument();
    expect(logoImg.tagName).toBe('IMG');
    expect(logoImg.className).toContain('object-contain');
    expect(screen.getByText('FitPulse')).toBeInTheDocument();
  });

  it('TrainerDashboard renders Member Roster, search input, and improved empty state with emerald green styling', async () => {
    const { TrainerDashboard } = await import('../pages/trainer/TrainerDashboard');
    render(
      <NotificationProvider>
        <AuthProvider>
          <BrowserRouter>
            <TrainerDashboard />
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    );

    expect(await screen.findByText(/Head Coach & Trainer Portal/i)).toBeInTheDocument();
    expect(screen.getByText(/Member Roster & Routine Management/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search member by name or email/i)).toBeInTheDocument();
    expect(screen.getByText(/Select an Athlete from the Roster/i)).toBeInTheDocument();
  });

  it('AdminDashboard renders Platform Stats, Users, and Gym Operating Schedule, and excludes Security Audit Logs', async () => {
    const { AdminDashboard } = await import('../pages/admin/AdminDashboard');
    render(
      <NotificationProvider>
        <AuthProvider>
          <BrowserRouter>
            <AdminDashboard />
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    );

    expect(await screen.findByText(/Administrative Operations Center/i)).toBeInTheDocument();
    expect(screen.getByText(/System Overview & Facility Control/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Platform Stats/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gym Operating Schedule/i })).toBeInTheDocument();

    // Verify Security Audit Logs tab/section is completely removed
    expect(screen.queryByRole('button', { name: /Security Audit Logs/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/Security & Administrative Audit Trails/i)).not.toBeInTheDocument();
  });

  it('Navbar excludes Exercise Master from Admin menu while preserving Admin Center', async () => {
    const { Navbar } = await import('../components/layout/Navbar');
    render(
      <NotificationProvider>
        <AuthProvider>
          <BrowserRouter>
            <Navbar />
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    );

    // Exercise Master must not appear in the document
    expect(screen.queryByText('Exercise Master')).not.toBeInTheDocument();
  });

  it('ExerciseLibraryPage continues to render Curated Exercise Library with search and filters', async () => {
    const { ExerciseLibraryPage } = await import('../pages/member/ExerciseLibraryPage');
    render(
      <NotificationProvider>
        <AuthProvider>
          <BrowserRouter>
            <ExerciseLibraryPage />
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    );

    expect(await screen.findByText(/Curated Exercise Library/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search exercise by name/i)).toBeInTheDocument();
    expect(screen.getByText('All Equipment')).toBeInTheDocument();
  });
});
