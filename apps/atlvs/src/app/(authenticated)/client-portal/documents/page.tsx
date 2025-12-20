'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, FileText, Download, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useClientPortalDocuments } from '@/hooks/useClientPortal';
import { Button } from '@ghxstship/ui';

export default function ClientPortalDocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [docType, setDocType] = useState<string>('all');

  const token = typeof window !== 'undefined' ? localStorage.getItem('portal_token') : null;
  const { data, isLoading, error } = useClientPortalDocuments(token || undefined);

  const proposals = data?.documents?.proposals || [];
  const contracts = data?.documents?.contracts || [];

  const allDocuments = [
    ...proposals.map((p) => ({ ...p, type: 'proposal' })),
    ...contracts.map((c) => ({ ...c, type: 'contract' })),
  ];

  const filteredDocuments = allDocuments.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = docType === 'all' || doc.type === docType;
    return matchesSearch && matchesType;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'signed':
      case 'accepted':
        return { label: 'Signed', color: 'bg-success/20 text-success', icon: CheckCircle };
      case 'pending':
      case 'sent':
        return { label: 'Pending', color: 'bg-warning/20 text-warning', icon: Clock };
      case 'expired':
        return { label: 'Expired', color: 'bg-destructive/20 text-destructive', icon: AlertCircle };
      case 'draft':
        return { label: 'Draft', color: 'bg-muted text-muted-foreground', icon: FileText };
      default:
        return { label: status, color: 'bg-muted text-muted-foreground', icon: FileText };
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading documents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <p className="text-destructive">Failed to load documents</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground">Documents</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            View and sign your proposals and contracts
          </p>
        </div>
        <Link
          href="/client-portal"
          className="text-body-sm text-primary hover:underline"
        >
          Back to Portal
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Total Documents</span>
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">{allDocuments.length}</p>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-secondary" />
            <span className="text-body-sm text-muted-foreground">Proposals</span>
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">{proposals.length}</p>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-accent" />
            <span className="text-body-sm text-muted-foreground">Contracts</span>
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">{contracts.length}</p>
        </div>
      </div>

      <div className="bg-background border-2 border-border rounded-card">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Types</option>
            <option value="proposal">Proposals</option>
            <option value="contract">Contracts</option>
          </select>
        </div>

        <div className="divide-y divide-border">
          {filteredDocuments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No documents found
            </div>
          ) : (
            filteredDocuments.map((doc) => {
              const statusConfig = getStatusConfig(doc.status);
              const StatusIcon = statusConfig.icon;
              return (
                <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-card flex items-center justify-center ${
                      doc.type === 'proposal' ? 'bg-secondary/10' : 'bg-accent/10'
                    }`}>
                      <FileText className={`h-5 w-5 ${
                        doc.type === 'proposal' ? 'text-secondary' : 'text-accent'
                      }`} />
                    </div>
                    <div>
                      <p className="text-body-sm font-weight-medium text-foreground">{doc.name}</p>
                      <p className="text-body-xs text-muted-foreground">
                        {doc.type === 'proposal' ? doc.proposal_number : 'Contract'} • {formatDate(doc.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <StatusIcon className={`h-4 w-4 ${statusConfig.color.split(' ')[1]}`} />
                      <span className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" className="p-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="p-2">
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
