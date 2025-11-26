'use client';

import { useRouter } from 'next/navigation';
import { ProtectedRoute as SharedProtectedRoute } from '@ghxstship/ui';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  return (
    <SharedProtectedRoute 
      useAuth={useAuth}
      redirectPath="/auth/signin"
      loadingText="Loading..."
      onUnauthenticated={(path) => router.push(path)}
    >
      {children}
    </SharedProtectedRoute>
  );
}
