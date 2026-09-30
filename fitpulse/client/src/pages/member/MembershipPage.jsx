import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Check,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { membershipApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import confetti from 'canvas-confetti';

export const MembershipPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotification();

  const [currentMembership, setCurrentMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentState, setPaymentState] = useState('idle'); // idle | pending | processing | successful | failed

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await membershipApi.getStatus();
      setCurrentMembership(res.membership);
    } catch (err) {
      console.error('Error fetching membership status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Step 1: Create Order
  const handleInitiateOrder = async () => {
    setProcessing(true);
    try {
      const res = await membershipApi.createOrder({
        planName: 'FitPulse Standard Monthly',
        durationDays: 30,
        amountInr: 1499,
      });
      setOrder(res.order);
      setPaymentState('pending');
    } catch (err) {
      notifyError(err.message || 'Could not generate membership order.');
    } finally {
      setProcessing(false);
    }
  };

  // Step 2: Process Simulated Demo Payment
  const handleSimulatePayment = async (outcome = 'success') => {
    if (!order) return;
    setProcessing(true);
    setPaymentState('processing');

    try {
      // Simulate realistic network delay (750ms)
      await new Promise((resolve) => setTimeout(resolve, 750));

      const res = await membershipApi.processPayment({
        orderId: order.id,
        paymentOutcome: outcome,
      });

      if (outcome === 'success') {
        setPaymentState('successful');
        setCurrentMembership(res.membership);

        confetti({
          particleCount: 70,
          spread: 50,
          origin: { y: 0.6 },
        });

        success('Membership activated successfully! Welcome to FitPulse.');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      setPaymentState('failed');
      notifyError(err.message || 'Payment simulation failed.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Checking gym membership status..." fullScreen />;
  }

  // If user already has an active membership
  if (currentMembership && currentMembership.isActive) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6 bg-white">
        <div className="text-center space-y-2">
          <Badge variant="emerald" size="lg" className="px-3 py-1 font-semibold">
            ACTIVE MEMBERSHIP
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Your Gym Membership is Active</h1>
          <p className="text-sm text-slate-600">
            You currently have full access to workouts, gym floor check-ins, and consistency analytics.
          </p>
        </div>

        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">{currentMembership.planName}</h3>
              <p className="text-sm text-emerald-700 font-mono mt-0.5 font-medium">
                ₹{currentMembership.amountInr?.toLocaleString('en-IN')} (Paid via Demo Mode)
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Valid Until</span>
              <span className="text-sm font-bold text-slate-900 font-mono">
                {new Date(currentMembership.endDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 block mb-0.5">Days Remaining:</span>
              <span className="text-xl font-bold text-emerald-700 font-mono">
                {currentMembership.daysRemaining || 0} Days
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Transaction ID:</span>
              <span className="text-xs font-mono text-slate-700 break-all font-medium">
                {currentMembership.transactionId || 'DEMO-TXN'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Plan Benefits Included:</h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {currentMembership.benefits?.map((b, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="primary"
              size="md"
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Go to Member Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6 bg-white">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <CreditCard className="w-3.5 h-3.5" /> Step 2: Activate Gym Membership
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Select Your Membership Plan
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Complete your student-friendly membership step to unlock personalized workout routines, physical gym
          check-ins, and monthly consistency reports.
        </p>
      </div>

      {/* Demo Mode Notice */}
      <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-900">DEMO PAYMENT MODE (College Project Simulation):</span>
          <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
            This checkout simulates a real payment gateway response without charging real money. Clicking Pay activates
            your 30-day membership in MongoDB with a mock transaction ID.
          </p>
        </div>
      </div>

      {/* Single Configurable Standard Plan Card */}
      <Card className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-700">
              Standard Membership
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">FitPulse Monthly Pass</h3>
            <p className="text-xs text-slate-500 mt-1">Duration: 30 Days (Renewable)</p>
          </div>

          <div className="text-left sm:text-right">
            <div className="flex items-baseline gap-1 sm:justify-end">
              <span className="text-3xl font-bold text-slate-900 font-mono">₹1,499</span>
              <span className="text-xs text-slate-500 font-normal">/ month</span>
            </div>
            <span className="text-[11px] text-slate-400">Includes all gym floor access</span>
          </div>
        </div>

        {/* Benefits Checklist */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Included In This Plan:</h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Full Physical Gym Access</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Personalized Workout Split</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Digital Check-In & Check-Out</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Monthly Consistency Report</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Supplement Budget Guide</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Exercise Form Library</span>
            </li>
          </ul>
        </div>

        {/* Payment Summary & Action */}
        <div className="pt-4 border-t border-gray-100 space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 font-medium">Total Payable Amount:</span>
            <span className="text-base font-bold text-slate-900 font-mono">₹1,499 INR</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 font-medium">Payment Status:</span>
            <Badge
              variant={
                paymentState === 'successful'
                  ? 'emerald'
                  : paymentState === 'failed'
                  ? 'rose'
                  : paymentState === 'processing'
                  ? 'cyan'
                  : 'amber'
              }
            >
              {paymentState === 'successful'
                ? 'Successful'
                : paymentState === 'processing'
                ? 'Processing...'
                : paymentState === 'failed'
                ? 'Payment Declined'
                : order
                ? 'Order Ready'
                : 'Pending Selection'}
            </Badge>
          </div>

          {!order ? (
            <Button
              onClick={handleInitiateOrder}
              isLoading={processing}
              variant="primary"
              size="lg"
              className="w-full"
              rightIcon={<CreditCard className="w-4 h-4" />}
            >
              Proceed to Demo Payment (₹1,499)
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => handleSimulatePayment('success')}
                  isLoading={processing}
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Pay ₹1,499 (Simulate Success)
                </Button>
                <Button
                  onClick={() => handleSimulatePayment('fail')}
                  disabled={processing}
                  variant="outline"
                  size="lg"
                  className="text-rose-600 hover:bg-rose-50 border-rose-200"
                >
                  Simulate Failure
                </Button>
              </div>
              <p className="text-[11px] text-center text-slate-500">
                Clicking "Simulate Success" records the transaction in MongoDB and grants active status.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
