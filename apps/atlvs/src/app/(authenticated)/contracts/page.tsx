'use client';

import { useState } from 'react';
import { Plus, Search, FileText, Clock, CheckCircle, AlertTriangle, Filter } from 'lucide-react';
import { useContracts } from '@/hooks/useContracts';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground' },
  pending_signatures: { label: 'Pending Signatures', color: 'bg-warning/20 text-warning' },
  partially_signed: { label: 'Partially Signed', color: 'bg-primary/20 text-primary' },
  active: { label: 'Active', color: 'bg-success/20 text-success' },
  completed: { label: 'Completed', color: 'bg-success/20 text-success' },
  expired: { label: 'Expired', color: 'bg-muted text-muted-foreground' },
  terminated: { label: 'Terminated', color: 'bg-destructive/20 text-destructive' },
  voided: { label: 'Voided', color: 'bg-destructive/20 text-destructive' },
};

const TYPE_CONFIG = {
  service: 'Service Agreement',
  product: 'Product Agreement',
  nda: 'NDA',
  employment: 'Employment',
  partnership: 'Partnership',
  licensing: 'Licensing',
};

export default function ContractsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  const { data: contracts, isLoading, error } = useContracts();

  const filteredContracts = (contracts || []).filter((contract) => {
    const matchesSearch = !searchQuery || 
      contract.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || contract.status === statusFilter;
    const matchesType = !typeFilter || contract.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStats = () => {
    const all = contracts || [];
    return {
      total: all.length,
      active: all.filter((c) => c.status === 'active' || c.status === 'completed').length,
      pending: all.filter((c) => c.status === 'draft' || c.status === 'pending_signatures').length,
      expiring: all.filter((c) => {
        if (c.status !== 'active' || !c.end_date) return false;
        const daysUntil = Math.ceil((new Date(c.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntil <= 30 && daysUntil > 0;
      }).length,
      totalValue: all.reduce((sum, c) => sum + (c.value || 0), 0),
    };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-card w-1/3" />
          <div className="h-64 bg-muted rounded-card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 text-destructive">
          Failed to load contracts. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground">Contracts</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Manage contracts and electronic signatures
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/contracts/clauses"
            className="px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
          >
            Clause Library
          </a>
          <a
            href="/contracts/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Contract
          </a>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Total</span>
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">{stats.total}</p>
        </div>
        <div className="bg-background border-2 border-success/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-success" />
            <span className="text-body-sm text-muted-foreground">Active</span>
          </div>
          <p className="text-h3-md font-weight-bold text-success">{stats.active}</p>
        </div>
        <div className="bg-background border-2 border-warning/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-warning" />
            <span className="text-body-sm text-muted-foreground">Pending</span>
          </div>
          <p className="text-h3-md font-weight-bold text-warning">{stats.pending}</p>
        </div>
        <div className="bg-background border-2 border-destructive/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="text-body-sm text-muted-foreground">Expiring</span>
          </div>
          <p className="text-h3-md font-weight-bold text-destructive">{stats.expiring}</p>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Total Value</span>
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">{formatCurrency(stats.totalValue)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search contracts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Types</option>
            {Object.entries(TYPE_CONFIG).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredContracts.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-card border-2 border-dashed border-border">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No contracts found
          </h3>
          <p className="text-body-sm text-muted-foreground mb-4">
            {searchQuery ? 'Try adjusting your search' : 'Create your first contract'}
          </p>
          <a
            href="/contracts/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm"
          >
            <Plus className="h-4 w-4" />
            New Contract
          </a>
        </div>
      )}

      {filteredContracts.length > 0 && (
        <div className="space-y-4">
          {filteredContracts.map((contract) => {
            const statusConfig = STATUS_CONFIG[contract.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;
            const typeLabel = TYPE_CONFIG[contract.type as keyof typeof TYPE_CONFIG] || contract.type;
            const isExpiring = contract.end_date && contract.status === 'active' &&
              Math.ceil((new Date(contract.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 30;

            return (
              <a
                key={contract.id}
                href={`/contracts/${contract.id}`}
                className="block bg-background border-2 border-border rounded-card p-6 hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-body-lg font-weight-semibold text-foreground">
                        {contract.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                      {isExpiring && (
                        <span className="px-2 py-1 bg-destructive/20 text-destructive rounded-badge text-body-xs font-weight-medium">
                          Expiring Soon
                        </span>
                      )}
                    </div>
                    <p className="text-body-sm text-muted-foreground">
                      {typeLabel} • {contract.vendor?.name || 'No vendor'}
                    </p>
                    <p className="text-body-xs text-muted-foreground mt-1">
                      {contract.start_date && `Started ${new Date(contract.start_date).toLocaleDateString()}`}
                      {contract.end_date && ` • Ends ${new Date(contract.end_date).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-h4-md font-weight-bold text-foreground">
                      {formatCurrency(contract.value || 0)}
                    </p>
                    {contract.auto_renew && (
                      <p className="text-body-xs text-success mt-1">Auto-renew enabled</p>
                    )}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
