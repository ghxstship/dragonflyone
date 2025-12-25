'use client';

import {
  Badge,
  Body,
  Box,
  Button,
  Card,
  Container,
  EmptyState,
  EnterprisePageHeader,
  Form,
  Grid,
  H2,
  H3,
  Input,
  Label,
  MainContent,
  Modal,
  Select,
  Skeleton,
  Stack,
  Text,
  Textarea,
} from '@ghxstship/ui';

import { useState } from 'react';
import { Search, DollarSign, Calendar, Percent, Tag, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
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
      <>
        <EnterprisePageHeader title="Pricing Rules" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Stack gap={4}>
              <Grid cols={4} gap={4}>
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
              </Grid>
              <Skeleton className="h-64" />
            </Stack>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <EnterprisePageHeader title="Pricing Rules" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Failed to load pricing rules"
              description="Please try again."
              action={{ label: 'Retry', onClick: () => window.location.reload() }}
            />
          </Container>
        </MainContent>
      </>
    );
  }

  return (
    <>
      <EnterprisePageHeader
        title="Pricing Rules"
        subtitle="Configure pricing rules, discounts, and surcharges"
        primaryAction={{ label: 'Add Rule', onClick: () => { setEditingRule(null); setShowModal(true); } }}
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            <Grid cols={4} gap={4}>
              <Card className="p-4">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <Text size="sm" className="text-muted-foreground">Total Rules</Text>
                </Stack>
                <Body className="font-weight-bold">{rules.length}</Body>
              </Card>
              <Card className="p-4 border-success/50">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <ToggleRight className="h-5 w-5 text-success" />
                  <Text size="sm" className="text-muted-foreground">Active</Text>
                </Stack>
                <Body className="font-weight-bold text-success">{rules.filter((r) => r.is_active).length}</Body>
              </Card>
              <Card className="p-4 border-secondary/50">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <Percent className="h-5 w-5 text-secondary" />
                  <Text size="sm" className="text-muted-foreground">Discounts</Text>
                </Stack>
                <Body className="font-weight-bold text-secondary">{rules.filter((r) => r.rule_type === 'discount').length}</Body>
              </Card>
              <Card className="p-4 border-warning/50">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <Calendar className="h-5 w-5 text-warning" />
                  <Text size="sm" className="text-muted-foreground">Seasonal</Text>
                </Stack>
                <Body className="font-weight-bold text-warning">{rules.filter((r) => r.rule_type === 'seasonal').length}</Body>
              </Card>
            </Grid>

            <Stack direction="horizontal" gap={4} className="flex-wrap items-center">
              <Box className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search rules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </Box>
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="">All Types</option>
                {Object.entries(RULE_TYPE_CONFIG).map(([type, config]) => (
                  <option key={type} value={type}>{config.label}</option>
                ))}
              </Select>
            </Stack>

            {filteredRules.length === 0 ? (
              <EmptyState
                title="No pricing rules found"
                description="Create pricing rules to configure your venue pricing."
                icon={<DollarSign className="h-12 w-12" />}
                action={{ label: 'Add First Rule', onClick: () => setShowModal(true) }}
              />
            ) : (
              <Stack gap={3}>
                {filteredRules.map((rule) => {
                  const typeConfig = RULE_TYPE_CONFIG[rule.rule_type] || RULE_TYPE_CONFIG.base;
                  const TypeIcon = typeConfig.icon;

                  return (
                    <Card key={rule.id} className={`p-4 ${!rule.is_active ? 'opacity-60' : ''}`}>
                      <Stack direction="horizontal" className="justify-between items-start">
                        <Stack direction="horizontal" gap={3} className="items-start">
                          <Box className={`p-2 rounded-card bg-muted ${typeConfig.color}`}>
                            <TypeIcon className="h-5 w-5" />
                          </Box>
                          <Box>
                            <Stack direction="horizontal" gap={2} className="items-center mb-1">
                              <H3>{rule.name}</H3>
                              <Badge className={rule.is_active ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}>
                                {rule.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                              <Badge className="bg-muted text-muted-foreground">{typeConfig.label}</Badge>
                            </Stack>
                            {rule.description && <Body size="sm" className="text-muted-foreground mb-2">{rule.description}</Body>}
                            <Stack direction="horizontal" gap={4} className="text-muted-foreground">
                              {rule.price !== undefined && <Text size="xs">${rule.price} {rule.price_unit && `/ ${rule.price_unit}`}</Text>}
                              {rule.percentage !== undefined && <Text size="xs">{rule.percentage}%</Text>}
                              <Text size="xs">Priority: {rule.priority}</Text>
                              {rule.valid_from && (
                                <Text size="xs">
                                  Valid: {new Date(rule.valid_from).toLocaleDateString()}
                                  {rule.valid_to && ` - ${new Date(rule.valid_to).toLocaleDateString()}`}
                                </Text>
                              )}
                            </Stack>
                          </Box>
                        </Stack>
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="ghost" size="sm" onClick={() => handleToggle(rule)} title={rule.is_active ? 'Deactivate' : 'Activate'}>
                            {rule.is_active ? <ToggleRight className="h-4 w-4 text-success" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { setEditingRule(rule); setShowModal(true); }}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(rule)} className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </Stack>
                      </Stack>
                    </Card>
                  );
                })}
              </Stack>
            )}

            <PricingRuleModal
              rule={editingRule}
              open={showModal}
              onClose={() => { setShowModal(false); setEditingRule(null); }}
              onSave={(data) => {
                if (editingRule) {
                  updateMutation.mutate({ id: editingRule.id, ...data });
                } else {
                  createMutation.mutate(data);
                }
              }}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}

interface PricingRuleModalProps {
  rule: PricingRule | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<PricingRule>) => void;
  isLoading: boolean;
}

function PricingRuleModal({ rule, open, onClose, onSave, isLoading }: PricingRuleModalProps) {
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
    <Modal open={open} onClose={onClose} title={rule ? 'Edit Pricing Rule' : 'New Pricing Rule'}>
      <Form onSubmit={handleSubmit}>
        <Stack gap={4}>
          <Box>
            <Label className="block mb-1">Rule Name *</Label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Weekend Surcharge"
            />
          </Box>

          <Box>
            <Label className="block mb-1">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </Box>

          <Box>
            <Label className="block mb-1">Rule Type *</Label>
            <Select
              value={formData.rule_type}
              onChange={(e) => setFormData({ ...formData, rule_type: e.target.value as PricingRule['rule_type'] })}
            >
              {Object.entries(RULE_TYPE_CONFIG).map(([type, config]) => (
                <option key={type} value={type}>{config.label}</option>
              ))}
            </Select>
          </Box>

          <Grid cols={2} gap={4}>
            <Box>
              <Label className="block mb-1">Price ($)</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                step="0.01"
                min="0"
              />
            </Box>
            <Box>
              <Label className="block mb-1">Percentage (%)</Label>
              <Input
                type="number"
                value={formData.percentage}
                onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                step="0.1"
              />
            </Box>
          </Grid>

          <Grid cols={2} gap={4}>
            <Box>
              <Label className="block mb-1">Price Unit</Label>
              <Select value={formData.price_unit} onChange={(e) => setFormData({ ...formData, price_unit: e.target.value })}>
                <option value="event">Per Event</option>
                <option value="hour">Per Hour</option>
                <option value="day">Per Day</option>
                <option value="guest">Per Guest</option>
              </Select>
            </Box>
            <Box>
              <Label className="block mb-1">Priority</Label>
              <Input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                min="0"
              />
            </Box>
          </Grid>

          <Grid cols={2} gap={4}>
            <Box>
              <Label className="block mb-1">Valid From</Label>
              <Input type="date" value={formData.valid_from} onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })} />
            </Box>
            <Box>
              <Label className="block mb-1">Valid To</Label>
              <Input type="date" value={formData.valid_to} onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })} />
            </Box>
          </Grid>

          <Stack direction="horizontal" gap={2} className="items-center">
            <Input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="is_active">Active</Label>
          </Stack>

          <Stack direction="horizontal" gap={3} className="justify-end pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading || !formData.name}>
              {isLoading ? 'Saving...' : rule ? 'Update' : 'Create'}
            </Button>
          </Stack>
        </Stack>
      </Form>
    </Modal>
  );
}
