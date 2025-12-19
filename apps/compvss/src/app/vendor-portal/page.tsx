'use client';

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
} from '@ghxstship/ui';
import {
  Truck,
  FileText,
  DollarSign,
  Calendar,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { CompvssAppLayout } from '../../components/app-layout';

import {
  useVendorData,
  useVendorDeliveries,
  useVendorInvoices,
} from '../../hooks/useVendorPortal';

export default function VendorPortalPage() {
  const { data: vendorData, isLoading, error } = useVendorData();
  const { data: upcomingDeliveries = [] } = useVendorDeliveries();
  const { data: recentInvoices = [] } = useVendorInvoices();

  if (isLoading) {
    return (
      <CompvssAppLayout>
        <Stack gap={8} className="flex min-h-[60vh] items-center justify-center">
          <Stack gap={4} className="items-center">
            <div className="h-8 w-8 animate-spin rounded-avatar border-4 border-primary border-t-transparent" />
            <Body>Loading vendor data...</Body>
          </Stack>
        </Stack>
      </CompvssAppLayout>
    );
  }

  if (error) {
    return (
      <CompvssAppLayout>
        <Stack gap={8} className="p-6">
          <Card className="p-6 border-destructive bg-destructive/10">
            <Stack gap={4} className="items-center text-center">
              <Body className="text-destructive font-display">Failed to load vendor data</Body>
              <Body className="text-destructive">{error instanceof Error ? error.message : 'An error occurred'}</Body>
              <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
            </Stack>
          </Card>
        </Stack>
      </CompvssAppLayout>
    );
  }

  const displayVendorData = vendorData || { companyName: 'Vendor', activeContracts: 0, pendingDeliveries: 0, pendingInvoices: 0, totalRevenue: 0 };

  return (
    <CompvssAppLayout>
      <Stack gap={8}>
        <SectionHeader
          kicker="Vendor Portal"
          title={`Welcome, ${displayVendorData.companyName}`}
          description="Manage your deliveries, contracts, and invoices"
          colorScheme="on-dark"
        />

        <Grid cols={4} gap={4}>
          <StatCard
            label="Active Contracts"
            value={displayVendorData.activeContracts.toString()}
            icon={<FileText size={20} />}
            inverted
          />
          <StatCard
            label="Pending Deliveries"
            value={displayVendorData.pendingDeliveries.toString()}
            icon={<Truck size={20} />}
            inverted
          />
          <StatCard
            label="Pending Invoices"
            value={displayVendorData.pendingInvoices.toString()}
            icon={<DollarSign size={20} />}
            inverted
          />
          <StatCard
            label="YTD Revenue"
            value={`$${displayVendorData.totalRevenue.toLocaleString()}`}
            icon={<DollarSign size={20} />}
            inverted
          />
        </Grid>

        <Grid cols={2} gap={6}>
          <Card inverted>
            <CardBody>
              <Stack gap={4}>
                <Stack direction="horizontal" className="items-center justify-between">
                  <H3 className="text-white">Upcoming Deliveries</H3>
                  <Link href="/my-deliveries">
                    <Button variant="ghost" size="sm">
                      View All <ArrowRight size={14} className="ml-1" />
                    </Button>
                  </Link>
                </Stack>

                <Stack gap={3}>
                  {upcomingDeliveries.map(delivery => (
                    <Stack
                      key={delivery.id}
                      direction="horizontal"
                      className="items-center justify-between border-b border-ink-700 pb-3"
                    >
                      <Stack gap={1}>
                        <Body className="text-white">{delivery.production}</Body>
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <Calendar size={12} className="text-on-dark-muted" />
                          <Body size="sm" className=" text-on-dark-muted">
                            {new Date(delivery.date).toLocaleDateString()}
                          </Body>
                        </Stack>
                      </Stack>
                      <Stack direction="horizontal" gap={3} className="items-center">
                        <Body className="text-on-dark-muted">{delivery.items}</Body>
                        <Badge variant={delivery.status === 'confirmed' ? 'success' : 'warning'}>
                          {delivery.status}
                        </Badge>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </CardBody>
          </Card>

          <Card inverted>
            <CardBody>
              <Stack gap={4}>
                <Stack direction="horizontal" className="items-center justify-between">
                  <H3 className="text-white">Recent Invoices</H3>
                  <Link href="/my-invoices">
                    <Button variant="ghost" size="sm">
                      View All <ArrowRight size={14} className="ml-1" />
                    </Button>
                  </Link>
                </Stack>

                <Stack gap={3}>
                  {recentInvoices.map(invoice => (
                    <Stack
                      key={invoice.id}
                      direction="horizontal"
                      className="items-center justify-between border-b border-ink-700 pb-3"
                    >
                      <Stack gap={1}>
                        <Body className="text-white">{invoice.id}</Body>
                        <Body size="sm" className=" text-on-dark-muted">{invoice.production}</Body>
                      </Stack>
                      <Stack direction="horizontal" gap={3} className="items-center">
                        <Body className="text-white">${invoice.amount.toLocaleString()}</Body>
                        <Badge variant={invoice.status === 'paid' ? 'success' : 'warning'}>
                          {invoice.status}
                        </Badge>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </CardBody>
          </Card>
        </Grid>

        <Card inverted>
          <CardBody>
            <Stack gap={4}>
              <H3 className="text-white">Quick Actions</H3>
              <Grid cols={4} gap={4}>
                <Link href="/my-deliveries">
                  <Card className="cursor-pointer transition-colors hover:bg-ink-800">
                    <CardBody>
                      <Stack gap={2} className="items-center py-4">
                        <Truck size={24} className="text-primary" />
                        <Body className="text-white">View Deliveries</Body>
                      </Stack>
                    </CardBody>
                  </Card>
                </Link>
                <Link href="/my-invoices">
                  <Card className="cursor-pointer transition-colors hover:bg-ink-800">
                    <CardBody>
                      <Stack gap={2} className="items-center py-4">
                        <DollarSign size={24} className="text-primary" />
                        <Body className="text-white">Submit Invoice</Body>
                      </Stack>
                    </CardBody>
                  </Card>
                </Link>
                <Link href="/my-contracts">
                  <Card className="cursor-pointer transition-colors hover:bg-ink-800">
                    <CardBody>
                      <Stack gap={2} className="items-center py-4">
                        <FileText size={24} className="text-primary" />
                        <Body className="text-white">View Contracts</Body>
                      </Stack>
                    </CardBody>
                  </Card>
                </Link>
                <Card className="cursor-pointer transition-colors hover:bg-ink-800">
                  <CardBody>
                    <Stack gap={2} className="items-center py-4">
                      <CheckCircle size={24} className="text-primary" />
                      <Body className="text-white">Update Profile</Body>
                    </Stack>
                  </CardBody>
                </Card>
              </Grid>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </CompvssAppLayout>
  );
}
