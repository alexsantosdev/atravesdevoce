import { NextApiRequest, NextApiResponse } from 'next';

const PAGBANK_API_URL = 'https://api.pagseguro.com/';
const PAGBANK_TOKEN = process.env.PAGBANK_TOKEN;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { checkout_id } = req.query;

    if (!checkout_id || typeof checkout_id !== 'string') {
      return res.status(400).json({ error: 'Checkout ID is required' });
    }

    const response = await fetch(`${PAGBANK_API_URL}/checkouts/${checkout_id}`, {
      headers: {
        'Authorization': `Bearer ${PAGBANK_TOKEN}`,
        'Accept': '*/*',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get checkout status');
    }

    const data = await response.json();
    res.status(200).json({ status: data.status });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to get checkout status' });
  }
} 