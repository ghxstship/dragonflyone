'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Section,
  H1,
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Field,
  Input,
  Textarea,
  Select,
  Grid,
  Stack,
  Badge,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  LoadingSpinner,
  StatCard,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@ghxstship/ui';

interface SalesData {
  id: string;
  location: string;
  location_type: 'venue' | 'booth' | 'online' | 'box_office';
  date: string;
  period: string;
  transactions: number;
  gross_sales: number;
  refunds: number;
  net_sales: number;
  avg_transaction: number;
  top_items: { name: string; quantity: number; revenue: number }[];
}

interface LocationSummary {
  id: string;
  name: string;
  type: 'venue' | 'booth' | 'online' | 'box_office';
  total_sales: number;
  transactions: number;
  avg_transaction: number;
  trend: 'up' | 'down' | 'stable';
  trend_percent: number;
}

const mockSalesData: SalesData[] = [
  { id: 'SD-001', location: 'Main Bar', location_type: 'venue', date: '2024-11-24', period: '14:00-15:00', transactions: 89, gross_sales: 2450.50, refunds: 45.00, net_sales: 2405.50, avg_transaction: 27.03, top_items: [{ name: 'Beer', quantity: 156, revenue: 1248.00 }, { name: 'Cocktails', quantity: 67, revenue: 871.00 }] },
  { id: 'SD-002', location: 'Main Bar', location_type: 'venue', date: '2024-11-24', period: '13:00-14:00', transactions: 72, gross_sales: 1980.25, refunds: 0, net_sales: 1980.25, avg_transaction: 27.50, top_items: [{ name: 'Beer', quantity: 134, revenue: 1072.00 }, { name: 'Wine', quantity: 45, revenue: 585.00 }] },
  { id: 'SD-003', location: 'Merch Booth A', location_type: 'booth', date: '2024-11-24', period: '14:00-15:00', transactions: 45, gross_sales: 3825.00, refunds: 85.00, net_sales: 3740.00, avg_transaction: 83.11, top_items: [{ name: 'Tour T-Shirt', quantity: 32, revenue: 1440.00 }, { name: 'Hoodie', quantity: 18, revenue: 1530.00 }] },
  { id: 'SD-004', location: 'Merch Booth B', location_type: 'booth', date: '2024-11-24', period: '14:00-15:00', transactions: 38, gross_sales: 2890.00, refunds: 0, net_sales: 2890.00, avg_transaction: 76.05, top_items: [{ name: 'Poster', quantity: 45, revenue: 1125.00 }, { name: 'Cap', quantity: 28, revenue: 980.00 }] },
  { id: 'SD-005', location: 'Online Store', location_type: 'online', date: '2024-11-24', period: '14:00-15:00', transactions: 156, gross_sales: 8945.00, refunds: 250.00, net_sales: 8695.00, avg_transaction: 55.74, top_items: [{ name: 'Vinyl Album', quantity: 45, revenue: 1575.00 }, { name: 'Bundle Pack', quantity: 28, revenue: 2520.00 }] },
  { id: 'SD-006', location: 'Box Office', location_type: 'box_office', date: '2024-11-24', period: '14:00-15:00', transactions: 234, gross_sales: 18720.00, refunds: 150.00, net_sales: 18570.00, avg_transaction: 79.36, top_items: [{ name: 'GA Ticket', quantity: 189, revenue: 14175.00 }, { name: 'VIP Ticket', quantity: 45, revenue: 4500.00 }] },
];

const mockLocationSummaries: LocationSummary[] = [
  { id: 'LOC-001', name: 'Main Bar', type: 'venue', total_sales: 12450.75, transactions: 456, avg_transaction: 27.30, trend: 'up', trend_percent: 12.5 },
  { id: 'LOC-002', name: 'Merch Booth A', type: 'booth', total_sales: 18750.00, transactions: 225, avg_transaction: 83.33, trend: 'up', trend_percent: 8.2 },
  { id: 'LOC-003', name: 'Merch Booth B', type: 'booth', total_sales: 14280.00, transactions: 188, avg_transaction: 75.96, trend: 'stable', trend_percent: 0.5 },
  { id: 'LOC-004', name: 'Online Store', type: 'online', total_sales: 45890.00, transactions: 823, avg_transaction: 55.76, trend: 'up', trend_percent: 15.8 },
  { id: 'LOC-005', name: 'Box Office', type: 'box_office', total_sales: 89450.00, transactions: 1128, avg_transaction: 79.30, trend: 'down', trend_percent: -3.2 },
];

export default function SalesReportingPage() {
  const router = useRouter();
  const [salesData, setSalesData] = useState<SalesData[]>(mockSalesData);
  const [locationSummaries, setLocationSummaries] = useState<LocationSummary[]>(mockLocationSummaries);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '2024-11-24', end: '2024-11-24' });
  const [selectedPeriod, setSelectedPeriod] = useState<SalesData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getLocationTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      venue: 'bg-blue-500 text-white',
      booth: 'bg-purple-500 text-white',
      online: 'bg-green-500 text-white',
      box_office: 'bg-orange-500 text-white',
    };
    return <Badge className={colors[type] || ''}>{type.replace('_', ' ')}</Badge>;
  };

  const getTrendBadge = (trend: string, percent: number) => {
    if (trend === 'up') {
      return <Badge className="bg-green-500 text-white">↑ {percent}%</Badge>;
    } else if (trend === 'down') {
      return <Badge className="bg-red-500 text-white">↓ {Math.abs(percent)}%</Badge>;
    }
    return <Badge variant="outline">→ {percent}%</Badge>;
  };

  const filteredSalesData = salesData.filter(s =>
    selectedLocation === 'all' || s.location === selectedLocation
  );

  const totalSales = locationSummaries.reduce((sum, l) => sum + l.total_sales, 0);
  const totalTransactions = locationSummaries.reduce((sum, l) => sum + l.transactions, 0);
  const avgTransaction = totalSales / totalTransactions;

  return (
    <Section className="min-h-screen bg-white">
      <Container className="py-8">
        <Stack gap={8}>
          <Stack direction="horizontal" className="justify-between items-start">
            <Stack gap={2}>
              <H1>SALES REPORTING</H1>
              <Body className="text-gray-600">Sales analytics by location and time period</Body>
            </Stack>
            <Stack direction="horizontal" gap={2}>
              <Button variant="outline">Export Report</Button>
              <Button variant="solid" onClick={() => router.push('/admin/analytics')}>
                Full Analytics
              </Button>
            </Stack>
          </Stack>

          {error && (
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Grid cols={4} gap={6}>
            <StatCard label="Total Sales" value={`$${totalSales.toLocaleString()}`} className="border-2 border-black" />
            <StatCard label="Transactions" value={totalTransactions.toLocaleString()} className="border-2 border-black" />
            <StatCard label="Avg Transaction" value={`$${avgTransaction.toFixed(2)}`} className="border-2 border-black" />
            <StatCard label="Locations" value={locationSummaries.length} className="border-2 border-black" />
          </Grid>

          <Stack direction="horizontal" gap={4}>
            <Field label="Location" className="w-48">
              <Select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="all">All Locations</option>
                {locationSummaries.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Start Date" className="w-48">
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </Field>
            <Field label="End Date" className="w-48">
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </Field>
          </Stack>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
                Overview
              </Tab>
              <Tab active={activeTab === 'by_location'} onClick={() => setActiveTab('by_location')}>
                By Location
              </Tab>
              <Tab active={activeTab === 'by_period'} onClick={() => setActiveTab('by_period')}>
                By Time Period
              </Tab>
              <Tab active={activeTab === 'top_items'} onClick={() => setActiveTab('top_items')}>
                Top Items
              </Tab>
            </TabsList>
          </Tabs>

          {activeTab === 'overview' && (
            <Grid cols={2} gap={6}>
              <Card className="p-6 border-2 border-black">
                <Stack gap={4}>
                  <H3>Location Performance</H3>
                  <Stack gap={2}>
                    {locationSummaries.sort((a, b) => b.total_sales - a.total_sales).map(loc => (
                      <Stack key={loc.id} direction="horizontal" className="justify-between items-center">
                        <Stack direction="horizontal" gap={2}>
                          {getLocationTypeBadge(loc.type)}
                          <Body>{loc.name}</Body>
                        </Stack>
                        <Stack direction="horizontal" gap={4}>
                          <Body className="font-bold">${loc.total_sales.toLocaleString()}</Body>
                          {getTrendBadge(loc.trend, loc.trend_percent)}
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Card>
              <Card className="p-6 border-2 border-black">
                <Stack gap={4}>
                  <H3>Sales by Channel</H3>
                  <Stack gap={2}>
                    {['box_office', 'online', 'booth', 'venue'].map(type => {
                      const typeSales = locationSummaries
                        .filter(l => l.type === type)
                        .reduce((sum, l) => sum + l.total_sales, 0);
                      const percent = (typeSales / totalSales * 100).toFixed(1);
                      return (
                        <Stack key={type} gap={1}>
                          <Stack direction="horizontal" className="justify-between">
                            <Body className="capitalize">{type.replace('_', ' ')}</Body>
                            <Body className="font-bold">${typeSales.toLocaleString()} ({percent}%)</Body>
                          </Stack>
                          <Card className="h-2 bg-gray-200 rounded overflow-hidden">
                            <Card className="h-full bg-black" style={{ width: `${percent}%` }} />
                          </Card>
                        </Stack>
                      );
                    })}
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          )}

          {activeTab === 'by_location' && (
            <Stack gap={4}>
              {locationSummaries.map(loc => (
                <Card key={loc.id} className="p-4 border-2 border-black">
                  <Grid cols={6} gap={4} className="items-center">
                    <Stack gap={1}>
                      <Body className="font-bold">{loc.name}</Body>
                      {getLocationTypeBadge(loc.type)}
                    </Stack>
                    <Stack gap={1}>
                      <Label className="text-gray-500">Total Sales</Label>
                      <Body className="font-bold text-green-600">${loc.total_sales.toLocaleString()}</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Label className="text-gray-500">Transactions</Label>
                      <Body className="font-bold">{loc.transactions}</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Label className="text-gray-500">Avg Transaction</Label>
                      <Body className="font-bold">${loc.avg_transaction.toFixed(2)}</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Label className="text-gray-500">Trend</Label>
                      {getTrendBadge(loc.trend, loc.trend_percent)}
                    </Stack>
                    <Button variant="outline" size="sm" onClick={() => setSelectedLocation(loc.name)}>
                      View Details
                    </Button>
                  </Grid>
                </Card>
              ))}
            </Stack>
          )}

          {activeTab === 'by_period' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Transactions</TableHead>
                  <TableHead>Gross Sales</TableHead>
                  <TableHead>Refunds</TableHead>
                  <TableHead>Net Sales</TableHead>
                  <TableHead>Avg Transaction</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSalesData.map(data => (
                  <TableRow key={data.id}>
                    <TableCell>
                      <Stack gap={1}>
                        <Body>{data.location}</Body>
                        {getLocationTypeBadge(data.location_type)}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Label>{data.period}</Label>
                    </TableCell>
                    <TableCell>
                      <Body className="font-bold">{data.transactions}</Body>
                    </TableCell>
                    <TableCell>
                      <Body className="font-bold">${data.gross_sales.toLocaleString()}</Body>
                    </TableCell>
                    <TableCell>
                      <Body className={data.refunds > 0 ? 'text-red-600' : ''}>
                        ${data.refunds.toFixed(2)}
                      </Body>
                    </TableCell>
                    <TableCell>
                      <Body className="font-bold text-green-600">${data.net_sales.toLocaleString()}</Body>
                    </TableCell>
                    <TableCell>
                      <Body>${data.avg_transaction.toFixed(2)}</Body>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedPeriod(data)}>
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {activeTab === 'top_items' && (
            <Grid cols={2} gap={6}>
              {locationSummaries.slice(0, 4).map(loc => {
                const locData = salesData.find(s => s.location === loc.name);
                return (
                  <Card key={loc.id} className="p-6 border-2 border-black">
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="justify-between">
                        <H3>{loc.name}</H3>
                        {getLocationTypeBadge(loc.type)}
                      </Stack>
                      <Stack gap={2}>
                        {locData?.top_items.map((item, idx) => (
                          <Stack key={idx} direction="horizontal" className="justify-between">
                            <Stack gap={1}>
                              <Body>{item.name}</Body>
                              <Label className="text-gray-500">{item.quantity} sold</Label>
                            </Stack>
                            <Body className="font-bold text-green-600">${item.revenue.toLocaleString()}</Body>
                          </Stack>
                        ))}
                      </Stack>
                    </Stack>
                  </Card>
                );
              })}
            </Grid>
          )}

          <Button variant="outline" onClick={() => router.push('/admin')}>
            Back to Admin
          </Button>
        </Stack>
      </Container>

      <Modal open={!!selectedPeriod} onClose={() => setSelectedPeriod(null)}>
        <ModalHeader><H3>Period Details</H3></ModalHeader>
        <ModalBody>
          {selectedPeriod && (
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between">
                <Body className="font-bold text-xl">{selectedPeriod.location}</Body>
                {getLocationTypeBadge(selectedPeriod.location_type)}
              </Stack>
              <Label className="text-gray-500">{selectedPeriod.date} • {selectedPeriod.period}</Label>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Label className="text-gray-500">Transactions</Label>
                  <Body className="font-bold">{selectedPeriod.transactions}</Body>
                </Stack>
                <Stack gap={1}>
                  <Label className="text-gray-500">Gross Sales</Label>
                  <Body className="font-bold">${selectedPeriod.gross_sales.toLocaleString()}</Body>
                </Stack>
                <Stack gap={1}>
                  <Label className="text-gray-500">Refunds</Label>
                  <Body className={selectedPeriod.refunds > 0 ? 'text-red-600 font-bold' : ''}>
                    ${selectedPeriod.refunds.toFixed(2)}
                  </Body>
                </Stack>
                <Stack gap={1}>
                  <Label className="text-gray-500">Net Sales</Label>
                  <Body className="font-bold text-green-600">${selectedPeriod.net_sales.toLocaleString()}</Body>
                </Stack>
              </Grid>
              <Stack gap={2}>
                <Label className="text-gray-500">Top Items</Label>
                {selectedPeriod.top_items.map((item, idx) => (
                  <Stack key={idx} direction="horizontal" className="justify-between">
                    <Body>{item.name} ({item.quantity})</Body>
                    <Body className="font-bold">${item.revenue.toLocaleString()}</Body>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedPeriod(null)}>Close</Button>
          <Button variant="solid">Export</Button>
        </ModalFooter>
      </Modal>
    </Section>
  );
}
