'use client';

import { useState } from 'react';
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
  Truck,
  Calendar,
  MapPin,
  Package,
  CheckCircle,
  Clock,
  Search,
} from 'lucide-react';
import { CompvssAppLayout } from '../../components/app-layout';

import {
  useMyDeliveries,
  type Delivery,
} from '../../hooks/useMyDeliveries';

export default function MyDeliveriesPage() {
  const { data: deliveries = [] } = useMyDeliveries();
  const [searchQuery, setSearchQuery] = useState('');

  const scheduledCount = deliveries.filter(d => d.status === 'scheduled').length;
  const inTransitCount = deliveries.filter(d => d.status === 'in_transit').length;
  const deliveredCount = deliveries.filter(d => d.status === 'delivered').length;

  const filteredDeliveries = deliveries.filter(d =>
    d.production.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.venue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: Delivery['status']) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="info">Scheduled</Badge>;
      case 'in_transit':
        return <Badge variant="warning">In Transit</Badge>;
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'confirmed':
        return <Badge variant="success">Confirmed</Badge>;
    }
  };

  return (
    <CompvssAppLayout>
      <Stack gap={8}>
        <SectionHeader
          kicker="Vendor Portal"
          title="My Deliveries"
          description="Track and manage your scheduled deliveries"
          colorScheme="on-dark"
        />

        <Grid cols={3} gap={4}>
          <StatCard
            label="Scheduled"
            value={scheduledCount.toString()}
            icon={<Calendar size={20} />}
            inverted
          />
          <StatCard
            label="In Transit"
            value={inTransitCount.toString()}
            icon={<Truck size={20} />}
            inverted
          />
          <StatCard
            label="Delivered"
            value={deliveredCount.toString()}
            icon={<CheckCircle size={20} />}
            inverted
          />
        </Grid>

        <Card inverted>
          <CardBody>
            <Stack gap={4}>
              <Stack direction="horizontal" className="items-center justify-between">
                <H3 className="text-white">All Deliveries</H3>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Search size={16} className="text-on-dark-muted" />
                  <Input
                    placeholder="Search deliveries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                </Stack>
              </Stack>

              <Stack gap={4}>
                {filteredDeliveries.map(delivery => (
                  <Card key={delivery.id} className="border-2 border-ink-700">
                    <CardBody>
                      <Stack gap={4}>
                        <Stack direction="horizontal" className="items-start justify-between">
                          <Stack gap={2}>
                            <Stack direction="horizontal" gap={2} className="items-center">
                              <H3 className="text-white">{delivery.production}</H3>
                              {getStatusBadge(delivery.status)}
                            </Stack>
                            <Stack direction="horizontal" gap={4}>
                              <Stack direction="horizontal" gap={1} className="items-center">
                                <MapPin size={14} className="text-on-dark-muted" />
                                <Body className="text-on-dark-muted">{delivery.venue}</Body>
                              </Stack>
                              <Stack direction="horizontal" gap={1} className="items-center">
                                <Calendar size={14} className="text-on-dark-muted" />
                                <Body className="text-on-dark-muted">
                                  {new Date(delivery.date).toLocaleDateString()} at {delivery.time}
                                </Body>
                              </Stack>
                            </Stack>
                          </Stack>
                          <Body className="text-on-dark-muted">{delivery.id}</Body>
                        </Stack>

                        <Grid cols={2} gap={4}>
                          <Stack gap={2}>
                            <Body size="sm" className=" text-on-dark-muted">Items</Body>
                            <Stack gap={1}>
                              {delivery.items.map((item, idx) => (
                                <Stack key={idx} direction="horizontal" gap={2} className="items-center">
                                  <Package size={12} className="text-on-dark-muted" />
                                  <Body className="text-white">{item}</Body>
                                </Stack>
                              ))}
                            </Stack>
                          </Stack>
                          <Stack gap={2}>
                            <Body size="sm" className=" text-on-dark-muted">Site Contact</Body>
                            <Body className="text-white">{delivery.contactName}</Body>
                            <Body className="text-on-dark-muted">{delivery.contactPhone}</Body>
                          </Stack>
                        </Grid>

                        {delivery.status === 'scheduled' && (
                          <Stack direction="horizontal" gap={2}>
                            <Button variant="solid">
                              <Truck size={16} className="mr-2" />
                              Mark In Transit
                            </Button>
                            <Button variant="outline">
                              <Clock size={16} className="mr-2" />
                              Reschedule
                            </Button>
                          </Stack>
                        )}

                        {delivery.status === 'in_transit' && (
                          <Button variant="solid">
                            <CheckCircle size={16} className="mr-2" />
                            Mark Delivered
                          </Button>
                        )}
                      </Stack>
                    </CardBody>
                  </Card>
                ))}
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </CompvssAppLayout>
  );
}
