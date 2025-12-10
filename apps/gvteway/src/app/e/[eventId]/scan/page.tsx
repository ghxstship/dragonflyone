'use client';

import { useState, useCallback, useEffect } from 'react';
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
import { log } from '@ghxstship/config';

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
  const [scanCount, setScanCount] = useState({ valid: 0, invalid: 0, total: 0 });
  const [isScanning, setIsScanning] = useState(false);

  // Fetch scan stats for this event
  useEffect(() => {
    if (!eventId) return;
    const fetchScanStats = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}/scan-stats`);
        if (response.ok) {
          const data = await response.json();
          setScanCount(data.stats || { valid: 0, invalid: 0, total: 0 });
        }
      } catch (error) {
        log.error('Failed to fetch scan stats:', error instanceof Error ? error : undefined);
      }
    };
    fetchScanStats();
  }, [eventId]);

  const handleManualScan = useCallback(async () => {
    if (!manualCode.trim()) return;
    setIsScanning(true);
    
    try {
      // Validate ticket via API
      const response = await fetch(`/api/events/${eventId}/validate-ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCode: manualCode }),
      });
      
      const data = await response.json();
      const isValid = response.ok && data.valid;
      
      setLastScan({
        ticketId: manualCode,
        status: isValid ? 'valid' : 'invalid',
        name: data.name,
        ticketType: data.ticketType,
        message: data.message || (isValid ? 'Ticket validated successfully' : 'Invalid ticket code'),
      });
      setScanCount(prev => ({
        ...prev,
        valid: prev.valid + (isValid ? 1 : 0),
        invalid: prev.invalid + (isValid ? 0 : 1),
        total: prev.total + 1,
      }));
    } catch (error) {
      setLastScan({
        ticketId: manualCode,
        status: 'invalid',
        message: 'Failed to validate ticket',
      });
    } finally {
      setIsScanning(false);
      setManualCode('');
    }
  }, [manualCode, eventId]);

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
