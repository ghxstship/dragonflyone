'use client';

import {
  Body,
  H1,
  H2,
  Text,
} from '@ghxstship/ui';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, Mail, Phone, Building2, Calendar, Clock, User } from 'lucide-react';
import { useContact } from '@/hooks/useContacts';

export default function ContactDetailPage() {
  const params = useParams();
  const contactId = params.id as string;

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
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading contact...</div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <Body className="text-destructive">Contact not found</Body>
          <Link href="/contacts" className="text-primary hover:underline mt-2 inline-block">
            Back to Contacts
          </Link>
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
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-avatar bg-primary/10 flex items-center justify-center">
              <Text className="text-primary text-h3-md font-weight-bold">
                {contact.first_name?.charAt(0) || '?'}{contact.last_name?.charAt(0) || ''}
              </Text>
            </div>
            <div>
              <H1 className="text-h2-md font-weight-bold text-foreground">
                {contact.first_name} {contact.last_name}
              </H1>
              {contact.title && contact.company && (
                <Body className="text-body-md text-muted-foreground">
                  {contact.title} at {contact.company}
                </Body>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/contacts/${contactId}/timeline`}
            className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
          >
            <Clock className="h-4 w-4" />
            <Text className="text-body-sm">Timeline</Text>
          </Link>
          <Link
            href={`/contacts/${contactId}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            <Text className="text-body-sm font-weight-medium">Edit</Text>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Contact Information</H2>
            <div className="grid grid-cols-2 gap-6">
              {contact.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Body className="text-body-xs text-muted-foreground">Email</Body>
                    <Link href={`mailto:${contact.email}`} className="text-body-md text-primary hover:underline">
                      {contact.email}
                    </Link>
                  </div>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Body className="text-body-xs text-muted-foreground">Phone</Body>
                    <Link href={`tel:${contact.phone}`} className="text-body-md text-primary hover:underline">
                      {contact.phone}
                    </Link>
                  </div>
                </div>
              )}
              {contact.company && (
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Body className="text-body-xs text-muted-foreground">Company</Body>
                    <Body className="text-body-md text-foreground">{contact.company}</Body>
                  </div>
                </div>
              )}
              {contact.title && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Body className="text-body-xs text-muted-foreground">Title</Body>
                    <Body className="text-body-md text-foreground">{contact.title}</Body>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Recent Activity</H2>
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <Body className="text-body-md">No recent activity</Body>
              <Link
                href={`/contacts/${contactId}/timeline`}
                className="text-primary hover:underline text-body-sm mt-2 inline-block"
              >
                View full timeline
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Quick Actions</H2>
            <div className="space-y-2">
              {contact.email && (
                <Link
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-muted rounded-button transition-colors"
                >
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Text className="text-body-sm">Send Email</Text>
                </Link>
              )}
              {contact.phone && (
                <Link
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-muted rounded-button transition-colors"
                >
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Text className="text-body-sm">Call</Text>
                </Link>
              )}
              <Link
                href={`/pipeline/deals/new?contact=${contactId}`}
                className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-muted rounded-button transition-colors"
              >
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Text className="text-body-sm">Create Deal</Text>
              </Link>
            </div>
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Details</H2>
            <div className="space-y-3 text-body-sm">
              <div className="flex items-center justify-between">
                <Text className="text-muted-foreground">Type</Text>
                <Text className="text-foreground capitalize">{contact.type || 'Contact'}</Text>
              </div>
              <div className="flex items-center justify-between">
                <Text className="text-muted-foreground">Status</Text>
                <Text className="text-foreground capitalize">{contact.status || 'Active'}</Text>
              </div>
              <div className="flex items-center justify-between">
                <Text className="text-muted-foreground">Created</Text>
                <Text className="text-foreground">{formatDate(contact.created_at)}</Text>
              </div>
              <div className="flex items-center justify-between">
                <Text className="text-muted-foreground">Updated</Text>
                <Text className="text-foreground">{formatDate(contact.updated_at)}</Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
