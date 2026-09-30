import { Membership } from '../models/Membership.js';
import { AuditLog } from '../models/AuditLog.js';

// Get current user's membership details
export const getMembershipStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find the latest active or most recent membership
    const membership = await Membership.findOne({ userId }).sort({ createdAt: -1 });

    const isActive = membership ? membership.isActive() : false;

    res.status(200).json({
      success: true,
      membership: membership
        ? {
            id: membership._id,
            planName: membership.planName,
            durationDays: membership.durationDays,
            amountInr: membership.amountInr,
            currency: membership.currency,
            paymentStatus: membership.paymentStatus,
            paymentMode: membership.paymentMode,
            transactionId: membership.transactionId,
            startDate: membership.startDate,
            endDate: membership.endDate,
            benefits: membership.benefits,
            isActive,
            daysRemaining:
              isActive && membership.endDate
                ? Math.max(0, Math.ceil((new Date(membership.endDate) - new Date()) / (1000 * 60 * 60 * 24)))
                : 0,
          }
        : null,
      isActive,
    });
  } catch (err) {
    next(err);
  }
};

// Create a new membership payment order (defaults to Standard Monthly: ₹1,499)
export const createPaymentOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { planName = 'FitPulse Standard Monthly', durationDays = 30, amountInr = 1499 } = req.body;

    // Check if there is already an active membership
    const existingActive = await Membership.findOne({
      userId,
      paymentStatus: 'successful',
      endDate: { $gt: new Date() },
    });

    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: `You already have an active membership valid until ${new Date(
          existingActive.endDate
        ).toLocaleDateString()}.`,
        membership: existingActive,
      });
    }

    // Cancel any previous pending orders to avoid duplicate dangling orders
    await Membership.updateMany(
      { userId, paymentStatus: 'pending' },
      { paymentStatus: 'cancelled' }
    );

    const order = await Membership.create({
      userId,
      planName,
      durationDays: Number(durationDays),
      amountInr: Number(amountInr),
      currency: 'INR',
      paymentStatus: 'pending',
      paymentMode: 'demo_simulated',
    });

    res.status(201).json({
      success: true,
      message: 'Membership order generated successfully.',
      order: {
        id: order._id,
        planName: order.planName,
        durationDays: order.durationDays,
        amountInr: order.amountInr,
        currency: order.currency,
        paymentStatus: order.paymentStatus,
        benefits: order.benefits,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Process simulated or verified payment
export const processPayment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { orderId, paymentOutcome = 'success' } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required to process payment.',
      });
    }

    const order = await Membership.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Membership order not found.',
      });
    }

    if (order.paymentStatus === 'successful') {
      return res.status(400).json({
        success: false,
        message: 'This membership order has already been paid and activated.',
      });
    }

    if (paymentOutcome === 'fail') {
      order.paymentStatus = 'failed';
      await order.save();

      return res.status(400).json({
        success: false,
        message: 'Simulated payment was declined or cancelled.',
        order,
      });
    }

    // Successful Demo Payment
    const now = new Date();
    const expiry = new Date(now.getTime() + order.durationDays * 24 * 60 * 60 * 1000);
    const simulatedTxnId = `DEMO-TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    order.paymentStatus = 'successful';
    order.paymentMode = 'demo_simulated';
    order.transactionId = simulatedTxnId;
    order.startDate = now;
    order.endDate = expiry;
    await order.save();

    await AuditLog.create({
      userId,
      userEmail: req.user.email,
      action: 'MEMBERSHIP_ACTIVATED',
      resource: 'Membership',
      details: {
        membershipId: order._id,
        planName: order.planName,
        amountInr: order.amountInr,
        transactionId: simulatedTxnId,
        paymentMode: 'demo_simulated',
        validUntil: expiry,
      },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Demo payment completed successfully! Your gym membership is now active.',
      membership: {
        id: order._id,
        planName: order.planName,
        durationDays: order.durationDays,
        amountInr: order.amountInr,
        currency: order.currency,
        paymentStatus: order.paymentStatus,
        transactionId: order.transactionId,
        startDate: order.startDate,
        endDate: order.endDate,
        isActive: true,
      },
    });
  } catch (err) {
    next(err);
  }
};
