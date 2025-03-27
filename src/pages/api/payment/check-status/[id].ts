import { NextApiRequest, NextApiResponse } from 'next';
import { getCheckout, updateInvite, updateCheckoutStatus, updateInviteByCheckoutId } from '@/services/database';
import { mapPagBankStatusToTransactionStatus, mapPagBankPaymentMethod } from '@/services/payment';

const PAGBANK_API_URL = 'https://sandbox.api.pagseguro.com';
const PAGBANK_TOKEN = process.env.PAGBANK_TOKEN;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Checkout ID is required' });
    }

    // Get checkout details from our database
    const checkout = await getCheckout(id);
    if (!checkout) {
      return res.status(404).json({ error: 'Checkout not found' });
    }

    // Get checkout status from PagBank
    const response = await fetch(`${PAGBANK_API_URL}/checkouts/${id}`, {
      headers: {
        'Authorization': `Bearer ${PAGBANK_TOKEN}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`PagBank API Error: ${response.status} ${response.statusText}`);
    }

    const checkoutData = await response.json();

    // If there's an order, get its details
    let orderData = null;
    if (checkoutData.orders?.[0]?.id) {
      const orderResponse = await fetch(`${PAGBANK_API_URL}/orders/${checkoutData.orders[0].id}`, {
        headers: {
          'Authorization': `Bearer ${PAGBANK_TOKEN}`,
          'Accept': 'application/json',
        },
      });

      if (orderResponse.ok) {
        orderData = await orderResponse.json();
        const paymentStatus = mapPagBankStatusToTransactionStatus(orderData.charges?.[0]?.status);
        const paymentMethod = orderData.charges?.[0]?.payment_method?.type 
          ? mapPagBankPaymentMethod(orderData.charges[0].payment_method.type)
          : undefined;
        
        // Update checkout status in our database
        await updateCheckoutStatus(id, paymentStatus, paymentMethod);

        if (orderData.charges?.[0]?.status === 'PAID') {
          await updateInviteByCheckoutId(id, 'CONFIRMED');
        } else if (['CANCELLED', 'DECLINED', 'FAILED'].includes(orderData.charges?.[0]?.status)) {
          await updateInviteByCheckoutId(id, 'CANCELLED');
        }
        
        // Update invite status based on order status
        if (orderData.status === 'PAID') {
          await updateInvite(checkout.inviteId, {
            status: 'CONFIRMED',
            updatedAt: new Date().toISOString(),
          });
        } else if (['CANCELLED', 'DECLINED', 'FAILED'].includes(orderData.status)) {
          await updateInvite(checkout.inviteId, {
            status: 'CANCELLED',
            updatedAt: new Date().toISOString(),
          });
        }
      }
    } else {
      // If no order yet, update checkout status from checkout data
      const paymentStatus = mapPagBankStatusToTransactionStatus(checkoutData.status);
      await updateCheckoutStatus(id, paymentStatus);
    }

    return res.status(200).json({
      checkout: checkoutData,
      order: orderData,
      status: orderData?.status || checkoutData.status,
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return res.status(500).json({
      error: 'Failed to check payment status',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
} 