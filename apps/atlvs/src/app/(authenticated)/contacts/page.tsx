'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, MoreVertical, User, Mail, Phone, Building2, Tag } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import {
  Body,
  Button,
  H1,
  Input,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@ghxstship/ui';

export default function ContactsPage() {
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
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading contacts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <Body className="text-destructive">Failed to load contacts</Body>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <H1 className="text-h2-md font-weight-bold text-foreground">Contacts</H1>
          <Body className="text-body-sm text-muted-foreground mt-1">
            Manage your contacts and relationships
          </Body>
        </div>
        <Link
          href="/contacts/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <Text className="text-body-sm font-weight-medium">Add Contact</Text>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
          />
        </div>
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
        >
          <option value="">All Types</option>
          <option value="client">Clients</option>
          <option value="lead">Leads</option>
          <option value="vendor">Vendors</option>
          <option value="partner">Partners</option>
        </Select>
        <Link
          href="/contacts/duplicates"
          className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
        >
          <Filter className="h-4 w-4" />
          <Text className="text-body-sm">Find Duplicates</Text>
        </Link>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 border-2 border-dashed border-border rounded-card">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <Body className="text-body-md text-muted-foreground">
            {searchQuery || typeFilter ? 'No contacts match your filters' : 'No contacts yet'}
          </Body>
          {!searchQuery && !typeFilter && (
            <Link
              href="/contacts/new"
              className="inline-flex items-center gap-2 mt-4 text-primary hover:underline"
            >
              <Plus className="h-4 w-4" />
              Add your first contact
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-background border-2 border-border rounded-card overflow-hidden">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b border-border bg-muted/30">
                <TableHead className="px-4 py-3 text-left text-body-sm font-weight-medium text-muted-foreground">
                  Name
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-body-sm font-weight-medium text-muted-foreground">
                  Contact Info
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-body-sm font-weight-medium text-muted-foreground">
                  Company
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-body-sm font-weight-medium text-muted-foreground">
                  Type
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-body-sm font-weight-medium text-muted-foreground">
                  Last Activity
                </TableHead>
                <TableHead className="px-4 py-3 text-right text-body-sm font-weight-medium text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id} className="border-b border-border hover:bg-muted/30">
                  <TableCell className="px-4 py-3">
                    <Link
                      href={`/contacts/${contact.id}`}
                      className="flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-avatar bg-primary/10 flex items-center justify-center">
                        <Text className="text-primary font-weight-medium">
                          {contact.first_name?.charAt(0) || '?'}{contact.last_name?.charAt(0) || ''}
                        </Text>
                      </div>
                      <div>
                        <Text className="text-body-sm font-weight-medium text-foreground hover:text-primary">
                          {contact.first_name} {contact.last_name}
                        </Text>
                        {contact.title && (
                          <Body className="text-body-xs text-muted-foreground">{contact.title}</Body>
                        )}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="space-y-1">
                      {contact.email && (
                        <div className="flex items-center gap-1 text-body-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <Link href={`mailto:${contact.email}`} className="hover:text-primary">
                            {contact.email}
                          </Link>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-1 text-body-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <Link href={`tel:${contact.phone}`} className="hover:text-primary">
                            {contact.phone}
                          </Link>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {contact.company && (
                      <div className="flex items-center gap-1 text-body-sm text-foreground">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {contact.company}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Text className={`inline-flex items-center gap-1 px-2 py-1 rounded text-body-xs capitalize ${
                      contact.type === 'client' ? 'bg-success-100 text-success-800' :
                      contact.type === 'lead' ? 'bg-info-100 text-info-800' :
                      contact.type === 'vendor' ? 'bg-violet-100 text-violet-800' :
                      'bg-ink-100 text-ink-800'
                    }`}>
                      <Tag className="h-3 w-3" />
                      {contact.type || 'Contact'}
                    </Text>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-body-sm text-muted-foreground">
                    {contact.updated_at ? formatDate(contact.updated_at) : 'Never'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="p-2">
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
