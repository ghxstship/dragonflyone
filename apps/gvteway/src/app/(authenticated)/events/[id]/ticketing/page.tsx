'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Ticket, Edit2, Trash2, DollarSign, Users, ToggleLeft, ToggleRight } from 'lucide-react';
import { useTicketTypes, useCreateTicketType, useUpdateTicketType, useDeleteTicketType } from '@/hooks/useTicketing';

interface TicketTypeForm {
  name: string;
  description: string;
  price: number;
  quantity_available: number;
  max_per_order: number;
  sales_start: string;
  sales_end: string;
  is_active: boolean;
}

const DEFAULT_FORM: TicketTypeForm = {
  name: '',
  description: '',
  price: 0,
  quantity_available: 100,
  max_per_order: 10,
  sales_start: '',
  sales_end: '',
  is_active: true,
};

export default function EventTicketingPage() {
  const params = useParams();
  const eventId = params.id as string;

  const { data, isLoading, error } = useTicketTypes(eventId);
  const createMutation = useCreateTicketType();
  const updateMutation = useUpdateTicketType();
  const deleteMutation = useDeleteTicketType();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TicketTypeForm>(DEFAULT_FORM);

  const ticketTypes = data?.ticket_types || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(DEFAULT_FORM);
    setShowModal(true);
  };

  const handleOpenEdit = (ticketType: typeof ticketTypes[0]) => {
    setEditingId(ticketType.id);
    setFormData({
      name: ticketType.name,
      description: ticketType.description || '',
      price: ticketType.price,
      quantity_available: ticketType.quantity_available || 0,
      max_per_order: ticketType.max_per_order || 10,
      sales_start: ticketType.sales_start || '',
      sales_end: ticketType.sales_end || '',
      is_active: ticketType.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          ticketTypeId: editingId,
          input: formData,
        });
      } else {
        await createMutation.mutateAsync({
          event_id: eventId,
          ...formData,
        });
      }
      setShowModal(false);
      setFormData(DEFAULT_FORM);
      setEditingId(null);
    } catch (err) {
      console.error('Failed to save ticket type:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ticket type?')) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      console.error('Failed to delete ticket type:', err);
    }
  };

  const handleToggleActive = async (ticketType: typeof ticketTypes[0]) => {
    try {
      await updateMutation.mutateAsync({
        ticketTypeId: ticketType.id,
        input: { is_active: !ticketType.is_active },
      });
    } catch (err) {
      console.error('Failed to toggle ticket type:', err);
    }
  };

  const totalCapacity = ticketTypes.reduce((sum, t) => sum + (t.quantity_available || 0), 0);
  const totalSold = ticketTypes.reduce((sum, t) => sum + (t.quantity_sold || 0), 0);
  const totalRevenue = ticketTypes.reduce((sum, t) => sum + (t.quantity_sold || 0) * t.price, 0);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading ticketing...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <p className="text-destructive">Failed to load ticket types</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground">Event Ticketing</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Manage ticket types and pricing
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Ticket Type
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Ticket className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Total Capacity</span>
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">{totalCapacity}</p>
        </div>
        <div className="bg-background border-2 border-success/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-success" />
            <span className="text-body-sm text-muted-foreground">Tickets Sold</span>
          </div>
          <p className="text-h3-md font-weight-bold text-success">{totalSold}</p>
        </div>
        <div className="bg-background border-2 border-primary/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Total Revenue</span>
          </div>
          <p className="text-h3-md font-weight-bold text-primary">{formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      <div className="bg-background border-2 border-border rounded-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-h4-md font-weight-semibold text-foreground">Ticket Types</h2>
        </div>

        {ticketTypes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No ticket types created yet. Click &quot;Add Ticket Type&quot; to get started.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {ticketTypes.map((ticketType) => (
              <div key={ticketType.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-avatar flex items-center justify-center ${ticketType.is_active ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Ticket className={`h-5 w-5 ${ticketType.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="text-body-sm font-weight-medium text-foreground">{ticketType.name}</p>
                    <p className="text-body-xs text-muted-foreground">{ticketType.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-body-lg font-weight-bold text-foreground">{formatCurrency(ticketType.price)}</p>
                    <p className="text-body-xs text-muted-foreground">
                      {ticketType.quantity_sold || 0} / {ticketType.quantity_available || 0} sold
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleActive(ticketType)}
                    className="p-2 hover:bg-muted rounded-button transition-colors"
                  >
                    {ticketType.is_active ? (
                      <ToggleRight className="h-5 w-5 text-success" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(ticketType)}
                    className="p-2 hover:bg-muted rounded-button transition-colors"
                  >
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(ticketType.id)}
                    className="p-2 hover:bg-destructive/10 rounded-button transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 w-full max-w-lg">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">
              {editingId ? 'Edit Ticket Type' : 'Create Ticket Type'}
            </h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="General Admission"
                  className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Access to all general areas"
                  rows={2}
                  className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm font-weight-medium text-foreground mb-1">Price *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-body-sm font-weight-medium text-foreground mb-1">Quantity *</label>
                  <input
                    type="number"
                    value={formData.quantity_available}
                    onChange={(e) => setFormData({ ...formData, quantity_available: parseInt(e.target.value) || 0 })}
                    min="1"
                    className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm font-weight-medium text-foreground mb-1">Sale Start</label>
                  <input
                    type="datetime-local"
                    value={formData.sales_start}
                    onChange={(e) => setFormData({ ...formData, sales_start: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-body-sm font-weight-medium text-foreground mb-1">Sale End</label>
                  <input
                    type="datetime-local"
                    value={formData.sales_end}
                    onChange={(e) => setFormData({ ...formData, sales_end: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">Max Per Order</label>
                <input
                  type="number"
                  value={formData.max_per_order}
                  onChange={(e) => setFormData({ ...formData, max_per_order: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                  setFormData(DEFAULT_FORM);
                }}
                className="px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.name || createMutation.isPending || updateMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary text-body-sm font-weight-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
