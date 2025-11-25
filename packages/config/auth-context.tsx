'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PlatformRole, EventRole } from './roles';

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
    // Load user from session/localStorage
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('ghxstship_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Use Supabase authentication
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration missing');
      }

      const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error_description || 'Authentication failed');
      }

      const authData = await response.json();
      
      // Fetch user profile and roles from platform_users table
      const profileResponse = await fetch(`${supabaseUrl}/rest/v1/platform_users?id=eq.${authData.user.id}&select=*`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${authData.access_token}`,
        },
      });

      let platformRoles: PlatformRole[] = [PlatformRole.GVTEWAY_MEMBER];
      let eventRolesByEvent: Record<string, EventRole[]> = {};

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData.length > 0) {
          platformRoles = profileData[0].platform_roles || [PlatformRole.GVTEWAY_MEMBER];
          eventRolesByEvent = profileData[0].event_roles || {};
        }
      }

      const authenticatedUser: User = {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata?.full_name || email.split('@')[0],
        platformRoles,
        eventRolesByEvent,
        avatar: authData.user.user_metadata?.avatar_url,
      };
      
      setUser(authenticatedUser);
      localStorage.setItem('ghxstship_user', JSON.stringify(authenticatedUser));
      localStorage.setItem('ghxstship_access_token', authData.access_token);
      localStorage.setItem('ghxstship_refresh_token', authData.refresh_token);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Optionally call Supabase logout endpoint
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const accessToken = localStorage.getItem('ghxstship_access_token');
      
      if (supabaseUrl && supabaseAnonKey && accessToken) {
        await fetch(`${supabaseUrl}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${accessToken}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('ghxstship_user');
      localStorage.removeItem('ghxstship_access_token');
      localStorage.removeItem('ghxstship_refresh_token');
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

  const hasPermission = (permission: string, eventId?: string): boolean => {
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
