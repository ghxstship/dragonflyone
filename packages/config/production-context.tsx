'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase-client';

/**
 * Production Context
 * Provides current production selection and related data across the ATLVS app
 */

export interface Production {
  id: string;
  name: string;
  status: string;
  event_date: string;
  load_in_date: string;
  load_out_date: string;
  budget: number | null;
  sponsorship_target: number | null;
  venue_id: string | null;
  organization_id: string;
}

interface ProductionContextType {
  currentProductionId: string | null;
  currentProduction: Production | null;
  productions: Production[];
  isLoading: boolean;
  setCurrentProductionId: (id: string | null) => void;
  refreshProductions: () => Promise<void>;
}

const ProductionContext = createContext<ProductionContextType | undefined>(undefined);

export function ProductionProvider({ children }: { children: React.ReactNode }) {
  const [currentProductionId, setCurrentProductionId] = useState<string | null>(null);
  const [currentProduction, setCurrentProduction] = useState<Production | null>(null);
  const [productions, setProductions] = useState<Production[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load productions for the current user
  const refreshProductions = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setProductions([]);
        setCurrentProduction(null);
        return;
      }

      // Fetch productions the user has access to
      const { data, error } = await supabase
        .from('productions')
        .select('id, name, status, event_date, load_in_date, load_out_date, budget, sponsorship_target, venue_id, organization_id')
        .order('event_date', { ascending: false });

      if (error) throw error;

      setProductions(data || []);

      // If we have a current production ID, fetch its details
      if (currentProductionId) {
        const production = data?.find(p => p.id === currentProductionId);
        setCurrentProduction(production || null);
      }
    } catch (error) {
      console.error('Failed to load productions:', error);
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

  return (
    <ProductionContext.Provider
      value={{
        currentProductionId,
        currentProduction,
        productions,
        isLoading,
        setCurrentProductionId,
        refreshProductions,
      }}
    >
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
    setCurrentProductionId: () => {},
    refreshProductions: async () => {},
  };
}
