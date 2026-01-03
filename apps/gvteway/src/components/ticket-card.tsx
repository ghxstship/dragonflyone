'use client';

import { Card, H3, Body, Button, StatusBadge, Divider, Stack, Label } from '@ghxstship/ui';

interface TicketCardProps {
  id: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  ticketType: string;
  quantity: number;
  qrCode?: string;
  status: 'valid' | 'used' | 'cancelled';
}

export function TicketCard({
  id,
  eventTitle,
  eventDate,
  venue,
  ticketType,
  quantity,
  qrCode,
  status,
}: TicketCardProps) {
  const getStatusVariant = (status: 'valid' | 'used' | 'cancelled'): "success" | "neutral" | "error" => {
    switch (status) {
      case 'valid': return 'success';
      case 'used': return 'neutral';
      case 'cancelled': return 'error';
    }
  };

  const getCardBorder = (status: 'valid' | 'used' | 'cancelled'): string => {
    switch (status) {
      case 'valid': return 'border-black';
      case 'used': return 'border-border';
      case 'cancelled': return 'border-border';
    }
  };

  return (
    <Card className={`p-6 border-2 ${getCardBorder(status)}`}>
      <Stack gap={4}>
        <Stack direction="horizontal" className="items-start justify-between">
          <Stack gap={1}>
            <H3>{eventTitle}</H3>
            <Body size="sm" className="font-mono">{new Date(eventDate).toLocaleDateString()}</Body>
            <Body size="sm" className="text-on-light-secondary">{venue}</Body>
          </Stack>
          <StatusBadge status={getStatusVariant(status)} size="sm">
            {status}
          </StatusBadge>
        </Stack>

        <Divider />

        <Stack gap={2}>
          <Body size="sm">
            <Label className="font-weight-bold">Type:</Label> {ticketType}
          </Body>
          <Body size="sm">
            <Label className="font-weight-bold">Quantity:</Label> {quantity}
          </Body>
          <Body className="text-mono-xs text-on-light-muted">ID: {id}</Body>
        </Stack>

        {qrCode && status === 'valid' && (
          <>
            <Divider />
            <Stack className="flex h-32 w-32 items-center justify-center border-2 border-black bg-white">
              <Body className="text-mono-xs">QR Code</Body>
            </Stack>
          </>
        )}

        {status === 'valid' && (
          <Button variant="solid" size="lg" className="w-full">
            Download Ticket
          </Button>
        )}
      </Stack>
    </Card>
  );
}
