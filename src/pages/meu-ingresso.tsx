import { useState } from 'react'
import Head from 'next/head'
import { toast, Toaster } from 'sonner'

import { getInviteByCpf } from '@/services/database'

import { Invite } from '@/types/database'

import styles from '@/styles/MeuIngresso.module.scss'
import { Ticket } from '@/components/Ticket'

export default function MeuIngresso() {
  const [cpf, setCpf] = useState('')
  const [loading, setLoading] = useState(false)
  const [inviteInfo, setInviteInfo] = useState<Invite | null>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verificando seu pagamento...')

  async function checkStatus() {
    if (!cpf || typeof cpf !== 'string') {
      setStatus('error')
      setMessage('CPF não encontrado')
      return
    }

    try {
      const invite = await getInviteByCpf(cpf)
      if (!invite || !invite.checkoutId) {
        setStatus('error')
        setMessage('Convite não encontrado ou sem checkout associado')
        return
      }

      const response = await fetch(`/api/payment/check-status/${invite.checkoutId}`)
      if (!response.ok) {
        throw new Error('Erro ao verificar status do pagamento');
      }

      const data = await response.json()
      
      const paymentStatus = data.order?.charges?.[0]?.status || data.status;
      
      if (paymentStatus === 'PAID') {
        setStatus('success')
        setMessage('Pagamento confirmado! Você será redirecionado para a página inicial em alguns segundos.')
      } else if (['CANCELLED', 'DECLINED', 'FAILED'].includes(paymentStatus)) {
        setStatus('error')
        setMessage(`O pagamento foi ${paymentStatus.toLowerCase()}. Por favor, tente novamente.`)
      } else {
        setTimeout(checkStatus, 5000)
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Erro ao verificar status do pagamento')
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if(cpf?.trim() === '') {
      return
    }
    
    try {
      await checkStatus()
      const formattedCpf = cpf.replace(/\D/g, '')
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
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Meu Ingresso | Através de você</title>
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

          {inviteInfo && (
            <div className={styles.ticketInfo}>
              <h2>Informações do Ingresso</h2>
              <div className={styles.status}>
                Status: <span className={inviteInfo.status === 'CONFIRMED' ? styles.confirmed : styles.pending}>
                  {inviteInfo.status === 'CONFIRMED' ? 'Confirmado' : 'Pendente'}
                </span>
              </div>
              {/* <div className={styles.details}>
                <p><strong>Nome:</strong> {inviteInfo.name}</p>
                <p><strong>Data:</strong> 23 e 24 de maio</p>
                <p><strong>Horário:</strong> 23/05 às 19:30 e 24/05 às 15:00</p>
                <p><strong>Local:</strong> Rua Catiguá, 130 - Portal dos Ipês, Cajamar</p>
              </div> */}
            </div>
          )}
        </div>
        <div className={styles.ticket}>
          <img src='/images/camera.svg' alt='camera icon' />
          <span>Tire print do seu ingresso e comparilhe em suas redes, marcando o <b>@atravesdevoce__</b></span>
          {inviteInfo && (
            <Ticket name={inviteInfo?.name} />
          )}
        </div>
      </main>
    </>
  )
} 