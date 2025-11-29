'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PlatformRole, EventRole } from './roles';
import { supabase } from './supabase-client';

/**
 * User Authentication & Role Context
 * Provides user session, roles, and permission checking
 */

export interface User {
  id: string;
  email: string;
  name: string;
  platformRoles: PlatformRole[];
  eventRolesByEvent: Record<string, EventRole[]>;
  impersonationPermissions?: string[];
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: PlatformRole) => boolean;
  hasEventRole: (eventId: string, role: EventRole) => boolean;
  hasPermission: (permission: string, eventId?: string) => boolean;
  canAccessPlatform: (platform: 'atlvs' | 'compvss' | 'gvteway') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing Supabase session
    const loadUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Fetch user profile and roles
          const { data: platformUser } = await supabase
            .from('platform_users')
            .select('id')
            .eq('auth_user_id', session.user.id)
            .single();

          let platformRoles: PlatformRole[] = [PlatformRole.GVTEWAY_MEMBER];

          if (platformUser) {
            const { data: userRoles } = await supabase
              .from('user_roles')
              .select('role_code')
              .eq('platform_user_id', platformUser.id);

            if (userRoles && userRoles.length > 0) {
              platformRoles = userRoles.map(r => r.role_code as PlatformRole);
            }
          }

          const authenticatedUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
            platformRoles,
            eventRolesByEvent: {},
            avatar: session.user.user_metadata?.avatar_url,
          };
          
          setUser(authenticatedUser);
          localStorage.setItem('ghxstship_user', JSON.stringify(authenticatedUser));
        } else {
          // Try localStorage as fallback
          const storedUser = localStorage.getItem('ghxstship_user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, _session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('ghxstship_user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Use Supabase client for authentication (handles cookies automatically)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message || 'Authentication failed');
      }

      if (!authData.user) {
        throw new Error('No user returned from authentication');
      }

      // Fetch user profile and roles from platform_users table
      const { data: platformUser } = await supabase
        .from('platform_users')
        .select('id')
        .eq('auth_user_id', authData.user.id)
        .single();

      let platformRoles: PlatformRole[] = [PlatformRole.GVTEWAY_MEMBER];
      const eventRolesByEvent: Record<string, EventRole[]> = {};

      if (platformUser) {
        // Get user roles
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role_code')
          .eq('platform_user_id', platformUser.id);

        if (userRoles && userRoles.length > 0) {
          platformRoles = userRoles.map(r => r.role_code as PlatformRole);
        }
      }

      const authenticatedUser: User = {
        id: authData.user.id,
        email: authData.user.email || email,
        name: authData.user.user_metadata?.full_name || email.split('@')[0],
        platformRoles,
        eventRolesByEvent,
        avatar: authData.user.user_metadata?.avatar_url,
      };
      
      setUser(authenticatedUser);
      localStorage.setItem('ghxstship_user', JSON.stringify(authenticatedUser));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('ghxstship_user');
    }
  };

  const hasRole = (role: PlatformRole): boolean => {
    if (!user) return false;
    return user.platformRoles.includes(role);
  };

  const hasEventRole = (eventId: string, role: EventRole): boolean => {
    if (!user) return false;
    const eventRoles = user.eventRolesByEvent[eventId] || [];
    return eventRoles.includes(role);
  };

  const hasPermission = (_permission: string, _eventId?: string): boolean => {
    if (!user) return false;
    
    // Legend roles have all permissions
    const hasLegendRole = user.platformRoles.some(r => r.startsWith('LEGEND_'));
    if (hasLegendRole) return true;

    // Check platform admin roles
    const isAdmin = user.platformRoles.some(r => 
      r.includes('ADMIN') || r.includes('SUPER_ADMIN')
    );
    if (isAdmin) return true;

    // TODO: Implement detailed permission checking
    return false;
  };

  const canAccessPlatform = (platform: 'atlvs' | 'compvss' | 'gvteway'): boolean => {
    if (!user) return false;

    // Legend roles can access everything
    const hasLegendRole = user.platformRoles.some(r => r.startsWith('LEGEND_'));
    if (hasLegendRole) return true;

    // Check platform-specific roles
    const platformPrefix = platform.toUpperCase();
    return user.platformRoles.some(r => r.startsWith(platformPrefix));
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole,
    hasEventRole,
    hasPermission,
    canAccessPlatform,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Role-based component wrapper
export function RequireRole({
  roles,
  children,
  fallback,
}: {
  roles: PlatformRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { user, hasRole } = useAuth();

  if (!user) {
    return fallback || null;
  }

  const hasRequiredRole = roles.some(role => hasRole(role));
  
  if (!hasRequiredRole) {
    return fallback || null;
  }

  return <>{children}</>;
}

// Platform access wrapper
export function RequirePlatformAccess({
  platform,
  children,
  fallback,
}: {
  platform: 'atlvs' | 'compvss' | 'gvteway';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { canAccessPlatform } = useAuth();

  if (!canAccessPlatform(platform)) {
    return fallback || null;
  }

  return <>{children}</>;
}
