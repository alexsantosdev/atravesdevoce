import { useEffect, useState } from 'react'
import Head from 'next/head'

import ProtectedRoute from '@/components/ProtectedRoute'

import { useAuth } from '@/contexts/AuthContext'

import { subscribeToInvites, subscribeToCheckouts, subscribeToTickets, calculateDashboardStats } from '@/services/database'

import { Invite, Checkout, Ticket, DashboardStats, PaymentStatus, InviteStatus } from '@/types/database'

import styles from '@/styles/Dashboard.module.scss'

export default function Dashboard() {
  const { logout } = useAuth()

  const [invites, setInvites] = useState<Invite[]>([])
  const [checkouts, setCheckouts] = useState<Checkout[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalInvites: 0,
    confirmedInvites: 0,
    pendingInvites: 0,
    activeTickets: 0,
    usedTickets: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribeInvites = subscribeToInvites(setInvites)
    const unsubscribeCheckouts = subscribeToCheckouts(setCheckouts)
    const unsubscribeTickets = subscribeToTickets(setTickets)

    // Set loading to false after all subscriptions are set up
    setLoading(false)

    return () => {
      unsubscribeInvites()
      unsubscribeCheckouts()
      unsubscribeTickets()
    }
  }, [])

  useEffect(() => {
    setStats(calculateDashboardStats(invites, checkouts, tickets))
  }, [invites, checkouts, tickets])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getPaymentMethodLabel = (method?: string) => {
    switch (method) {
      case 'CREDIT_CARD':
        return 'Cartão de Crédito'
      case 'DEBIT_CARD':
        return 'Cartão de Débito'
      case 'PIX':
        return 'PIX'
      default:
        return '-'
    }
  }

  const getPaymentStatus = (status?: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return 'Pago'
      case 'CANCELLED':
        return 'Cancelado'
      case 'PENDING':
        return 'Pendente'
      case 'FAILED':
        return 'Falhou'
      case 'REFUNDED':
        return 'Reembolsado'
      default:
        return '-'
    }
  }

  const getInviteStatus = (status?: InviteStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmado'
      case 'CANCELLED':
        return 'Cancelado'
      case 'PENDING':
        return 'Pendente'
      default:
        return '-'
    }
  }

  return (
    <>
      <Head>
        <title>Dashboard | Através de você</title>
      </Head>
      <ProtectedRoute>
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.header}>
              <h1 className={styles.title}>Controle</h1>
              <button onClick={logout} className={styles.button}>
                Sair
              </button>
            </div>

            {loading ? (
              <div className={styles.loading}>
                <div className={styles.loadingSpinner} />
              </div>
            ) : (
              <>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <div className={styles.statTitle}>Receita Total</div>
                    <div className={styles.statValue}>
                      {formatCurrency(stats.totalRevenue)}
                    </div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statTitle}>Total de participantes</div>
                    <div className={styles.statValue}>{stats.totalInvites}</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statTitle}>Participantes confirmados</div>
                    <div className={styles.statValue}>{stats.confirmedInvites}</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statTitle}>Participantes pendentes</div>
                    <div className={styles.statValue}>{stats.pendingInvites}</div>
                  </div>
                </div>

                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Pagamentos</h2>
                  <div className={styles.tableContainer}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Participante</th>
                          <th>Valor</th>
                          <th>Status</th>
                          <th>Método</th>
                          <th>Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {checkouts.map((checkout) => {
                          const invite = invites.find((i) => i.id === checkout.inviteId)
                          return (
                            <tr key={checkout.id}>
                              <td>{checkout.id}</td>
                              <td>{invite?.name || '-'}</td>
                              <td>{formatCurrency(checkout.amount)}</td>
                              <td>
                                <span className={`${styles.status} ${styles[`status${checkout.status}`]}`}>
                                  {getPaymentStatus(checkout.status)}
                                </span>
                              </td>
                              <td>{getPaymentMethodLabel(checkout.paymentMethod)}</td>
                              <td>{formatDate(checkout.createdAt)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Lista de participantes</h2>
                  <div className={styles.tableContainer}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>CPF</th>
                          <th>Email</th>
                          <th>Telefone</th>
                          <th>Status</th>
                          <th>Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invites.map((invite) => (
                          <tr key={invite.id}>
                            <td>{invite.name}</td>
                            <td>{invite.cpf}</td>
                            <td>{invite.email}</td>
                            <td>{invite.phone}</td>
                            <td>
                              <span className={`${styles.status} ${styles[`status${invite.status}`]}`}>
                                {getInviteStatus(invite.status)}
                              </span>
                            </td>
                            <td>{formatDate(invite.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </ProtectedRoute>
    </>
  )
} 