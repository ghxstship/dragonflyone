'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, MoreVertical, User, Mail, Phone, Building2, Tag } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import {
  Badge,
  Body,
  Box,
  Button,
  Card,
  Container,
  EmptyState,
  EnterprisePageHeader,
  Input,
  MainContent,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@ghxstship/ui';

export default function ContactsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  const { data, isLoading, error } = useContacts({ company: searchQuery });

  const contacts = data || [];

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
        <EnterprisePageHeader title="Contacts" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Stack gap={4}>
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-64" />
            </Stack>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <EnterprisePageHeader title="Contacts" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Failed to load contacts"
              description="Please try again."
              action={{ label: 'Retry', onClick: () => window.location.reload() }}
            />
          </Container>
        </MainContent>
      </>
    );
  }

  return (
    <>
      <EnterprisePageHeader
        title="Contacts"
        subtitle="Manage your contacts and relationships"
        primaryAction={{ label: 'Add Contact', onClick: () => router.push('/contacts/new') }}
        secondaryActions={[
          { label: 'Find Duplicates', onClick: () => router.push('/contacts/duplicates') }
        ]}
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            <Stack direction="horizontal" gap={4} className="items-center">
              <Box className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </Box>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="client">Clients</option>
                <option value="lead">Leads</option>
                <option value="vendor">Vendors</option>
                <option value="partner">Partners</option>
              </Select>
            </Stack>

            {contacts.length === 0 ? (
              <EmptyState
                title={searchQuery || typeFilter ? 'No contacts match your filters' : 'No contacts yet'}
                description={searchQuery || typeFilter ? 'Try adjusting your filters' : 'Add your first contact to get started'}
                icon={<User className="h-12 w-12" />}
                action={!searchQuery && !typeFilter ? { label: 'Add Contact', onClick: () => router.push('/contacts/new') } : undefined}
              />
            ) : (
              <Card className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact Info</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <Link href={`/contacts/${contact.id}`}>
                            <Stack direction="horizontal" gap={3} className="items-center">
                              <Box className="w-10 h-10 rounded-avatar bg-primary/10 flex items-center justify-center">
                                <Text className="text-primary font-weight-medium">
                                  {contact.first_name?.charAt(0) || '?'}{contact.last_name?.charAt(0) || ''}
                                </Text>
                              </Box>
                              <Stack gap={0}>
                                <Text className="font-weight-medium hover:text-primary">
                                  {contact.first_name} {contact.last_name}
                                </Text>
                                {contact.title && (
                                  <Body size="xs" className="text-muted-foreground">{contact.title}</Body>
                                )}
                              </Stack>
                            </Stack>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Stack gap={1}>
                            {contact.email && (
                              <Stack direction="horizontal" gap={1} className="items-center text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <Text size="xs">{contact.email}</Text>
                              </Stack>
                            )}
                            {contact.phone && (
                              <Stack direction="horizontal" gap={1} className="items-center text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <Text size="xs">{contact.phone}</Text>
                              </Stack>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          {contact.company && (
                            <Stack direction="horizontal" gap={1} className="items-center">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <Text size="sm">{contact.company}</Text>
                            </Stack>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={contact.type === 'client' ? 'solid' : 'outline'} className="capitalize">
                            <Tag className="h-3 w-3 mr-1" />
                            {contact.type || 'Contact'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {contact.updated_at ? formatDate(contact.updated_at) : 'Never'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
