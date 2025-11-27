'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorNavigationAuthenticated } from '../../components/navigation';
import { Container, Section, H1, H2, H3, Body, Button, Input, Select, Card, Grid, Badge, LoadingSpinner, Stack } from '@ghxstship/ui';
import { Search, Plus, Handshake, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';

export default function PartnershipsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const { data: contacts, isLoading } = useContacts();

  if (isLoading) {
    return (
      <Section className="min-h-screen bg-ink-950 text-ink-50">
        <CreatorNavigationAuthenticated />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading partnerships..." />
        </Container>
      </Section>
    );
  }

  const partnerships = contacts || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-white text-black border-2 border-black';
      case 'pending': return 'bg-grey-400 text-white';
      case 'inactive': return 'bg-grey-900 text-white';
      default: return 'bg-grey-200 text-black';
    }
  };

  return (
    <Section className="min-h-screen bg-ink-950 text-ink-50">
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={4} direction="horizontal" className="flex-col md:flex-row md:items-center md:justify-between border-b border-ink-800 pb-8">
            <Stack gap={2}>
              <H1>Partnerships</H1>
              <Body className="text-ink-600">Strategic alliances and joint ventures</Body>
            </Stack>
            <Button variant="solid" onClick={() => router.push('/partnerships/new')}>
              <Plus className="w-4 h-4 mr-2" />
              NEW PARTNERSHIP
            </Button>
          </Stack>

          <Grid cols={4} gap={6}>
            <Card className="p-6 text-center border-2 border-ink-800 bg-transparent">
              <Handshake className="w-8 h-8 mx-auto mb-2 text-ink-600" />
              <H2 className="text-white">{partnerships.filter((p: any) => p.status === 'active').length}</H2>
              <Body className="text-ink-600">Active</Body>
            </Card>
            <Card className="p-6 text-center border-2 border-ink-800 bg-transparent">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-ink-600" />
              <H2 className="text-white">{partnerships.filter((p: any) => p.status === 'pending').length}</H2>
              <Body className="text-ink-600">Pending</Body>
            </Card>
            <Card className="p-6 text-center border-2 border-ink-800 bg-transparent">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-ink-600" />
              <H2 className="text-white">{partnerships.length}</H2>
              <Body className="text-ink-600">Total Partners</Body>
            </Card>
            <Card className="p-6 text-center border-2 border-ink-800 bg-transparent">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-ink-600" />
              <H2 className="text-white">{partnerships.filter((p: any) => p.company).length}</H2>
              <Body className="text-ink-600">Companies</Body>
            </Card>
          </Grid>

          <Card className="p-6 border-2 border-ink-800 bg-transparent">
            <Stack gap={4} direction="horizontal">
              <Stack className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500" />
                <Input placeholder="Search partnerships..." className="pl-10 w-full bg-ink-900 border-ink-700 text-white" />
              </Stack>
              <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-48 bg-ink-900 border-ink-700 text-white">
                <option value="all">All Types</option>
                <option value="strategic">Strategic Partner</option>
                <option value="joint">Joint Venture</option>
                <option value="vendor">Preferred Vendor</option>
              </Select>
              <Select className="w-48 bg-ink-900 border-ink-700 text-white">
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </Select>
            </Stack>
          </Card>

          <Stack gap={4}>
            {partnerships.map((partnership: any) => (
              <Card key={partnership.id} className="p-6 border-2 border-ink-800 bg-transparent hover:border-ink-600 transition-colors">
                <Stack gap={4} direction="horizontal" className="items-start justify-between">
                  <Stack gap={4} className="flex-1">
                    <Stack gap={3} direction="horizontal" className="items-center">
                      <Handshake className="w-6 h-6 text-ink-600" />
                      <H2 className="text-white">{partnership.name}</H2>
                      <Badge className={getStatusColor(partnership.status || 'active')}>
                        {partnership.status?.toUpperCase() || 'ACTIVE'}
                      </Badge>
                    </Stack>
                    <Body className="text-ink-600">{partnership.company || partnership.type || 'Partner'}</Body>
                    
                    <Grid cols={4} gap={6}>
                      <Stack gap={1}>
                        <Body className="text-body-sm text-ink-500">Type</Body>
                        <Body className="font-bold text-white">{partnership.type || 'Partner'}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="text-body-sm text-ink-500">Company</Body>
                        <Body className="font-bold text-white">{partnership.company || 'N/A'}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="text-body-sm text-ink-500">Email</Body>
                        <Body className="font-bold text-white">{partnership.email || 'N/A'}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="text-body-sm text-ink-500">Phone</Body>
                        <Body className="font-bold text-white">{partnership.phone || 'N/A'}</Body>
                      </Stack>
                    </Grid>
                  </Stack>
                  <Stack gap={2} direction="horizontal" className="ml-6">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/partnerships/${partnership.id}`)}>VIEW DETAILS</Button>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/partnerships/${partnership.id}/edit`)}>EDIT</Button>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
