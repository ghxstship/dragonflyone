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
} from '@ghxstship/ui';
import {
  Calendar,
  Clock,
  FileText,
  DollarSign,
  Music,
  Download,
  Upload,
  MapPin,
} from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import { DEMO_ARTIST_BOOKINGS, type DemoArtistBooking } from '../../../lib/demo-data';

export default function ArtistPortalPage() {
  const [bookings] = useState<DemoArtistBooking[]>(DEMO_ARTIST_BOOKINGS);

  const upcomingCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const totalEarnings = bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.fee, 0);

  return (
    <AtlvsAppLayout>
      <Stack gap={8}>
        <SectionHeader kicker="Artist Portal" title="My Dashboard" description="View bookings, riders, and payments" colorScheme="on-dark" />

        <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Upcoming Shows" value={upcomingCount.toString()} icon={<Calendar size={20} />} inverted />
          <StatCard label="Completed" value={completedCount.toString()} icon={<Music size={20} />} inverted />
          <StatCard label="Next Show" value="Nov 20" icon={<Clock size={20} />} inverted />
          <StatCard label="Earnings YTD" value={`$${(totalEarnings / 1000).toFixed(0)}K`} icon={<DollarSign size={20} />} inverted />
        </Grid>

        <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
          <Card variant="elevated" inverted>
            <CardBody>
              <Stack gap={4}>
                <H3 className="text-white">My Bookings</H3>
                <Stack gap={3}>
                  {bookings.map(booking => (
                    <Stack key={booking.id} className="rounded border-2 border-ink-700 p-4">
                      <Stack direction="horizontal" className="items-start justify-between">
                        <Stack gap={1}>
                          <Body className="font-weight-semibold text-white">{booking.event}</Body>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <MapPin size={14} className="text-on-dark-muted" />
                            <Body size="sm" className=" text-on-dark-muted">{booking.venue}</Body>
                          </Stack>
                        </Stack>
                        <Badge variant={booking.status === 'confirmed' ? 'success' : booking.status === 'pending' ? 'warning' : 'info'}>
                          {booking.status}
                        </Badge>
                      </Stack>
                      <Stack direction="horizontal" className="mt-3 justify-between border-t border-ink-700 pt-3">
                        <Stack gap={0}>
                          <Body size="sm" className=" text-on-dark-muted">Date</Body>
                          <Body className="text-white">{booking.date}</Body>
                        </Stack>
                        <Stack gap={0}>
                          <Body size="sm" className=" text-on-dark-muted">Set Time</Body>
                          <Body className="text-white">{booking.setTime}</Body>
                        </Stack>
                        <Stack gap={0}>
                          <Body size="sm" className=" text-on-dark-muted">Fee</Body>
                          <Body className="font-weight-semibold text-white">${booking.fee.toLocaleString()}</Body>
                        </Stack>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </CardBody>
          </Card>

          <Stack gap={6}>
            <Card variant="elevated" inverted>
              <CardBody>
                <Stack gap={4}>
                  <H3 className="text-white">Rider & Tech Specs</H3>
                  <Stack gap={2}>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <FileText size={16} />
                        <Body className="text-white">Technical Rider</Body>
                      </Stack>
                      <Badge variant="success">Current</Badge>
                    </Stack>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <FileText size={16} />
                        <Body className="text-white">Hospitality Rider</Body>
                      </Stack>
                      <Badge variant="success">Current</Badge>
                    </Stack>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <FileText size={16} />
                        <Body className="text-white">Stage Plot</Body>
                      </Stack>
                      <Badge variant="warning">Update Needed</Badge>
                    </Stack>
                  </Stack>
                  <Button variant="outline" size="sm"><Upload size={14} className="mr-2" />Upload Document</Button>
                </Stack>
              </CardBody>
            </Card>

            <Card variant="elevated" inverted>
              <CardBody>
                <Stack gap={4}>
                  <H3 className="text-white">Payments</H3>
                  <Stack gap={2}>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Body className="text-white">Fall Festival</Body>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Body className="font-weight-semibold text-success">$18,000</Body>
                        <Badge variant="success">Paid</Badge>
                      </Stack>
                    </Stack>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Body className="text-white">Summer Music Festival</Body>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Body className="text-white">$12,500</Body>
                        <Badge variant="info">Deposit</Badge>
                      </Stack>
                    </Stack>
                  </Stack>
                  <Button variant="outline" size="sm"><Download size={14} className="mr-2" />Download Statements</Button>
                </Stack>
              </CardBody>
            </Card>
          </Stack>
        </Grid>
      </Stack>
    </AtlvsAppLayout>
  );
}
