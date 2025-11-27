'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Database } from './supabase-types';

/**
 * App Context Provider
 * Manages the hierarchical navigation context: Organization → Team → Workspace → Project → Activation
 * Provides Vercel-style context switching with persistence
 */

// Type aliases for cleaner code
type Organization = Database['public']['Tables']['organizations']['Row'];
type Team = Database['public']['Tables']['teams']['Row'];
type Workspace = Database['public']['Tables']['workspaces']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];
type Activation = Database['public']['Tables']['activations']['Row'];

// Simplified context item for breadcrumb display
export interface ContextItem {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  color?: string | null;
  badge?: string;
}

// Recent item for quick access
export interface RecentItem {
  type: 'organization' | 'team' | 'workspace' | 'project' | 'activation';
  id: string;
  name: string;
  slug: string;
  timestamp: number;
}

// Full context state
export interface AppContextState {
  // Current selections
  organization: Organization | null;
  team: Team | null;
  workspace: Workspace | null;
  project: Project | null;
  activation: Activation | null;
  
  // Available options (loaded from API)
  organizations: Organization[];
  teams: Team[];
  workspaces: Workspace[];
  projects: Project[];
  activations: Activation[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Recent/pinned items
  recentItems: RecentItem[];
  pinnedOrganizations: string[];
  pinnedProjects: string[];
}

export interface AppContextActions {
  // Selection actions
  setOrganization: (org: Organization | null) => void;
  setTeam: (team: Team | null) => void;
  setWorkspace: (workspace: Workspace | null) => void;
  setProject: (project: Project | null) => void;
  setActivation: (activation: Activation | null) => void;
  
  // Navigation helpers
  selectOrganizationById: (id: string) => Promise<void>;
  selectProjectById: (id: string) => Promise<void>;
  selectActivationById: (id: string) => Promise<void>;
  
  // Data loading
  loadOrganizations: () => Promise<void>;
  loadTeams: (orgId: string) => Promise<void>;
  loadWorkspaces: (orgId: string, teamId?: string) => Promise<void>;
  loadProjects: (orgId: string, workspaceId?: string) => Promise<void>;
  loadActivations: (orgId: string, projectId?: string, eventId?: string) => Promise<void>;
  
  // Search
  searchOrganizations: (query: string) => Promise<ContextItem[]>;
  searchProjects: (query: string) => Promise<ContextItem[]>;
  searchActivations: (query: string) => Promise<ContextItem[]>;
  
  // Pinning
  togglePinOrganization: (id: string) => void;
  togglePinProject: (id: string) => void;
  
  // Persistence
  persistContext: () => void;
  clearContext: () => void;
}

export type AppContextValue = AppContextState & AppContextActions;

const AppContext = createContext<AppContextValue | undefined>(undefined);

// Storage keys
const STORAGE_KEY_PREFIX = 'ghxstship_context';
const getStorageKey = (platform: string) => `${STORAGE_KEY_PREFIX}_${platform}`;

interface AppContextProviderProps {
  children: React.ReactNode;
  platform: 'atlvs' | 'compvss' | 'gvteway';
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export function AppContextProvider({ 
  children, 
  platform,
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
}: AppContextProviderProps) {
  // State
  const [organization, setOrganizationState] = useState<Organization | null>(null);
  const [team, setTeamState] = useState<Team | null>(null);
  const [workspace, setWorkspaceState] = useState<Workspace | null>(null);
  const [project, setProjectState] = useState<Project | null>(null);
  const [activation, setActivationState] = useState<Activation | null>(null);
  
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activations, setActivations] = useState<Activation[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [pinnedOrganizations, setPinnedOrganizations] = useState<string[]>([]);
  const [pinnedProjects, setPinnedProjects] = useState<string[]>([]);

  // Helper to make authenticated API calls
  const fetchWithAuth = useCallback(async (endpoint: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing');
    }
    
    const accessToken = typeof window !== 'undefined' 
      ? localStorage.getItem('ghxstship_access_token') 
      : null;
    
    const response = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': accessToken ? `Bearer ${accessToken}` : `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  }, [supabaseUrl, supabaseAnonKey]);

  // Add to recent items
  const addRecentItem = useCallback((item: Omit<RecentItem, 'timestamp'>) => {
    setRecentItems(prev => {
      const filtered = prev.filter(r => !(r.type === item.type && r.id === item.id));
      const newItem = { ...item, timestamp: Date.now() };
      return [newItem, ...filtered].slice(0, 10); // Keep last 10
    });
  }, []);

  // Load organizations
  const loadOrganizations = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchWithAuth('organizations?select=*&order=name');
      setOrganizations(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organizations');
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithAuth]);

  // Load teams for an organization
  const loadTeams = useCallback(async (orgId: string) => {
    try {
      const data = await fetchWithAuth(`teams?organization_id=eq.${orgId}&select=*&order=name`);
      setTeams(data || []);
    } catch (err) {
      console.error('Failed to load teams:', err);
    }
  }, [fetchWithAuth]);

  // Load workspaces
  const loadWorkspaces = useCallback(async (orgId: string, teamId?: string) => {
    try {
      let query = `workspaces?organization_id=eq.${orgId}&select=*&order=name`;
      if (teamId) {
        query += `&team_id=eq.${teamId}`;
      }
      const data = await fetchWithAuth(query);
      setWorkspaces(data || []);
    } catch (err) {
      console.error('Failed to load workspaces:', err);
    }
  }, [fetchWithAuth]);

  // Load projects
  const loadProjects = useCallback(async (orgId: string, workspaceId?: string) => {
    try {
      let query = `projects?organization_id=eq.${orgId}&select=*&order=name`;
      // If workspace specified, we'd need to join through workspace_projects
      const data = await fetchWithAuth(query);
      setProjects(data || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  }, [fetchWithAuth]);

  // Load activations
  const loadActivations = useCallback(async (orgId: string, projectId?: string, eventId?: string) => {
    try {
      let query = `activations?organization_id=eq.${orgId}&select=*&order=name`;
      if (projectId) {
        query += `&project_id=eq.${projectId}`;
      }
      if (eventId) {
        query += `&event_id=eq.${eventId}`;
      }
      const data = await fetchWithAuth(query);
      setActivations(data || []);
    } catch (err) {
      console.error('Failed to load activations:', err);
    }
  }, [fetchWithAuth]);

  // Selection handlers with cascading updates
  const setOrganization = useCallback((org: Organization | null) => {
    setOrganizationState(org);
    // Clear child selections when org changes
    setTeamState(null);
    setWorkspaceState(null);
    setProjectState(null);
    setActivationState(null);
    setTeams([]);
    setWorkspaces([]);
    setProjects([]);
    setActivations([]);
    
    if (org) {
      addRecentItem({ type: 'organization', id: org.id, name: org.name, slug: org.slug });
      // Load child data
      loadTeams(org.id);
      loadProjects(org.id);
    }
  }, [addRecentItem, loadTeams, loadProjects]);

  const setTeam = useCallback((t: Team | null) => {
    setTeamState(t);
    setWorkspaceState(null);
    setWorkspaces([]);
    
    if (t && organization) {
      loadWorkspaces(organization.id, t.id);
    }
  }, [organization, loadWorkspaces]);

  const setWorkspace = useCallback((ws: Workspace | null) => {
    setWorkspaceState(ws);
  }, []);

  const setProject = useCallback((proj: Project | null) => {
    setProjectState(proj);
    setActivationState(null);
    setActivations([]);
    
    if (proj) {
      addRecentItem({ type: 'project', id: proj.id, name: proj.name, slug: proj.name.toLowerCase().replace(/\s+/g, '-') });
      if (organization) {
        loadActivations(organization.id, proj.id);
      }
    }
  }, [organization, addRecentItem, loadActivations]);

  const setActivation = useCallback((act: Activation | null) => {
    setActivationState(act);
    if (act) {
      addRecentItem({ type: 'activation', id: act.id, name: act.name, slug: act.slug });
    }
  }, [addRecentItem]);

  // Select by ID helpers
  const selectOrganizationById = useCallback(async (id: string) => {
    const org = organizations.find(o => o.id === id);
    if (org) {
      setOrganization(org);
    } else {
      // Fetch if not in cache
      try {
        const data = await fetchWithAuth(`organizations?id=eq.${id}&select=*`);
        if (data && data.length > 0) {
          setOrganization(data[0]);
        }
      } catch (err) {
        console.error('Failed to select organization:', err);
      }
    }
  }, [organizations, setOrganization, fetchWithAuth]);

  const selectProjectById = useCallback(async (id: string) => {
    const proj = projects.find(p => p.id === id);
    if (proj) {
      setProject(proj);
    } else {
      try {
        const data = await fetchWithAuth(`projects?id=eq.${id}&select=*`);
        if (data && data.length > 0) {
          setProject(data[0]);
        }
      } catch (err) {
        console.error('Failed to select project:', err);
      }
    }
  }, [projects, setProject, fetchWithAuth]);

  const selectActivationById = useCallback(async (id: string) => {
    const act = activations.find(a => a.id === id);
    if (act) {
      setActivation(act);
    } else {
      try {
        const data = await fetchWithAuth(`activations?id=eq.${id}&select=*`);
        if (data && data.length > 0) {
          setActivation(data[0]);
        }
      } catch (err) {
        console.error('Failed to select activation:', err);
      }
    }
  }, [activations, setActivation, fetchWithAuth]);

  // Search functions
  const searchOrganizations = useCallback(async (query: string): Promise<ContextItem[]> => {
    if (!query.trim()) {
      return organizations.map(o => ({
        id: o.id,
        name: o.name,
        slug: o.slug,
      }));
    }
    
    const filtered = organizations.filter(o => 
      o.name.toLowerCase().includes(query.toLowerCase()) ||
      o.slug.toLowerCase().includes(query.toLowerCase())
    );
    
    return filtered.map(o => ({
      id: o.id,
      name: o.name,
      slug: o.slug,
    }));
  }, [organizations]);

  const searchProjects = useCallback(async (query: string): Promise<ContextItem[]> => {
    if (!query.trim()) {
      return projects.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.name.toLowerCase().replace(/\s+/g, '-'),
        badge: p.phase,
      }));
    }
    
    const filtered = projects.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase())
    );
    
    return filtered.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.name.toLowerCase().replace(/\s+/g, '-'),
      badge: p.phase,
    }));
  }, [projects]);

  const searchActivations = useCallback(async (query: string): Promise<ContextItem[]> => {
    if (!query.trim()) {
      return activations.map(a => ({
        id: a.id,
        name: a.name,
        slug: a.slug,
        icon: a.icon,
        color: a.color,
        badge: a.category,
      }));
    }
    
    const filtered = activations.filter(a => 
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.slug.toLowerCase().includes(query.toLowerCase()) ||
      (a.code && a.code.toLowerCase().includes(query.toLowerCase()))
    );
    
    return filtered.map(a => ({
      id: a.id,
      name: a.name,
      slug: a.slug,
      icon: a.icon,
      color: a.color,
      badge: a.category,
    }));
  }, [activations]);

  // Pinning
  const togglePinOrganization = useCallback((id: string) => {
    setPinnedOrganizations(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }, []);

  const togglePinProject = useCallback((id: string) => {
    setPinnedProjects(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }, []);

  // Persistence
  const persistContext = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const data = {
      organizationId: organization?.id,
      teamId: team?.id,
      workspaceId: workspace?.id,
      projectId: project?.id,
      activationId: activation?.id,
      recentItems,
      pinnedOrganizations,
      pinnedProjects,
    };
    
    localStorage.setItem(getStorageKey(platform), JSON.stringify(data));
  }, [platform, organization, team, workspace, project, activation, recentItems, pinnedOrganizations, pinnedProjects]);

  const clearContext = useCallback(() => {
    setOrganizationState(null);
    setTeamState(null);
    setWorkspaceState(null);
    setProjectState(null);
    setActivationState(null);
    setRecentItems([]);
    setPinnedOrganizations([]);
    setPinnedProjects([]);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(getStorageKey(platform));
    }
  }, [platform]);

  // Load persisted context on mount
  useEffect(() => {
    const loadPersistedContext = async () => {
      if (typeof window === 'undefined') return;
      
      try {
        const stored = localStorage.getItem(getStorageKey(platform));
        if (stored) {
          const data = JSON.parse(stored);
          setRecentItems(data.recentItems || []);
          setPinnedOrganizations(data.pinnedOrganizations || []);
          setPinnedProjects(data.pinnedProjects || []);
          
          // Load organizations first
          await loadOrganizations();
          
          // Then restore selections
          if (data.organizationId) {
            await selectOrganizationById(data.organizationId);
          }
          if (data.projectId) {
            await selectProjectById(data.projectId);
          }
          if (data.activationId) {
            await selectActivationById(data.activationId);
          }
        } else {
          await loadOrganizations();
        }
      } catch (err) {
        console.error('Failed to load persisted context:', err);
        await loadOrganizations();
      }
    };
    
    loadPersistedContext();
  }, [platform]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-persist on changes
  useEffect(() => {
    persistContext();
  }, [organization, team, workspace, project, activation, recentItems, pinnedOrganizations, pinnedProjects]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo<AppContextValue>(() => ({
    // State
    organization,
    team,
    workspace,
    project,
    activation,
    organizations,
    teams,
    workspaces,
    projects,
    activations,
    isLoading,
    error,
    recentItems,
    pinnedOrganizations,
    pinnedProjects,
    
    // Actions
    setOrganization,
    setTeam,
    setWorkspace,
    setProject,
    setActivation,
    selectOrganizationById,
    selectProjectById,
    selectActivationById,
    loadOrganizations,
    loadTeams,
    loadWorkspaces,
    loadProjects,
    loadActivations,
    searchOrganizations,
    searchProjects,
    searchActivations,
    togglePinOrganization,
    togglePinProject,
    persistContext,
    clearContext,
  }), [
    organization, team, workspace, project, activation,
    organizations, teams, workspaces, projects, activations,
    isLoading, error, recentItems, pinnedOrganizations, pinnedProjects,
    setOrganization, setTeam, setWorkspace, setProject, setActivation,
    selectOrganizationById, selectProjectById, selectActivationById,
    loadOrganizations, loadTeams, loadWorkspaces, loadProjects, loadActivations,
    searchOrganizations, searchProjects, searchActivations,
    togglePinOrganization, togglePinProject, persistContext, clearContext,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
}

// Convenience hooks for specific context levels
export function useOrganization() {
  const { organization, organizations, setOrganization, searchOrganizations, isLoading } = useAppContext();
  return { organization, organizations, setOrganization, searchOrganizations, isLoading };
}

export function useProject() {
  const { project, projects, setProject, searchProjects, isLoading } = useAppContext();
  return { project, projects, setProject, searchProjects, isLoading };
}

export function useActivation() {
  const { activation, activations, setActivation, searchActivations, isLoading } = useAppContext();
  return { activation, activations, setActivation, searchActivations, isLoading };
}

export function useTeam() {
  const { team, teams, setTeam, isLoading } = useAppContext();
  return { team, teams, setTeam, isLoading };
}

export function useWorkspace() {
  const { workspace, workspaces, setWorkspace, isLoading } = useAppContext();
  return { workspace, workspaces, setWorkspace, isLoading };
}
