import { NextApiRequest, NextApiResponse } from 'next'
import { createCheckout as createCheckoutInDb, updateInviteCheckoutId } from '@/services/database'
import { PaymentStatus } from '@/types/database'

const PAGBANK_API_URL = 'https://api.pagseguro.com'
const PAGBANK_TOKEN = process.env.PAGBANK_TOKEN

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { 
      name, 
      cpf, 
      email, 
      phone, 
      age, 
      birthDate, 
      gender,
      church, 
      churchOther, 
      shirtSize, 
      emergencyContact, 
      cellGroup,
      hasParticipatedPeniel,
      transportation,
      inviteId 
    } = req.body;

    // Validate required fields
    if (!name || !cpf || !email || !phone || !age || !birthDate || !gender || !church || !shirtSize || !emergencyContact || !transportation) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'All fields are required'
      });
    }

    // Validate church other field
    if (church === 'OUTROS' && !churchOther) {
      return res.status(400).json({ 
        error: 'Missing church other field',
        details: 'Church other field is required when church is OUTROS'
      });
    }

    // Validate cell group field if provided
    if (cellGroup !== undefined && cellGroup !== null && cellGroup.trim() === '') {
      return res.status(400).json({ 
        error: 'Invalid cell group',
        details: 'Cell group cannot be empty if provided'
      });
    }

    // Format phone number and clean CPF
    const cleanPhone = phone.replace(/\D/g, '');
    const cleanCpf = cpf.replace(/\D/g, '');
    
    if (cleanPhone.length < 10) {
      return res.status(400).json({ 
        error: 'Invalid phone number',
        details: 'Phone number must have at least 10 digits'
      });
    }

    const area = cleanPhone.substring(0, 2);
    const number = cleanPhone.substring(2);

    console.log('Creating checkout for:', { 
      name, 
      email, 
      cleanCpf, 
      area, 
      number, 
      cellGroup, 
      hasParticipatedPeniel 
    });

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
          reference_id: 'ATRAVES_2025',
          name: 'Encontro submergidos',
          quantity: 1,
          unit_amount: 33000, // R$ 330,00
        },
      ],
      payment_methods: [
        {
          type: 'CREDIT_CARD',
          brands: ['MASTERCARD', 'VISA'],
        },
        {
          type: 'DEBIT_CARD',
          brands: ['MASTERCARD', 'VISA'],
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

    if (!PAGBANK_TOKEN) {
      throw new Error('PAGBANK_TOKEN environment variable is not set');
    }

    const response = await fetch(`${PAGBANK_API_URL}/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAGBANK_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PagBank API Error:', response.status, errorText);
      throw new Error(`PagBank API Error: ${response.status} - ${errorText}`);
    }

    const checkout = await response.json();
    console.log('PagBank response:', JSON.stringify(checkout, null, 2));

    // Find payment URL from links
    const paymentLink = checkout.links?.find((link: any) => link.rel === 'PAY')?.href;
    if (!paymentLink) {
      console.error('Payment URL not found in checkout response:', checkout);
      throw new Error('Payment URL not found in checkout response');
    }

    // Save checkout details in database
    await createCheckoutInDb({
      id: checkout.id,
      inviteId: cleanCpf,
      amount: 33000, // Keep consistent with unit_amount
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