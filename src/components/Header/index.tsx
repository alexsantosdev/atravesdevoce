import Link from 'next/link'
import { useRouter } from 'next/router'

import styles from './styles.module.scss'

export default function Header() {
  const router = useRouter()

  return (
    <div className={styles.navigation}>
        <header className={styles.header}>
            <div className={styles.container}>
                <nav>
                    <Link href="/" className={router.pathname === '/' ? styles.active : ''}>
                        Início
                    </Link>
                    <Link href="/meu-ingresso" className={router.pathname === '/meu-ingresso' ? styles.active : ''}>
                        Meu ingresso
                    </Link>
                </nav>
            </div>
        </header>
    </div>
  )
} 