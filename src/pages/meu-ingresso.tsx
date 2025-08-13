import { useState } from 'react'
import Head from 'next/head'
import { toast, Toaster } from 'sonner'
import Router from 'next/router'

import { getInviteByCpf, getCheckout } from '@/services/database'

import { Invite, Checkout } from '@/types/database'

import styles from '@/styles/MeuIngresso.module.scss'
import { Ticket } from '@/components/Ticket'

export default function MeuIngresso() {
  const [cpf, setCpf] = useState('')
  const [loading, setLoading] = useState(false)
  const [inviteInfo, setInviteInfo] = useState<Invite | null>(null)
  const [checkoutInfo, setCheckoutInfo] = useState<Checkout | null>(null)
  const [showTicket, setShowTicket] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PAID' | 'CANCELLED' | 'FAILED' | null>(null)
  const [checkingPayment, setCheckingPayment] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if(cpf?.trim() === '') {
      return
    }
    
    try {
      const formattedCpf = cpf.replace(/\D/g, '')
      console.log('Searching for CPF:', formattedCpf)
      
      const invite = await getInviteByCpf(formattedCpf)
      console.log('Invite found:', invite)
      
      if (invite) {
        setInviteInfo(invite)
        setShowTicket(true)
        
        // Check payment status if checkoutId exists
        if (invite.checkoutId) {
          console.log('CheckoutId found:', invite.checkoutId)
          // Get checkout info to access paymentLink
          const checkout = await getCheckout(invite.checkoutId)
          console.log('Checkout info:', checkout)
          setCheckoutInfo(checkout)
          
          await checkPaymentStatus(invite.checkoutId)
        } else {
          console.log('No checkoutId, setting status to PENDING')
          setPaymentStatus('PENDING')
        }
        
        toast.success('Ingresso encontrado!')
      } else {
        toast.error('Ingresso não encontrado')
        setInviteInfo(null)
        setCheckoutInfo(null)
        setShowTicket(false)
        setPaymentStatus(null)
      }
    } catch (error) {
      console.error('Error in handleSearch:', error)
      toast.error('Erro ao buscar ingresso')
      setInviteInfo(null)
      setCheckoutInfo(null)
      setShowTicket(false)
      setPaymentStatus(null)
    } finally {
      setLoading(false)
    }
  }

  const checkPaymentStatus = async (checkoutId: string) => {
    console.log('checkPaymentStatus called with checkoutId:', checkoutId)
    setCheckingPayment(true)
    try {
      const timestamp = Date.now()
      const response = await fetch(`/api/payment/check-status/${checkoutId}?t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      })

      if (!response.ok) {
        throw new Error('Erro ao verificar status do pagamento')
      }

      const data = await response.json()
      console.log('Payment status response:', data)
      
      // Use the mappedStatus from the API response (already mapped correctly)
      const finalStatus = data.mappedStatus || 'PENDING'
      
      console.log('Final status determined:', finalStatus)
      setPaymentStatus(finalStatus)
    } catch (error) {
      console.error('Error checking payment status:', error)
      setPaymentStatus('PENDING')
    } finally {
      setCheckingPayment(false)
    }
  }

  const handleRetryPaymentCheck = async () => {
    if (inviteInfo?.checkoutId) {
      await checkPaymentStatus(inviteInfo.checkoutId)
    }
  }

  const handleFinishPayment = () => {
    if (checkoutInfo?.paymentLink) {
      window.open(checkoutInfo.paymentLink, '_blank')
    }
  }

  const handleBackToHome = () => {
    Router.push('/')
  }

  const renderPaymentStatus = () => {
    console.log('renderPaymentStatus called with:', {
      checkingPayment,
      paymentStatus,
      inviteInfo: !!inviteInfo,
      showTicket,
      checkoutInfo: !!checkoutInfo
    })

    if (checkingPayment) {
      return (
        <div className={styles.pendingStatus}>
          <div className={styles.loadingSpinner} />
          <h3>Verificando pagamento...</h3>
        </div>
      )
    }

    if (paymentStatus === 'PAID') {
      return (
        <div className={styles.successPage}>
          <div className={styles.successPageContent}>
            <div className={styles.successHeader}>
              <div className={styles.successIcon}>✓</div>
              <span>ENCONTRO SUBMERGIDOS</span>
              <h2>Seu ingresso foi encontrado!</h2>
              <p>
                Aqui estão os detalhes do seu ingresso para o Encontro Submergidos.
              </p>
            </div>
            
            <div className={styles.eventImage}>
              <img src='/images/event.jpg' alt='Encontro Submergidos' />
            </div>
            
            <div className={styles.eventInfo}>
              <h3>Informações do Participante e Evento</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>👤 Participante:</span>
                  <span className={styles.value}>{inviteInfo?.name || 'N/A'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>📧 Email:</span>
                  <span className={styles.value}>{inviteInfo?.email || 'N/A'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>📱 Telefone:</span>
                  <span className={styles.value}>{inviteInfo?.phone || 'N/A'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>📅 Data:</span>
                  <span className={styles.value}>19, 20 e 21 de Setembro</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>💰 Valor:</span>
                  <span className={styles.value}>R$ 330,00</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>🚍 Transporte:</span>
                  <span className={styles.value}>Incluído (ida e volta)</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>🛏️ Acomodação:</span>
                  <span className={styles.value}>Incluída</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>🍽️ Refeições:</span>
                  <span className={styles.value}>Café, almoço e jantar</span>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <button onClick={handleBackToHome} className={styles.primaryButton}>
                <span>Voltar ao início</span>
              </button>
            </div>
          </div>
          
          <div className={styles.ticketSection}>
            <div className={styles.ticketHeader}>
              <img src='/images/camera.svg' alt='camera icon' />
              <span>Tire print do seu ingresso e compartilhe em suas redes, marcando <b>@fonteigreja</b></span>
            </div>
            {/* <div className={styles.ticketWrapper}>
              <Ticket name={inviteInfo?.name || ''} />
            </div> */}
          </div>
        </div>
      )
    }

    if (paymentStatus === 'PENDING') {
      console.log('Rendering PENDING status')
      return (
        <div className={styles.pendingStatus}>
          <div className={styles.pendingIcon}>⏳</div>
          <h3>Pagamento Pendente</h3>
          <p>Seu ingresso foi encontrado, mas o pagamento ainda não foi finalizado.</p>
          <p>Para acessar seu ingresso, você precisa completar o pagamento.</p>
          
          {checkoutInfo?.paymentLink && (
            <div className={styles.paymentInfo}>
              <div className={styles.paymentCard}>
                <h4>💰 Valor: R$ 330,00</h4>
                <p>Aceitamos PIX, cartão de crédito e débito</p>
              </div>
            </div>
          )}
          
          <div className={styles.pendingActions}>
            {checkoutInfo?.paymentLink ? (
              <button 
                onClick={handleFinishPayment} 
                className={styles.primaryButton}
              >
                Finalizar Pagamento
              </button>
            ) : (
              <button 
                onClick={handleRetryPaymentCheck} 
                className={styles.button}
                disabled={checkingPayment}
              >
                {checkingPayment ? 'Verificando...' : 'Verificar Novamente'}
              </button>
            )}
            <button onClick={handleBackToHome} className={styles.secondaryButton}>
              Voltar ao Início
            </button>
          </div>
        </div>
      )
    }

    if (paymentStatus === 'CANCELLED' || paymentStatus === 'FAILED') {
      return (
        <div className={styles.errorStatus}>
          <div className={styles.errorIcon}>❌</div>
          <h3>Pagamento Não Confirmado</h3>
          <p>O pagamento do seu ingresso não foi confirmado.</p>
          <p>Status: {paymentStatus === 'CANCELLED' ? 'Cancelado' : 'Falhou'}</p>
          
          {checkoutInfo?.paymentLink && (
            <div className={styles.paymentInfo}>
              <p>Você pode tentar novamente o pagamento:</p>
              <button 
                onClick={handleFinishPayment} 
                className={styles.primaryButton}
              >
                Tentar Pagamento Novamente
              </button>
            </div>
          )}
          
          <button onClick={handleBackToHome} className={styles.button}>
            Voltar ao Início
          </button>
        </div>
      )
    }

    console.log('No status matched, returning null')
    
    // Fallback for when status is null or undefined
    if (inviteInfo) {
      return (
        <div className={styles.pendingStatus}>
          <div className={styles.pendingIcon}>⏳</div>
          <h3>Verificando Status</h3>
          <p>Estamos verificando o status do seu pagamento...</p>
          <div className={styles.pendingActions}>
            <button 
              onClick={handleRetryPaymentCheck} 
              className={styles.button}
              disabled={checkingPayment}
            >
              {checkingPayment ? 'Verificando...' : 'Verificar Status'}
            </button>
            <button onClick={handleBackToHome} className={styles.secondaryButton}>
              Voltar ao Início
            </button>
          </div>
        </div>
      )
    }
    
    return null
  }

  return (
    <>
      <Head>
        <title>Meu Ingresso | Encontro Submergidos</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Toaster position='bottom-right' />
      <main className={styles.container}>
        <div className={styles.content}>
          <h1>Verificar meu ingresso</h1>
          <p>Digite seu CPF para consultar o status do seu ingresso</p>

          <form onSubmit={handleSearch}>
            <input
              type="text"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="Digite seu CPF"
              maxLength={14}
              disabled={loading}
            />
            <button type="submit" disabled={loading || cpf.trim() === ''}>
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>

          {inviteInfo && renderPaymentStatus()}
        </div>
      </main>
    </>
  )
} 