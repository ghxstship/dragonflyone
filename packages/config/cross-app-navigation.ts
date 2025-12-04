/**
 * Cross-App Navigation Utilities
 * Handles deep linking between ATLVS, COMPVSS, and GVTEWAY applications
 */

export type AppName = 'atlvs' | 'compvss' | 'gvteway';

export interface AppConfig {
  name: AppName;
  displayName: string;
  baseUrl: string;
  description: string;
}

export interface DeepLinkParams {
  app: AppName;
  path: string;
  productionId?: string;
  eventId?: string;
  params?: Record<string, string>;
}

export interface CrossAppLink {
  app: AppName;
  label: string;
  path: string;
  description?: string;
}

// App configuration - URLs should be configured via environment variables
export const APP_CONFIG: Record<AppName, AppConfig> = {
  atlvs: {
    name: 'atlvs',
    displayName: 'ATLVS',
    baseUrl: process.env.NEXT_PUBLIC_ATLVS_URL || 'http://localhost:3001',
    description: 'Production Planning & Management',
  },
  compvss: {
    name: 'compvss',
    displayName: 'COMPVSS',
    baseUrl: process.env.NEXT_PUBLIC_COMPVSS_URL || 'http://localhost:3002',
    description: 'Crew & Operations Management',
  },
  gvteway: {
    name: 'gvteway',
    displayName: 'GVTEWAY',
    baseUrl: process.env.NEXT_PUBLIC_GVTEWAY_URL || 'http://localhost:3003',
    description: 'Fan Experience Platform',
  },
};

/**
 * Generate a deep link URL for cross-app navigation
 */
export function generateDeepLink(params: DeepLinkParams): string {
  const { app, path, productionId, eventId, params: queryParams } = params;
  const config = APP_CONFIG[app];
  
  let url = config.baseUrl;
  
  // Build the path with context
  if (productionId && (app === 'atlvs' || app === 'compvss')) {
    url += `/p/${productionId}${path.startsWith('/') ? path : `/${path}`}`;
  } else if (eventId && app === 'gvteway') {
    url += `/e/${eventId}${path.startsWith('/') ? path : `/${path}`}`;
  } else {
    url += path.startsWith('/') ? path : `/${path}`;
  }
  
  // Add query parameters
  if (queryParams && Object.keys(queryParams).length > 0) {
    const searchParams = new URLSearchParams(queryParams);
    url += `?${searchParams.toString()}`;
  }
  
  return url;
}

/**
 * Parse a deep link URL to extract app and context information
 */
export function parseDeepLink(url: string): DeepLinkParams | null {
  try {
    const parsed = new URL(url);
    
    // Determine which app based on hostname or port
    let app: AppName | null = null;
    for (const [name, config] of Object.entries(APP_CONFIG)) {
      if (parsed.origin === config.baseUrl || parsed.hostname.includes(name)) {
        app = name as AppName;
        break;
      }
    }
    
    if (!app) return null;
    
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    let productionId: string | undefined;
    let eventId: string | undefined;
    let path = parsed.pathname;
    
    // Extract production/event context
    if (pathParts[0] === 'p' && pathParts[1]) {
      productionId = pathParts[1];
      path = '/' + pathParts.slice(2).join('/');
    } else if (pathParts[0] === 'e' && pathParts[1]) {
      eventId = pathParts[1];
      path = '/' + pathParts.slice(2).join('/');
    }
    
    // Extract query params
    const params: Record<string, string> = {};
    parsed.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return {
      app,
      path,
      productionId,
      eventId,
      params: Object.keys(params).length > 0 ? params : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Get cross-app links for a production context
 * Returns links to related sections in other apps
 */
export function getProductionCrossAppLinks(productionId: string): CrossAppLink[] {
  return [
    {
      app: 'atlvs',
      label: 'Production Planning',
      path: `/p/${productionId}/overview`,
      description: 'View production details and planning',
    },
    {
      app: 'atlvs',
      label: 'Finance',
      path: `/p/${productionId}/finance`,
      description: 'Budgets, expenses, and sponsors',
    },
    {
      app: 'compvss',
      label: 'Crew Management',
      path: `/p/${productionId}/crew`,
      description: 'Crew assignments and schedules',
    },
    {
      app: 'compvss',
      label: 'Operations',
      path: `/p/${productionId}/operations`,
      description: 'Stage management and logistics',
    },
  ];
}

/**
 * Get cross-app links for an event context
 * Returns links to related sections in other apps
 */
export function getEventCrossAppLinks(eventId: string, productionId?: string): CrossAppLink[] {
  const links: CrossAppLink[] = [
    {
      app: 'gvteway',
      label: 'Fan Experience',
      path: `/e/${eventId}`,
      description: 'Event landing page for fans',
    },
    {
      app: 'gvteway',
      label: 'Event Program',
      path: `/e/${eventId}/program`,
      description: 'Schedule and set times',
    },
  ];
  
  if (productionId) {
    links.push(
      {
        app: 'atlvs',
        label: 'Production Details',
        path: `/p/${productionId}/overview`,
        description: 'Production planning and management',
      },
      {
        app: 'compvss',
        label: 'Crew Operations',
        path: `/p/${productionId}/overview`,
        description: 'Crew and operations status',
      }
    );
  }
  
  return links;
}

/**
 * Navigate to another app (opens in new tab by default)
 */
export function navigateCrossApp(
  params: DeepLinkParams,
  options: { newTab?: boolean } = { newTab: true }
): void {
  const url = generateDeepLink(params);
  
  if (typeof window !== 'undefined') {
    if (options.newTab) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = url;
    }
  }
}

/**
 * Check if a URL is a cross-app link
 */
export function isCrossAppLink(url: string, currentApp: AppName): boolean {
  const parsed = parseDeepLink(url);
  return parsed !== null && parsed.app !== currentApp;
}
