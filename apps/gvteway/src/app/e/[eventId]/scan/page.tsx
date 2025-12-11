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
  CheckCircle,
  XCircle,
  Camera,
  Keyboard,
} from 'lucide-react';
import { GvtewayAppLayout } from '../../../../components/app-layout';
import { useEventScanData } from '@/hooks/useEventOperations';

interface ScanResult {
  ticketId: string;
  status: 'valid' | 'invalid' | 'used' | 'expired';
  name?: string;
  ticketType?: string;
  message: string;
}

export default function EventScanPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const [manualCode, setManualCode] = useState('');
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);

  const { stats: scanCount, validateTicket, isValidating: isScanning } = useEventScanData(eventId);

  const handleManualScan = async () => {
    if (!manualCode.trim()) return;
    
    try {
      const data = await validateTicket(manualCode);
      
      setLastScan({
        ticketId: manualCode,
        status: data.valid ? 'valid' : 'invalid',
        name: data.name,
        ticketType: data.ticketType,
        message: data.message || (data.valid ? 'Ticket validated successfully' : 'Invalid ticket code'),
      });
      setManualCode('');
    } catch {
      setLastScan({
        ticketId: manualCode,
        status: 'invalid',
        message: 'Failed to validate ticket',
      });
    }
  };

  return (
    <GvtewayAppLayout>
      <Stack gap={8}>
        <SectionHeader kicker="Event" title="Ticket Scanner" description="Scan and validate tickets" colorScheme="on-dark" />

        <Grid cols={3} gap={4}>
          <StatCard label="Valid Scans" value={scanCount.valid.toString()} icon={<CheckCircle size={20} />} trend="up" inverted />
          <StatCard label="Invalid" value={scanCount.invalid.toString()} icon={<XCircle size={20} />} inverted />
          <StatCard label="Total Scans" value={scanCount.total.toString()} icon={<Scan size={20} />} inverted />
        </Grid>

        <Grid cols={2} gap={6}>
          <Card variant="elevated" inverted>
            <CardBody>
              <Stack gap={4}>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Camera size={20} />
                  <H3 className="text-white">Camera Scanner</H3>
                </Stack>
                <Stack className="items-center justify-center rounded border-2 border-dashed border-ink-600 p-12">
                  <Scan size={48} className="text-on-dark-muted" />
                  <Body className="text-on-dark-muted">Camera scanner ready</Body>
                  <Button variant="solid" className="mt-4">
                    <Camera size={16} className="mr-2" />Start Camera
                  </Button>
                </Stack>
              </Stack>
            </CardBody>
          </Card>

          <Card variant="elevated" inverted>
            <CardBody>
              <Stack gap={4}>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Keyboard size={20} />
                  <H3 className="text-white">Manual Entry</H3>
                </Stack>
                <Stack gap={3}>
                  <Input
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Enter ticket code..."
                    onKeyDown={(e) => e.key === 'Enter' && handleManualScan()}
                  />
                  <Button variant="solid" onClick={handleManualScan} disabled={isScanning || !manualCode.trim()}>
                    <Scan size={16} className="mr-2" />{isScanning ? 'Scanning...' : 'Validate'}
                  </Button>
                </Stack>
              </Stack>
            </CardBody>
          </Card>
        </Grid>

        {lastScan && (
          <Card variant="elevated" className={lastScan.status === 'valid' ? 'border-2 border-success' : 'border-2 border-error'}>
            <CardBody>
              <Stack direction="horizontal" className="items-center justify-between">
                <Stack direction="horizontal" gap={4} className="items-center">
                  {lastScan.status === 'valid' ? (
                    <CheckCircle size={48} className="text-success" />
                  ) : (
                    <XCircle size={48} className="text-error" />
                  )}
                  <Stack gap={1}>
                    <H3 className={lastScan.status === 'valid' ? 'text-success' : 'text-error'}>
                      {lastScan.status === 'valid' ? 'Valid Ticket' : 'Invalid Ticket'}
                    </H3>
                    <Body className="text-on-dark-muted">{lastScan.message}</Body>
                    {lastScan.name && <Body className="text-white">{lastScan.name} - {lastScan.ticketType}</Body>}
                  </Stack>
                </Stack>
                <Badge variant={lastScan.status === 'valid' ? 'success' : 'error'}>
                  {lastScan.ticketId}
                </Badge>
              </Stack>
            </CardBody>
          </Card>
        )}
      </Stack>
    </GvtewayAppLayout>
  );
}
