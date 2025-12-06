interface EntraIdPrincipal {
  auth_typ: string; // "aad"
  claims: Array<{ typ: string; val: string }>;
  name_typ: string;
  role_typ: string;
}

export interface ParsedEntraIdUser {
  userPrincipalName: string;
  userId: string;
  name: string;
  groups: string[];
}

export function isEntraIdEnabled(): boolean {
  return process.env.ENABLE_ENTRAID_AUTH === 'true';
}

export function isPasswordAuthDisabled(): boolean {
  return process.env.DISABLE_PASSWORD_AUTH === 'true';
}

export function getEntraIdAllowedGroups(): string[] {
  const groups = process.env.ENTRAID_ALLOWED_GROUPS || '';
  return groups.split(',').filter(g => g.trim().length > 0);
}

export function parseEntraIdPrincipal(principalHeader: string | null): ParsedEntraIdUser | null {
  if (!principalHeader) return null;

  try {
    const decoded = Buffer.from(principalHeader, 'base64').toString('utf-8');
    const principal: EntraIdPrincipal = JSON.parse(decoded);

    const getClaim = (type: string) =>
      principal.claims.find(c => c.typ === type)?.val || '';

    return {
      userPrincipalName: getClaim('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn') ||
                         getClaim('preferred_username'),
      userId: getClaim('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier') ||
              getClaim('oid'),
      name: getClaim('name') || getClaim('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'),
      groups: principal.claims
        .filter(c => c.typ === 'groups')
        .map(c => c.val)
    };
  } catch (error) {
    console.error('Failed to parse EntraID principal:', error);
    return null;
  }
}

export function validateGroupAccess(userGroups: string[]): boolean {
  const allowedGroups = getEntraIdAllowedGroups();

  // If no groups configured, allow all authenticated users
  if (allowedGroups.length === 0) return true;

  // Check if user is in at least one allowed group
  return userGroups.some(group => allowedGroups.includes(group));
}
