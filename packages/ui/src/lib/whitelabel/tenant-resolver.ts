/**
 * Tenant Resolution System
 * 
 * Handles tenant identification and configuration loading for whitelabeling.
 * Supports multiple resolution strategies including subdomain, custom domain, and path-based routing.
 */

export interface TenantInfo {
  /** Unique tenant identifier */
  id: string;
  
  /** Tenant display name */
  name: string;
  
  /** Tenant domain (subdomain or custom) */
  domain: string;
  
  /** Whether this is a custom domain */
  isCustomDomain: boolean;
  
  /** Tenant status */
  status: 'active' | 'inactive' | 'suspended';
  
  /** Brand configuration overrides */
  brandOverrides?: Record<string, unknown>;
  
  /** Feature flags */
  features?: Record<string, boolean>;
  
  /** Metadata */
  metadata?: Record<string, unknown>;
}

export interface TenantResolverConfig {
  /** Base domain for subdomain resolution */
  baseDomain: string;
  
  /** Enable custom domain resolution */
  enableCustomDomains: boolean;
  
  /** Enable path-based tenant resolution */
  enablePathBasedResolution: boolean;
  
  /** Tenant cache TTL in seconds */
  cacheTTL: number;
  
  /** Fallback tenant ID */
  fallbackTenantId?: string;
}

/**
 * Default tenant resolver configuration
 */
export const defaultTenantResolverConfig: TenantResolverConfig = {
  baseDomain: 'atlvs.io',
  enableCustomDomains: true,
  enablePathBasedResolution: true,
  cacheTTL: 300, // 5 minutes
  fallbackTenantId: 'default',
};

/**
 * Tenant Resolver Class
 * 
 * Handles tenant identification from various sources and caching.
 */
export class TenantResolver {
  private config: TenantResolverConfig;
  private cache: Map<string, { tenant: TenantInfo; expires: number }> = new Map();

  constructor(config: Partial<TenantResolverConfig> = {}) {
    this.config = { ...defaultTenantResolverConfig, ...config };
  }

  /**
   * Resolve tenant from current request context
   */
  async resolveTenant(request?: Request): Promise<TenantInfo> {
    const tenantId = await this.extractTenantId(request);
    
    // Check cache first
    const cached = this.cache.get(tenantId);
    if (cached && cached.expires > Date.now()) {
      return cached.tenant;
    }

    // Load tenant from API
    const tenant = await this.loadTenant(tenantId);
    
    // Cache the result
    this.cache.set(tenantId, {
      tenant,
      expires: Date.now() + (this.config.cacheTTL * 1000),
    });

    return tenant;
  }

  /**
   * Extract tenant ID from request using various strategies
   */
  private async extractTenantId(request?: Request): Promise<string> {
    if (!request && typeof window !== 'undefined') {
      // Browser context - extract from URL
      return this.extractFromBrowser();
    }

    if (request) {
      // Server context - extract from headers/URL
      return this.extractFromRequest(request);
    }

    // Fallback
    return this.config.fallbackTenantId || 'default';
  }

  /**
   * Extract tenant ID from browser context
   */
  private extractFromBrowser(): string {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    // Strategy 1: Subdomain resolution
    if (this.config.enableCustomDomains || hostname.includes('.')) {
      const subdomain = hostname.split('.')[0];
      if (subdomain !== 'www' && subdomain !== 'app') {
        return subdomain;
      }
    }

    // Strategy 2: Path-based resolution
    if (this.config.enablePathBasedResolution) {
      const pathSegments = pathname.split('/').filter(Boolean);
      if (pathSegments.length > 0 && pathSegments[0] !== 'app') {
        return pathSegments[0];
      }
    }

    // Strategy 3: Local storage
    const storedTenant = localStorage.getItem('tenant_id');
    if (storedTenant) {
      return storedTenant;
    }

    return this.config.fallbackTenantId || 'default';
  }

  /**
   * Extract tenant ID from server request
   */
  private extractFromRequest(request: Request): string {
    const hostname = new URL(request.url).hostname;
    const pathname = new URL(request.url).pathname;

    // Strategy 1: Header-based resolution
    const tenantHeader = request.headers.get('x-tenant-id');
    if (tenantHeader) {
      return tenantHeader;
    }

    // Strategy 2: Subdomain resolution
    if (this.config.enableCustomDomains || hostname.includes('.')) {
      const subdomain = hostname.split('.')[0];
      if (subdomain !== 'www' && subdomain !== 'app') {
        return subdomain;
      }
    }

    // Strategy 3: Path-based resolution
    if (this.config.enablePathBasedResolution) {
      const pathSegments = pathname.split('/').filter(Boolean);
      if (pathSegments.length > 0 && pathSegments[0] !== 'app') {
        return pathSegments[0];
      }
    }

    return this.config.fallbackTenantId || 'default';
  }

  /**
   * Load tenant configuration from API
   */
  private async loadTenant(tenantId: string): Promise<TenantInfo> {
    try {
      const response = await fetch(`/api/tenants/${tenantId}`);
      if (!response.ok) {
        throw new Error(`Failed to load tenant: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to load tenant ${tenantId}:`, error);
      
      // Return fallback tenant
      return {
        id: this.config.fallbackTenantId || 'default',
        name: 'Default',
        domain: 'default',
        isCustomDomain: false,
        status: 'active',
      };
    }
  }

  /**
   * Clear tenant cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cached tenant info
   */
  getCachedTenant(tenantId: string): TenantInfo | null {
    const cached = this.cache.get(tenantId);
    if (cached && cached.expires > Date.now()) {
      return cached.tenant;
    }
    return null;
  }

  /**
   * Preload tenant configuration
   */
  async preloadTenant(_tenantId: string): Promise<void> {
    await this.resolveTenant();
  }

  /**
   * Validate tenant domain
   */
  async validateDomain(domain: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/tenants/validate-domain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get all available tenants (admin only)
   */
  async getAllTenants(): Promise<TenantInfo[]> {
    try {
      const response = await fetch('/api/tenants');
      if (!response.ok) {
        throw new Error(`Failed to load tenants: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to load tenants:', error);
      return [];
    }
  }
}

/**
 * Global tenant resolver instance
 */
export const tenantResolver = new TenantResolver();

/**
 * Server-side tenant resolution helper
 */
export const getServerTenant = async (request: Request): Promise<TenantInfo> => {
  return tenantResolver.resolveTenant(request);
};
