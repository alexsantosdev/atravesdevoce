import { ref, onValue, get, query, orderByChild, limitToLast, push, set, update } from 'firebase/database';
import { database } from './firebase';
import { Invite, Transaction, Ticket, DashboardStats, InviteStatus, PaymentStatus, TicketStatus, Checkout } from '../types/database';

const INVITES_REF = 'invites';
const TRANSACTIONS_REF = 'transactions';
const TICKETS_REF = 'tickets';
const CHECKOUTS_REF = 'checkouts';

export function subscribeToInvites(callback: (invites: Invite[]) => void) {
  const invitesRef = ref(database, INVITES_REF);
  return onValue(invitesRef, (snapshot) => {
    const data = snapshot.val();
    const invites = data ? Object.values(data) : [];
    callback(invites as Invite[]);
  });
}

export function subscribeToCheckouts(callback: (checkouts: Checkout[]) => void) {
  const checkoutsRef = ref(database, CHECKOUTS_REF);
  return onValue(checkoutsRef, (snapshot) => {
    const data = snapshot.val();
    const checkouts = data ? Object.values(data) : [];
    callback(checkouts as Checkout[]);
  });
}

export function subscribeToTickets(callback: (tickets: Ticket[]) => void) {
  const ticketsRef = ref(database, TICKETS_REF);
  return onValue(ticketsRef, (snapshot) => {
    const data = snapshot.val();
    const tickets = data ? Object.values(data) : [];
    callback(tickets as Ticket[]);
  });
}

export async function createInvite(invite: Omit<Invite, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invite> {
  const cleanCpf = invite.cpf.replace(/\D/g, '');
  const inviteRef = ref(database, `${INVITES_REF}/${cleanCpf}`);
  const now = new Date().toISOString();
  
  const newInvite: Invite = {
    ...invite,
    id: cleanCpf,
    createdAt: now,
    updatedAt: now,
  };

  await set(inviteRef, newInvite);
  return newInvite;
}

export async function updateInvite(id: string, data: Partial<Invite>) {
  const inviteRef = ref(database, `${INVITES_REF}/${id}`);
  await update(inviteRef, data);
}

export async function getInvite(id: string): Promise<Invite | null> {
  const inviteRef = ref(database, `${INVITES_REF}/${id}`);
  const snapshot = await get(inviteRef);
  return snapshot.val();
}

export function subscribeToTransactions(callback: (transactions: Transaction[]) => void) {
  const transactionsRef = ref(database, TRANSACTIONS_REF);
  return onValue(transactionsRef, (snapshot) => {
    const transactions: Transaction[] = [];
    snapshot.forEach((childSnapshot) => {
      transactions.push({
        id: childSnapshot.key!,
        ...childSnapshot.val(),
      });
    });
    callback(transactions);
  });
}

export async function createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) {
  const transactionsRef = ref(database, TRANSACTIONS_REF);
  const newTransactionRef = push(transactionsRef);
  const now = new Date().toISOString();

  const newTransaction: Transaction = {
    id: newTransactionRef.key!,
    ...transaction,
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  };

  await set(newTransactionRef, newTransaction);
  return newTransaction;
}

export async function updateTransactionStatus(
  transactionId: string,
  status: PaymentStatus,
  paymentDetails?: Transaction['paymentDetails']
) {
  const transactionRef = ref(database, `transactions/${transactionId}`);
  const now = new Date().toISOString();
  const updates: Partial<Transaction> = {
    status,
    updatedAt: now,
  };

  if (status === 'PAID') {
    updates.paidAt = now;
  } else if (status === 'CANCELLED') {
    updates.cancelledAt = now;
  } else if (status === 'REFUNDED') {
    updates.refundedAt = now;
  }

  if (paymentDetails) {
    updates.paymentDetails = paymentDetails;
  }

  await update(transactionRef, updates);
}

export async function getLatestTransactions(limit: number = 5): Promise<Transaction[]> {
  const transactionsRef = ref(database, TRANSACTIONS_REF);
  const latestTransactionsQuery = query(
    transactionsRef,
    orderByChild('createdAt'),
    limitToLast(limit)
  );

  const snapshot = await get(latestTransactionsQuery);
  const transactions: Transaction[] = [];
  snapshot.forEach((childSnapshot) => {
    transactions.push({
      id: childSnapshot.key!,
      ...childSnapshot.val(),
    });
  });
  return transactions;
}

export async function updateInviteCheckoutId(cpf: string, checkoutId: string): Promise<void> {
  const cleanCpf = cpf.replace(/\D/g, '');
  const inviteRef = ref(database, `${INVITES_REF}/${cleanCpf}`);
  const snapshot = await get(inviteRef);
  
  if (snapshot.exists()) {
    await set(inviteRef, {
      ...snapshot.val(),
      checkoutId,
      updatedAt: new Date().toISOString(),
    });
  }
}

export async function updateCheckoutStatus(checkoutId: string, status: PaymentStatus, paymentMethod?: string): Promise<void> {
  const checkoutRef = ref(database, `${CHECKOUTS_REF}/${checkoutId}`);
  const snapshot = await get(checkoutRef);
  
  if (snapshot.exists()) {
    await set(checkoutRef, {
      ...snapshot.val(),
      status,
      paymentMethod,
      updatedAt: new Date().toISOString(),
    });
  }
}

export async function updateInviteByCheckoutId(checkoutId: string, status: InviteStatus): Promise<void> {
  const invitesRef = ref(database, INVITES_REF);
  const snapshot = await get(invitesRef);
  
  if (snapshot.exists()) {
    const invites = snapshot.val();
    const inviteKeys = Object.keys(invites);
    
    for (const key of inviteKeys) {
      const invite = invites[key];
      if (invite.checkoutId === checkoutId) {
        await update(ref(database, `${INVITES_REF}/${key}`), {
          status,
          updatedAt: new Date().toISOString(),
        });
        break; // Stop after updating the first matching invite
      }
    }
  }
}

export async function createCheckout(checkout: Checkout) {
  const checkoutRef = ref(database, `${CHECKOUTS_REF}/${checkout.id}`);
  await set(checkoutRef, checkout);
}

export async function getCheckout(checkoutId: string): Promise<Checkout | null> {
  const checkoutRef = ref(database, `${CHECKOUTS_REF}/${checkoutId}`);
  const snapshot = await get(checkoutRef);
  return snapshot.val();
}

export async function createTicket(ticket: Ticket) {
  const ticketRef = ref(database, `${TICKETS_REF}/${ticket.id}`);
  await set(ticketRef, ticket);
}

export async function updateTicket(id: string, data: Partial<Ticket>) {
  const ticketRef = ref(database, `${TICKETS_REF}/${id}`);
  await update(ticketRef, data);
}

export function calculateDashboardStats(
  invites: Invite[],
  checkouts: Checkout[],
  tickets: Ticket[]
): DashboardStats {
  const totalRevenue = checkouts
    .filter(checkout => checkout.status === 'PAID')
    .reduce((sum, checkout) => sum + checkout.amount, 0);

  const totalInvites = invites.length;
  const confirmedInvites = invites.filter(invite => invite.status === 'CONFIRMED').length;
  const pendingInvites = invites.filter(invite => invite.status === 'PENDING').length;
  
  const activeTickets = tickets.filter(ticket => ticket.status === 'ACTIVE').length;
  const usedTickets = tickets.filter(ticket => ticket.status === 'USED').length;

  return {
    totalRevenue,
    totalInvites,
    confirmedInvites,
    pendingInvites,
    activeTickets,
    usedTickets
  };
}

export async function getInviteByCpf(cpf: string): Promise<Invite | null> {
  const cleanCpf = cpf.replace(/\D/g, '');
  const inviteRef = ref(database, `${INVITES_REF}/${cleanCpf}`);
  const snapshot = await get(inviteRef);
  
  if (snapshot.exists()) {
    return snapshot.val();
  }
  
  return null;
} 