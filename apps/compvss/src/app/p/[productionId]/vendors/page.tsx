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
  Building2,
  DollarSign,
  CheckCircle,
  Clock,
  Search,
  Plus,
  Phone,
  Mail,
} from 'lucide-react';
import { CompvssAppLayout } from '../../../../components/app-layout';

interface Vendor {
  id: string;
  name: string;
  category: string;
  contact: string;
  email: string;
  phone: string;
  contractValue: number;
  status: 'active' | 'pending' | 'completed';
}

const MOCK_VENDORS: Vendor[] = [
  { id: 'V-001', name: 'SoundWave Audio', category: 'Audio', contact: 'Mike Johnson', email: 'mike@soundwave.com', phone: '555-0101', contractValue: 45000, status: 'active' },
  { id: 'V-002', name: 'LightCraft Productions', category: 'Lighting', contact: 'Sarah Chen', email: 'sarah@lightcraft.com', phone: '555-0102', contractValue: 38000, status: 'active' },
  { id: 'V-003', name: 'Stage Masters', category: 'Staging', contact: 'Tom Wilson', email: 'tom@stagemasters.com', phone: '555-0103', contractValue: 52000, status: 'completed' },
  { id: 'V-004', name: 'Local Eats Catering', category: 'Catering', contact: 'Lisa Park', email: 'lisa@localeats.com', phone: '555-0104', contractValue: 15000, status: 'active' },
];

export default function ProductionVendorsPage() {
  const params = useParams();
  const _productionId = params?.productionId as string;
  const [vendors] = useState(MOCK_VENDORS);
  const [searchQuery, setSearchQuery] = useState('');

  const totalContractValue = vendors.reduce((sum, v) => sum + v.contractValue, 0);
  const activeVendors = vendors.filter(v => v.status === 'active').length;

  const filteredVendors = vendors.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <CompvssAppLayout>
      <Stack gap={8}>
        <Stack direction="horizontal" className="items-start justify-between">
          <SectionHeader kicker="Production" title="Vendors" description="Manage production vendors and contracts" colorScheme="on-dark" />
          <Button variant="solid"><Plus size={16} className="mr-2" />Add Vendor</Button>
        </Stack>

        <Grid cols={4} gap={4}>
          <StatCard label="Total Vendors" value={vendors.length.toString()} icon={<Building2 size={20} />} inverted />
          <StatCard label="Active" value={activeVendors.toString()} icon={<CheckCircle size={20} />} inverted />
          <StatCard label="Contract Value" value={`$${(totalContractValue / 1000).toFixed(0)}K`} icon={<DollarSign size={20} />} inverted />
          <StatCard label="Pending" value={vendors.filter(v => v.status === 'pending').length.toString()} icon={<Clock size={20} />} inverted />
        </Grid>

        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={4}>
              <Stack direction="horizontal" className="items-center justify-between">
                <H3 className="text-white">All Vendors</H3>
                <Stack direction="horizontal" gap={2}>
                  <Input placeholder="Search vendors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  <Button variant="outline"><Search size={16} /></Button>
                </Stack>
              </Stack>
              <Grid cols={2} gap={4}>
                {filteredVendors.map(vendor => (
                  <Card key={vendor.id} variant="elevated" inverted>
                    <CardBody>
                      <Stack gap={3}>
                        <Stack direction="horizontal" className="items-center justify-between">
                          <H3 className="text-white">{vendor.name}</H3>
                          <Badge variant={vendor.status === 'active' ? 'success' : vendor.status === 'completed' ? 'info' : 'warning'}>
                            {vendor.status}
                          </Badge>
                        </Stack>
                        <Body className="text-on-dark-muted">{vendor.category}</Body>
                        <Stack gap={1}>
                          <Body className="text-body-sm text-white">{vendor.contact}</Body>
                          <Stack direction="horizontal" gap={4}>
                            <Body className="text-body-sm text-on-dark-muted"><Mail size={12} className="mr-1 inline" />{vendor.email}</Body>
                            <Body className="text-body-sm text-on-dark-muted"><Phone size={12} className="mr-1 inline" />{vendor.phone}</Body>
                          </Stack>
                        </Stack>
                        <Stack direction="horizontal" className="justify-between border-t border-ink-700 pt-3">
                          <Body className="text-on-dark-muted">Contract Value</Body>
                          <Body className="font-weight-semibold text-white">${vendor.contractValue.toLocaleString()}</Body>
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
    </CompvssAppLayout>
  );
}
