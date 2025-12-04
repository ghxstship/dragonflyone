import { NextRequest, NextResponse } from 'next/server';

const CSRF_TOKEN_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32;

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Set CSRF token cookie
 */
export function setCsrfCookie(response: NextResponse, token: string): void {
  response.cookies.set(CSRF_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

/**
 * Get CSRF token from request cookies
 */
export function getCsrfTokenFromCookie(request: NextRequest): string | undefined {
  return request.cookies.get(CSRF_TOKEN_NAME)?.value;
}

/**
 * Get CSRF token from request header
 */
export function getCsrfTokenFromHeader(request: NextRequest): string | undefined {
  return request.headers.get(CSRF_HEADER_NAME) || undefined;
}

/**
 * Validate CSRF token - compares cookie token with header token
 */
export function validateCsrfToken(request: NextRequest): boolean {
  const cookieToken = getCsrfTokenFromCookie(request);
  const headerToken = getCsrfTokenFromHeader(request);

  if (!cookieToken || !headerToken) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  if (cookieToken.length !== headerToken.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < cookieToken.length; i++) {
    result |= cookieToken.charCodeAt(i) ^ headerToken.charCodeAt(i);
  }

  return result === 0;
}

/**
 * HTTP methods that require CSRF validation
 */
const CSRF_PROTECTED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Paths that are exempt from CSRF protection (webhooks, public APIs)
 */
const CSRF_EXEMPT_PATHS = [
  '/api/webhooks/',
  '/api/health',
  '/api/cron/',
  '/api/public/',
];

/**
 * Check if a path is exempt from CSRF protection
 */
function isExemptPath(pathname: string): boolean {
  return CSRF_EXEMPT_PATHS.some((path) => pathname.startsWith(path));
}

/**
 * CSRF protection middleware
 * 
 * Usage in middleware.ts:
 * ```
 * import { csrfMiddleware } from '@ghxstship/config/middleware/csrf';
 * 
 * export async function middleware(request: NextRequest) {
 *   const csrfResponse = csrfMiddleware(request);
 *   if (csrfResponse) return csrfResponse;
 *   // ... rest of middleware
 * }
 * ```
 */
export function csrfMiddleware(request: NextRequest): NextResponse | null {
  const { method, nextUrl } = request;
  const pathname = nextUrl.pathname;

  // Skip CSRF for exempt paths
  if (isExemptPath(pathname)) {
    return null;
  }

  // For GET/HEAD/OPTIONS, ensure CSRF token cookie exists
  if (!CSRF_PROTECTED_METHODS.includes(method)) {
    const existingToken = getCsrfTokenFromCookie(request);
    
    if (!existingToken) {
      // Generate and set new token
      const response = NextResponse.next();
      const newToken = generateCsrfToken();
      setCsrfCookie(response, newToken);
      return response;
    }
    
    return null;
  }

  // For protected methods, validate CSRF token
  if (!validateCsrfToken(request)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    );
  }

  return null;
}

/**
 * API route helper to get CSRF token for client-side usage
 * Use this in a GET /api/csrf endpoint
 * Note: Import cookies from 'next/headers' in your route handler
 */
export async function getCsrfTokenForClient(
  cookieStore: { get: (name: string) => { value: string } | undefined }
): Promise<{ token: string }> {
  let token = cookieStore.get(CSRF_TOKEN_NAME)?.value;

  if (!token) {
    token = generateCsrfToken();
  }

  return { token };
}

/**
 * React hook helper - returns the CSRF token from cookie
 * For client-side usage to include in fetch headers
 */
export function getClientCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  const match = document.cookie.match(new RegExp(`(^| )${CSRF_TOKEN_NAME}=([^;]+)`));
  return match ? match[2] : null;
}

/**
 * Fetch wrapper that automatically includes CSRF token
 */
export async function csrfFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getClientCsrfToken();
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set(CSRF_HEADER_NAME, token);
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
}
