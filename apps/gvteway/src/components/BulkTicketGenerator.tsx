'use client';

import { useState } from 'react';
import { Button, Input, Label, Alert, Card, Stack, H3, Body, Select, Field } from '@ghxstship/ui';

interface BulkTicketGeneratorProps {
  eventId: string;
  ticketTypes: Array<{ id: string; name: string; price: number; available: number }>;
  onSuccess?: () => void;
}

export default function BulkTicketGenerator({ 
  eventId, 
  ticketTypes, 
  onSuccess 
}: BulkTicketGeneratorProps) {
  const [selectedType, setSelectedType] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [prefix, setPrefix] = useState('');
  const [startNumber, setStartNumber] = useState('1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleGenerate = async () => {
    if (!selectedType) {
      setResult({ success: false, message: 'Please select a ticket type' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`/api/events/${eventId}/tickets/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_type_id: selectedType,
          quantity: parseInt(quantity, 10),
          prefix: prefix || undefined,
          start_number: startNumber ? parseInt(startNumber, 10) : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: `Successfully generated ${data.totalGenerated} tickets for ${data.ticketType}`,
        });
        setQuantity('100');
        setPrefix('');
        setStartNumber('1');
        onSuccess?.();
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to generate tickets',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <Stack gap={6}>
        <Stack>
          <H3 className="mb-2">Bulk Ticket Generator</H3>
          <Body className="text-grey-600">
            Generate multiple tickets at once for efficient inventory management
          </Body>
        </Stack>

      {result && (
        <Alert variant={result.success ? 'success' : 'error'}>
          {result.message}
        </Alert>
      )}

        <Stack gap={4}>
          <Field label="Ticket Type *">
            <Select
              id="ticketType"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              disabled={loading}
            >
              <option value="">Select a ticket type</option>
              {ticketTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} - ${(type.price / 100).toFixed(2)} ({type.available} available)
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Quantity *" hint="Maximum 10,000 tickets per batch">
            <Input
              id="quantity"
              type="number"
              min="1"
              max="10000"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={loading}
            />
          </Field>

          <Field label="Ticket Code Prefix (Optional)" hint="If empty, uses first 3 letters of ticket type name">
            <Input
              id="prefix"
              type="text"
              maxLength={10}
              value={prefix}
              onChange={(e) => setPrefix(e.target.value.toUpperCase())}
              placeholder="e.g., VIP, GA, EVENT"
              disabled={loading}
            />
          </Field>

          <Field label="Starting Number (Optional)" hint="Tickets will be numbered sequentially from this value">
            <Input
              id="startNumber"
              type="number"
              min="1"
              value={startNumber}
              onChange={(e) => setStartNumber(e.target.value)}
              disabled={loading}
            />
          </Field>

          <Button
            onClick={handleGenerate}
            disabled={loading || !selectedType}
            variant="solid"
            size="lg"
            className="w-full"
          >
            {loading ? 'Generating...' : 'Generate Tickets'}
          </Button>
        </Stack>

        <Card className="bg-grey-100 p-4">
          <Label className="mb-2 text-sm font-bold uppercase text-grey-700">Preview</Label>
          <Body className="text-grey-600">
            {selectedType && ticketTypes.find((t) => t.id === selectedType)
              ? `Ticket codes will be generated as: ${
                  prefix || ticketTypes.find((t) => t.id === selectedType)!.name.substring(0, 3).toUpperCase()
                }${(parseInt(startNumber, 10) || 1).toString().padStart(8, '0')} to ${
                  prefix || ticketTypes.find((t) => t.id === selectedType)!.name.substring(0, 3).toUpperCase()
                }${((parseInt(startNumber, 10) || 1) + parseInt(quantity, 10) - 1).toString().padStart(8, '0')}`
              : 'Select ticket type to see preview'}
          </Body>
        </Card>
      </Stack>
    </Card>
  );
}
