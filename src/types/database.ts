export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX'

export type PaymentStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED' | 'FAILED'

export type InviteStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'

export type TicketStatus = 'ACTIVE' | 'USED' | 'CANCELLED'

export interface Invite {
  id: string
  name: string
  cpf: string
  email: string
  phone: string
  age: number
  birthDate: string
  gender: 'MASCULINO' | 'FEMININO'
  church: 'FONTE' | 'OUTROS'
  churchOther?: string
  shirtSize: 'P' | 'M' | 'G' | 'GG' | 'G1' | 'G2'
  emergencyContact: string
  cellGroup?: string | null
  hasParticipatedPeniel: boolean
  transportation: 'IGREJA' | 'PROPRIO'
  status: InviteStatus
  checkoutId?: string
  createdAt?: string
  updatedAt?: string
}

export interface Transaction {
  id: string
  inviteId: string
  checkoutId: string
  orderId: string
  chargeId: string
  amount: number
  paymentMethod: PaymentMethod
  status: PaymentStatus
  createdAt: string
  updatedAt: string
  paidAt?: string
  cancelledAt?: string
  refundedAt?: string
  failedAt?: string
  paymentDetails?: {
    code: string
    message: string
    endToEndId?: string
    holderName?: string
    holderTaxId?: string
  }
}

export interface Ticket {
  id: string
  checkoutId: string
  status: TicketStatus
  createdAt?: string
  updatedAt?: string
  usedAt?: string
  cancelledAt?: string
}

export interface DashboardStats {
  totalRevenue: number
  totalInvites: number
  confirmedInvites: number
  pendingInvites: number
  activeTickets: number
  usedTickets: number
}

// PagBank Types
export interface PagBankCheckout {
  id: string
  reference_id: string
  status: string
  customer: {
    name: string
    email: string
    tax_id: string
    phone: {
      country: string
      area: string
      number: string
    }
  }
  items: Array<{
    reference_id: string
    name: string
    quantity: number
    unit_amount: number
  }>
  payment_methods: Array<{
    type: PaymentMethod
    brands?: string[]
  }>
  orders: Array<{
    id: string
    links: Array<{
      rel: string
      href: string
      method: string
    }>
  }>
  links: Array<{
    rel: string
    href: string
    method: string
  }>
}

export interface PagBankOrder {
  id: string
  reference_id: string
  created_at: string
  customer: {
    name: string
    email: string
    tax_id: string
    phones: Array<{
      type: string
      country: string
      area: string
      number: string
    }>
  }
  items: Array<{
    reference_id: string
    name: string
    quantity: number
    unit_amount: number
  }>
  charges: Array<{
    id: string
    reference_id: string
    status: PaymentStatus
    created_at: string
    paid_at?: string
    amount: {
      value: number
      currency: string
      summary: {
        total: number
        paid: number
        refunded: number
      }
    }
    payment_response: {
      code: string
      message: string
    }
    payment_method: {
      type: PaymentMethod
      pix?: {
        notification_id: string
        end_to_end_id: string
        holder: {
          name: string
          tax_id: string
        }
      }
    }
    links: Array<{
      rel: string
      href: string
      media: string
      type: string
    }>
  }>
  links: Array<{
    rel: string
    href: string
    media: string
    type: string
  }>
}

export interface Checkout {
  id: string
  inviteId: string
  amount: number
  status: PaymentStatus
  paymentLink: string
  paymentMethod?: PaymentMethod
  orderId?: string
  createdAt?: string
  updatedAt?: string
} 