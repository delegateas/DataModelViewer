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
      authorization: {
        params: {
          scope: 'openid profile email User.Read',
        },
      },
      async profile(profile, tokens) {
        // Only fetch groups if group-based access control is configured
        let groups: string[] = [];
        const allowedGroups = process.env.ENTRAID_ALLOWED_GROUPS || '';
        const hasGroupRestrictions = allowedGroups.trim().length > 0;

        if (hasGroupRestrictions && tokens.access_token) {
          try {
            const response = await fetch('https://graph.microsoft.com/v1.0/me/memberOf', {
              headers: {
                Authorization: `Bearer ${tokens.access_token}`,
              },
            });

            if (response.ok) {
              const data = await response.json();
              // Extract group Object IDs
              groups = data.value
                .filter((item: any) => item['@odata.type'] === '#microsoft.graph.group')
                .map((group: any) => group.id);
            } else {
              console.error('Failed to fetch groups:', response.status, response.statusText);
            }
          } catch (error) {
            console.error('Error fetching groups:', error);
          }
        }

        return {
          id: profile.sub || profile.oid,
          name: profile.name,
          email: profile.email || profile.preferred_username,
          groups,
          oid: profile.oid,
          tid: profile.tid,
          preferred_username: profile.preferred_username,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
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
