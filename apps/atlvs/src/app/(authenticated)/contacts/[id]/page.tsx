'use client';

import {
  Body,
  Box,
  Button,
  Card,
  Container,
  EmptyState,
  EnterprisePageHeader,
  Grid,
  H2,
  MainContent,
  Skeleton,
  Stack,
  Text,
} from '@ghxstship/ui';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit2, Mail, Phone, Building2, Calendar, Clock, User } from 'lucide-react';
import { useContact } from '@/hooks/useContacts';

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params?.id as string;

  const { data: contact, isLoading, error } = useContact(contactId);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <>
        <EnterprisePageHeader title="Contact Details" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Grid cols={3} gap={6}>
              <Box className="col-span-2"><Skeleton className="h-64" /></Box>
              <Skeleton className="h-64" />
            </Grid>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error || !contact) {
    return (
      <>
        <EnterprisePageHeader title="Contact Details" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Contact not found"
              description="The contact you're looking for doesn't exist or has been removed."
              action={{ label: 'Back to Contacts', onClick: () => router.push('/contacts') }}
            />
          </Container>
        </MainContent>
      </>
    );
  }

  return (
    <>
      <EnterprisePageHeader
        title={`${contact.first_name} ${contact.last_name}`}
        subtitle={contact.title && contact.company ? `${contact.title} at ${contact.company}` : undefined}
      />
      <Box className="px-6 py-3 border-b border-border flex items-center justify-between">
        <Stack direction="horizontal" gap={3} className="items-center">
          <Box className="w-12 h-12 rounded-avatar bg-primary/10 flex items-center justify-center">
            <Text className="text-primary font-weight-bold">
              {contact.first_name?.charAt(0) || '?'}{contact.last_name?.charAt(0) || ''}
            </Text>
          </Box>
        </Stack>
        <Stack direction="horizontal" gap={2}>
          <Link href={`/contacts/${contactId}/timeline`}>
            <Button variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              Timeline
            </Button>
          </Link>
          <Link href={`/contacts/${contactId}/edit`}>
            <Button>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </Stack>
      </Box>
      <MainContent padding="lg">
        <Container>
          <Grid cols={3} gap={6}>
            <Stack gap={6} className="col-span-2">
              <Card className="p-6">
                <H2 className="mb-4">Contact Information</H2>
                <Grid cols={2} gap={6}>
                  {contact.email && (
                    <Stack direction="horizontal" gap={3} className="items-start">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <Stack gap={0}>
                        <Body size="xs" className="text-muted-foreground">Email</Body>
                        <Link href={`mailto:${contact.email}`} className="text-primary hover:underline">
                          <Text>{contact.email}</Text>
                        </Link>
                      </Stack>
                    </Stack>
                  )}
                  {contact.phone && (
                    <Stack direction="horizontal" gap={3} className="items-start">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <Stack gap={0}>
                        <Body size="xs" className="text-muted-foreground">Phone</Body>
                        <Link href={`tel:${contact.phone}`} className="text-primary hover:underline">
                          <Text>{contact.phone}</Text>
                        </Link>
                      </Stack>
                    </Stack>
                  )}
                  {contact.company && (
                    <Stack direction="horizontal" gap={3} className="items-start">
                      <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <Stack gap={0}>
                        <Body size="xs" className="text-muted-foreground">Company</Body>
                        <Body>{contact.company}</Body>
                      </Stack>
                    </Stack>
                  )}
                  {contact.title && (
                    <Stack direction="horizontal" gap={3} className="items-start">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <Stack gap={0}>
                        <Body size="xs" className="text-muted-foreground">Title</Body>
                        <Body>{contact.title}</Body>
                      </Stack>
                    </Stack>
                  )}
                </Grid>
              </Card>

              <Card className="p-6">
                <H2 className="mb-4">Recent Activity</H2>
                <Box className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <Body className="text-muted-foreground">No recent activity</Body>
                  <Link href={`/contacts/${contactId}/timeline`} className="text-primary hover:underline mt-2 inline-block">
                    <Text size="sm">View full timeline</Text>
                  </Link>
                </Box>
              </Card>
            </Stack>

            <Stack gap={6}>
              <Card className="p-6">
                <H2 className="mb-4">Quick Actions</H2>
                <Stack gap={2}>
                  {contact.email && (
                    <Link href={`mailto:${contact.email}`}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                    </Link>
                  )}
                  {contact.phone && (
                    <Link href={`tel:${contact.phone}`}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                    </Link>
                  )}
                  <Link href={`/pipeline/deals/new?contact=${contactId}`}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Create Deal
                    </Button>
                  </Link>
                </Stack>
              </Card>

              <Card className="p-6">
                <H2 className="mb-4">Details</H2>
                <Stack gap={3}>
                  <Stack direction="horizontal" className="justify-between">
                    <Text size="sm" className="text-muted-foreground">Type</Text>
                    <Text size="sm" className="capitalize">{contact.type || 'Contact'}</Text>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Text size="sm" className="text-muted-foreground">Status</Text>
                    <Text size="sm" className="capitalize">{contact.status || 'Active'}</Text>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Text size="sm" className="text-muted-foreground">Created</Text>
                    <Text size="sm">{formatDate(contact.created_at)}</Text>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Text size="sm" className="text-muted-foreground">Updated</Text>
                    <Text size="sm">{formatDate(contact.updated_at)}</Text>
                  </Stack>
                </Stack>
              </Card>
            </Stack>
          </Grid>
        </Container>
      </MainContent>
    </>
  );
}
