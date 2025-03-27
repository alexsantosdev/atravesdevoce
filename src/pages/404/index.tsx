import Head from 'next/head'

// import styles from '@/styles/NotFound.module.scss'

export default function Error404Page() {
    return(
        <>
            <Head>
                <title>Não encontrado</title>
            </Head>

            {/* <main className={styles.mainContainer}>
                <div className={styles.mainSection}>
                    <h2>Perdemos essa página :(</h2>
                    <span>Desculpe, a página que você está procurando não existe ou foi removida.</span>
                    <a href='/'>Leve-me para o início</a>
                </div>
            </main> */}
        </>
    )
}