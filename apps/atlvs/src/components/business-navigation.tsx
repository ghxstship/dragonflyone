'use client';

import { useRouter } from 'next/navigation';
import { Button, Nav } from '@ghxstship/ui';

interface NavigationItem {
  label: string;
  path: string;
  roles?: string[];
}

const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Projects', path: '/projects' },
  { label: 'Finance', path: '/finance' },
  { label: 'Assets', path: '/assets' },
  { label: 'CRM', path: '/crm' },
  { label: 'Workforce', path: '/workforce' },
  { label: 'Analytics', path: '/analytics', roles: ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN'] },
  { label: 'Settings', path: '/settings', roles: ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN'] },
];

export function BusinessNavigation({ userRoles }: { userRoles: string[] }) {
  const router = useRouter();

  const visibleItems = navigationItems.filter(
    item => !item.roles || item.roles.some(role => userRoles.includes(role))
  );

  return (
    <Nav className="flex gap-2">
      {visibleItems.map(item => (
        <Button
          key={item.path}
          variant="ghost"
          size="sm"
          onClick={() => router.push(item.path)}
        >
          {item.label}
        </Button>
      ))}
    </Nav>
  );
}
