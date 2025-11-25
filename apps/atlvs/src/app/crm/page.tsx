'use client';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../components/navigation';
import {
  Container,
  Section,
  Display,
  H2,
  Body,
  Button,
  Card,
  Grid,
  Badge,
  Spinner,
  Stack,
  Breadcrumb,
  BreadcrumbItem,
} from '@ghxstship/ui';
import { useContacts } from '@/hooks/useContacts';
import { useDeals } from '@/hooks/useDeals';

export default function CRMPage() {
  const router = useRouter();
  const { data: contacts, isLoading: contactsLoading } = useContacts();
  const { data: deals, isLoading: dealsLoading } = useDeals();
  
  const isLoading = contactsLoading || dealsLoading;
  
  if (isLoading) {
    return (
      <Section className="min-h-screen bg-white flex items-center justify-center">
        <Spinner size="lg" />
      </Section>
    );
  }

  const activeContacts = contacts?.filter(c => c.status === 'active') || [];
  const totalDeals = deals?.length || 0;
  const totalValue = deals?.reduce((sum, d) => sum + (d.value || 0), 0) || 0;

  return (
    <Section className="min-h-screen bg-ink-950 text-white">
      <Navigation />
      <Section className="py-8">
        <Container>
          {/* Breadcrumb */}
          <Stack className="mb-6">
            <Breadcrumb>
              <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
              <BreadcrumbItem active>CRM</BreadcrumbItem>
            </Breadcrumb>
          </Stack>

          <Stack className="border-b-2 border-grey-800 py-8 mb-8">
            <Display>CRM</Display>
            <Stack direction="horizontal" gap={4} className="mt-4">
              <Button variant="solid" onClick={() => router.push('/contacts')}>Add Contact</Button>
              <Button variant="outline" onClick={() => alert('Import functionality coming soon')}>Import</Button>
            </Stack>
          </Stack>

          <Grid cols={3} className="mb-8">
            <Card className="p-6 text-center">
              <H2>{activeContacts.length}</H2>
              <Body>Active Clients</Body>
            </Card>
            <Card className="p-6 text-center">
              <H2>${(totalValue / 1000000).toFixed(1)}M</H2>
              <Body>Total Value</Body>
            </Card>
            <Card className="p-6 text-center">
              <H2>{totalDeals}</H2>
              <Body>Active Deals</Body>
            </Card>
          </Grid>

          <Stack gap={4}>
          {contacts?.map(contact => {
            const contactDeals = deals?.filter(d => d.contact_id === contact.id) || [];
            const contactValue = contactDeals.reduce((sum, d) => sum + (d.value || 0), 0);
            
            return (
              <Card key={contact.id} className="p-6">
                <Grid cols={4} gap={4}>
                  <Stack gap={1}>
                    <H2>{contact.name}</H2>
                    <Body className="text-sm">{contact.company || 'N/A'}</Body>
                    <Body className="text-sm">{contact.email}</Body>
                  </Stack>
                  <Stack gap={2}>
                    <Badge>{contact.type?.toUpperCase() || 'CLIENT'}</Badge>
                    <Badge>{contact.status?.toUpperCase() || 'ACTIVE'}</Badge>
                  </Stack>
                  <Stack gap={1}>
                    <Body className="text-sm">Deals: {contactDeals.length}</Body>
                    <Body className="text-sm">Value: ${(contactValue / 1000000).toFixed(2)}M</Body>
                  </Stack>
                  <Stack gap={2} direction="horizontal" className="items-center justify-end">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/contacts/${contact.id}`)}>View</Button>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/contacts/${contact.id}/edit`)}>Edit</Button>
                  </Stack>
                </Grid>
              </Card>
            );
          })}
        </Stack>
          </Container>
      </Section>
    </Section>
  );
}
