'use client';

import {
  Body,
  Button,
  H1,
  Input,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Search, CheckCircle, Ticket, Users, Clock, QrCode, RefreshCw } from 'lucide-react';
import { useGuestList, useCheckInTicket } from '@/hooks/useTicketing';

export default function EventCheckInPage() {
  const params = useParams();
  const eventId = params.id as string;

  const { data, isLoading, error, refetch } = useGuestList(eventId);
  const checkInMutation = useCheckInTicket();

  const [searchQuery, setSearchQuery] = useState('');
  const [manualCode, setManualCode] = useState('');

  const guests = data?.guests || [];

  const filteredGuests = guests.filter((guest) =>
    guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.ticket_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const checkedInCount = guests.filter((g) => g.checked_in).length;
  const pendingCount = guests.filter((g) => !g.checked_in).length;

  const handleCheckIn = async (ticketId: string) => {
    try {
      await checkInMutation.mutateAsync({ ticket_id: ticketId });
    } catch (err) {
      console.error('Failed to check in:', err);
    }
  };

  const handleManualCheckIn = async () => {
    if (!manualCode.trim()) return;
    const guest = guests.find((g) => g.ticket_code.toLowerCase() === manualCode.toLowerCase());
    if (guest) {
      await handleCheckIn(guest.id);
      setManualCode('');
    } else {
      alert('Ticket not found');
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading guest list...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <Body className="text-destructive">Failed to load guest list</Body>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <H1 className="text-h2-md font-weight-bold text-foreground">Check-In</H1>
          <Body className="text-body-sm text-muted-foreground mt-1">
            Scan tickets or search guests
          </Body>
        </div>
        <Button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button font-weight-medium text-body-sm hover:bg-muted transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-primary" />
            <Text className="text-body-sm text-muted-foreground">Total Guests</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-foreground">{guests.length}</Body>
        </div>
        <div className="bg-background border-2 border-success/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-success" />
            <Text className="text-body-sm text-muted-foreground">Checked In</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-success">{checkedInCount}</Body>
        </div>
        <div className="bg-background border-2 border-warning/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-warning" />
            <Text className="text-body-sm text-muted-foreground">Pending</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-warning">{pendingCount}</Body>
        </div>
      </div>

      <div className="bg-background border-2 border-primary rounded-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <QrCode className="h-5 w-5 text-primary" />
          <Text className="text-body-sm font-weight-medium text-foreground">Manual Entry</Text>
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleManualCheckIn()}
            placeholder="Enter ticket code..."
            className="flex-1 px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button
            onClick={handleManualCheckIn}
            disabled={!manualCode.trim() || checkInMutation.isPending}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary text-body-sm font-weight-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Check In
          </Button>
        </div>
      </div>

      <div className="bg-background border-2 border-border rounded-card">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or ticket code..."
              className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
          {filteredGuests.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No guests found
            </div>
          ) : (
            filteredGuests.map((guest) => (
              <div
                key={guest.id}
                className={`p-4 flex items-center justify-between transition-colors ${
                  guest.checked_in ? 'bg-success/5' : 'hover:bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-avatar flex items-center justify-center ${
                    guest.checked_in ? 'bg-success/20' : 'bg-primary/10'
                  }`}>
                    {guest.checked_in ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <Ticket className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <Body className="text-body-sm font-weight-medium text-foreground">{guest.name}</Body>
                    <Body className="text-body-xs text-muted-foreground">{guest.email}</Body>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Body className="text-body-xs font-weight-medium text-foreground">{guest.ticket_type}</Body>
                    <Body className="text-body-xs text-muted-foreground font-mono">{guest.ticket_code}</Body>
                  </div>
                  {guest.checked_in ? (
                    <div className="text-right">
                      <Text className="px-2 py-1 bg-success/20 text-success rounded-badge text-body-xs font-weight-medium">
                        Checked In
                      </Text>
                      <Body className="text-body-xs text-muted-foreground mt-1">
                        {formatTime(guest.checked_in_at)}
                      </Body>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleCheckIn(guest.id)}
                      disabled={checkInMutation.isPending}
                      className="px-4 py-2 bg-success text-success-foreground rounded-button border-2 border-success text-body-sm font-weight-medium hover:bg-success/90 transition-colors disabled:opacity-50"
                    >
                      Check In
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
