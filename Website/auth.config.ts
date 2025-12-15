import type { NextAuthConfig } from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';

export const authConfig = {
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      issuer: process.env.AZURE_TENANT_ID
        ? `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0`
        : undefined,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLoginPage = nextUrl.pathname === '/login';

      // Allow everyone to access the login page
      if (isOnLoginPage) {
        return true;
      }

      // Public API endpoints
      const publicApiEndpoints = ['/api/auth', '/api/version'];
      if (publicApiEndpoints.some(path => nextUrl.pathname.startsWith(path))) {
        return true;
      }

      // All other pages require authentication
      if (!isLoggedIn) {
        return false; // Will redirect to /login
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
