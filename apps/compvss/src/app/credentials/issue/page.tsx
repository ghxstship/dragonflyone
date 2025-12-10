'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus, Camera, Search } from 'lucide-react';
import { CompvssAppLayout } from '../../../components/app-layout';
import { useCredentialTypes, useIssueCredential } from '../../../hooks/useCredentials';
import { useContacts } from '../../../hooks/useContacts';
import { log } from '@ghxstship/config';
import {
  Container,
  Section,
  Stack,
  Grid,
  Card,
  H2,
  H3,
  Body,
  Button,
  Input,
  Badge,
  Box,
} from '@ghxstship/ui';

export default function IssueCredentialPage() {
  const router = useRouter();
  const { data: credentialTypes } = useCredentialTypes();
  const { data: contacts } = useContacts();
  const issueMutation = useIssueCredential();
  
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [notes, setNotes] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedType = credentialTypes?.find(t => t.id === selectedTypeId);
  const selectedContact = contacts?.find(c => c.id === selectedContactId);
  
  const filteredContacts = contacts?.filter(c => 
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.email?.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const generateBadgeNumber = () => {
    const prefix = selectedType?.code || 'CR';
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    setBadgeNumber(`${prefix}-${random}`);
  };

  const handleSubmit = async () => {
    if (!selectedTypeId || !selectedContactId || !badgeNumber) return;
    
    setIsSubmitting(true);
    try {
      await issueMutation.mutateAsync({
        production_id: productionId || params?.productionId || '', 
        credential_type_id: selectedTypeId,
        contact_id: selectedContactId,
        badge_number: badgeNumber,
        status: 'active',
        expires_at: expiresAt || undefined,
        notes: notes || undefined,
      });
      router.push('/credentials');
    } catch (error) {
      log.error('Failed to issue credential:', error instanceof Error ? error : undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CompvssAppLayout>
      <Section className="min-h-screen bg-grey-50 py-8">
        <Container>
          <Stack gap={6}>
            {/* Header */}
            <Stack direction="horizontal" gap={4} className="items-center">
              <Button
                onClick={() => router.back()}
                className="flex items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
              <Stack gap={1}>
                <H2>Issue Credential</H2>
                <Body className="text-grey-600">Issue a new credential to a contact</Body>
              </Stack>
            </Stack>

            <Grid cols={3} gap={6}>
              {/* Left: Form */}
              <Box className="col-span-2">
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={6}>
                    {/* Credential Type Selection */}
                    <Stack gap={2}>
                      <H3>Select Credential Type</H3>
                      <Grid cols={3} gap={4}>
                        {credentialTypes?.filter(t => t.is_active).map(type => (
                          <Card
                            key={type.id}
                            className={`cursor-pointer border-2 p-4 transition-all ${
                              selectedTypeId === type.id 
                                ? 'border-primary bg-primary/5' 
                                : 'border-grey-200 hover:border-grey-400'
                            }`}
                            onClick={() => setSelectedTypeId(type.id)}
                          >
                            <Stack gap={2}>
                              <Badge style={{ backgroundColor: type.color, color: '#fff' }}>
                                {type.code}
                              </Badge>
                              <Body className="font-weight-semibold">{type.name}</Body>
                              <Body className="text-body-sm text-grey-500">Level {type.access_level}</Body>
                            </Stack>
                          </Card>
                        ))}
                      </Grid>
                    </Stack>

                    {/* Contact Selection */}
                    <Stack gap={2}>
                      <H3>Select Contact</H3>
                      <Box className="relative">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-grey-400" />
                        <Input
                          type="text"
                          placeholder="Search contacts by name or email..."
                          value={contactSearch}
                          onChange={(e) => setContactSearch(e.target.value)}
                          className="w-full border-2 border-grey-300 py-3 pl-10 pr-4"
                        />
                      </Box>
                      <Box className="max-h-48 overflow-y-auto rounded border-2 border-grey-200">
                        {filteredContacts?.slice(0, 10).map(contact => (
                          <Box
                            key={contact.id}
                            className={`cursor-pointer border-b border-grey-100 p-3 transition-colors last:border-b-0 ${
                              selectedContactId === contact.id 
                                ? 'bg-primary/10' 
                                : 'hover:bg-grey-50'
                            }`}
                            onClick={() => setSelectedContactId(contact.id)}
                          >
                            <Stack direction="horizontal" gap={3} className="items-center justify-between">
                              <Stack gap={0}>
                                <Body className="font-weight-semibold">{contact.first_name} {contact.last_name}</Body>
                                <Body className="text-body-sm text-grey-500">{contact.email}</Body>
                              </Stack>
                              {selectedContactId === contact.id && (
                                <Badge variant="success">Selected</Badge>
                              )}
                            </Stack>
                          </Box>
                        ))}
                      </Box>
                    </Stack>

                    {/* Badge Number */}
                    <Stack gap={2}>
                      <H3>Badge Number</H3>
                      <Stack direction="horizontal" gap={2}>
                        <Input
                          type="text"
                          placeholder="e.g., AA-0001"
                          value={badgeNumber}
                          onChange={(e) => setBadgeNumber(e.target.value)}
                          className="flex-1 border-2 border-grey-300 px-4 py-3"
                        />
                        <Button
                          onClick={generateBadgeNumber}
                          className="border-2 border-grey-300 bg-white px-4 py-3"
                        >
                          Generate
                        </Button>
                      </Stack>
                    </Stack>

                    {/* Expiration */}
                    <Stack gap={2}>
                      <H3>Expiration Date (Optional)</H3>
                      <Input
                        type="date"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        className="border-2 border-grey-300 px-4 py-3"
                      />
                    </Stack>

                    {/* Notes */}
                    <Stack gap={2}>
                      <H3>Notes (Optional)</H3>
                      <textarea
                        placeholder="Add any notes about this credential..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-24 w-full resize-none border-2 border-grey-300 px-4 py-3"
                      />
                    </Stack>
                  </Stack>
                </Card>
              </Box>

              {/* Right: Summary */}
              <Box>
                <Card className="sticky top-4 border-2 border-grey-200 p-6">
                  <Stack gap={4}>
                    <H3>Credential Summary</H3>
                    
                    {selectedType ? (
                      <Stack gap={2}>
                        <Body className="text-body-sm text-grey-500">Credential Type</Body>
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <Badge style={{ backgroundColor: selectedType.color, color: '#fff' }}>
                            {selectedType.code}
                          </Badge>
                          <Body className="font-weight-semibold">{selectedType.name}</Body>
                        </Stack>
                      </Stack>
                    ) : (
                      <Body className="text-grey-400">Select a credential type</Body>
                    )}

                    {selectedContact ? (
                      <Stack gap={2}>
                        <Body className="text-body-sm text-grey-500">Holder</Body>
                        <Body className="font-weight-semibold">{selectedContact.first_name} {selectedContact.last_name}</Body>
                        <Body className="text-body-sm text-grey-500">{selectedContact.email}</Body>
                      </Stack>
                    ) : (
                      <Body className="text-grey-400">Select a contact</Body>
                    )}

                    {badgeNumber && (
                      <Stack gap={2}>
                        <Body className="text-body-sm text-grey-500">Badge Number</Body>
                        <Body className="font-mono font-weight-semibold">{badgeNumber}</Body>
                      </Stack>
                    )}

                    {selectedType?.requires_photo && (
                      <Box className="rounded border-2 border-dashed border-warning bg-warning/10 p-3">
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <Camera className="size-4 text-warning" />
                          <Body className="text-body-sm text-warning">Photo required for this credential type</Body>
                        </Stack>
                      </Box>
                    )}

                    {selectedType?.requires_background_check && (
                      <Box className="rounded border-2 border-dashed border-error bg-error/10 p-3">
                        <Body className="text-body-sm text-error">Background check required</Body>
                      </Box>
                    )}

                    <Button
                      onClick={handleSubmit}
                      disabled={!selectedTypeId || !selectedContactId || !badgeNumber || isSubmitting}
                      className="flex w-full items-center justify-center gap-2 border-2 border-primary bg-primary px-6 py-4 text-white disabled:opacity-50"
                    >
                      <UserPlus className="size-4" />
                      {isSubmitting ? 'Issuing...' : 'Issue Credential'}
                    </Button>
                  </Stack>
                </Card>
              </Box>
            </Grid>
          </Stack>
        </Container>
      </Section>
    </CompvssAppLayout>
  );
}
