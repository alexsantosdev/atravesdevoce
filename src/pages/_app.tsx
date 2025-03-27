import type { AppProps } from 'next/app'
import { appWithTranslation } from 'next-i18next'
import { SessionProvider as NextAuthProvider} from 'next-auth/react'
import { Toaster } from 'react-hot-toast'

import { AuthProvider } from '../contexts/AuthContext'

import '@/styles/global.scss'

function MyApp({ Component, pageProps }: AppProps) {
  return(
    <NextAuthProvider session={pageProps.session}>
      <AuthProvider>
        <Component {...pageProps} />
        <Toaster position="top-right" />
      </AuthProvider>
    </NextAuthProvider>
  )
}

export default appWithTranslation(MyApp)