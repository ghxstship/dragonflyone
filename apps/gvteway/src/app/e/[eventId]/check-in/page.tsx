'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  SectionHeader,
  Card,
  CardBody,
  Stack,
  StatCard,
  Button,
  Badge,
  Grid,
  Body,
  H3,
  Input,
} from '@ghxstship/ui';
import {
  Scan,
  Users,
  CheckCircle,
  XCircle,
  Search,
  Clock,
  RefreshCw,
} from 'lucide-react';
// Layout provided by route group
import { useEventCheckInData } from '@/hooks/useEventOperations';

import {
  DEMO_RECENT_SCANS,
  type DemoRecentScan as RecentScan,
} from '@/lib/demo-data';

export default function EventCheckInPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const [recentScans, setRecentScans] = useState<RecentScan[]>(DEMO_RECENT_SCANS);
  const [manualSearch, setManualSearch] = useState('');

  const { stats, searchTicket, isSearching, refetch } = useEventCheckInData(eventId);

  const checkedInPercentage = Math.round((stats.checkedIn / stats.totalCapacity) * 100);

  const handleManualSearch = async () => {
    if (!manualSearch.trim()) return;
    try {
      const data = await searchTicket(manualSearch);
      if (data.ticket) {
        setRecentScans(prev => [{
          id: Date.now().toString(),
          ticketId: data.ticket.id,
          name: data.ticket.name,
          ticketType: data.ticket.type,
          status: data.ticket.status,
          timestamp: new Date(),
        }, ...prev.slice(0, 9)]);
      }
      setManualSearch('');
    } catch {
      // Error handled by hook
    }
  };

  const getStatusBadge = (status: RecentScan['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="success">Checked In</Badge>;
      case 'duplicate':
        return <Badge variant="warning">Duplicate</Badge>;
      case 'invalid':
        return <Badge variant="error">Invalid</Badge>;
      case 'expired':
        return <Badge variant="error">Expired</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <>
      <Stack gap={8}>
        <SectionHeader
          kicker="Event"
          title="Check-In Dashboard"
          description="Real-time attendance tracking and ticket scanning"
          colorScheme="on-dark"
        />

        <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Checked In"
            value={stats.checkedIn.toLocaleString()}
            icon={<CheckCircle size={20} />}
            trend="up"
            inverted
          />
          <StatCard
            label="Pending"
            value={stats.pending.toLocaleString()}
            icon={<Users size={20} />}
            inverted
          />
          <StatCard
            label="Denied"
            value={stats.denied.toString()}
            icon={<XCircle size={20} />}
            inverted
          />
          <StatCard
            label="Attendance"
            value={`${checkedInPercentage}%`}
            icon={<Scan size={20} />}
            trend={checkedInPercentage >= 50 ? 'up' : undefined}
            inverted
          />
        </Grid>

        <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
          <Card variant="elevated" inverted>
            <CardBody>
              <Stack gap={4}>
                <H3 className="text-white">Manual Lookup</H3>
                <Stack direction="horizontal" gap={2}>
                  <Input
                    value={manualSearch}
                    onChange={(e) => setManualSearch(e.target.value)}
                    placeholder="Search by ticket ID, name, or email..."
                    onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                  />
                  <Button variant="solid" onClick={handleManualSearch} disabled={isSearching}>
                    <Search size={16} />
                  </Button>
                </Stack>
                <Body size="sm" className=" text-on-dark-muted">
                  Enter ticket ID, attendee name, or email to manually check in
                </Body>
              </Stack>
            </CardBody>
          </Card>

          <Card variant="elevated" inverted>
            <CardBody>
              <Stack gap={4}>
                <Stack direction="horizontal" className="items-center justify-between">
                  <H3 className="text-white">Scanner Status</H3>
                  <Badge variant="success">Online</Badge>
                </Stack>
                <Stack gap={2}>
                  <Stack direction="horizontal" className="justify-between">
                    <Body className="text-on-dark-muted">Active Scanners</Body>
                    <Body className="font-weight-semibold text-white">4</Body>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Body className="text-on-dark-muted">Scans/min</Body>
                    <Body className="font-weight-semibold text-white">12</Body>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Body className="text-on-dark-muted">Avg Scan Time</Body>
                    <Body className="font-weight-semibold text-white">1.2s</Body>
                  </Stack>
                </Stack>
              </Stack>
            </CardBody>
          </Card>
        </Grid>

        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={4}>
              <Stack direction="horizontal" className="items-center justify-between">
                <H3 className="text-white">Recent Scans</H3>
                <Button variant="ghost" size="sm" onClick={() => refetch()}>
                  <RefreshCw size={14} className="mr-1" />
                  Refresh
                </Button>
              </Stack>
              <Stack gap={2}>
                {recentScans.map((scan) => (
                  <Stack
                    key={scan.id}
                    direction="horizontal"
                    className="items-center justify-between rounded border-2 border-ink-700 p-3"
                  >
                    <Stack direction="horizontal" gap={4} className="items-center">
                      {scan.status === 'success' ? (
                        <CheckCircle size={20} className="text-success" />
                      ) : (
                        <XCircle size={20} className="text-error" />
                      )}
                      <Stack gap={0}>
                        <Body className="font-weight-semibold text-white">{scan.name}</Body>
                        <Body size="sm" className=" text-on-dark-muted">
                          {scan.ticketId} - {scan.ticketType}
                        </Body>
                      </Stack>
                    </Stack>
                    <Stack direction="horizontal" gap={4} className="items-center">
                      {getStatusBadge(scan.status)}
                      <Body size="sm" className=" text-on-dark-muted">
                        <Clock size={12} className="mr-1 inline" />
                        {scan.timestamp.toLocaleTimeString()}
                      </Body>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </>
  );
}
