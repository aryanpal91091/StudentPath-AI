import { Response } from 'express';
import prisma from '../utils/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const uploadScreenshot = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!req.file) return res.status(400).json({ error: 'Screenshot is required' });

    const ref = `sp-up-${Date.now()}`;
    const payment = await prisma.payment.create({
      data: {
        userId: req.user.id,
        amount: 499,
        status: 'PENDING',
        reference: ref,
        paymentMethod: 'UPI',
        purpose: 'SUBSCRIPTION',
        screenshotUrl: `/uploads/${req.file.filename}`
      }
    });

    res.status(200).json({ message: 'Screenshot uploaded successfully', payment });
  } catch (error: any) {
    console.error('Screenshot upload error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const checkoutSession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { purpose, targetId, amount } = req.body;

    if (!purpose || !amount) {
      return res.status(400).json({ error: 'Purpose and amount are required' });
    }

    if (!['SUBSCRIPTION', 'COUNSELLING'].includes(purpose)) {
      return res.status(400).json({ error: 'Invalid purpose. Must be SUBSCRIPTION or COUNSELLING' });
    }

    // Create a pending payment log
    const ref = `sp-tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const payment = await prisma.payment.create({
      data: {
        userId: req.user.id,
        amount: parseFloat(amount),
        status: 'PENDING',
        reference: ref,
        paymentMethod: 'UPI',
        purpose
      }
    });

    // Provide a mock redirect checkout URL
    res.status(200).json({
      message: 'Checkout session created',
      checkoutUrl: `/payment/simulate?ref=${ref}&purpose=${purpose}&targetId=${targetId || ''}&amount=${amount}`,
      reference: ref
    });

  } catch (error: any) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const completeSimulatedPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reference, status, targetId } = req.body;

    if (!reference || !status) {
      return res.status(400).json({ error: 'Reference and status are required' });
    }

    const payment = await prisma.payment.findFirst({
      where: { reference }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    if (payment.status !== 'PENDING') {
      return res.status(400).json({ error: 'This payment has already been processed' });
    }

    // Update payment record in transaction
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status }
      });

      if (status === 'SUCCESS') {
        if (payment.purpose === 'SUBSCRIPTION') {
          // Find student profile
          const student = await tx.studentProfile.findUnique({
            where: { userId: payment.userId }
          });
          if (student) {
            // Update profile
            await tx.studentProfile.update({
              where: { id: student.id },
              data: { premiumStatus: true }
            });
            // Create subscription
            const sub = await tx.subscription.create({
              data: {
                studentProfileId: student.id,
                plan: 'PREMIUM',
                status: 'ACTIVE',
                startDate: new Date(),
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
              }
            });
            // Link payment to subscription
            await tx.payment.update({
              where: { id: payment.id },
              data: { subscriptionId: sub.id }
            });
          }
        } else if (payment.purpose === 'COUNSELLING' && targetId) {
          // Update session status to CONFIRMED
          await tx.counsellingSession.update({
            where: { id: parseInt(targetId) },
            data: {
              paymentStatus: 'PAID',
              status: 'CONFIRMED',
              paymentId: reference
            }
          });
        }
      }
    });

    res.status(200).json({
      message: `Payment status updated to ${status}`,
      status
    });

  } catch (error: any) {
    console.error('Complete payment error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
