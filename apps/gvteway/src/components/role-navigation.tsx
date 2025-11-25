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
  { label: 'Events', path: '/events' },
  { label: 'Browse', path: '/browse' },
  { label: 'My Tickets', path: '/orders' },
  { label: 'Profile', path: '/profile' },
  { label: 'Create Event', path: '/events/create', roles: ['GVTEWAY_ADMIN', 'GVTEWAY_EXPERIENCE_CREATOR'] },
  { label: 'Manage Venues', path: '/venues', roles: ['GVTEWAY_ADMIN', 'GVTEWAY_VENUE_MANAGER'] },
  { label: 'Moderate', path: '/moderate', roles: ['GVTEWAY_ADMIN', 'GVTEWAY_MODERATOR'] },
];

export function RoleNavigation({ userRoles }: { userRoles: string[] }) {
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
