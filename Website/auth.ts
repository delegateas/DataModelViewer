import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { getEntraIdAllowedGroups } from './lib/auth/entraid';
import { createEntraIdSession } from './lib/session';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      // Validate EntraID users before creating session
      if (account?.provider === 'microsoft-entra-id' && profile) {
        // Groups are now fetched via the profile callback and available in user object
        const userGroups = (user as any).groups || (profile as any).groups || [];
        const allowedGroups = getEntraIdAllowedGroups();

        // If groups are configured, validate access
        if (allowedGroups.length > 0) {
          const hasAccess = userGroups.some((group: string) => allowedGroups.includes(group));
          if (!hasAccess) return false;
        }

        // Create custom session cookie only after group validation passes
        await createEntraIdSession({
          userPrincipalName: (user as any).preferred_username || user.email || '',
          userId: (user as any).oid || user.id || '',
          name: user.name || '',
          groups: userGroups
        });
      }

      return true;
    },
    async jwt({ token, account, profile, user }) {
      // On initial sign in, add custom claims
      if (account && profile) {
        token.tenantId = (profile as any).tid;
        token.groups = (user as any)?.groups || (profile as any).groups || [];
        token.userId = (profile as any).oid;
      }
      return token;
    },
    async session({ session, token }) {
      // Add custom claims to session
      if (session.user) {
        (session.user as any).tenantId = token.tenantId;
        (session.user as any).groups = token.groups;
        (session.user as any).userId = token.userId;
      }

      // Validate group access
      const allowedGroups = getEntraIdAllowedGroups();
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
