'use client';

import {
  Body,
  Button,
  Form,
  H1,
  H2,
  Input,
  Label,
  Select,
  Textarea,
} from '@ghxstship/ui';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
        <Link
          href="/contracts"
          className="inline-flex items-center gap-2 text-body-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Contracts
        </Link>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-card">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <H1 className="text-h3-md font-weight-bold text-foreground">New Contract</H1>
            <Body className="text-body-sm text-muted-foreground">
              Create a contract with electronic signatures
            </Body>
          </div>
        </div>

        {errors.submit && (
          <div className="mb-6 p-4 bg-destructive/10 border-2 border-destructive rounded-card text-destructive text-body-sm">
            {errors.submit}
          </div>
        )}

        <Form onSubmit={(e) => handleSubmit(e, 'draft')} className="space-y-6">
          <div>
            <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
              Contract Title *
            </Label>
            <Input
              type="text"
              placeholder="e.g., Venue Rental Agreement"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            {errors.title && (
              <Body className="mt-1 text-body-xs text-destructive">{errors.title}</Body>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Contract Type *
              </Label>
              <Select
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
              </Select>
            </div>
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Contract Value
              </Label>
              <Input
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
            <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
              Counterparty Name *
            </Label>
            <Input
              type="text"
              placeholder="Name of the other party"
              value={formData.counterparty_name}
              onChange={(e) => setFormData({ ...formData, counterparty_name: e.target.value })}
              className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            {errors.counterparty_name && (
              <Body className="mt-1 text-body-xs text-destructive">{errors.counterparty_name}</Body>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Start Date *
              </Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              {errors.start_date && (
                <Body className="mt-1 text-body-xs text-destructive">{errors.start_date}</Body>
              )}
            </div>
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                End Date
              </Label>
              <Input
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
                <H2 className="text-h4-md font-weight-semibold text-foreground">Signers</H2>
              </div>
              <Button
                type="button"
                onClick={handleAddSigner}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-body-sm font-weight-medium text-primary hover:bg-primary/10 rounded-button transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Signer
              </Button>
            </div>

            {errors.signers && (
              <Body className="text-body-xs text-destructive">{errors.signers}</Body>
            )}

            <div className="space-y-3">
              {signers.map((signer, index) => (
                <div key={index} className="flex items-center gap-3 p-4 border-2 border-border rounded-card">
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <Input
                      type="text"
                      placeholder="Name"
                      value={signer.name}
                      onChange={(e) => handleSignerChange(index, 'name', e.target.value)}
                      className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={signer.email}
                      onChange={(e) => handleSignerChange(index, 'email', e.target.value)}
                      className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <Select
                      value={signer.role}
                      onChange={(e) => handleSignerChange(index, 'role', e.target.value)}
                      className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="client">Client</option>
                      <option value="vendor">Vendor</option>
                      <option value="witness">Witness</option>
                      <option value="approver">Approver</option>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    onClick={() => handleRemoveSigner(index)}
                    disabled={signers.length === 1}
                    className="p-2 text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
              Terms and Conditions
            </Label>
            <Textarea
              rows={6}
              placeholder="Enter the contract terms..."
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <Input
              type="checkbox"
              id="auto_renew"
              checked={formData.auto_renew}
              onChange={(e) => setFormData({ ...formData, auto_renew: e.target.checked })}
              className="w-4 h-4 border-2 border-border rounded"
            />
            <Label htmlFor="auto_renew" className="text-body-sm text-foreground">
              Auto-renew this contract when it expires
            </Label>
          </div>

          <div>
            <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
              Notes
            </Label>
            <Textarea
              rows={3}
              placeholder="Internal notes (not visible to signers)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Link
              href="/contracts"
              className="px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
            >
              Cancel
            </Link>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </Button>
            <Button
              type="button"
              onClick={(e) => handleSubmit(e, 'pending_signatures')}
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create & Send for Signatures'}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
