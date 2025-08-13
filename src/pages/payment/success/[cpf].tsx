import { useEffect, useState } from 'react'
import Router, { useRouter } from 'next/router'
import Head from 'next/head'
import { toast } from 'sonner'

import { Ticket } from '@/components/Ticket'

import { getInviteByCpf } from '@/services/database'

import { Invite } from '@/types/database'

import styles from '@/styles/Payment.module.scss'

export default function PaymentSuccess() {
  const router = useRouter()
  const { cpf } = router.query
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('loading')
  const [message, setMessage] = useState('Verificando seu pagamento...')
  const [success, setSuccess] = useState<boolean>(false)
  const [inviteInfo, setInviteInfo] = useState<Invite | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    async function checkStatus() {
      if (!cpf || typeof cpf !== 'string') {
        setStatus('error');
        setMessage('CPF não encontrado');
        return;
      }

      try {
        // Get invite details
        const invite = await getInviteByCpf(cpf);
        if (!invite) {
          setStatus('error');
          setMessage('Convite não encontrado');
          return;
        }

        setInviteInfo(invite);

        if (!invite.checkoutId) {
          setStatus('error');
          setMessage('Convite sem checkout associado');
          return;
        }

        // Get checkout status from PagBank with cache-busting
        const timestamp = Date.now();
        const response = await fetch(`/api/payment/check-status/${invite.checkoutId}?t=${timestamp}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        });

        if (!response.ok) {
          throw new Error('Erro ao verificar status do pagamento');
        }

        const data = await response.json();
        
        // Check payment status from order or checkout
        const paymentStatus = data.status || data.order?.charges?.[0]?.status || 'PENDING';
        
        if (paymentStatus === 'PAID') {
          setStatus('success');
          setMessage('Pagamento confirmado! Você receberá seu ingresso em alguns segundos.');
          setTimeout(() => {
            setSuccess(true)
          }, 3000);
        } else if (['CANCELLED', 'DECLINED', 'FAILED'].includes(paymentStatus)) {
          setStatus('error');
          setMessage(`O pagamento foi ${paymentStatus.toLowerCase()}. Por favor, tente novamente.`);
        } else {
          // Status is pending or other status - show once and let user decide
          setStatus('pending');
          setMessage(`Status do pagamento: ${paymentStatus}. O pagamento ainda está sendo processado.`);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Erro ao verificar status do pagamento');
      }
    }

    if (cpf) {
      checkStatus();
    }
  }, [cpf]);

  const handleBackToHome = () => {
    Router.push('/')
  }

  const handleRetryCheck = async () => {
    if (!cpf || typeof cpf !== 'string' || !inviteInfo?.checkoutId) {
      return;
    }

    setIsChecking(true);
    setMessage('Verificando novamente...');

    try {
      const timestamp = Date.now();
      const response = await fetch(`/api/payment/check-status/${inviteInfo.checkoutId}?t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao verificar status do pagamento');
      }

      const data = await response.json();
      const paymentStatus = data.status || data.order?.charges?.[0]?.status || 'PENDING';
      
      if (paymentStatus === 'PAID') {
        setStatus('success');
        setMessage('Pagamento confirmado! Você receberá seu ingresso em alguns segundos.');
        setTimeout(() => {
          setSuccess(true)
        }, 3000);
      } else if (['CANCELLED', 'DECLINED', 'FAILED'].includes(paymentStatus)) {
        setStatus('error');
        setMessage(`O pagamento foi ${paymentStatus.toLowerCase()}. Por favor, tente novamente.`);
      } else {
        setStatus('pending');
        setMessage(`Status do pagamento: ${paymentStatus}. O pagamento ainda está sendo processado.`);
        toast.info('Status ainda pendente. Tente novamente em alguns minutos.');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Erro ao verificar status do pagamento');
    } finally {
      setIsChecking(false);
    }
  }

  if (status === 'loading') {
    return (
      <>
        <Head>
          <title>Verificando Pagamento | Encontro Submergidos</title>
        </Head>
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.loadingSpinner} />
            <h2>Verificando Pagamento</h2>
            <p>{message}</p>
          </div>
        </div>
      </>
    )
  }

  if (status === 'pending') {
    return (
      <>
        <Head>
          <title>Pagamento em Processamento | Encontro Submergidos</title>
        </Head>
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.pendingIcon}>⏳</div>
            <h2>Pagamento em Processamento</h2>
            <p>{message}</p>
            <div className={styles.pendingActions}>
              <button 
                onClick={handleRetryCheck} 
                className={styles.button}
                disabled={isChecking}
              >
                {isChecking ? 'Verificando...' : 'Verificar Novamente'}
              </button>
              <button onClick={handleBackToHome} className={styles.secondaryButton}>
                Voltar ao Início
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (status === 'error') {
    return (
      <>
        <Head>
          <title>Erro no Pagamento | Encontro Submergidos</title>
        </Head>
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.errorIcon}>❌</div>
            <h2>Erro na Verificação</h2>
            <p>{message}</p>
            <button onClick={handleBackToHome} className={styles.button}>
              Voltar ao Início
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Status do Pagamento | Encontro Submergidos</title>
      </Head>
      {success ? (
        <div className={styles.successPage}>
          <div className={styles.successPageContent}>
            <div className={styles.successHeader}>
              <div className={styles.successIcon}>✓</div>
              <span>ENCONTRO SUBMERGIDOS</span>
              <h2>Sua inscrição foi confirmada!</h2>
              <p>
                Estamos muito felizes em tê-lo conosco! Seu ingresso está pronto e você já pode visualizá-lo abaixo.
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
              <button onClick={() => Router.push('/meu-ingresso')} className={styles.primaryButton}>
                <span>Ver meus ingressos</span>
              </button>
              <button onClick={() => Router.push('/')} className={styles.secondaryButton}>
                <span>Voltar ao início</span>
              </button>
            </div>
          </div>
          
          
        </div>
      ) : (
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.content}>
              <div className={styles.successIcon}>✓</div>
              <h1 className={styles.title}>Pagamento Confirmado!</h1>
              <p className={styles.message}>{message}</p>
            </div>
          </div>
        </main>
      )}
    </>
  );
} 