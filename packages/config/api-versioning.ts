/**
 * API Versioning Utilities
 * Provides middleware and utilities for API versioning across all apps
 */

import { NextRequest, NextResponse } from 'next/server';

// =============================================================================
// TYPES
// =============================================================================

export type APIVersion = 'v1' | 'v2';

export interface VersionedAPIConfig {
  /** Current API version */
  currentVersion: APIVersion;
  /** Supported versions */
  supportedVersions: APIVersion[];
  /** Default version for unversioned requests */
  defaultVersion: APIVersion;
  /** Whether to allow unversioned requests */
  allowUnversioned: boolean;
  /** Deprecation warnings */
  deprecatedVersions: APIVersion[];
}

export interface VersionedResponse<T = unknown> {
  /** API version used */
  apiVersion: APIVersion;
  /** Response data */
  data: T;
  /** Metadata */
  meta?: {
    /** Deprecation warning if applicable */
    deprecationWarning?: string;
    /** Suggested upgrade version */
    suggestedVersion?: APIVersion;
    /** Request timestamp */
    timestamp: string;
  };
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface VersionedErrorResponse {
  apiVersion: APIVersion;
  error: APIError;
  meta: {
    timestamp: string;
    requestId?: string;
  };
}

// =============================================================================
// CONFIGURATION
// =============================================================================

export const API_VERSION_CONFIG: VersionedAPIConfig = {
  currentVersion: 'v1',
  supportedVersions: ['v1'],
  defaultVersion: 'v1',
  allowUnversioned: true, // Allow during transition period
  deprecatedVersions: [],
};

// =============================================================================
// VERSION DETECTION
// =============================================================================

/**
 * Extract API version from request
 * Checks URL path, headers, and query params
 */
export function extractAPIVersion(request: NextRequest): APIVersion | null {
  // Check URL path first (/api/v1/...)
  const pathMatch = request.nextUrl.pathname.match(/\/api\/(v\d+)\//);
  if (pathMatch) {
    return pathMatch[1] as APIVersion;
  }
  
  // Check Accept header (Accept: application/vnd.ghxstship.v1+json)
  const acceptHeader = request.headers.get('Accept');
  if (acceptHeader) {
    const versionMatch = acceptHeader.match(/vnd\.ghxstship\.(v\d+)/);
    if (versionMatch) {
      return versionMatch[1] as APIVersion;
    }
  }
  
  // Check custom header (X-API-Version: v1)
  const versionHeader = request.headers.get('X-API-Version');
  if (versionHeader && /^v\d+$/.test(versionHeader)) {
    return versionHeader as APIVersion;
  }
  
  // Check query param (?api_version=v1)
  const queryVersion = request.nextUrl.searchParams.get('api_version');
  if (queryVersion && /^v\d+$/.test(queryVersion)) {
    return queryVersion as APIVersion;
  }
  
  return null;
}

/**
 * Get effective API version for a request
 */
export function getEffectiveVersion(
  request: NextRequest,
  config: VersionedAPIConfig = API_VERSION_CONFIG
): APIVersion {
  const requestedVersion = extractAPIVersion(request);
  
  if (requestedVersion && config.supportedVersions.includes(requestedVersion)) {
    return requestedVersion;
  }
  
  return config.defaultVersion;
}

// =============================================================================
// RESPONSE HELPERS
// =============================================================================

/**
 * Create a versioned API response
 */
export function createVersionedResponse<T>(
  data: T,
  version: APIVersion,
  config: VersionedAPIConfig = API_VERSION_CONFIG
): VersionedResponse<T> {
  const response: VersionedResponse<T> = {
    apiVersion: version,
    data,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
  
  // Add deprecation warning if applicable
  if (config.deprecatedVersions.includes(version)) {
    response.meta = {
      timestamp: response.meta?.timestamp || new Date().toISOString(),
      deprecationWarning: `API version ${version} is deprecated. Please upgrade to ${config.currentVersion}.`,
      suggestedVersion: config.currentVersion,
    };
  }
  
  return response;
}

/**
 * Create a versioned error response
 */
export function createVersionedError(
  error: APIError,
  version: APIVersion,
  requestId?: string
): VersionedErrorResponse {
  return {
    apiVersion: version,
    error,
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };
}

/**
 * Create a NextResponse with versioning headers
 */
export function createAPIResponse<T>(
  data: T,
  request: NextRequest,
  options: {
    status?: number;
    headers?: Record<string, string>;
    config?: VersionedAPIConfig;
  } = {}
): NextResponse {
  const { status = 200, headers = {}, config = API_VERSION_CONFIG } = options;
  const version = getEffectiveVersion(request, config);
  const versionedData = createVersionedResponse(data, version, config);
  
  const responseHeaders = new Headers(headers);
  responseHeaders.set('X-API-Version', version);
  responseHeaders.set('Content-Type', 'application/json');
  
  // Add deprecation header if applicable
  if (config.deprecatedVersions.includes(version)) {
    responseHeaders.set(
      'Deprecation',
      `version="${version}"; date="${new Date().toISOString()}"`
    );
    responseHeaders.set('Sunset', new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString());
  }
  
  return NextResponse.json(versionedData, {
    status,
    headers: responseHeaders,
  });
}

/**
 * Create an error NextResponse with versioning
 */
export function createAPIErrorResponse(
  error: APIError,
  request: NextRequest,
  options: {
    status?: number;
    requestId?: string;
    config?: VersionedAPIConfig;
  } = {}
): NextResponse {
  const { status = 500, requestId, config = API_VERSION_CONFIG } = options;
  const version = getEffectiveVersion(request, config);
  const errorResponse = createVersionedError(error, version, requestId);
  
  return NextResponse.json(errorResponse, {
    status,
    headers: {
      'X-API-Version': version,
      'Content-Type': 'application/json',
    },
  });
}

// =============================================================================
// MIDDLEWARE
// =============================================================================

/**
 * API versioning middleware
 * Validates version and adds version headers to response
 */
export function withAPIVersioning(
  handler: (request: NextRequest, version: APIVersion) => Promise<NextResponse>,
  config: VersionedAPIConfig = API_VERSION_CONFIG
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const requestedVersion = extractAPIVersion(request);
    
    // Check if version is supported
    if (requestedVersion && !config.supportedVersions.includes(requestedVersion)) {
      return createAPIErrorResponse(
        {
          code: 'UNSUPPORTED_API_VERSION',
          message: `API version ${requestedVersion} is not supported. Supported versions: ${config.supportedVersions.join(', ')}`,
        },
        request,
        { status: 400, config }
      );
    }
    
    // Check if unversioned requests are allowed
    if (!requestedVersion && !config.allowUnversioned) {
      return createAPIErrorResponse(
        {
          code: 'API_VERSION_REQUIRED',
          message: `API version is required. Use /api/v1/... or set X-API-Version header. Supported versions: ${config.supportedVersions.join(', ')}`,
        },
        request,
        { status: 400, config }
      );
    }
    
    const effectiveVersion = getEffectiveVersion(request, config);
    
    try {
      const response = await handler(request, effectiveVersion);
      
      // Ensure version header is set
      response.headers.set('X-API-Version', effectiveVersion);
      
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      return createAPIErrorResponse(
        {
          code: 'INTERNAL_ERROR',
          message,
        },
        request,
        { status: 500, config }
      );
    }
  };
}

// =============================================================================
// URL HELPERS
// =============================================================================

/**
 * Add version prefix to API path
 */
export function versionedPath(path: string, version: APIVersion = 'v1'): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Check if already versioned
  if (/^api\/v\d+\//.test(cleanPath)) {
    return `/${cleanPath}`;
  }
  
  // Check if starts with api/
  if (cleanPath.startsWith('api/')) {
    return `/${cleanPath.replace('api/', `api/${version}/`)}`;
  }
  
  return `/api/${version}/${cleanPath}`;
}

/**
 * Remove version prefix from API path
 */
export function unversionedPath(path: string): string {
  return path.replace(/\/api\/v\d+\//, '/api/');
}

/**
 * Check if path is versioned
 */
export function isVersionedPath(path: string): boolean {
  return /\/api\/v\d+\//.test(path);
}

/**
 * Get version from path
 */
export function getVersionFromPath(path: string): APIVersion | null {
  const match = path.match(/\/api\/(v\d+)\//);
  return match ? (match[1] as APIVersion) : null;
}
