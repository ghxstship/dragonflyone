'use client';

/**
 * Dashboard Layout with AppSwitcher Integration
 * Gap 10 Remediation: Cross-app navigation
 */

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Container, Body, Spinner } from '@ghxstship/ui';

const createClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchUserRoles() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data } = await supabase
          .from('platform_users')
          .select('platform_roles')
          .eq('id', user.id)
          .single();
        
        if (data?.platform_roles) {
          setUserRoles(data.platform_roles);
        }
      }
      
      setLoading(false);
    }

    fetchUserRoles();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Top Navigation Bar with AppSwitcher */}
      <header className="sticky top-0 z-40 bg-surface-primary border-b-2 border-ink-muted">
        <Container>
          <div className="flex items-center justify-between h-16">
            {/* Logo / Brand */}
            <div className="flex items-center gap-4">
              <div className="px-3 py-2 bg-primary text-on-dark-primary rounded-button font-weight-bold">
                ATLVS
              </div>
              <Body className="font-weight-bold text-ink-primary hidden md:block">
                ATLVS Dashboard
              </Body>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
              <Body className="text-ink-secondary text-body-sm">
                {userRoles.length > 0 ? userRoles[0].replace(/_/g, ' ') : 'User'}
              </Body>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
}
