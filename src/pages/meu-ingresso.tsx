import { useState } from 'react'
import Head from 'next/head'
import { toast, Toaster } from 'sonner'
import Router from 'next/router'

import { getInviteByCpf } from '@/services/database'

import { Invite } from '@/types/database'

import styles from '@/styles/MeuIngresso.module.scss'
import { Ticket } from '@/components/Ticket'

export default function MeuIngresso() {
  const [cpf, setCpf] = useState('')
  const [loading, setLoading] = useState(false)
  const [inviteInfo, setInviteInfo] = useState<Invite | null>(null)
  const [showTicket, setShowTicket] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if(cpf?.trim() === '') {
      return
    }
    
    try {
      const formattedCpf = cpf.replace(/\D/g, '')
      const invite = await getInviteByCpf(formattedCpf)
      
      if (invite) {
        setInviteInfo(invite)
        setShowTicket(true)
        toast.success('Ingresso encontrado!')
      } else {
        toast.error('Ingresso não encontrado')
        setInviteInfo(null)
        setShowTicket(false)
      }
    } catch (error) {
      toast.error('Erro ao buscar ingresso')
      setInviteInfo(null)
      setShowTicket(false)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToHome = () => {
    Router.push('/')
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

          {inviteInfo && showTicket && (
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
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
} 