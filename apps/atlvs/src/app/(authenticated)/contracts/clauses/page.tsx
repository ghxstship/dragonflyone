'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, FileText, Edit2, Trash2, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@ghxstship/ui';

interface Clause {
  id: string;
  name: string;
  category: string;
  content: string;
  description?: string;
  variables?: string[];
  is_default: boolean;
  is_required: boolean;
  order_index: number;
  created_at: string;
}

const CATEGORIES = [
  { id: 'all', name: 'All Categories' },
  { id: 'general', name: 'General' },
  { id: 'liability', name: 'Liability' },
  { id: 'payment', name: 'Payment' },
  { id: 'cancellation', name: 'Cancellation' },
  { id: 'force_majeure', name: 'Force Majeure' },
  { id: 'confidentiality', name: 'Confidentiality' },
  { id: 'indemnification', name: 'Indemnification' },
  { id: 'custom', name: 'Custom' },
];

export default function ContractClausesPage() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['contract-clauses', selectedCategory],
    queryFn: async () => {
      const url = selectedCategory === 'all'
        ? '/api/contract-clauses'
        : `/api/contract-clauses?category=${selectedCategory}`;
      const response = await fetch(url);
      if (!response.ok) {
        return { clauses: [], grouped: {}, total: 0 };
      }
      return response.json();
    },
  });

  const createClause = useMutation({
    mutationFn: async (clause: Partial<Clause>) => {
      const response = await fetch('/api/contract-clauses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clause),
      });
      if (!response.ok) throw new Error('Failed to create clause');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-clauses'] });
      setShowAddModal(false);
    },
  });

  const clauses: Clause[] = data?.clauses || [];
  const filteredClauses = clauses.filter(
    (c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           c.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading clauses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-destructive">Error loading clauses. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/contracts"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-h2-md font-weight-bold text-foreground">Clause Library</h1>
            <p className="text-body-sm text-muted-foreground mt-1">
              {data?.total || 0} clauses available
            </p>
          </div>
        </div>
        <Button variant="solid" size="sm" onClick={() => setShowAddModal(true)} icon={<Plus className="h-4 w-4" />} iconPosition="left">
          Add Clause
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clauses..."
            className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {filteredClauses.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 border-2 border-dashed border-border rounded-card">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-body-md text-muted-foreground">No clauses found</p>
          <Button variant="ghost" size="sm" onClick={() => setShowAddModal(true)} icon={<Plus className="h-4 w-4" />} iconPosition="left" className="mt-4">
            Add your first clause
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredClauses.map((clause) => (
            <div
              key={clause.id}
              className="bg-background border-2 border-border rounded-card p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-body-md font-weight-semibold text-foreground">
                      {clause.name}
                    </h3>
                    {clause.is_required && (
                      <span className="px-2 py-0.5 text-body-xs bg-success-100 text-success-800 rounded">
                        Required
                      </span>
                    )}
                    {clause.is_default && (
                      <span className="px-2 py-0.5 text-body-xs bg-info-100 text-info-800 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <span className="text-body-xs text-muted-foreground capitalize">
                    {clause.category.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="p-1.5">
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="p-1.5 hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              {clause.description && (
                <p className="text-body-sm text-muted-foreground mb-2">
                  {clause.description}
                </p>
              )}
              <div className="p-3 bg-muted/30 rounded-card">
                <p className="text-body-sm text-foreground line-clamp-3">
                  {clause.content}
                </p>
              </div>
              {clause.variables && clause.variables.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-body-xs text-muted-foreground">Variables:</span>
                  {clause.variables.map((v) => (
                    <span key={v} className="px-2 py-0.5 text-body-xs bg-muted rounded">
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-h4-md font-weight-semibold text-foreground mb-4">Add Clause</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createClause.mutate({
                  name: formData.get('name') as string,
                  category: formData.get('category') as string,
                  content: formData.get('content') as string,
                  description: formData.get('description') as string || undefined,
                  is_default: formData.get('is_default') === 'on',
                  is_required: formData.get('is_required') === 'on',
                });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Clause Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g., Payment Terms"
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    required
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  >
                    {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  placeholder="Brief description of this clause"
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Content *
                </label>
                <textarea
                  name="content"
                  required
                  rows={6}
                  placeholder="Enter the clause content. Use {{variable_name}} for dynamic values."
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="is_default" className="w-4 h-4" />
                  <span className="text-body-sm text-foreground">Include by default</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="is_required" className="w-4 h-4" />
                  <span className="text-body-sm text-foreground">Required in all contracts</span>
                </label>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="solid" size="sm" type="submit" disabled={createClause.isPending} isLoading={createClause.isPending} loadingText="Creating...">
                  Create Clause
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
