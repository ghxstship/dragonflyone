'use client';

import {
  Body,
  Button,
  H1,
  H2,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Merge, Eye, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface DuplicateGroup {
  id: string;
  match_score: number;
  contacts: Array<{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    company?: string;
    created_at: string;
    booking_count?: number;
  }>;
  match_reasons: string[];
}

export default function ContactDuplicatesPage() {
  const queryClient = useQueryClient();
  const [selectedGroup, setSelectedGroup] = useState<DuplicateGroup | null>(null);
  const [primaryContactId, setPrimaryContactId] = useState<string>('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['contact-duplicates'],
    queryFn: async () => {
      const response = await fetch('/api/contacts/duplicates');
      if (!response.ok) {
        return { groups: [], total: 0 };
      }
      return response.json() as Promise<{ groups: DuplicateGroup[]; total: number }>;
    },
  });

  const mergeContacts = useMutation({
    mutationFn: async ({ primary_id, merge_ids }: { primary_id: string; merge_ids: string[] }) => {
      const response = await fetch('/api/contacts/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primary_id, merge_ids }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to merge contacts');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-duplicates'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setSelectedGroup(null);
      setPrimaryContactId('');
    },
  });

  const groups = data?.groups || [];

  const handleMerge = () => {
    if (!selectedGroup || !primaryContactId) return;
    
    const mergeIds = selectedGroup.contacts
      .filter((c) => c.id !== primaryContactId)
      .map((c) => c.id);
    
    mergeContacts.mutate({ primary_id: primaryContactId, merge_ids: mergeIds });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-error-600 bg-error-100';
    if (score >= 70) return 'text-warning-600 bg-warning-100';
    return 'text-info-600 bg-info-100';
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Scanning for duplicates...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <Body className="text-destructive">Failed to load duplicates</Body>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/contacts"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <H1 className="text-h2-md font-weight-bold text-foreground">Duplicate Contacts</H1>
            <Body className="text-body-sm text-muted-foreground mt-1">
              {data?.total || 0} potential duplicate groups found
            </Body>
          </div>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 border-2 border-dashed border-border rounded-card">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <Body className="text-body-md text-muted-foreground">No duplicate contacts found</Body>
          <Body className="text-body-sm text-muted-foreground mt-1">
            Your contact list is clean!
          </Body>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <H2 className="text-h4-md font-weight-semibold text-foreground">Duplicate Groups</H2>
            {groups.map((group) => (
              <Button
                key={group.id}
                onClick={() => {
                  setSelectedGroup(group);
                  setPrimaryContactId(group.contacts[0]?.id || '');
                }}
                className={`w-full text-left p-4 rounded-card border-2 transition-colors ${
                  selectedGroup?.id === group.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/30'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning-800" />
                    <Text className="text-body-sm font-weight-medium text-foreground">
                      {group.contacts.length} potential duplicates
                    </Text>
                  </div>
                  <Text className={`px-2 py-0.5 text-body-xs rounded ${getScoreColor(group.match_score)}`}>
                    {group.match_score}% match
                  </Text>
                </div>
                <div className="space-y-1">
                  {group.contacts.slice(0, 3).map((contact) => (
                    <Body key={contact.id} className="text-body-xs text-muted-foreground truncate">
                      {contact.first_name} {contact.last_name} - {contact.email}
                    </Body>
                  ))}
                  {group.contacts.length > 3 && (
                    <Body className="text-body-xs text-muted-foreground">
                      +{group.contacts.length - 3} more
                    </Body>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {group.match_reasons.slice(0, 3).map((reason, i) => (
                    <Text
                      key={i}
                      className="px-2 py-0.5 text-body-xs bg-muted text-muted-foreground rounded"
                    >
                      {reason}
                    </Text>
                  ))}
                </div>
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            <H2 className="text-h4-md font-weight-semibold text-foreground">Merge Preview</H2>
            {!selectedGroup ? (
              <div className="text-center py-12 bg-muted/30 border-2 border-dashed border-border rounded-card">
                <Merge className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <Body className="text-body-sm text-muted-foreground">
                  Select a duplicate group to merge
                </Body>
              </div>
            ) : (
              <div className="bg-background border-2 border-border rounded-card p-4">
                <Body className="text-body-sm text-muted-foreground mb-4">
                  Select the primary contact to keep. Other contacts will be merged into it.
                </Body>
                <div className="space-y-3">
                  {selectedGroup.contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`p-3 rounded-card border-2 cursor-pointer transition-colors ${
                        primaryContactId === contact.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/30'
                      }`}
                      onClick={() => setPrimaryContactId(contact.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <Body className="text-body-sm font-weight-medium text-foreground">
                            {contact.first_name} {contact.last_name}
                          </Body>
                          <Body className="text-body-xs text-muted-foreground">{contact.email}</Body>
                          {contact.phone && (
                            <Body className="text-body-xs text-muted-foreground">{contact.phone}</Body>
                          )}
                          {contact.company && (
                            <Body className="text-body-xs text-muted-foreground">{contact.company}</Body>
                          )}
                        </div>
                        <div className="text-right">
                          <Body className="text-body-xs text-muted-foreground">
                            Created {formatDate(contact.created_at)}
                          </Body>
                          {contact.booking_count !== undefined && contact.booking_count > 0 && (
                            <Body className="text-body-xs text-primary">
                              {contact.booking_count} bookings
                            </Body>
                          )}
                        </div>
                      </div>
                      {primaryContactId === contact.id && (
                        <div className="mt-2 flex items-center gap-1 text-body-xs text-primary">
                          <Eye className="h-3 w-3" />
                          Primary (will be kept)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <Button
                    onClick={handleMerge}
                    disabled={!primaryContactId || mergeContacts.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <Merge className="h-4 w-4" />
                    {mergeContacts.isPending ? 'Merging...' : 'Merge Contacts'}
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedGroup(null);
                      setPrimaryContactId('');
                    }}
                    className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
