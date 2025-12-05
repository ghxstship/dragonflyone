'use client';

import { useState } from 'react';
import {
  SectionHeader,
  Card,
  CardBody,
  Stack,
  StatCard,
  Button,
  Badge,
  Grid,
  Body,
  H3,
} from '@ghxstship/ui';
import {
  LayoutDashboard,
  Plus,
  Star,
  Users,
  Eye,
  Edit,
  Copy,
  Trash2,
} from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';

interface Dashboard {
  id: string;
  name: string;
  description: string;
  owner: string;
  visibility: 'private' | 'team' | 'organization';
  widgets: number;
  lastModified: string;
  starred: boolean;
  views: number;
}

const mockDashboards: Dashboard[] = [
  {
    id: '1',
    name: 'Executive Overview',
    description: 'High-level KPIs and financial metrics for leadership',
    owner: 'System',
    visibility: 'organization',
    widgets: 12,
    lastModified: '2024-12-04T10:00:00Z',
    starred: true,
    views: 1250,
  },
  {
    id: '2',
    name: 'Production Pipeline',
    description: 'Active productions status and timeline view',
    owner: 'Operations Team',
    visibility: 'team',
    widgets: 8,
    lastModified: '2024-12-03T15:30:00Z',
    starred: true,
    views: 890,
  },
  {
    id: '3',
    name: 'Financial Health',
    description: 'Revenue, expenses, and budget tracking',
    owner: 'Finance Team',
    visibility: 'team',
    widgets: 10,
    lastModified: '2024-12-02T09:00:00Z',
    starred: false,
    views: 456,
  },
  {
    id: '4',
    name: 'Crew Analytics',
    description: 'Crew utilization, availability, and performance',
    owner: 'HR Team',
    visibility: 'team',
    widgets: 6,
    lastModified: '2024-12-01T14:00:00Z',
    starred: false,
    views: 234,
  },
  {
    id: '5',
    name: 'My Custom Dashboard',
    description: 'Personal metrics and quick access widgets',
    owner: 'You',
    visibility: 'private',
    widgets: 4,
    lastModified: '2024-11-30T11:00:00Z',
    starred: true,
    views: 45,
  },
];

export default function DashboardsPage() {
  const [dashboards] = useState(mockDashboards);
  const [view, setView] = useState<'all' | 'starred' | 'mine'>('all');

  const starredCount = dashboards.filter(d => d.starred).length;
  const myCount = dashboards.filter(d => d.owner === 'You').length;

  const filteredDashboards = dashboards.filter(d => {
    if (view === 'starred') return d.starred;
    if (view === 'mine') return d.owner === 'You';
    return true;
  });

  const getVisibilityBadge = (visibility: Dashboard['visibility']) => {
    switch (visibility) {
      case 'private':
        return <Badge variant="info">Private</Badge>;
      case 'team':
        return <Badge variant="warning">Team</Badge>;
      case 'organization':
        return <Badge variant="success">Organization</Badge>;
    }
  };

  return (
    <AtlvsAppLayout>
      <Stack gap={8}>
        <SectionHeader
          kicker="Analytics"
          title="Dashboards"
          description="Create and manage custom dashboards"
          colorScheme="on-dark"
        />

        <Grid cols={4} gap={4}>
          <StatCard
            label="Total Dashboards"
            value={dashboards.length.toString()}
            icon={<LayoutDashboard size={20} />}
            inverted
          />
          <StatCard
            label="Starred"
            value={starredCount.toString()}
            icon={<Star size={20} />}
            inverted
          />
          <StatCard
            label="My Dashboards"
            value={myCount.toString()}
            icon={<Users size={20} />}
            inverted
          />
          <StatCard
            label="Total Views"
            value="2.9K"
            icon={<Eye size={20} />}
            inverted
          />
        </Grid>

        <Card inverted>
          <CardBody>
            <Stack gap={4}>
              <Stack direction="horizontal" className="items-center justify-between">
                <Stack direction="horizontal" gap={2}>
                  <Button
                    variant={view === 'all' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => setView('all')}
                  >
                    All Dashboards
                  </Button>
                  <Button
                    variant={view === 'starred' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => setView('starred')}
                  >
                    <Star size={14} className="mr-1" />
                    Starred
                  </Button>
                  <Button
                    variant={view === 'mine' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => setView('mine')}
                  >
                    My Dashboards
                  </Button>
                </Stack>
                <Button variant="solid" size="sm">
                  <Plus size={14} className="mr-1" />
                  New Dashboard
                </Button>
              </Stack>

              <Grid cols={3} gap={4}>
                {filteredDashboards.map(dashboard => (
                  <Card key={dashboard.id} className="border-2 border-ink-700">
                    <CardBody>
                      <Stack gap={3}>
                        <Stack direction="horizontal" className="items-start justify-between">
                          <Stack gap={1}>
                            <Stack direction="horizontal" gap={2} className="items-center">
                              <H3 className="text-white">{dashboard.name}</H3>
                              {dashboard.starred && (
                                <Star size={14} className="fill-warning text-warning" />
                              )}
                            </Stack>
                            <Body className="text-body-sm text-on-dark-muted">
                              {dashboard.description}
                            </Body>
                          </Stack>
                        </Stack>

                        <Stack direction="horizontal" gap={2} className="items-center">
                          {getVisibilityBadge(dashboard.visibility)}
                          <Body className="text-body-sm text-on-dark-muted">
                            {dashboard.widgets} widgets
                          </Body>
                        </Stack>

                        <Stack direction="horizontal" className="items-center justify-between">
                          <Stack gap={0}>
                            <Body className="text-body-sm text-on-dark-muted">
                              Owner: {dashboard.owner}
                            </Body>
                            <Body className="text-body-sm text-on-dark-muted">
                              {dashboard.views.toLocaleString()} views
                            </Body>
                          </Stack>
                          <Stack direction="horizontal" gap={1}>
                            <Button variant="ghost" size="sm">
                              <Eye size={14} />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit size={14} />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Copy size={14} />
                            </Button>
                            {dashboard.owner === 'You' && (
                              <Button variant="ghost" size="sm">
                                <Trash2 size={14} />
                              </Button>
                            )}
                          </Stack>
                        </Stack>
                      </Stack>
                    </CardBody>
                  </Card>
                ))}
              </Grid>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </AtlvsAppLayout>
  );
}
