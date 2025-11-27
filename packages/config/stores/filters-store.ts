import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { StoreApi, UseBoundStore } from 'zustand';

/**
 * Filters Store
 * Manages filter state across different views and applications
 */
interface FiltersState {
  // Event filters (GVTEWAY)
  eventFilters: {
    category?: string[];
    dateRange?: { start: string; end: string };
    priceRange?: { min: number; max: number };
    location?: string;
    status?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
  
  // Project filters (ATLVS)
  projectFilters: {
    status?: string[];
    client?: string[];
    manager?: string[];
    dateRange?: { start: string; end: string };
    budgetRange?: { min: number; max: number };
    health?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
  
  // Crew filters (COMPVSS)
  crewFilters: {
    skills?: string[];
    availability?: string;
    certifications?: string[];
    experience?: { min: number; max: number };
    rate?: { min: number; max: number };
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
  
  // Actions
  setEventFilters: (filters: Partial<FiltersState['eventFilters']>) => void;
  resetEventFilters: () => void;
  
  setProjectFilters: (filters: Partial<FiltersState['projectFilters']>) => void;
  resetProjectFilters: () => void;
  
  setCrewFilters: (filters: Partial<FiltersState['crewFilters']>) => void;
  resetCrewFilters: () => void;
  
  resetAllFilters: () => void;
}

const defaultEventFilters = {
  sortBy: 'start_date',
  sortOrder: 'asc' as const,
};

const defaultProjectFilters = {
  sortBy: 'created_at',
  sortOrder: 'desc' as const,
};

const defaultCrewFilters = {
  sortBy: 'name',
  sortOrder: 'asc' as const,
};

export const useFiltersStore: UseBoundStore<StoreApi<FiltersState>> = create<FiltersState>()(
  devtools(
    persist(
      immer((set) => ({
        // Initial state
        eventFilters: defaultEventFilters,
        projectFilters: defaultProjectFilters,
        crewFilters: defaultCrewFilters,

        // Event filter actions
        setEventFilters: (filters) =>
          set((state) => {
            state.eventFilters = { ...state.eventFilters, ...filters };
          }),

        resetEventFilters: () =>
          set((state) => {
            state.eventFilters = defaultEventFilters;
          }),

        // Project filter actions
        setProjectFilters: (filters) =>
          set((state) => {
            state.projectFilters = { ...state.projectFilters, ...filters };
          }),

        resetProjectFilters: () =>
          set((state) => {
            state.projectFilters = defaultProjectFilters;
          }),

        // Crew filter actions
        setCrewFilters: (filters) =>
          set((state) => {
            state.crewFilters = { ...state.crewFilters, ...filters };
          }),

        resetCrewFilters: () =>
          set((state) => {
            state.crewFilters = defaultCrewFilters;
          }),

        // Reset all
        resetAllFilters: () =>
          set((state) => {
            state.eventFilters = defaultEventFilters;
            state.projectFilters = defaultProjectFilters;
            state.crewFilters = defaultCrewFilters;
          }),
      })),
      {
        name: 'ghxstship-filters-store',
      }
    ),
    { name: 'Filters Store' }
  )
);
