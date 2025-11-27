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
      case 'used': return 'border-grey-500';
      case 'cancelled': return 'border-grey-800';
    }
  };

  return (
    <Card className={`p-6 border-2 ${getCardBorder(status)}`}>
      <Stack gap={4}>
        <Stack direction="horizontal" className="items-start justify-between">
          <Stack gap={1}>
            <H3>{eventTitle}</H3>
            <Body className="text-body-sm font-mono">{new Date(eventDate).toLocaleDateString()}</Body>
            <Body className="text-body-sm text-grey-600">{venue}</Body>
          </Stack>
          <StatusBadge status={getStatusVariant(status)} size="sm">
            {status}
          </StatusBadge>
        </Stack>

        <Divider />

        <Stack gap={2}>
          <Body className="text-body-sm">
            <Label className="font-bold">Type:</Label> {ticketType}
          </Body>
          <Body className="text-body-sm">
            <Label className="font-bold">Quantity:</Label> {quantity}
          </Body>
          <Body className="text-mono-xs text-grey-500">ID: {id}</Body>
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
