'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, MoreVertical, User, Mail, Phone, Building2, Tag } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import { Button } from '@ghxstship/ui';

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
          <p className="text-destructive">Failed to load contacts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground">Contacts</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Manage your contacts and relationships
          </p>
        </div>
        <Link
          href="/contacts/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="text-body-sm font-weight-medium">Add Contact</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
        >
          <option value="">All Types</option>
          <option value="client">Clients</option>
          <option value="lead">Leads</option>
          <option value="vendor">Vendors</option>
          <option value="partner">Partners</option>
        </select>
        <Link
          href="/contacts/duplicates"
          className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
        >
          <Filter className="h-4 w-4" />
          <span className="text-body-sm">Find Duplicates</span>
        </Link>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 border-2 border-dashed border-border rounded-card">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-body-md text-muted-foreground">
            {searchQuery || typeFilter ? 'No contacts match your filters' : 'No contacts yet'}
          </p>
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
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-body-sm font-weight-medium text-muted-foreground">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-body-sm font-weight-medium text-muted-foreground">
                  Contact Info
                </th>
                <th className="px-4 py-3 text-left text-body-sm font-weight-medium text-muted-foreground">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-body-sm font-weight-medium text-muted-foreground">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-body-sm font-weight-medium text-muted-foreground">
                  Last Activity
                </th>
                <th className="px-4 py-3 text-right text-body-sm font-weight-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/contacts/${contact.id}`}
                      className="flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-avatar bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-weight-medium">
                          {contact.first_name?.charAt(0) || '?'}{contact.last_name?.charAt(0) || ''}
                        </span>
                      </div>
                      <div>
                        <span className="text-body-sm font-weight-medium text-foreground hover:text-primary">
                          {contact.first_name} {contact.last_name}
                        </span>
                        {contact.title && (
                          <p className="text-body-xs text-muted-foreground">{contact.title}</p>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      {contact.email && (
                        <div className="flex items-center gap-1 text-body-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <a href={`mailto:${contact.email}`} className="hover:text-primary">
                            {contact.email}
                          </a>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-1 text-body-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <a href={`tel:${contact.phone}`} className="hover:text-primary">
                            {contact.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {contact.company && (
                      <div className="flex items-center gap-1 text-body-sm text-foreground">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {contact.company}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-body-xs capitalize ${
                      contact.type === 'client' ? 'bg-success-100 text-success-800' :
                      contact.type === 'lead' ? 'bg-info-100 text-info-800' :
                      contact.type === 'vendor' ? 'bg-violet-100 text-violet-800' :
                      'bg-ink-100 text-ink-800'
                    }`}>
                      <Tag className="h-3 w-3" />
                      {contact.type || 'Contact'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-body-sm text-muted-foreground">
                    {contact.updated_at ? formatDate(contact.updated_at) : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="p-2">
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
