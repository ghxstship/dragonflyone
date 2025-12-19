'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, FileText, Plus, Trash2, Users } from 'lucide-react';
import { useCreateContract } from '@/hooks/useContracts';

interface Signer {
  name: string;
  email: string;
  role: string;
}

export default function NewContractPage() {
  const router = useRouter();
  const createMutation = useCreateContract();

  const [formData, setFormData] = useState({
    title: '',
    type: 'service',
    vendor_id: '',
    counterparty_name: '',
    value: 0,
    currency: 'USD',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    terms: '',
    auto_renew: false,
    payment_terms: '',
    notes: '',
  });

  const [signers, setSigners] = useState<Signer[]>([
    { name: '', email: '', role: 'client' },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddSigner = () => {
    setSigners((prev) => [...prev, { name: '', email: '', role: 'signer' }]);
  };

  const handleRemoveSigner = (index: number) => {
    if (signers.length > 1) {
      setSigners((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSignerChange = (index: number, field: keyof Signer, value: string) => {
    setSigners((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.counterparty_name && !formData.vendor_id) {
      newErrors.counterparty_name = 'Counterparty name is required';
    }
    if (signers.some((s) => !s.name || !s.email)) {
      newErrors.signers = 'All signers must have name and email';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'pending_signatures' = 'draft') => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = await createMutation.mutateAsync({
        title: formData.title,
        type: formData.type as 'service' | 'product' | 'nda' | 'employment',
        vendor_id: formData.vendor_id || '',
        value: formData.value,
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        status: status === 'pending_signatures' ? 'active' : 'draft',
        terms: formData.terms,
        auto_renew: formData.auto_renew,
      });
      router.push(`/contracts/${result.id}`);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create contract',
      });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <a
          href="/contracts"
          className="inline-flex items-center gap-2 text-body-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Contracts
        </a>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-card">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-h3-md font-weight-bold text-foreground">New Contract</h1>
            <p className="text-body-sm text-muted-foreground">
              Create a contract with electronic signatures
            </p>
          </div>
        </div>

        {errors.submit && (
          <div className="mb-6 p-4 bg-destructive/10 border-2 border-destructive rounded-card text-destructive text-body-sm">
            {errors.submit}
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, 'draft')} className="space-y-6">
          <div>
            <label className="block text-body-sm font-weight-medium text-foreground mb-2">
              Contract Title *
            </label>
            <input
              type="text"
              placeholder="e.g., Venue Rental Agreement"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            {errors.title && (
              <p className="mt-1 text-body-xs text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Contract Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="service">Service Agreement</option>
                <option value="product">Product Agreement</option>
                <option value="nda">Non-Disclosure Agreement</option>
                <option value="employment">Employment Agreement</option>
                <option value="partnership">Partnership Agreement</option>
                <option value="licensing">Licensing Agreement</option>
              </select>
            </div>
            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Contract Value
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) || 0 })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-body-sm font-weight-medium text-foreground mb-2">
              Counterparty Name *
            </label>
            <input
              type="text"
              placeholder="Name of the other party"
              value={formData.counterparty_name}
              onChange={(e) => setFormData({ ...formData, counterparty_name: e.target.value })}
              className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            {errors.counterparty_name && (
              <p className="mt-1 text-body-xs text-destructive">{errors.counterparty_name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              {errors.start_date && (
                <p className="mt-1 text-body-xs text-destructive">{errors.start_date}</p>
              )}
            </div>
            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-h4-md font-weight-semibold text-foreground">Signers</h2>
              </div>
              <button
                type="button"
                onClick={handleAddSigner}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-body-sm font-weight-medium text-primary hover:bg-primary/10 rounded-button transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Signer
              </button>
            </div>

            {errors.signers && (
              <p className="text-body-xs text-destructive">{errors.signers}</p>
            )}

            <div className="space-y-3">
              {signers.map((signer, index) => (
                <div key={index} className="flex items-center gap-3 p-4 border-2 border-border rounded-card">
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={signer.name}
                      onChange={(e) => handleSignerChange(index, 'name', e.target.value)}
                      className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={signer.email}
                      onChange={(e) => handleSignerChange(index, 'email', e.target.value)}
                      className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <select
                      value={signer.role}
                      onChange={(e) => handleSignerChange(index, 'role', e.target.value)}
                      className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="client">Client</option>
                      <option value="vendor">Vendor</option>
                      <option value="witness">Witness</option>
                      <option value="approver">Approver</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSigner(index)}
                    disabled={signers.length === 1}
                    className="p-2 text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-body-sm font-weight-medium text-foreground mb-2">
              Terms and Conditions
            </label>
            <textarea
              rows={6}
              placeholder="Enter the contract terms..."
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="auto_renew"
              checked={formData.auto_renew}
              onChange={(e) => setFormData({ ...formData, auto_renew: e.target.checked })}
              className="w-4 h-4 border-2 border-border rounded"
            />
            <label htmlFor="auto_renew" className="text-body-sm text-foreground">
              Auto-renew this contract when it expires
            </label>
          </div>

          <div>
            <label className="block text-body-sm font-weight-medium text-foreground mb-2">
              Notes
            </label>
            <textarea
              rows={3}
              placeholder="Internal notes (not visible to signers)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <a
              href="/contracts"
              className="px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
            >
              Cancel
            </a>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'pending_signatures')}
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create & Send for Signatures'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
