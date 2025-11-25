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
  { label: 'Crew', path: '/crew' },
  { label: 'Create Project', path: '/projects/new', roles: ['COMPVSS_ADMIN'] },
  { label: 'Assign Crew', path: '/crew/assign', roles: ['COMPVSS_ADMIN', 'COMPVSS_TEAM_MEMBER'] },
  { label: 'Run of Show', path: '/run-of-show' },
  { label: 'Build & Strike', path: '/build-strike' },
  { label: 'Directory', path: '/directory' },
];

export function ProductionNavigation({ userRoles }: { userRoles: string[] }) {
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
