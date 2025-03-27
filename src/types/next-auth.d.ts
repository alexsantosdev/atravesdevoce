import NextAuth from 'next-auth'

import { User, Workspace } from '@/contexts/AuthContext'

declare module "next-auth" {
  interface Session {
    accessToken: string;
    refreshToken: string;
    token: JWT,
    user: {
      name: string;
      email: string;
      image: string;
    }
  }

  interface JWT {
    accessToken: string;
    refreshToken: string;
    user: User,
    workspace: Workspace
  }
}
