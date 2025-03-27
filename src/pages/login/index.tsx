import { useState } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-hot-toast'
import Head from 'next/head'

import { useAuth } from '@/contexts/AuthContext'

import styles from '@/styles/Login.module.scss'

export default function Login() {
  const { signIn } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signIn(email, password);
      toast.success('Autenticado com sucesso!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Email ou senha inválidos');
      console.error(error);
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Login | Através de você</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <h2 className={styles.title}>
            Acessar Painel de Controle
          </h2>
          <form className={styles.form} onSubmit={handleSubmitLogin}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Endereço de email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={styles.input}
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={styles.input}
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={styles.button}
            >
              {loading ? 'Autenticando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
} 