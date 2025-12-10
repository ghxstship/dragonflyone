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
  Package,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Search,
  Plus,
  QrCode,
} from 'lucide-react';
import { AtlvsAppLayout } from '../../../../components/app-layout';
import { useProductionAssetsData, type Asset } from '@/hooks/useProductionAssets';

export default function ProductionAssetsPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const [searchQuery, setSearchQuery] = useState('');

  const {
    assets,
    totalValue,
    inUseCount,
    maintenanceCount,
  } = useProductionAssetsData(productionId);

  const filteredAssets = assets.filter((a: Asset) =>
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
