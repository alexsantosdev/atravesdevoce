import { useState } from 'react'
import Router from 'next/router'

import styles from './styles.module.scss'
import PaymentModal from '../PaymentModal';

interface EventDetailProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EventDetail({ isOpen, onClose }: EventDetailProps) {
  if (!isOpen) return null;

  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const handleViewTickets = () => {
    Router.push('/meu-ingresso')
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        {/* <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button> */}
        <div className={styles.eventContent}>
            <div className={styles.imageContainer}>
                <img src='/images/event.jpg' alt="" />
            </div>
            <h2>encontro submergidos</h2>
            <span>19, 20 e 21 de setembro</span>

            <h3>ENCONTRO "SUBMERGIDOS" <br /> Dias 19, 20 e 21 de SETEMBRO DE 2025.</h3>
            <span>
                Você achou que já tinha vivido tudo? <br />
                Que o que você viveu ali era tudo o que o céu tinha pra te dar? <br />
                "Deus está te chamando… <b>mais fundo</b>."
            </span>

            <div className={styles.sections}>
                <h2>Sobre o evento</h2>
                <span>
                    "Submergidos é onde o raso termina e o profundo começa." <br /><br />
                    É um chamado pra quem deseja se perder nas águas do Espírito. <br /><br />

                    <b>Não para espectadores.</b> <br />
                    <b>Mas para os sedentos.</b> <br />
                    <b>Para os que desejam mais.</b> <br /> <br />

                    <b>Mais presença.</b> <br />
                    <b>Mais renúncia.</b> <br />
                    <b>Mais profundidade.</b>" <br /> <br />

                    Esse é o tempo de romper com a superficialidade. <br />
                    De permitir que tudo o que é raso seja deixado para trás, <br />
                    até que só a presença dEle governe." <br /><br />

                    Submergidos não é para quem apenas lembra do fogo… <br /><br />

                    É para quem carrega a marca e não aceita mais viver na superfície." <br /><br />

                    "Prepara teu coração… <br />
                    Porque há profundezas reservadas pra você."
                </span>
            </div>

            <div className={styles.sections}>
                <h2>INFORMAÇÕES</h2>
                <span>
                    📅 Dias 19, 20 e 21 de setembro <br /><br />
                    
                    ⸻ <br /><br />

                    💰 INVESTIMENTO: R$ 330,00 <br /><br />

                    Inclui: <br />
                    ✔️ Transporte ida e volta <br />
                    ✔️ Acomodação <br />
                    ✔️ Todas as refeições (café da manhã, almoço e jantar) <br />

                    ⸻ <br /><br />

                    🚍 TRANSPORTE: <br /><br />

                    Saída: Igreja FONTE – Rua Catiguá, 130 <br />
                    Retorno: Domingo (dia 21), para o mesmo local. <br /><br />

                    ⸻ <br /><br />
                    
                    🛏️ ACOMODAÇÃO: <br /><br />

                    <ul>
                        <li>Quartos compartilhados</li>
                        <li>1 banheiro por quarto</li>
                        <li>será necessário levar roupa de cama. ( teremos colchão de solteiro no local )</li> <br /><br />
                    </ul>

                    ⸻ <br /><br />
                </span>

                <div className={styles.buttonGroup}>
                    <button onClick={() => setShowPaymentModal(true)} className={styles.primaryButton}>
                        <span>garantir meu ingresso</span>
                    </button>
                    <button onClick={handleViewTickets} className={styles.secondaryButton}>
                        <span>ver meus ingressos</span>
                    </button>
                </div>

                <br /><br />
            </div>
        </div>
      </div>

        <PaymentModal 
            isOpen={showPaymentModal} 
            onClose={() => setShowPaymentModal(false)} 
        />  
    </div>
  );
} 