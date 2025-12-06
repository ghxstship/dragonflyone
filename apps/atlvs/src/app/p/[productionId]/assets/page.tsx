'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Package,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Search,
  Plus,
  QrCode,
} from 'lucide-react';
import { AtlvsAppLayout } from '../../../../components/app-layout';

interface Asset {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  value: number;
  status: 'available' | 'in-use' | 'maintenance' | 'retired';
  location: string;
  assignedTo?: string;
}

const MOCK_ASSETS: Asset[] = [
  { id: 'A-001', name: 'LED Wall Panel Set (20)', category: 'Video', serialNumber: 'LED-2024-001', value: 45000, status: 'in-use', location: 'Main Stage', assignedTo: 'Video Team' },
  { id: 'A-002', name: 'Moving Head Fixtures (24)', category: 'Lighting', serialNumber: 'MH-2024-012', value: 72000, status: 'in-use', location: 'Main Stage', assignedTo: 'Lighting Team' },
  { id: 'A-003', name: 'Line Array System', category: 'Audio', serialNumber: 'LA-2024-005', value: 125000, status: 'in-use', location: 'FOH', assignedTo: 'Audio Team' },
  { id: 'A-004', name: 'Stage Deck (100 sections)', category: 'Staging', serialNumber: 'SD-2024-008', value: 35000, status: 'available', location: 'Warehouse' },
  { id: 'A-005', name: 'Truss System', category: 'Rigging', serialNumber: 'TR-2024-003', value: 28000, status: 'maintenance', location: 'Shop' },
];

export default function ProductionAssetsPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAssets = useCallback(async () => {
    if (!productionId) return;
    try {
      const response = await fetch(`/api/productions/${productionId}/assets`);
      if (response.ok) {
        const data = await response.json();
        if (data.assets && data.assets.length > 0) {
          setAssets(data.assets);
        }
      }
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    }
  }, [productionId]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const totalValue = assets.reduce((sum, a) => sum + a.value, 0);
  const inUseCount = assets.filter(a => a.status === 'in-use').length;
  const maintenanceCount = assets.filter(a => a.status === 'maintenance').length;

  const filteredAssets = assets.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: Asset['status']) => {
    const variants: Record<string, 'success' | 'info' | 'warning' | 'error'> = {
      available: 'success', 'in-use': 'info', maintenance: 'warning', retired: 'error'
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <AtlvsAppLayout>
      <Stack gap={8}>
        <Stack direction="horizontal" className="items-start justify-between">
          <SectionHeader kicker="Production" title="Assets" description="Track production equipment and assets" colorScheme="on-dark" />
          <Stack direction="horizontal" gap={2}>
            <Button variant="outline"><QrCode size={16} className="mr-2" />Scan</Button>
            <Button variant="solid"><Plus size={16} className="mr-2" />Add Asset</Button>
          </Stack>
        </Stack>

        <Grid cols={4} gap={4}>
          <StatCard label="Total Assets" value={assets.length.toString()} icon={<Package size={20} />} inverted />
          <StatCard label="Total Value" value={`$${(totalValue / 1000).toFixed(0)}K`} icon={<DollarSign size={20} />} inverted />
          <StatCard label="In Use" value={inUseCount.toString()} icon={<CheckCircle size={20} />} inverted />
          <StatCard label="Maintenance" value={maintenanceCount.toString()} icon={<AlertTriangle size={20} />} inverted />
        </Grid>

        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={4}>
              <Stack direction="horizontal" className="items-center justify-between">
                <H3 className="text-white">All Assets</H3>
                <Stack direction="horizontal" gap={2}>
                  <Input placeholder="Search assets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  <Button variant="outline"><Search size={16} /></Button>
                </Stack>
              </Stack>
              <Grid cols={2} gap={4}>
                {filteredAssets.map(asset => (
                  <Card key={asset.id} variant="elevated" inverted>
                    <CardBody>
                      <Stack gap={3}>
                        <Stack direction="horizontal" className="items-center justify-between">
                          <H3 className="text-white">{asset.name}</H3>
                          {getStatusBadge(asset.status)}
                        </Stack>
                        <Stack gap={2}>
                          <Stack direction="horizontal" className="justify-between">
                            <Body className="text-on-dark-muted">Category</Body>
                            <Body className="text-white">{asset.category}</Body>
                          </Stack>
                          <Stack direction="horizontal" className="justify-between">
                            <Body className="text-on-dark-muted">Serial #</Body>
                            <Body className="text-white">{asset.serialNumber}</Body>
                          </Stack>
                          <Stack direction="horizontal" className="justify-between">
                            <Body className="text-on-dark-muted">Value</Body>
                            <Body className="font-weight-semibold text-white">${asset.value.toLocaleString()}</Body>
                          </Stack>
                          <Stack direction="horizontal" className="justify-between">
                            <Body className="text-on-dark-muted">Location</Body>
                            <Body className="text-white">{asset.location}</Body>
                          </Stack>
                          {asset.assignedTo && (
                            <Stack direction="horizontal" className="justify-between">
                              <Body className="text-on-dark-muted">Assigned To</Body>
                              <Body className="text-white">{asset.assignedTo}</Body>
                            </Stack>
                          )}
                        </Stack>
                      </Stack>
                    </CardBody>
                  </Card>
                ))}
              </Grid>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </AtlvsAppLayout>
  );
}
