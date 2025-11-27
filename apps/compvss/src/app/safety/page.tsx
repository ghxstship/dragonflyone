'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorNavigationAuthenticated } from '../../components/navigation';
import { Container, Section, Display, H2, H3, Body, Button, Card, Grid, Badge, LoadingSpinner, EmptyState, Stack, Breadcrumb, BreadcrumbItem } from '@ghxstship/ui';
import { AlertTriangle, CheckCircle, FileText, Users, Shield, AlertCircle } from 'lucide-react';

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
      case 'critical':
        return 'bg-black text-white';
      case 'medium': return 'bg-grey-600 text-white';
      case 'low': return 'bg-grey-300 text-black';
      default: return 'bg-grey-200 text-black';
    }
  };

  const activeIncidents = incidents.filter(i => i.status !== 'resolved').length;
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length;

  if (loading) {
    return (
      <Section className="min-h-screen bg-white py-8">
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading safety data..." />
        </Container>
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="min-h-screen bg-white py-8">
        <Container className="py-16">
          <EmptyState
            title="Error Loading Safety Data"
            description={error}
            action={{ label: "Retry", onClick: fetchIncidents }}
          />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-ink-950 text-white">
      <CreatorNavigationAuthenticated />
      <Section className="py-8">
        <Container>
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
            <BreadcrumbItem active>Safety</BreadcrumbItem>
          </Breadcrumb>

          <Stack gap={4} direction="horizontal" className="justify-between items-start mb-8">
            <Stack gap={2}>
              <Display>SAFETY MANAGEMENT</Display>
              <Body className="text-grey-600">Incident reporting and safety compliance</Body>
            </Stack>
            <Button onClick={() => router.push('/safety/report')}>
              <AlertTriangle className="w-4 h-4 mr-2" />
              REPORT INCIDENT
            </Button>
          </Stack>

        <Grid cols={4} gap={4} className="mb-8">
          <Card className="p-6 text-center bg-white border-2 border-black">
            <Shield className="w-8 h-8 mx-auto mb-2" />
            <H2>0</H2>
            <Body>Days Since Incident</Body>
          </Card>
          <Card className="p-6 text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-grey-600" />
            <H2>{activeIncidents}</H2>
            <Body className="text-grey-600">Active Incidents</Body>
          </Card>
          <Card className="p-6 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-grey-600" />
            <H2>{resolvedIncidents}</H2>
            <Body className="text-grey-600">Resolved (YTD)</Body>
          </Card>
          <Card className="p-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-grey-600" />
            <H2>68</H2>
            <Body className="text-grey-600">Certified Crew</Body>
          </Card>
        </Grid>

        <Grid cols={2} gap={4} className="mb-8">
          <Card className="p-6">
            <Stack gap={4} direction="horizontal" className="justify-between items-center mb-4">
              <H2>RECENT INCIDENTS</H2>
              <Button variant="outline" size="sm" onClick={() => router.push('/safety/incidents')}>VIEW ALL</Button>
            </Stack>
            <Stack gap={4}>
              {incidents.map((incident) => (
                <Card key={incident.id} className="p-4 border-2 border-grey-200">
                  <Stack gap={2} direction="horizontal" className="justify-between items-start mb-2">
                    <Stack gap={1} className="flex-1">
                      <Stack gap={2} direction="horizontal" className="items-center">
                        <H3>{incident.id}</H3>
                        <Badge className={getSeverityColor(incident.severity)}>
                          {incident.severity.toUpperCase()}
                        </Badge>
                      </Stack>
                      <Body className="text-sm">{incident.description}</Body>
                      <Body className="text-xs text-grey-600">{incident.location}</Body>
                    </Stack>
                  </Stack>
                  <Stack gap={2} direction="horizontal" className="justify-between items-center text-sm mt-3">
                    <Body className="text-grey-600">
                      Reported by {incident.reported_by}
                    </Body>
                    <Body className="text-grey-600">{new Date(incident.date).toLocaleDateString()}</Body>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Card>

          <Card className="p-6">
            <H2 className="mb-4">CERTIFICATION STATUS</H2>
            <Stack gap={4}>
              {certifications.map((cert, idx) => (
                <Stack key={idx} gap={2}>
                  <Stack gap={2} direction="horizontal" className="justify-between">
                    <Body className="font-bold">{cert.name}</Body>
                    <Body className="text-sm text-grey-600">
                      {cert.current} certified
                    </Body>
                  </Stack>
                  <Grid cols={3} gap={2} className="text-center">
                    <Card className={`p-2 ${cert.expired > 0 ? 'bg-black text-white' : 'bg-grey-100'}`}>
                      <Body className="text-sm font-bold">{cert.expired}</Body>
                      <Body className="text-xs">Expired</Body>
                    </Card>
                    <Card className={`p-2 ${cert.expiring > 0 ? 'bg-grey-600 text-white' : 'bg-grey-100'}`}>
                      <Body className="text-sm font-bold">{cert.expiring}</Body>
                      <Body className="text-xs">Expiring</Body>
                    </Card>
                    <Card className="p-2 bg-white border-2 border-black">
                      <Body className="text-sm font-bold">{cert.current}</Body>
                      <Body className="text-xs">Current</Body>
                    </Card>
                  </Grid>
                </Stack>
              ))}
            </Stack>
          </Card>
        </Grid>

        <Card className="p-6">
          <H2 className="mb-4">SAFETY RESOURCES</H2>
          <Grid cols={3} gap={4}>
            {[
              { title: 'Emergency Procedures', icon: AlertTriangle, docs: 12 },
              { title: 'Safety Protocols', icon: Shield, docs: 24 },
              { title: 'Training Materials', icon: FileText, docs: 18 },
            ].map((resource, idx) => (
              <Card key={idx} className="p-6 text-center hover:shadow-hard-lg transition-shadow cursor-pointer">
                <resource.icon className="w-12 h-12 mx-auto mb-3 text-grey-600" />
                <H3 className="mb-2">{resource.title}</H3>
                <Body className="text-sm text-grey-600 mb-4">{resource.docs} documents</Body>
                <Button variant="outline" size="sm" className="w-full" onClick={() => router.push(`/safety/resources/${resource.title.toLowerCase().replace(' ', '-')}`)}>ACCESS</Button>
              </Card>
            ))}
          </Grid>
        </Card>
      </Container>
      </Section>
    </Section>
  );
}
