'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Section, Display, H2, H3, Body, Button, Input, Select, Card, Grid, Badge, LoadingSpinner, Stack } from '@ghxstship/ui';
import { Search, Plus, Handshake, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';

export default function PartnershipsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const { data: contacts, isLoading } = useContacts();

  if (isLoading) {
    return (
      <Section className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading partnerships..." />
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
    <Section className="min-h-screen bg-white py-8">
      <Container>
        <Stack gap={8}>
          <Stack gap={4} direction="horizontal" className="justify-between items-start">
            <Stack gap={2}>
              <Display>PARTNERSHIPS</Display>
              <Body className="text-grey-600">Strategic alliances and joint ventures</Body>
            </Stack>
            <Button onClick={() => router.push('/partnerships/new')}>
              <Plus className="w-4 h-4 mr-2" />
              NEW PARTNERSHIP
            </Button>
          </Stack>

          <Grid cols={4} gap={6}>
            <Card className="p-6 text-center">
              <Handshake className="w-8 h-8 mx-auto mb-2 text-grey-600" />
              <H2>{partnerships.filter((p: any) => p.status === 'active').length}</H2>
              <Body className="text-grey-600">Active</Body>
            </Card>
            <Card className="p-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-grey-600" />
              <H2>{partnerships.filter((p: any) => p.status === 'pending').length}</H2>
              <Body className="text-grey-600">Pending</Body>
            </Card>
            <Card className="p-6 text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-grey-600" />
              <H2>{partnerships.length}</H2>
              <Body className="text-grey-600">Total Partners</Body>
            </Card>
            <Card className="p-6 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-grey-600" />
              <H2>{partnerships.filter((p: any) => p.company).length}</H2>
              <Body className="text-grey-600">Companies</Body>
            </Card>
          </Grid>

          <Card className="p-6">
            <Stack gap={4} direction="horizontal">
              <Stack className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-500" />
                <Input placeholder="Search partnerships..." className="pl-10 w-full" />
              </Stack>
              <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-48">
                <option value="all">All Types</option>
                <option value="strategic">Strategic Partner</option>
                <option value="joint">Joint Venture</option>
                <option value="vendor">Preferred Vendor</option>
              </Select>
              <Select className="w-48">
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </Select>
            </Stack>
          </Card>

          <Stack gap={4}>
            {partnerships.map((partnership: any) => (
              <Card key={partnership.id} className="p-6 hover:shadow-[8px_8px_0_0_#000] transition-shadow">
                <Stack gap={4} direction="horizontal" className="items-start justify-between">
                  <Stack gap={4} className="flex-1">
                    <Stack gap={3} direction="horizontal" className="items-center">
                      <Handshake className="w-6 h-6 text-grey-600" />
                      <H2>{partnership.name}</H2>
                      <Badge className={getStatusColor(partnership.status || 'active')}>
                        {partnership.status?.toUpperCase() || 'ACTIVE'}
                      </Badge>
                    </Stack>
                    <Body className="text-grey-600">{partnership.company || partnership.type || 'Partner'}</Body>
                    
                    <Grid cols={4} gap={6}>
                      <Stack gap={1}>
                        <Body className="text-sm text-grey-600">Type</Body>
                        <Body className="font-bold">{partnership.type || 'Partner'}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="text-sm text-grey-600">Company</Body>
                        <Body className="font-bold">{partnership.company || 'N/A'}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="text-sm text-grey-600">Email</Body>
                        <Body className="font-bold">{partnership.email || 'N/A'}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="text-sm text-grey-600">Phone</Body>
                        <Body className="font-bold">{partnership.phone || 'N/A'}</Body>
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
