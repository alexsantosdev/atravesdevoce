import { PagBankCheckout, PagBankOrder, PaymentMethod, PaymentStatus } from '@/types/database'

const PAGBANK_API_URL = 'https://api.pagseguro.com/'
const PAGBANK_TOKEN = process.env.NEXT_PUBLIC_PAGBANK_TOKEN

export async function createCheckout(data: {
  name: string
  cpf: string
  email: string
  phone: string
  age: number
  inviteId: string
}) {
  try {
    const response = await fetch(`${PAGBANK_API_URL}/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAGBANK_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reference_id: `invite-${data.cpf}`,
        customer: {
          name: data.name,
          email: data.email,
          tax_id: data.cpf,
          phones: [
            {
              country_code: '55',
              area_code: data.phone.substring(0, 2),
              number: data.phone.substring(2),
            },
          ],
        },
        items: [
          {
            reference_id: 'CONF_MULHERES',
            name: 'Conferência de Mulheres',
            quantity: 1,
            unit_amount: 5700,
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
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success/${data.cpf}`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success/${data.cpf}`,
        notification_urls: [`${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`],
        payment_notification_urls: [`${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`],
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create checkout')
    }

    const checkout: PagBankCheckout = await response.json()
    return checkout
  } catch (error) {
    console.error('Error creating checkout:', error)
    throw error
  }
}

export async function getCheckoutStatus(checkoutId: string): Promise<PagBankCheckout> {
  try {
    const response = await fetch(`${PAGBANK_API_URL}/checkouts/${checkoutId}`, {
      headers: {
        'Authorization': `Bearer ${PAGBANK_TOKEN}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get checkout status')
    }

    const checkout: PagBankCheckout = await response.json()
    return checkout
  } catch (error) {
    console.error('Error getting checkout status:', error)
    throw error
  }
}

export async function getOrderStatus(orderId: string): Promise<PagBankOrder> {
  try {
    const response = await fetch(`${PAGBANK_API_URL}/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${PAGBANK_TOKEN}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get order status')
    }

    const order: PagBankOrder = await response.json()
    return order
  } catch (error) {
    console.error('Error getting order status:', error)
    throw error
  }
}

export function getPaymentLink(checkout: PagBankCheckout): string {
  const payLink = checkout.links.find(link => link.rel === 'PAY')
  return payLink?.href || ''
}

export function mapPagBankStatusToTransactionStatus(status: string): PaymentStatus {
  switch (status) {
    case 'PAID':
      return 'PAID'
    case 'CANCELLED':
      return 'CANCELLED'
    case 'REFUNDED':
      return 'REFUNDED'
    case 'FAILED':
      return 'FAILED'
    default:
      return 'PENDING'
  }
}

export function mapPagBankPaymentMethod(method: string): PaymentMethod {
  switch (method) {
    case 'CREDIT_CARD':
      return 'CREDIT_CARD'
    case 'DEBIT_CARD':
      return 'DEBIT_CARD'
    case 'PIX':
      return 'PIX'
    default:
      return 'CREDIT_CARD'
  }
} 