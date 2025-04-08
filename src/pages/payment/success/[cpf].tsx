import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

import { getInviteByCpf } from '@/services/database'

import styles from '@/styles/Payment.module.scss'

export default function PaymentSuccess() {
  const router = useRouter()
  const { cpf } = router.query
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verificando seu pagamento...')

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
          setMessage('Pagamento confirmado! Você será redirecionado para a página inicial em alguns segundos.');
          setTimeout(() => {
            router.push('/');
          }, 5000);
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

    if (cpf) {
      checkStatus();
    }
  }, [cpf, router]);

  return (
    <>
      <Head>
        <title>Status do Pagamento | Através de você</title>
      </Head>
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
    </>
  );
} 