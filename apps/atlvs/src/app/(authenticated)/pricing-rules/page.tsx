'use client';

import {
  Body,
  Button,
  Form,
  H1,
  H2,
  H3,
  Input,
  Label,
  Select,
  Text,
  Textarea,
} from '@ghxstship/ui';

import { useState } from 'react';
import { Plus, Search, DollarSign, Calendar, Percent, Tag, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface PricingRule {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  rule_type: 'base' | 'seasonal' | 'event_type' | 'day_of_week' | 'time_of_day' | 'minimum_spend' | 'discount' | 'surcharge';
  price?: number;
  percentage?: number;
  price_unit?: string;
  applies_to?: string[];
  conditions?: Record<string, unknown>;
  priority: number;
  is_active: boolean;
  valid_from?: string;
  valid_to?: string;
  created_at: string;
  updated_at: string;
}

interface PricingRulesResponse {
  rules: PricingRule[];
  total: number;
}

const RULE_TYPE_CONFIG = {
  base: { label: 'Base Price', icon: DollarSign, color: 'text-primary' },
  seasonal: { label: 'Seasonal', icon: Calendar, color: 'text-secondary' },
  event_type: { label: 'Event Type', icon: Tag, color: 'text-accent' },
  day_of_week: { label: 'Day of Week', icon: Calendar, color: 'text-warning' },
  time_of_day: { label: 'Time of Day', icon: Calendar, color: 'text-info' },
  minimum_spend: { label: 'Minimum Spend', icon: DollarSign, color: 'text-success' },
  discount: { label: 'Discount', icon: Percent, color: 'text-success' },
  surcharge: { label: 'Surcharge', icon: Percent, color: 'text-destructive' },
};

export default function PricingPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['pricing-rules', typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (typeFilter) params.set('rule_type', typeFilter);
      const response = await fetch(`/api/pricing-rules?${params}`);
      if (!response.ok) throw new Error('Failed to fetch pricing rules');
      return response.json() as Promise<PricingRulesResponse>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (input: Partial<PricingRule>) => {
      const response = await fetch('/api/pricing-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error('Failed to create pricing rule');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
      setShowModal(false);
      setEditingRule(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...input }: Partial<PricingRule> & { id: string }) => {
      const response = await fetch(`/api/pricing-rules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error('Failed to update pricing rule');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
      setShowModal(false);
      setEditingRule(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/pricing-rules/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete pricing rule');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const response = await fetch(`/api/pricing-rules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active }),
      });
      if (!response.ok) throw new Error('Failed to toggle pricing rule');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
    },
  });

  const rules = data?.rules || [];
  const filteredRules = searchQuery
    ? rules.filter(
        (r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : rules;

  const handleDelete = async (rule: PricingRule) => {
    if (confirm(`Delete pricing rule "${rule.name}"? This action cannot be undone.`)) {
      await deleteMutation.mutateAsync(rule.id);
    }
  };

  const handleToggle = async (rule: PricingRule) => {
    await toggleMutation.mutateAsync({ id: rule.id, is_active: !rule.is_active });
  };

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
          Failed to load pricing rules. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <H1 className="text-h2-md font-weight-bold text-foreground">Pricing Rules</H1>
          <Body className="text-body-sm text-muted-foreground mt-1">
            Configure pricing rules, discounts, and surcharges
          </Body>
        </div>
        <Button
          onClick={() => {
            setEditingRule(null);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Rule
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <Text className="text-body-sm text-muted-foreground">Total Rules</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-foreground">{rules.length}</Body>
        </div>
        <div className="bg-background border-2 border-success/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <ToggleRight className="h-5 w-5 text-success" />
            <Text className="text-body-sm text-muted-foreground">Active</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-success">
            {rules.filter((r) => r.is_active).length}
          </Body>
        </div>
        <div className="bg-background border-2 border-secondary/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="h-5 w-5 text-secondary" />
            <Text className="text-body-sm text-muted-foreground">Discounts</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-secondary">
            {rules.filter((r) => r.rule_type === 'discount').length}
          </Body>
        </div>
        <div className="bg-background border-2 border-warning/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-warning" />
            <Text className="text-body-sm text-muted-foreground">Seasonal</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-warning">
            {rules.filter((r) => r.rule_type === 'seasonal').length}
          </Body>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Types</option>
          {Object.entries(RULE_TYPE_CONFIG).map(([type, config]) => (
            <option key={type} value={type}>
              {config.label}
            </option>
          ))}
        </Select>
      </div>

      {filteredRules.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-card border-2 border-dashed border-border">
          <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <H3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No pricing rules found
          </H3>
          <Body className="text-body-sm text-muted-foreground mb-4">
            Create pricing rules to configure your venue pricing.
          </Body>
          <Button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm"
          >
            <Plus className="h-4 w-4" />
            Add First Rule
          </Button>
        </div>
      )}

      {filteredRules.length > 0 && (
        <div className="space-y-3">
          {filteredRules.map((rule) => {
            const typeConfig = RULE_TYPE_CONFIG[rule.rule_type] || RULE_TYPE_CONFIG.base;
            const TypeIcon = typeConfig.icon;

            return (
              <div
                key={rule.id}
                className={`bg-background border-2 rounded-card p-4 ${
                  rule.is_active ? 'border-border' : 'border-border/50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-card bg-muted ${typeConfig.color}`}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <H3 className="text-body-md font-weight-semibold text-foreground">
                          {rule.name}
                        </H3>
                        <Text className={`px-2 py-0.5 rounded-badge text-body-xs font-weight-medium ${
                          rule.is_active ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                        }`}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </Text>
                        <Text className="px-2 py-0.5 rounded-badge text-body-xs bg-muted text-muted-foreground">
                          {typeConfig.label}
                        </Text>
                      </div>
                      {rule.description && (
                        <Body className="text-body-sm text-muted-foreground mb-2">{rule.description}</Body>
                      )}
                      <div className="flex items-center gap-4 text-body-xs text-muted-foreground">
                        {rule.price !== undefined && (
                          <Text>${rule.price} {rule.price_unit && `/ ${rule.price_unit}`}</Text>
                        )}
                        {rule.percentage !== undefined && (
                          <Text>{rule.percentage}%</Text>
                        )}
                        <Text>Priority: {rule.priority}</Text>
                        {rule.valid_from && (
                          <Text>
                            Valid: {new Date(rule.valid_from).toLocaleDateString()}
                            {rule.valid_to && ` - ${new Date(rule.valid_to).toLocaleDateString()}`}
                          </Text>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleToggle(rule)}
                      className="p-2 hover:bg-muted rounded-button transition-colors"
                      title={rule.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {rule.is_active ? (
                        <ToggleRight className="h-4 w-4 text-success" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingRule(rule);
                        setShowModal(true);
                      }}
                      className="p-2 hover:bg-muted rounded-button transition-colors"
                    >
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(rule)}
                      className="p-2 hover:bg-destructive/10 rounded-button transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <PricingRuleModal
          rule={editingRule}
          onClose={() => {
            setShowModal(false);
            setEditingRule(null);
          }}
          onSave={(data) => {
            if (editingRule) {
              updateMutation.mutate({ id: editingRule.id, ...data });
            } else {
              createMutation.mutate(data);
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}

interface PricingRuleModalProps {
  rule: PricingRule | null;
  onClose: () => void;
  onSave: (data: Partial<PricingRule>) => void;
  isLoading: boolean;
}

function PricingRuleModal({ rule, onClose, onSave, isLoading }: PricingRuleModalProps) {
  const [formData, setFormData] = useState({
    name: rule?.name || '',
    description: rule?.description || '',
    rule_type: rule?.rule_type || 'base',
    price: rule?.price?.toString() || '',
    percentage: rule?.percentage?.toString() || '',
    price_unit: rule?.price_unit || 'event',
    priority: rule?.priority?.toString() || '0',
    is_active: rule?.is_active ?? true,
    valid_from: rule?.valid_from || '',
    valid_to: rule?.valid_to || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      description: formData.description || undefined,
      rule_type: formData.rule_type as PricingRule['rule_type'],
      price: formData.price ? parseFloat(formData.price) : undefined,
      percentage: formData.percentage ? parseFloat(formData.percentage) : undefined,
      price_unit: formData.price_unit || undefined,
      priority: parseInt(formData.priority) || 0,
      is_active: formData.is_active,
      valid_from: formData.valid_from || undefined,
      valid_to: formData.valid_to || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border-2 border-border rounded-modal w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <H2 className="text-h3-md font-weight-bold text-foreground">
            {rule ? 'Edit Pricing Rule' : 'New Pricing Rule'}
          </H2>
        </div>
        <Form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
              Rule Name *
            </Label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
              placeholder="e.g., Weekend Surcharge"
            />
          </div>

          <div>
            <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
              Description
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div>
            <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
              Rule Type *
            </Label>
            <Select
              value={formData.rule_type}
              onChange={(e) => setFormData({ ...formData, rule_type: e.target.value as PricingRule['rule_type'] })}
              className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
            >
              {Object.entries(RULE_TYPE_CONFIG).map(([type, config]) => (
                <option key={type} value={type}>
                  {config.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Price ($)
              </Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Percentage (%)
              </Label>
              <Input
                type="number"
                value={formData.percentage}
                onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                step="0.1"
                className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Price Unit
              </Label>
              <Select
                value={formData.price_unit}
                onChange={(e) => setFormData({ ...formData, price_unit: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
              >
                <option value="event">Per Event</option>
                <option value="hour">Per Hour</option>
                <option value="day">Per Day</option>
                <option value="guest">Per Guest</option>
              </Select>
            </div>
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Priority
              </Label>
              <Input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                min="0"
                className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Valid From
              </Label>
              <Input
                type="date"
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Valid To
              </Label>
              <Input
                type="date"
                value={formData.valid_to}
                onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="is_active" className="text-body-sm text-foreground">
              Active
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : rule ? 'Update' : 'Create'}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
