import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
      isActive: boolean;
      plan: string;
      onboarded: boolean;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    uid?: string;
    isAdmin?: boolean;
    isActive?: boolean;
    plan?: string;
    onboarded?: boolean;
  }
}
