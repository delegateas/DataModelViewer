/**
 * Utility functions for clipboard operations
 */

/**
 * Copy text to clipboard using the modern clipboard API
 * @param text The text to copy to clipboard
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Modern clipboard API - preferred method
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback for older browsers - create temporary input element
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'absolute';
    textArea.style.left = '-9999px';
    textArea.style.opacity = '0';
    
    document.body.appendChild(textArea);
    textArea.select();
    textArea.setSelectionRange(0, 99999);
    
    // Use the legacy method as fallback (suppress deprecation warning)
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    return success;
  } catch (err) {
    console.error('Failed to copy text to clipboard:', err);
    return false;
  }
}

/**
 * Generate a shareable URL for a specific section
 * @param sectionId The schema name of the section
 * @param groupName Optional group name for context
 * @returns The full URL that can be shared
 */
export function generateSectionLink(sectionId: string, groupName?: string): string {
  const url = new URL(window.location.href);
  url.pathname = '/metadata';
  url.searchParams.set('section', sectionId);
  if (groupName) {
    url.searchParams.set('group', groupName);
  }
  return url.toString();
}

/**
 * Generate a shareable URL for a specific group
 * @param groupName The name of the group
 * @returns The full URL that can be shared
 */
export function generateGroupLink(groupName: string): string {
  const url = new URL(window.location.href);
  url.pathname = '/metadata';
  url.searchParams.set('group', groupName);
  return url.toString();
}