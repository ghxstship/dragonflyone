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
  Spinner,
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
import { log } from '@ghxstship/config';

interface ProductionVendor {
  id: string;
  name: string;
  category: string;
  contact: string;
  email: string;
  phone: string;
  contractValue: number;
  status: 'pending' | 'active' | 'completed';
}

export default function ProductionVendorsPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const [vendors, setVendors] = useState<ProductionVendor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchVendors = useCallback(async () => {
    if (!productionId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/productions/${productionId}/vendors`);
      if (response.ok) {
        const data = await response.json();
        if (data.vendors && data.vendors.length > 0) {
          setVendors(data.vendors);
        }
      }
    } catch (error) {
      log.error('Failed to fetch vendors:', error instanceof Error ? error : undefined);
    } finally {
      setLoading(false);
    }
  }, [productionId]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

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

        <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
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
              {loading ? (
                <Stack className="items-center py-12">
                  <Spinner variant="grey" size="lg" />
                </Stack>
              ) : (
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
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
                          <Body size="sm" className=" text-white">{vendor.contact}</Body>
                          <Stack direction="horizontal" gap={4}>
                            <Body size="sm" className=" text-on-dark-muted"><Mail size={12} className="mr-1 inline" />{vendor.email}</Body>
                            <Body size="sm" className=" text-on-dark-muted"><Phone size={12} className="mr-1 inline" />{vendor.phone}</Body>
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
              )}
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </CompvssAppLayout>
  );
}
