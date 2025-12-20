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