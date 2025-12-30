'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from './supabase-client';

/**
 * Production Context
 * Provides current production selection and related data across the ATLVS app
 */

export interface Production {
  id: string;
  name: string;
  status: string | null;
  start_datetime: string | null;
  end_datetime: string | null;
  organization_id: string;
}

interface ProductionContextType {
  currentProductionId: string | null;
  currentProduction: Production | null;
  productions: Production[];
  isLoading: boolean;
  error: string | null;
  setCurrentProductionId: (id: string | null) => void;
  refreshProductions: () => Promise<void>;
  clearError: () => void;
}

const ProductionContext = createContext<ProductionContextType | undefined>(undefined);

export function ProductionProvider({ children }: { children: React.ReactNode }) {
  const [currentProductionId, setCurrentProductionId] = useState<string | null>(null);
  const [currentProduction, setCurrentProduction] = useState<Production | null>(null);
  const [productions, setProductions] = useState<Production[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load productions for the current user
  const refreshProductions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setProductions([]);
        setCurrentProduction(null);
        return;
      }

      // Use legend_events for productions (3NF pattern - productions are events with production profile)
      const { data, error: fetchError } = await supabase
        .from('legend_events')
        .select('id, name, status, start_datetime, end_datetime, organization_id')
        .eq('event_type', 'production')
        .order('start_datetime', { ascending: false });

      if (fetchError) throw fetchError;

      setProductions(data || []);

      if (currentProductionId) {
        const production = data?.find(p => p.id === currentProductionId);
        setCurrentProduction(production || null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load productions';
      setError(errorMessage);
      setProductions([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentProductionId]);

  // Load productions on mount
  useEffect(() => {
    refreshProductions();
  }, [refreshProductions]);

  // Update current production when ID changes
  useEffect(() => {
    if (currentProductionId && productions.length > 0) {
      const production = productions.find(p => p.id === currentProductionId);
      setCurrentProduction(production || null);
    } else {
      setCurrentProduction(null);
    }
  }, [currentProductionId, productions]);

  // Persist current production ID to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentProductionId) {
        localStorage.setItem('currentProductionId', currentProductionId);
      } else {
        localStorage.removeItem('currentProductionId');
      }
    }
  }, [currentProductionId]);

  // Load persisted production ID on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedId = localStorage.getItem('currentProductionId');
      if (savedId) {
        setCurrentProductionId(savedId);
      }
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<ProductionContextType>(() => ({
    currentProductionId,
    currentProduction,
    productions,
    isLoading,
    error,
    setCurrentProductionId,
    refreshProductions,
    clearError,
  }), [currentProductionId, currentProduction, productions, isLoading, error, refreshProductions, clearError]);

  return (
    <ProductionContext.Provider value={value}>
      {children}
    </ProductionContext.Provider>
  );
}

export function useProductionContext() {
  const context = useContext(ProductionContext);
  if (context === undefined) {
    throw new Error('useProductionContext must be used within a ProductionProvider');
  }
  return context;
}

// Safe version that returns defaults if not in provider
export function useProductionContextSafe() {
  const context = useContext(ProductionContext);
  return context ?? {
    currentProductionId: null,
    currentProduction: null,
    productions: [],
    isLoading: false,
    error: null,
    setCurrentProductionId: () => {},
    refreshProductions: async () => {},
    clearError: () => {},
  };
}
