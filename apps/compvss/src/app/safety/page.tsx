'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CompvssAppLayout } from '../../components/app-layout';
import {
  Container,
  H2,
  H3,
  Body,
  Button,
  Card,
  Grid,
  Badge,
  LoadingSpinner,
  EmptyState,
  Stack,
  StatCard,
  EnterprisePageHeader,
  MainContent,
} from '@ghxstship/ui';
import { AlertTriangle, FileText, Shield } from 'lucide-react';

interface Incident {
  id: string;
  type: string;
  description: string;
  location: string;
  reported_by: string;
  date: string;
  status: string;
  severity: string;
  created_at: string;
}

export default function SafetyPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/safety/incidents');
      if (!response.ok) {
        throw new Error('Failed to fetch incidents');
      }
      const data = await response.json();
      setIncidents(data.incidents || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // TODO: Fetch certifications from API when available
  const certifications = [
    { name: 'First Aid/CPR', expired: 2, expiring: 5, current: 23 },
    { name: 'Aerial Lift', expired: 0, expiring: 3, current: 15 },
    { name: 'Rigging Safety', expired: 1, expiring: 4, current: 18 },
    { name: 'Electrical Safety', expired: 0, expiring: 2, current: 12 },
  ];

  const getSeverityVariant = (severity: string): "solid" | "outline" => {
    switch (severity) {
      case 'high':
      case 'critical':
        return 'solid';
      default:
        return 'outline';
    }
  };

  const activeIncidents = incidents.filter(i => i.status !== 'resolved').length;
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length;

  if (loading) {
    return (
      <CompvssAppLayout>
        <MainContent padding="lg">
          <Container className="flex min-h-[60vh] items-center justify-center">
            <LoadingSpinner size="lg" text="Loading safety data..." />
          </Container>
        </MainContent>
      </CompvssAppLayout>
    );
  }

  if (error) {
    return (
      <CompvssAppLayout>
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Error Loading Safety Data"
              description={error}
              action={{ label: "Retry", onClick: fetchIncidents }}
            />
          </Container>
        </MainContent>
      </CompvssAppLayout>
    );
  }

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Safety Management"
        subtitle="Incident reporting and safety compliance"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Safety' }]}
        views={[{ id: 'default', label: 'Default', icon: 'grid' }]}
        activeView="default"
        primaryAction={{ label: 'Report Incident', onClick: () => router.push('/safety/report') }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>

          <Grid cols={4} gap={4} className="mb-8">
            <StatCard value="0" label="Days Since Incident" />
            <StatCard value={activeIncidents.toString()} label="Active Incidents" />
            <StatCard value={resolvedIncidents.toString()} label="Resolved (YTD)" />
            <StatCard value="68" label="Certified Crew" />
          </Grid>

          <Grid cols={2} gap={4} className="mb-8">
            <Card>
              <Stack gap={4} direction="horizontal" className="mb-4 items-center justify-between">
                <H2>RECENT INCIDENTS</H2>
                <Button variant="outline" size="sm" onClick={() => router.push('/safety/incidents')}>VIEW ALL</Button>
              </Stack>
              <Stack gap={4}>
                {incidents.map((incident) => (
                  <Card key={incident.id}>
                    <Stack gap={2} direction="horizontal" className="mb-2 items-start justify-between">
                      <Stack gap={1} className="flex-1">
                        <Stack gap={2} direction="horizontal" className="items-center">
                          <H3>{incident.id}</H3>
                          <Badge variant={getSeverityVariant(incident.severity)}>
                            {incident.severity.toUpperCase()}
                          </Badge>
                        </Stack>
                        <Body className="text-body-sm">{incident.description}</Body>
                        <Body className="text-body-sm">{incident.location}</Body>
                      </Stack>
                    </Stack>
                    <Stack gap={2} direction="horizontal" className="mt-3 items-center justify-between text-body-sm">
                      <Body className="text-body-sm">
                        Reported by {incident.reported_by}
                      </Body>
                      <Body className="text-body-sm">{new Date(incident.date).toLocaleDateString()}</Body>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Card>

            <Card>
              <H2 className="mb-4">CERTIFICATION STATUS</H2>
              <Stack gap={4}>
                {certifications.map((cert, idx) => (
                  <Stack key={idx} gap={2}>
                    <Stack gap={2} direction="horizontal" className="justify-between">
                      <Body className="font-display">{cert.name}</Body>
                      <Body className="text-body-sm">
                        {cert.current} certified
                      </Body>
                    </Stack>
                    <Grid cols={3} gap={2} className="text-center">
                      <Card>
                        <Body className="font-display text-body-sm">{cert.expired}</Body>
                        <Body className="text-body-sm">Expired</Body>
                      </Card>
                      <Card>
                        <Body className="font-display text-body-sm">{cert.expiring}</Body>
                        <Body className="text-body-sm">Expiring</Body>
                      </Card>
                      <Card>
                        <Body className="font-display text-body-sm">{cert.current}</Body>
                        <Body className="text-body-sm">Current</Body>
                      </Card>
                    </Grid>
                  </Stack>
                ))}
              </Stack>
            </Card>
          </Grid>

          <Card>
            <H2 className="mb-4">SAFETY RESOURCES</H2>
            <Grid cols={3} gap={4}>
              {[
                { title: 'Emergency Procedures', icon: AlertTriangle, docs: 12 },
                { title: 'Safety Protocols', icon: Shield, docs: 24 },
                { title: 'Training Materials', icon: FileText, docs: 18 },
              ].map((resource, idx) => (
                <Card key={idx}>
                  <Stack className="items-center text-center">
                    <resource.icon className="mb-3 size-12" />
                    <H3 className="mb-2">{resource.title}</H3>
                    <Body className="mb-4 text-body-sm">{resource.docs} documents</Body>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/safety/resources/${resource.title.toLowerCase().replace(' ', '-')}`)}>ACCESS</Button>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Card>
        </Container>
      </MainContent>
    </CompvssAppLayout>
  );
}
