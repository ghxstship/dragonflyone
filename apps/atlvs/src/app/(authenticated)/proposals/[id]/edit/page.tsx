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
  Text,
  Textarea,
} from '@ghxstship/ui';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2, FileText, DollarSign } from 'lucide-react';
import { useProposal, useUpdateProposal } from '@/hooks/useProposals';

interface PricingItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export default function EditProposalPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.id as string;

  const { data: proposal, isLoading } = useProposal(proposalId);
  const updateProposal = useUpdateProposal();

  const [formData, setFormData] = useState({
    name: '',
    introduction: '',
    terms: '',
    valid_until: '',
    status: 'draft',
  });

  const [pricingItems, setPricingItems] = useState<PricingItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (proposal) {
      setFormData({
        name: proposal.name || '',
        introduction: proposal.introduction || '',
        terms: proposal.terms || '',
        valid_until: proposal.valid_until?.split('T')[0] || '',
        status: proposal.status || 'draft',
      });
      setPricingItems(proposal.pricing_items || []);
    }
  }, [proposal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const addPricingItem = () => {
    const newItem: PricingItem = {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      unit_price: 0,
      total: 0,
    };
    setPricingItems((prev) => [...prev, newItem]);
  };

  const updatePricingItem = (itemId: string, field: keyof PricingItem, value: string | number) => {
    setPricingItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unit_price') {
            updated.total = updated.quantity * updated.unit_price;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const removePricingItem = (itemId: string) => {
    setPricingItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const calculateTotal = () => {
    return pricingItems.reduce((sum, item) => sum + item.total, 0);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Proposal name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await updateProposal.mutateAsync({
        proposalId,
        name: formData.name,
        introduction: formData.introduction || undefined,
        terms: formData.terms || undefined,
        valid_until: formData.valid_until || undefined,
        status: formData.status as 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired',
        pricing_items: pricingItems,
        subtotal: calculateTotal(),
        total_amount: calculateTotal(),
      });
      router.push(`/proposals/${proposalId}`);
    } catch (error) {
      setErrors({ submit: 'Failed to update proposal' });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading proposal...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/proposals/${proposalId}`}
          className="p-2 hover:bg-muted rounded-button transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <H1 className="text-h2-md font-weight-bold text-foreground">Edit Proposal</H1>
          <Body className="text-body-sm text-muted-foreground mt-1">
            {proposal?.proposal_number}
          </Body>
        </div>
      </div>

      <Form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-background border-2 border-border rounded-card p-6">
          <H2 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Proposal Details
          </H2>
          <div className="space-y-4">
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Proposal Name *
              </Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border-2 rounded-button focus:outline-none focus:border-primary ${
                  errors.name ? 'border-destructive' : 'border-border'
                }`}
              />
              {errors.name && (
                <Body className="text-body-xs text-destructive mt-1">{errors.name}</Body>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Valid Until
                </Label>
                <Input
                  type="date"
                  name="valid_until"
                  value={formData.valid_until}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Status
                </Label>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="viewed">Viewed</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="expired">Expired</option>
                </Select>
              </div>
            </div>
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Introduction
              </Label>
              <Textarea
                name="introduction"
                value={formData.introduction}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary resize-none"
              />
            </div>
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Terms & Conditions
              </Label>
              <Textarea
                name="terms"
                value={formData.terms}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <div className="flex items-center justify-between mb-4">
            <H2 className="text-h4-md font-weight-semibold text-foreground flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing Items
            </H2>
            <Button
              type="button"
              onClick={addPricingItem}
              className="flex items-center gap-2 px-3 py-1.5 text-body-sm text-primary border-2 border-primary rounded-button hover:bg-primary/5 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
          {pricingItems.length === 0 ? (
            <div className="text-center py-8 bg-muted/30 border-2 border-dashed border-border rounded-card">
              <Body className="text-body-sm text-muted-foreground">No pricing items</Body>
              <Button
                type="button"
                onClick={addPricingItem}
                className="mt-2 text-primary text-body-sm hover:underline"
              >
                Add your first item
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {pricingItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-3 items-center p-3 bg-muted/30 border-2 border-border rounded-card"
                >
                  <div className="col-span-5">
                    <Input
                      type="text"
                      value={item.description}
                      onChange={(e) => updatePricingItem(item.id, 'description', e.target.value)}
                      placeholder="Description"
                      className="w-full px-3 py-1.5 border-2 border-border rounded text-body-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updatePricingItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      min="1"
                      className="w-full px-3 py-1.5 border-2 border-border rounded text-body-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updatePricingItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-1.5 border-2 border-border rounded text-body-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="col-span-2 text-right">
                    <Text className="text-body-sm font-weight-medium text-foreground">
                      {formatCurrency(item.total)}
                    </Text>
                  </div>
                  <div className="col-span-1 text-right">
                    <Button
                      type="button"
                      onClick={() => removePricingItem(item.id)}
                      className="p-1 hover:bg-destructive/10 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-end pt-3 border-t border-border">
                <div className="text-right">
                  <Text className="text-body-sm text-muted-foreground mr-4">Total:</Text>
                  <Text className="text-h4-md font-weight-bold text-foreground">
                    {formatCurrency(calculateTotal())}
                  </Text>
                </div>
              </div>
            </div>
          )}
        </div>

        {errors.submit && (
          <div className="p-4 bg-destructive/10 border-2 border-destructive rounded-card">
            <Body className="text-body-sm text-destructive">{errors.submit}</Body>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link
            href={`/proposals/${proposalId}`}
            className="px-6 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            disabled={updateProposal.isPending}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {updateProposal.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
