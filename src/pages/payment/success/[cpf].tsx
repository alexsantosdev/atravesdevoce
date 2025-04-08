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
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verificando seu pagamento...')
  const [success, setSuccess] = useState<boolean>(false)
  const [inviteInfo, setInviteInfo] = useState<Invite | null>(null)

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
        if (!invite || !invite.checkoutId) {
          setStatus('error');
          setMessage('Convite não encontrado ou sem checkout associado');
          return;
        }

        // Get checkout status from PagBank
        const response = await fetch(`/api/payment/check-status/${invite.checkoutId}`);
        if (!response.ok) {
          throw new Error('Erro ao verificar status do pagamento');
        }

        const data = await response.json();
        
        // Check payment status from order or checkout
        const paymentStatus = data.order?.charges?.[0]?.status || data.status;
        
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
          // If still pending, check again in 5 seconds
          setTimeout(checkStatus, 5000);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Erro ao verificar status do pagamento');
      }
    }

    const handleSearch = async () => {
      try {
        const formattedCpf = String(cpf).replace(/\D/g, '')
        const invite = await getInviteByCpf(formattedCpf)
        
        if (invite) {
          setInviteInfo(invite)
        } else {
          toast.error('Ingresso não encontrado')
          setInviteInfo(null)
        }
      } catch (error) {
        toast.error('Erro ao buscar ingresso')
        setInviteInfo(null)
      }
    }

    if (cpf) {
      checkStatus();
      handleSearch()
    }
  }, [cpf, router]);

  return (
    <>
      <Head>
        <title>Status do Pagamento | Através de você</title>
      </Head>
      {success ? (
        <div className={styles.successPage}>
          <div className={styles.successPageContent}>
            <span>Conferência de MULHERES</span>
            <h2>Sua inscrição foi confirmada!</h2>
            <p>
              Estamos muito felizes em tê-la conosco! Você já pode acessar sua conta e visualizar todos os seus ingressos.
            </p>
            <button onClick={() => Router.push('/meu-ingresso')}>
              <span>Ver meus ingressos</span>
            </button>
          </div>
          {inviteInfo && (
            <div className={styles.ticket}>
              <img src='/images/camera.svg' alt='camera icon' />
              <span>Tire print do seu ingresso e comparilhe em suas redes, marcando o <b>@atravesdevoce__</b></span>
              <Ticket name={inviteInfo?.name} />
            </div>
          )}
        </div>
      ) : (
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.content}>
              {status === 'loading' && (
                <>
                  <div className={styles.loadingSpinner} />
                  <h1 className={styles.title}>Verificando seu pagamento...</h1>
                  <p className={styles.message}>{message}</p>
                </>
              )}

              {status === 'success' && (
                <>
                  <div className={styles.successIcon}>✓</div>
                  <h1 className={styles.title}>Pagamento Confirmado!</h1>
                  <p className={styles.message}>{message}</p>
                </>
              )}

              {status === 'error' && (
                <>
                  <div className={styles.errorIcon}>✕</div>
                  <h1 className={styles.title}>Erro no Pagamento</h1>
                  <p className={styles.message}>{message}</p>
                  <button onClick={() => router.push('/')} className={styles.button}>
                    Voltar para a página inicial
                  </button>
                </>
              )}
            </div>
          </div>
        </main>
      )}
    </>
  );
} 