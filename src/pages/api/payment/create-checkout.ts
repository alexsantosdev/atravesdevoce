import { NextApiRequest, NextApiResponse } from 'next'
import { createCheckout as createCheckoutInDb, updateInviteCheckoutId } from '@/services/database'
import { PaymentStatus } from '@/types/database'

const PAGBANK_API_URL = 'https://sandbox.api.pagseguro.com'
const PAGBANK_TOKEN = process.env.PAGBANK_TOKEN

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { name, cpf, email, phone, age, inviteId } = req.body;

    // Format phone number and clean CPF
    const cleanPhone = phone.replace(/\D/g, '');
    const cleanCpf = cpf.replace(/\D/g, '');
    const area = cleanPhone.substring(0, 2);
    const number = cleanPhone.substring(2);

    console.log('NUMBER >>>>>>>>>>>>>>>>>', number)

    // Create payload for PagBank
    const payload = {
      reference_id: `invite-${cleanCpf}`,
      customer: {
        name,
        email,
        tax_id: cleanCpf,
        phone: {
            country: '55',
            area: String(area),
            number: String(number),
        },
      },
      items: [
        {
          reference_id: 'CONF_MULHERES',
          name: 'Conferência de Mulheres',
          quantity: 1,
          unit_amount: 5700, // R$ 57,00
        },
      ],
      payment_methods: [
        {
          type: 'CREDIT_CARD',
          brands: ['MASTERCARD', 'VISA'],
        },
        {
          type: 'DEBIT_CARD',
          brands: ['VISA'],
        },
        {
          type: 'PIX',
        },
      ],
      payment_methods_configs: [
        {
          type: 'CREDIT_CARD',
          config_options: [
            {
              option: 'INSTALLMENTS_LIMIT',
              value: '3',
            },
          ],
        },
      ],
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success/${cleanCpf}`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success/${cleanCpf}`,
      notification_urls: [`${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`],
    };

    console.log('Sending request to PagBank with payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${PAGBANK_API_URL}/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAGBANK_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout');
    }

    const checkout = await response.json();

    // Find payment URL from links
    const paymentLink = checkout.links?.find((link: any) => link.rel === 'PAY')?.href;
    if (!paymentLink) {
      throw new Error('Payment URL not found in checkout response');
    }

    // Save checkout details in database
    await createCheckoutInDb({
      id: checkout.id,
      inviteId: cleanCpf,
      amount: 5700,
      status: 'PENDING' as PaymentStatus,
      paymentLink,
      createdAt: new Date().toISOString(),
    });

    // Update invite with checkout ID
    await updateInviteCheckoutId(cleanCpf, checkout.id);

    // Return the response with the payment link
    return res.status(200).json({
      ...checkout,
      payment_url: paymentLink,
    });
  } catch (error) {
    console.error('Error creating checkout:', error);
    return res.status(500).json({ 
      error: 'Failed to create checkout',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
} 