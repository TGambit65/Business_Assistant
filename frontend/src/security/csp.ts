/**
 * Content Security Policy utilities
 * 
 * Provides tools to create and manage Content Security Policies
 * that protect the application from XSS, data injection, and other threats.
 */

export type CSPDirective = 
  | 'default-src'
  | 'script-src'
  | 'style-src'
  | 'img-src'
  | 'connect-src'
  | 'font-src'
  | 'object-src'
  | 'media-src'
  | 'frame-src'
  | 'worker-src'
  | 'manifest-src'
  | 'form-action'
  | 'base-uri'
  | 'frame-ancestors'
  | 'block-all-mixed-content'
  | 'upgrade-insecure-requests'
  | 'report-uri'
  | 'report-to';

/**
 * Default Content Security Policy directives
 * Provides reasonable security while allowing common functionality
 */
export const DEFAULT_CSP_DIRECTIVES: Record<CSPDirective, string[]> = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://www.google-analytics.com'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'img-src': ["'self'", 'data:', 'https://www.google-analytics.com'],
  'connect-src': ["'self'", 'https://www.google-analytics.com', 'https://api.deepseek.com', 'https://api.deepseek.ai'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'object-src': ["'none'"],
  'media-src': ["'self'"],
  'frame-src': ["'none'"],
  'worker-src': ["'self'", 'blob:'],
  'manifest-src': ["'self'"],
  'form-action': ["'self'"],
  'base-uri': ["'self'"],
  'frame-ancestors': ["'none'"],
  'block-all-mixed-content': [],
  'upgrade-insecure-requests': [],
  'report-uri': ['/api/csp-report'],
  'report-to': ['csp-endpoint']
};

/**
 * Progressive Web App (PWA) Content Security Policy directives
 * More permissive to allow offline functionality and caching
 */
export const PWA_CSP_DIRECTIVES: Record<CSPDirective, string[]> = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", 'https://www.google-analytics.com', 'https://storage.googleapis.com'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'img-src': ["'self'", 'data:', 'blob:', 'https://www.google-analytics.com'],
  'connect-src': ["'self'", 'https://www.google-analytics.com', 'https://api.deepseek.com', 'https://api.deepseek.ai', 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'object-src': ["'none'"],
  'media-src': ["'self'", 'blob:'],
  'frame-src': ["'self'"],
  'worker-src': ["'self'", 'blob:'],
  'manifest-src': ["'self'"],
  'form-action': ["'self'"],
  'base-uri': ["'self'"],
  'frame-ancestors': ["'self'"],
  'block-all-mixed-content': [],
  'upgrade-insecure-requests': [],
  'report-uri': ['/api/csp-report'],
  'report-to': ['csp-endpoint']
};

/**
 * Build a CSP string from directives object
 * @param directives Record of CSP directives
 * @returns Formatted CSP string
 */
export function buildCSPString(directives: Partial<Record<CSPDirective, string[]>>): string {
  return Object.entries(directives)
    .filter(([_, values]) => values && values.length > 0)
    .map(([directive, values]) => {
      // Handle directives that don't need values (like block-all-mixed-content)
      if (values.length === 0) {
        return directive;
      }
      return `${directive} ${values.join(' ')}`;
    })
    .join('; ');
}

/**
 * Merge two sets of CSP directives, with the second overriding the first
 * @param base Base directives
 * @param override Override directives
 * @returns Merged directives
 */
export function mergeCSPDirectives(
  base: Partial<Record<CSPDirective, string[]>>,
  override: Partial<Record<CSPDirective, string[]>>
): Partial<Record<CSPDirective, string[]>> {
  const result: Partial<Record<CSPDirective, string[]>> = { ...base };
  
  // Merge or override directives
  for (const [directive, values] of Object.entries(override)) {
    result[directive as CSPDirective] = values;
  }
  
  return result;
}

/**
 * Get Content Security Policy for PWA mode
 * @param customDirectives Optional custom directives to add/override
 * @returns Complete CSP string for PWA
 */
export function getPWAContentSecurityPolicy(
  customDirectives: Partial<Record<CSPDirective, string[]>> = {}
): string {
  // Merge PWA directives with custom overrides
  const mergedDirectives = mergeCSPDirectives(PWA_CSP_DIRECTIVES, customDirectives);
  
  // Build the CSP string
  return buildCSPString(mergedDirectives);
}

/**
 * Apply CSP to a document
 * @param document Document to apply CSP to
 * @param directives CSP directives to apply
 */
export function applyCSP(
  document: Document,
  directives: Partial<Record<CSPDirective, string[]>> = DEFAULT_CSP_DIRECTIVES
): void {
  const cspString = buildCSPString(directives);
  
  // Create a meta tag for CSP
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = cspString;
  
  // Add it to the document head
  document.head.appendChild(meta);
}

/**
 * Get nonce for CSP inline scripts
 * Should be called once per page load and reused
 * @returns Random nonce string
 */
export function generateCSPNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
} 