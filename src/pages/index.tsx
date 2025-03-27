import { useState } from 'react'
import Head from 'next/head'
import { Toaster } from 'sonner'

import styles from '@/styles/Home.module.scss'
import PaymentModal from '../components/PaymentModal'

export default function Home() {
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  return (
    <>
      <Head>
        <title>Conferência de mulheres | Através de você</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Toaster position='bottom-center' />
      <main className={styles.mainContainer}>
        <div className={styles.mainHeader}>
          <div className={styles.side}>
            <div className={styles.content}>
              <span>Conferência de MULHERES</span>
              <h2>Deus quer fazer algo <b>através de você!</b></h2>
              <p>
                Em um tempo de oração, Deus me direcionou a reunir mulheres para serem curadas, libertas e restauradas, para então transformarem outras vidas. 
                E assim nasceu o <b>Através de Você</b> – um movimento que já impacta mulheres ao redor do Brasil!
              </p>
              <button>
                <span>eu quero fazer parte!</span>
              </button>
            </div>
          </div>
          <div className={styles.side}>
            <img src='/images/background.png' alt='background image' />
          </div>
        </div>

        <div className={styles.mainContent}>
          <h2>Você está pronta para a transformação?</h2>
          <span>Prepare-se para um tempo inesquecível de conexão, restauração e manifestação do poder de Deus.</span>

          <div className={styles.grid}>
            <div className={styles.card}>
              <img src='/images/g1.jpg' alt='g1 image' />
              <div className={styles.content}>
                <span>nai lopes</span>
                <h2>22 às 19H30m</h2>
              </div>
            </div>
            <div className={styles.card}>
              <img src='/images/g4.jpg' alt='g1 image' />
              <div className={styles.content}>
                <span>pra rafaela marques</span>
                <h2>22 às 20H30m</h2>
              </div>
            </div>
            <div className={styles.card}>
              <img src='/images/g3.jpg' alt='g1 image' />
              <div className={styles.content}>
                <span>pra bianca franco</span>
                <h2>23 às 15H00m</h2>
              </div>
            </div>
            <div className={styles.card}>
              <img src='/images/g2.jpg' alt='g1 image' />
              <div className={styles.content}>
                <span>pra thamires ponciano</span>
                <h2>23 às 16H00m</h2>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.bg}>
          <div className={styles.fullBackground}>
            <h2>🔥 Um final de semana que mudará a sua vida!</h2>
            <span>Nos dias <b>22 e 23 de maio</b>, prepare-se para um tempo inesquecível de conexão, restauração e manifestação do poder de Deus.</span>
          </div>
        </div>

        <div className={styles.eventSection}>
          <h5>Jesus está te chamando</h5>
          <h2>O que te espera <br /> na conferência?</h2>

          <div className={styles.columns} style={{ marginTop: '8rem' }}>
            <div className={styles.column}>
              <img src='/images/c1.jpg' alt='c1 image' />
            </div>
            <div className={styles.column}>
              <div className={styles.columnContent}>
                <h3>Conexão</h3>
                <h2>Palavra e <br /> ministração</h2>
                <p>
                  Jesus disse: "<em>siga-me e o farei pescador de homens</em>", uma chamada de Jesus específica deixa-me salvar através de você."
                </p>
              </div>
            </div>
          </div>

          <div className={styles.columns}>
            <div className={styles.column}>
              <div className={styles.columnContent}>
                <h3>Intensidade</h3>
                <h2>Adorações intensas</h2>
                <p>
                  Não importa em qual nível você esteja, talvez você só precise ser cuidada e amada. Nós cremos que através de você, sinais e maravilhas serão manifestos.
                </p>
              </div>
            </div>
            <div className={styles.column}>
              <img src='/images/c2.jpg' alt='c2 image' />
            </div>
          </div>

          <div className={styles.about}>
            <img src='/images/figure.png' alt='Pra. Thamires Ponciano' />
            <div className={styles.aboutContent}>
              <span>Sobre o evento</span>
              <h2>Através de Você</h2>
              <p>
                O através de você é um projeto totalmente voltado a mulheres, um projeto onde mulheres são curadas para curar, libertas para libertar, restauradas para restaurar, primeiro em mim depois através de mim.
              </p>

              <p>
                Ele é totalmente inspirado por Jesus, já parou para pensar o quanto Jesus era atraído por pessoas improváveis, a história de Pedro me remete ATRAVÉS DE VOCÊ.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.ctaAndFooter}>
          <div className={styles.ctaSection}>
            <div className={styles.content}>
              <h4>Você não vai perder né?</h4>
              <h2>Reserve sua vaga agora mesmo e se prepare para viver o <b>sobrenatural de Deus!</b></h2>
              <span>Rua Catiguá, 130 - Portal dos Ipês, Cajamar</span>
              <p>Nossa estrutura conta com estacionamento e lanchonete.</p>
            </div>

            <div className={styles.ctaCard}>
              <span>
                Será um final de semana memorável, crie grandes expectativas. <b>Seremos marcadas pelo senhor</b>.
              </span>
              <div className={styles.priceSection}>
                <div className={styles.price}>
                  <h4>R$</h4>
                  <h2>57,00</h2>
                </div>
                <span>Ou em até <b>3x de R$ 20,34 reais</b> no cartão de crédito</span>
              </div>

              <div className={styles.items}>
                <div className={styles.item}>
                  <img src='/images/marker.svg' alt='marker' />
                  <span>Dias 22 e 23 de Maio</span>
                </div>
                <div className={styles.item}>
                  <img src='/images/marker.svg' alt='marker' />
                  <span>22 de maio - Início às 19h30</span>
                </div>
                <div className={styles.item}>
                  <img src='/images/marker.svg' alt='marker' />
                  <span>23 de maio - Retorno às 15h</span>
                </div>
              </div>

              <div className={styles.btn}>
                <button onClick={() => setShowPaymentModal(true)}>
                  <span>Quero me inscrever</span>
                  <img src='/images/arrow.svg' alt='arrow' />
                </button>
                <span>Você será redirecionada pra um ambiente seguro PagBank.</span>
              </div>
              <span className={styles.ctaFooter}>Pague com um cartão de crédito, débito ou Pix.</span>
            </div>
          </div>
          
          <div className={styles.footer}>
            <span>&copy; Fonte Igreja Apostólica • Todos os direitos reservados</span>
          </div>
        </div>

        <PaymentModal 
          isOpen={showPaymentModal} 
          onClose={() => setShowPaymentModal(false)} 
        />
      </main>
    </>
  )
}