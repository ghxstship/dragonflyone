'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, DollarSign, Calendar, Clock } from 'lucide-react';
import { useSpace, useSpacePricingRules } from '@/hooks/useSpaces';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@ghxstship/ui';

interface PricingRule {
  id: string;
  name: string;
  rule_type: 'base' | 'seasonal' | 'day_of_week' | 'time_of_day' | 'minimum';
  price: number;
  price_unit: 'flat' | 'hourly' | 'daily' | 'half_day';
  conditions?: {
    days_of_week?: number[];
    start_date?: string;
    end_date?: string;
    start_time?: string;
    end_time?: string;
    minimum_hours?: number;
  };
  priority: number;
  is_active: boolean;
}

export default function SpacePricingPage() {
  const params = useParams();
  const spaceId = params.id as string;
  const queryClient = useQueryClient();

  const { data: spaceData, isLoading: spaceLoading } = useSpace(spaceId);
  const { data: pricingData, isLoading: pricingLoading } = useSpacePricingRules(spaceId);

  const [showAddForm, setShowAddForm] = useState(false);

  const space = spaceData?.space;
  const rules: PricingRule[] = pricingData?.rules || [];

  const createRule = useMutation({
    mutationFn: async (rule: Partial<PricingRule>) => {
      const response = await fetch(`/api/spaces/${spaceId}/pricing-rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule),
      });
      if (!response.ok) throw new Error('Failed to create pricing rule');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['space-pricing-rules', spaceId] });
      setShowAddForm(false);
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getRuleTypeColor = (type: string) => {
    switch (type) {
      case 'base':
        return 'bg-info-100 text-info-800';
      case 'seasonal':
        return 'bg-success-100 text-success-800';
      case 'day_of_week':
        return 'bg-violet-100 text-violet-800';
      case 'time_of_day':
        return 'bg-warning-100 text-warning-800';
      case 'minimum':
        return 'bg-error-100 text-error-800';
      default:
        return 'bg-ink-100 text-ink-800';
    }
  };

  if (spaceLoading || pricingLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading pricing rules...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/spaces/${spaceId}`}
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-h2-md font-weight-bold text-foreground">Pricing Rules</h1>
            <p className="text-body-sm text-muted-foreground mt-1">
              {space?.name || 'Space'}
            </p>
          </div>
        </div>
        <Button variant="solid" size="sm" onClick={() => setShowAddForm(true)} icon={<Plus className="h-4 w-4" />} iconPosition="left">
          Add Rule
        </Button>
      </div>

      {rules.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 border-2 border-dashed border-border rounded-card">
          <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-body-md text-muted-foreground">No pricing rules configured</p>
          <Button variant="ghost" size="sm" onClick={() => setShowAddForm(true)} icon={<Plus className="h-4 w-4" />} iconPosition="left" className="mt-4">
            Add your first pricing rule
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`bg-background border-2 border-border rounded-card p-4 ${
                !rule.is_active ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-body-md font-weight-semibold text-foreground">
                      {rule.name}
                    </h3>
                    <span className={`px-2 py-0.5 text-body-xs rounded capitalize ${getRuleTypeColor(rule.rule_type)}`}>
                      {rule.rule_type.replace('_', ' ')}
                    </span>
                    {!rule.is_active && (
                      <span className="px-2 py-0.5 text-body-xs rounded bg-ink-100 text-ink-800">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-body-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {formatCurrency(rule.price)} / {rule.price_unit}
                    </span>
                    <span>Priority: {rule.priority}</span>
                  </div>
                  {rule.conditions && (
                    <div className="mt-2 flex items-center gap-4 text-body-xs text-muted-foreground">
                      {rule.conditions.days_of_week && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {rule.conditions.days_of_week.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}
                        </span>
                      )}
                      {rule.conditions.start_time && rule.conditions.end_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {rule.conditions.start_time} - {rule.conditions.end_time}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="p-2">
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="p-2 hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-md w-full mx-4">
            <h3 className="text-h4-md font-weight-semibold text-foreground mb-4">Add Pricing Rule</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createRule.mutate({
                  name: formData.get('name') as string,
                  rule_type: formData.get('rule_type') as PricingRule['rule_type'],
                  price: parseFloat(formData.get('price') as string),
                  price_unit: formData.get('price_unit') as PricingRule['price_unit'],
                  priority: 1,
                  is_active: true,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Rule Type
                  </label>
                  <select
                    name="rule_type"
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  >
                    <option value="base">Base</option>
                    <option value="seasonal">Seasonal</option>
                    <option value="day_of_week">Day of Week</option>
                    <option value="time_of_day">Time of Day</option>
                    <option value="minimum">Minimum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Price Unit
                  </label>
                  <select
                    name="price_unit"
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  >
                    <option value="flat">Flat</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="half_day">Half Day</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  step="0.01"
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button variant="solid" size="sm" type="submit" disabled={createRule.isPending} isLoading={createRule.isPending} loadingText="Adding...">
                  Add Rule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
