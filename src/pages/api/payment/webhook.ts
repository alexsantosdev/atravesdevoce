import { NextApiRequest, NextApiResponse } from 'next';
import { updateInvite, updateCheckoutStatus, createTicket } from '@/services/database';
import { mapPagBankStatusToTransactionStatus, mapPagBankPaymentMethod } from '@/services/payment';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { charges } = req.body;

    if (!charges || !Array.isArray(charges)) {
      return res.status(400).json({ message: 'Invalid webhook payload' });
    }

    for (const charge of charges) {
      const {
        id: chargeId,
        reference_id: inviteId,
        status,
        created_at: createdAt,
        paid_at: paidAt,
        amount,
        payment_response,
        payment_method,
      } = charge;

      // Extract invite ID from reference_id (format: invite-{cpf})
      const inviteIdMatch = inviteId.match(/^invite-(\d+)$/);
      if (!inviteIdMatch) {
        console.error('Invalid invite ID format:', inviteId);
        continue;
      }

      const cpf = inviteIdMatch[1];
      const transactionStatus = mapPagBankStatusToTransactionStatus(status);
      const paymentMethod = mapPagBankPaymentMethod(payment_method.type);

      // Update checkout status
      await updateCheckoutStatus(charge.checkout_id, transactionStatus, paymentMethod);

      // Update invite status if payment is successful
      if (status === 'PAID') {
        await updateInvite(cpf, {
          status: 'CONFIRMED',
          updatedAt: new Date().toISOString(),
        });

        // Create ticket if payment is successful
        await createTicket({
          id: uuidv4(),
          checkoutId: charge.checkout_id,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else if (status === 'CANCELLED' || status === 'REFUNDED') {
        await updateInvite(cpf, {
          status: 'CANCELLED',
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 