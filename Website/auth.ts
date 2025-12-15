import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { getEntraIdAllowedGroups } from './lib/auth/entraid';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, account, profile }) {
      console.log('JWT callback:', { token, account, profile });
      // On initial sign in, add custom claims
      if (account && profile) {
        token.tenantId = (profile as any).tid;
        token.groups = (profile as any).groups || [];
        token.userId = (profile as any).oid;
      }
      return token;
    },
    async session({ session, token }) {
      console.log('Session callback:', { session, token });
      // Add custom claims to session
      if (session.user) {
        (session.user as any).tenantId = token.tenantId;
        (session.user as any).groups = token.groups;
        (session.user as any).userId = token.userId;
      }

      // Validate group access
      const allowedGroups = getEntraIdAllowedGroups();
      console.log('Groups:', allowedGroups);
      if (allowedGroups.length > 0) {
        const userGroups = (token.groups as string[]) || [];
        const hasAccess = userGroups.some(group => allowedGroups.includes(group));

        if (!hasAccess) {
          throw new Error('User not in allowed groups');
        }
      }

      return session;
    },
  },
});
