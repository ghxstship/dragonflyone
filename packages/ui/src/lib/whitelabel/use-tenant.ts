"use client";

import { useState, useEffect } from "react";
import { tenantResolver, type TenantInfo } from "./tenant-resolver.js";

/**
 * Hook for resolving current tenant
 */
export const useTenant = () => {
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTenant = async () => {
      try {
        setLoading(true);
        setError(null);
        const resolvedTenant = await tenantResolver.resolveTenant();
        setTenant(resolvedTenant);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tenant');
      } finally {
        setLoading(false);
      }
    };

    loadTenant();
  }, []);

  return { tenant, loading, error, refetch: () => tenantResolver.resolveTenant().then(setTenant) };
};
