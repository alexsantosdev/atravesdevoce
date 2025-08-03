import { useState } from 'react'

import styles from './styles.module.scss'
import PaymentModal from '../PaymentModal';

interface EventDetailProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EventDetail({ isOpen, onClose }: EventDetailProps) {
  if (!isOpen) return null;

  const [showPaymentModal, setShowPaymentModal] = useState(false)

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
        <div className={styles.eventContent}>
            <div className={styles.imageContainer}>
                <img src='https://static.wixstatic.com/media/62f1e7_bd041179f8754f14b903dc280957f5bc~mv2.jpg/v1/fill/w_640,h_360,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/62f1e7_bd041179f8754f14b903dc280957f5bc~mv2.jpg' alt="" />
            </div>
            <h2>encontro através de você</h2>
            <span>sex., 17 de out. | Cemine Word</span>

            <h3>ENCONTRO "ATRAVÉS DE VOCÊ" <br /> Dias 17, 18 e 19 de OUTUBRO DE 2025.</h3>
            <span>
                Serão três dias intensos em um sítio, separadas exclusivamente para ouvirmos a voz de Deus e sermos ativadas no nosso propósito. <br />
                Essa imersão é mais do que um retiro — é um chamado. Cremos que o evangelho não pode parar em nós.
            </span>

            <div className={styles.sections}>
                <h2>Horário e local</h2>
                <span>
                    17 de out. de 2025, 19:00 – 19 de out. de 2025, 19:00 <br />
                    Cemine Word, Estr. do Tronco, 485 - Veraneio Maracanã, Itaquaquecetuba - SP, 08582-460, Brasil
                </span>
            </div>
            <div className={styles.sections}>
                <h2>Sobre o evento</h2>
                <span>
                    ENCONTRO “ATRAVÉS DE VOCÊ” – UMA IMERSÃO PARA MULHERES ✨ <br /><br />

                    Esse não será apenas mais um encontro… Será um marco profético na vida de muitas mulheres!
                    Durante três dias — sexta, sábado e domingo, em um sítio preparado com muito amor — viveremos uma imersão profunda com Deus. 🌿 <br /><br />

                    O encontro “Através de Você” nasceu no coração de Deus como um projeto exclusivo para mulheres, com o propósito de edificar, curar, alinhar e ativar o que o céu já liberou sobre nós. <br />
                    Você sairá desse lugar com clareza sobre o que o Senhor deseja fazer através da sua vida. <br /><br />

                    💡 Mulheres serão fortalecidas em sua identidade, despertadas para o chamado, e capacitadas para viver o extraordinário de Deus — em casa, no trabalho, no ministério e onde forem enviadas.
                </span>
            </div>

            <div className={styles.sections}>
                <h2>INFORMAÇÕES</h2>
                <span>
                    📅 Dias 17, 18 e 19 <br />
                    📍Espaço Cemine Word – Estrada do Tronco, 485 – Itaquaquecetuba/SP <br /><br />
                    
                    ⸻ <br /><br />

                    💰 INVESTIMENTO: R$ 387,00 <br /><br />

                    Inclui: <br />
                    ✔️ Transporte ida e volta <br />
                    ✔️ Acomodação <br />
                    ✔️ Todas as refeições (café da manhã, almoço e jantar) <br />
                    Obs: Bebidas do almoço e jantar serão pagas à parte. <br /><br />

                    ⸻ <br /><br />

                    🚍 TRANSPORTE: <br /><br />

                    Saída: Igreja FONTE – Rua Catiguá, 130 <br />
                    Retorno: Domingo (dia 19), para o mesmo local. <br /><br />

                    ⸻ <br /><br />
                    
                    🛏️ ACOMODAÇÃO: <br /><br />

                    <ul>
                        <li>Quartos compartilhados com 5 a 7 mulheres</li>
                        <li>1 banheiro por quarto</li>
                        <li>será necessário levar roupa de cama. ( teremos colchão de solteiro no local )</li> <br /><br />
                    </ul>

                    A estrutura conta com quadras e piscinas, que serão liberadas de acordo com a programação. <br /><br />

                    ⸻ <br /><br />

                    Essa é uma imersão transformadora, feita por Deus para mulheres como você. <br />
                    Não é sobre você… é através de você. <br /><br />
                </span>

                <button onClick={() => setShowPaymentModal(true)}>
                    <span>garantir meu ingresso</span>
                </button>

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