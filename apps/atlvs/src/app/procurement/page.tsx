'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Section, Display, H2, H3, Body, Button, Input, Select, Card, Grid, Badge, Spinner, Stack } from '@ghxstship/ui';
import { Search, Plus, FileText, TrendingUp, Package, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { usePurchaseOrders } from '@/hooks/useProcurement';

export default function ProcurementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'completed'>('active');
  const { data: purchaseOrders, isLoading } = usePurchaseOrders();

  const mockPurchaseOrders = [
    {
      id: 'PO-2024-001',
      vendor: 'ProAV Systems',
      description: 'LED Wall Panels - 100 units',
      amount: 125000,
      status: 'active',
      requestedBy: 'John Smith',
      dueDate: '2024-12-15',
      category: 'Equipment',
    },
    {
      id: 'PO-2024-002',
      vendor: 'Elite Staging Co',
      description: 'Stage Platforms and Risers',
      amount: 45000,
      status: 'pending',
      requestedBy: 'Sarah Johnson',
      dueDate: '2024-12-20',
      category: 'Staging',
    },
    {
      id: 'PO-2024-003',
      vendor: 'Lumina Lighting',
      description: 'Moving Head Fixtures - 50 units',
      amount: 89000,
      status: 'completed',
      requestedBy: 'Mike Peters',
      dueDate: '2024-11-30',
      category: 'Lighting',
    },
  ];

  if (isLoading) {
    return (
      <Section className="min-h-screen bg-white flex items-center justify-center">
        <Spinner size="lg" />
      </Section>
    );
  }

  const displayPOs = purchaseOrders || mockPurchaseOrders;
  const filteredPOs = displayPOs.filter((po: any) => po.status === activeTab);

  const stats = {
    totalActive: displayPOs.filter((po: any) => po.status === 'active').length,
    totalPending: displayPOs.filter((po: any) => po.status === 'pending').length,
    totalSpend: displayPOs.reduce((sum: number, po: any) => sum + po.amount, 0),
    avgValue: displayPOs.reduce((sum: number, po: any) => sum + po.amount, 0) / displayPOs.length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-white text-black border-2 border-black';
      case 'pending': return 'bg-grey-400 text-white';
      case 'completed': return 'bg-black text-white';
      default: return 'bg-grey-200 text-black';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <TrendingUp className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <Section className="min-h-screen bg-white py-8">
      <Container>
        <Stack gap={4} direction="horizontal" className="justify-between items-start mb-8">
          <Stack gap={2}>
            <Display className="mb-2">PROCUREMENT</Display>
            <Body className="text-grey-600">Purchase orders and vendor management</Body>
          </Stack>
          <Stack gap={3} direction="horizontal">
            <Button variant="outline" onClick={() => router.push('/procurement/export')}>
              <FileText className="w-4 h-4 mr-2" />
              EXPORT
            </Button>
            <Button onClick={() => router.push('/procurement/new')}>
              <Plus className="w-4 h-4 mr-2" />
              NEW PURCHASE ORDER
            </Button>
          </Stack>
        </Stack>

        <Grid cols={4} gap={6} className="mb-8">
          <Card className="p-6 text-center">
            <Package className="w-8 h-8 mx-auto mb-2 text-grey-600" />
            <H2>{stats.totalActive}</H2>
            <Body className="text-grey-600">Active POs</Body>
          </Card>
          <Card className="p-6 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-grey-600" />
            <H2>{stats.totalPending}</H2>
            <Body className="text-grey-600">Pending</Body>
          </Card>
          <Card className="p-6 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-grey-600" />
            <H2>${(stats.totalSpend / 1000).toFixed(0)}K</H2>
            <Body className="text-grey-600">Total Spend</Body>
          </Card>
          <Card className="p-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-grey-600" />
            <H2>${(stats.avgValue / 1000).toFixed(0)}K</H2>
            <Body className="text-grey-600">Avg Value</Body>
          </Card>
        </Grid>

        <Card className="p-6 mb-8">
          <Stack gap={4} direction="horizontal">
            <Stack className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-500" />
              <Input placeholder="Search purchase orders..." className="pl-10 w-full" />
            </Stack>
            <Select className="w-48">
              <option>All Categories</option>
              <option>Equipment</option>
              <option>Staging</option>
              <option>Lighting</option>
              <option>Audio</option>
            </Select>
          </Stack>
        </Card>

        <Stack gap={4} direction="horizontal" className="mb-6 border-b-2 border-grey-200">
          {[
            { id: 'active', label: 'ACTIVE', count: stats.totalActive },
            { id: 'pending', label: 'PENDING', count: stats.totalPending },
            { id: 'completed', label: 'COMPLETED', count: displayPOs.filter((po: any) => po.status === 'completed').length },
          ].map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              variant="ghost"
              className={`pb-4 px-6 font-heading text-lg tracking-wider rounded-none ${
                activeTab === tab.id
                  ? 'border-b-4 border-black -mb-0.5'
                  : 'text-grey-500 hover:text-black'
              }`}
            >
              {tab.label} ({tab.count})
            </Button>
          ))}
        </Stack>

        <Stack gap={4}>
          {filteredPOs.map((po) => (
            <Card key={po.id} className="p-6 hover:shadow-[8px_8px_0_0_#000] transition-shadow">
              <Stack gap={4} direction="horizontal" className="justify-between items-start mb-4">
                <Stack className="flex-1">
                  <Stack gap={3} direction="horizontal" className="items-center mb-2">
                    <H2>{po.id}</H2>
                    <Badge className={`${getStatusColor(po.status)} flex items-center gap-1`}>
                      {getStatusIcon(po.status)}
                      {po.status.toUpperCase()}
                    </Badge>
                  </Stack>
                  <H3 className="mb-1">{po.description}</H3>
                  <Body className="text-sm text-grey-600">Vendor: {(po as any).vendor}</Body>
                </Stack>
                <Stack className="text-right">
                  <Display size="md" className="mb-1">${(po.amount / 1000).toFixed(0)}K</Display>
                  <Body className="text-sm text-grey-600">Due: {new Date((po as any).dueDate).toLocaleDateString()}</Body>
                </Stack>
              </Stack>

              <Grid cols={3} gap={6} className="mb-4">
                <Stack gap={1}>
                  <Body className="text-sm text-grey-600">Category</Body>
                  <Body className="font-bold">{po.category}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body className="text-sm text-grey-600">Requested By</Body>
                  <Body className="font-bold">{(po as any).requestedBy}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body className="text-sm text-grey-600">Status</Body>
                  <Body className="font-bold">{po.status.toUpperCase()}</Body>
                </Stack>
              </Grid>

              <Stack gap={2} direction="horizontal">
                <Button variant="outline" size="sm" onClick={() => router.push(`/procurement/${po.id}`)}>VIEW DETAILS</Button>
                <Button variant="ghost" size="sm" onClick={() => router.push(`/procurement/${po.id}/edit`)}>EDIT</Button>
                {po.status === 'pending' && (
                  <Button size="sm" className="ml-auto" onClick={() => router.push(`/procurement/${po.id}/approve`)}>APPROVE</Button>
                )}
              </Stack>
            </Card>
          ))}
        </Stack>
      </Container>
    </Section>
  );
}
