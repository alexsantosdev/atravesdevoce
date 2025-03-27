import { useEffect } from 'react'
import { useRouter } from 'next/router'

import { useAuth } from '@/contexts/AuthContext'

import styles from '@/styles/ProtectedRoute.module.scss'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    )
  }

  return user ? <>{children}</> : null
} 