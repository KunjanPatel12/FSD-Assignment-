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
import { RegisterPage } from '../pages/auth/RegisterPage';

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
  });

  it('Badge should render with variant styling', () => {
    render(<Badge variant="emerald">CONSISTENT</Badge>);
    const badge = screen.getByText(/consistent/i);
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('text-emerald-400');
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

  it('LandingPage should render headline and navigation links', () => {
    render(
      <NotificationProvider>
        <AuthProvider>
          <BrowserRouter>
            <LandingPage />
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    );

    expect(screen.getByText(/build real fitness consistency/i)).toBeInTheDocument();
    expect(screen.getByText(/deterministic fitness engine/i)).toBeInTheDocument();
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
});
