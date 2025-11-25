'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { Stack, Body, LoadingSpinner } from '@ghxstship/ui';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Stack className="flex min-h-screen items-center justify-center bg-black text-white">
        <LoadingSpinner size="lg" text="Loading..." />
      </Stack>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
