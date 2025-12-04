'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, QrCode, Camera, CheckCircle, XCircle, AlertTriangle, Search } from 'lucide-react';
import { CompvssAppLayout } from '../../../components/app-layout';
import { useVerifyCredential, useLogCredentialScan, useZones } from '../../../hooks/useCredentials';
import {
  Container,
  Section,
  Stack,
  Grid,
  Card,
  H2,
  H3,
  Body,
  Button,
  Input,
  Badge,
  Box,
  Select,
} from '@ghxstship/ui';

type ScanResult = {
  valid: boolean;
  reason?: string;
  accessType?: string;
  credential?: {
    id: string;
    badge_number: string;
    status: string;
    credential_type?: { name: string; code: string; color: string; access_level: number };
    contact?: { first_name: string; last_name: string; email: string };
  };
};

export default function ScanCredentialPage() {
  const router = useRouter();
  const { data: zones } = useZones();
  const verifyMutation = useVerifyCredential();
  const logScanMutation = useLogCredentialScan();
  
  const [manualBadgeNumber, setManualBadgeNumber] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);

  const handleManualScan = async () => {
    if (!manualBadgeNumber) return;
    
    setIsScanning(true);
    try {
      const result = await verifyMutation.mutateAsync({
        badgeNumber: manualBadgeNumber,
        zoneId: selectedZoneId || undefined,
      });
      
      setScanResult(result);
      setRecentScans(prev => [result, ...prev.slice(0, 9)]);
      
      // Log the scan
      if (result.credential && selectedZoneId) {
        await logScanMutation.mutateAsync({
          credentialId: result.credential.id,
          zoneId: selectedZoneId,
          scanType: 'verify',
          result: result.valid ? 'granted' : 'denied',
        });
      }
      
      setManualBadgeNumber('');
    } catch (error) {
      setScanResult({
        valid: false,
        reason: 'Credential not found',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const getResultIcon = (result: ScanResult) => {
    if (result.valid) {
      return <CheckCircle className="size-16 text-success" />;
    }
    if (result.reason?.includes('suspended') || result.reason?.includes('expired')) {
      return <AlertTriangle className="size-16 text-warning" />;
    }
    return <XCircle className="size-16 text-error" />;
  };

  const getResultColor = (result: ScanResult) => {
    if (result.valid) return 'border-success bg-success/10';
    if (result.reason?.includes('suspended') || result.reason?.includes('expired')) {
      return 'border-warning bg-warning/10';
    }
    return 'border-error bg-error/10';
  };

  return (
    <CompvssAppLayout>
      <Section className="min-h-screen bg-ink-950 py-8">
        <Container>
          <Stack gap={6}>
            {/* Header */}
            <Stack direction="horizontal" gap={4} className="items-center">
              <Button
                onClick={() => router.back()}
                className="flex items-center gap-2 border-2 border-grey-600 bg-transparent px-4 py-2 text-white"
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
              <Stack gap={1}>
                <H2 className="text-white">Credential Scanner</H2>
                <Body className="text-grey-400">Verify credentials and check zone access</Body>
              </Stack>
            </Stack>

            <Grid cols={2} gap={6}>
              {/* Left: Scanner */}
              <Stack gap={6}>
                {/* Zone Selection */}
                <Card className="border-2 border-grey-700 bg-grey-900 p-6">
                  <Stack gap={4}>
                    <H3 className="text-white">Select Zone</H3>
                    <Select
                      value={selectedZoneId}
                      onChange={(e) => setSelectedZoneId(e.target.value)}
                      className="w-full border-2 border-grey-600 bg-grey-800 px-4 py-3 text-white"
                    >
                      <option value="">All Zones (General Verification)</option>
                      {zones?.map(zone => (
                        <option key={zone.id} value={zone.id}>
                          {zone.code} - {zone.name} (Level {zone.access_level})
                        </option>
                      ))}
                    </Select>
                  </Stack>
                </Card>

                {/* Manual Entry */}
                <Card className="border-2 border-grey-700 bg-grey-900 p-6">
                  <Stack gap={4}>
                    <H3 className="text-white">Manual Badge Entry</H3>
                    <Stack direction="horizontal" gap={2}>
                      <Box className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-grey-400" />
                        <Input
                          type="text"
                          placeholder="Enter badge number (e.g., AA-0001)"
                          value={manualBadgeNumber}
                          onChange={(e) => setManualBadgeNumber(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === 'Enter' && handleManualScan()}
                          className="w-full border-2 border-grey-600 bg-grey-800 py-3 pl-10 pr-4 font-mono text-white"
                        />
                      </Box>
                      <Button
                        onClick={handleManualScan}
                        disabled={!manualBadgeNumber || isScanning}
                        className="border-2 border-primary bg-primary px-6 py-3 text-white disabled:opacity-50"
                      >
                        {isScanning ? 'Scanning...' : 'Verify'}
                      </Button>
                    </Stack>
                  </Stack>
                </Card>

                {/* QR Scanner Placeholder */}
                <Card className="border-2 border-dashed border-grey-600 bg-grey-900/50 p-12">
                  <Stack gap={4} className="items-center text-center">
                    <QrCode className="size-16 text-grey-500" />
                    <H3 className="text-grey-400">QR Code Scanner</H3>
                    <Body className="text-grey-500">
                      Camera-based QR scanning requires device camera access.
                      Use manual entry above or connect a barcode scanner.
                    </Body>
                    <Button className="border-2 border-grey-600 bg-transparent px-6 py-3 text-grey-400">
                      <Camera className="mr-2 size-4" />
                      Enable Camera
                    </Button>
                  </Stack>
                </Card>
              </Stack>

              {/* Right: Result & History */}
              <Stack gap={6}>
                {/* Current Result */}
                {scanResult && (
                  <Card className={`border-2 p-6 ${getResultColor(scanResult)}`}>
                    <Stack gap={4} className="items-center text-center">
                      {getResultIcon(scanResult)}
                      
                      <H2 className={scanResult.valid ? 'text-success' : 'text-error'}>
                        {scanResult.valid ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                      </H2>
                      
                      {scanResult.reason && (
                        <Body className="text-grey-600">{scanResult.reason}</Body>
                      )}
                      
                      {scanResult.credential && (
                        <Card className="w-full border-2 border-grey-200 bg-white p-4">
                          <Stack gap={3}>
                            <Stack direction="horizontal" gap={2} className="items-center justify-center">
                              <Badge style={{ 
                                backgroundColor: scanResult.credential.credential_type?.color || '#666', 
                                color: '#fff' 
                              }}>
                                {scanResult.credential.credential_type?.code || 'N/A'}
                              </Badge>
                              <Body className="font-mono font-weight-bold">
                                {scanResult.credential.badge_number}
                              </Body>
                            </Stack>
                            <Body className="font-weight-semibold">
                              {scanResult.credential.contact?.first_name} {scanResult.credential.contact?.last_name}
                            </Body>
                            <Body className="text-body-sm text-grey-500">
                              {scanResult.credential.credential_type?.name} - Level {scanResult.credential.credential_type?.access_level}
                            </Body>
                          </Stack>
                        </Card>
                      )}
                      
                      <Button
                        onClick={() => setScanResult(null)}
                        className="border-2 border-grey-300 bg-white px-6 py-2"
                      >
                        Clear
                      </Button>
                    </Stack>
                  </Card>
                )}

                {/* Recent Scans */}
                <Card className="border-2 border-grey-700 bg-grey-900 p-6">
                  <Stack gap={4}>
                    <H3 className="text-white">Recent Scans</H3>
                    {recentScans.length === 0 ? (
                      <Body className="text-grey-500">No recent scans</Body>
                    ) : (
                      <Stack gap={2}>
                        {recentScans.map((scan, index) => (
                          <Box
                            key={index}
                            className={`flex items-center justify-between rounded border-2 p-3 ${
                              scan.valid ? 'border-success/30 bg-success/10' : 'border-error/30 bg-error/10'
                            }`}
                          >
                            <Stack direction="horizontal" gap={3} className="items-center">
                              {scan.valid ? (
                                <CheckCircle className="size-5 text-success" />
                              ) : (
                                <XCircle className="size-5 text-error" />
                              )}
                              <Stack gap={0}>
                                <Body className="font-mono text-body-sm text-white">
                                  {scan.credential?.badge_number || 'Unknown'}
                                </Body>
                                <Body className="text-body-xs text-grey-400">
                                  {scan.credential?.contact?.first_name} {scan.credential?.contact?.last_name}
                                </Body>
                              </Stack>
                            </Stack>
                            <Badge variant={scan.valid ? 'success' : 'error'}>
                              {scan.valid ? 'GRANTED' : 'DENIED'}
                            </Badge>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Card>
              </Stack>
            </Grid>
          </Stack>
        </Container>
      </Section>
    </CompvssAppLayout>
  );
}
