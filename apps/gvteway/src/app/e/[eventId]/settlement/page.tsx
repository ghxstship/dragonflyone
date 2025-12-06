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
  Table,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
} from '@ghxstship/ui';
import {
  DollarSign,
  TrendingUp,
  CheckCircle,
  Download,
} from 'lucide-react';
import { GvtewayAppLayout } from '../../../../components/app-layout';

interface SettlementData {
  grossRevenue: number;
  ticketFees: number;
  refunds: number;
  netTicketRevenue: number;
  venueCost: number;
  productionCost: number;
  talentCost: number;
  marketingCost: number;
  staffingCost: number;
  miscCost: number;
  totalCosts: number;
  netProfit: number;
  profitMargin: number;
}

const defaultSettlement: SettlementData = {
  grossRevenue: 0,
  ticketFees: 0,
  refunds: 0,
  netTicketRevenue: 0,
  venueCost: 0,
  productionCost: 0,
  talentCost: 0,
  marketingCost: 0,
  staffingCost: 0,
  miscCost: 0,
  totalCosts: 0,
  netProfit: 0,
  profitMargin: 0,
};

export default function EventSettlementPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const [settlement, setSettlement] = useState<SettlementData>(defaultSettlement);
  const [loading, setLoading] = useState(true);

  const fetchSettlement = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}/settlement`);
      if (response.ok) {
        const data = await response.json();
        setSettlement(data.settlement || defaultSettlement);
      }
    } catch (error) {
      console.error('Failed to fetch settlement:', error);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchSettlement();
  }, [fetchSettlement]);

  return (
    <GvtewayAppLayout>
      <Stack gap={8}>
        <Stack direction="horizontal" className="items-start justify-between">
          <SectionHeader kicker="Event" title="Settlement" description="Final event financial settlement" colorScheme="on-dark" />
          <Button variant="outline"><Download size={16} className="mr-2" />Export</Button>
        </Stack>

        {loading ? (
          <Stack className="items-center py-12">
            <Spinner variant="grey" size="lg" />
          </Stack>
        ) : (
          <>
            <Grid cols={4} gap={4}>
              <StatCard label="Gross Revenue" value={`$${(settlement.grossRevenue / 1000).toFixed(0)}K`} icon={<DollarSign size={20} />} inverted />
              <StatCard label="Total Costs" value={`$${(settlement.totalCosts / 1000).toFixed(0)}K`} icon={<DollarSign size={20} />} inverted />
              <StatCard label="Net Profit" value={`$${(settlement.netProfit / 1000).toFixed(1)}K`} icon={<TrendingUp size={20} />} trend="up" inverted />
              <StatCard label="Margin" value={`${settlement.profitMargin}%`} icon={<CheckCircle size={20} />} inverted />
            </Grid>

        <Grid cols={2} gap={6}>
          <Card variant="elevated" inverted>
            <CardBody>
              <Stack gap={4}>
                <H3 className="text-white">Revenue</H3>
                <Table>
                  <TableBody>
                    <TableRow><TableCell>Gross Ticket Sales</TableCell><TableCell className="text-right">${settlement.grossRevenue.toLocaleString()}</TableCell></TableRow>
                    <TableRow><TableCell>Less: Ticket Fees</TableCell><TableCell className="text-right text-error">-${settlement.ticketFees.toLocaleString()}</TableCell></TableRow>
                    <TableRow><TableCell>Less: Refunds</TableCell><TableCell className="text-right text-error">-${settlement.refunds.toLocaleString()}</TableCell></TableRow>
                    <TableRow className="border-t-2 border-ink-600"><TableCell className="font-weight-bold">Net Revenue</TableCell><TableCell className="text-right font-weight-bold">${settlement.netTicketRevenue.toLocaleString()}</TableCell></TableRow>
                  </TableBody>
                </Table>
              </Stack>
            </CardBody>
          </Card>

          <Card variant="elevated" inverted>
            <CardBody>
              <Stack gap={4}>
                <H3 className="text-white">Expenses</H3>
                <Table>
                  <TableBody>
                    <TableRow><TableCell>Venue</TableCell><TableCell className="text-right">${settlement.venueCost.toLocaleString()}</TableCell></TableRow>
                    <TableRow><TableCell>Production</TableCell><TableCell className="text-right">${settlement.productionCost.toLocaleString()}</TableCell></TableRow>
                    <TableRow><TableCell>Talent</TableCell><TableCell className="text-right">${settlement.talentCost.toLocaleString()}</TableCell></TableRow>
                    <TableRow><TableCell>Marketing</TableCell><TableCell className="text-right">${settlement.marketingCost.toLocaleString()}</TableCell></TableRow>
                    <TableRow><TableCell>Staffing</TableCell><TableCell className="text-right">${settlement.staffingCost.toLocaleString()}</TableCell></TableRow>
                    <TableRow><TableCell>Miscellaneous</TableCell><TableCell className="text-right">${settlement.miscCost.toLocaleString()}</TableCell></TableRow>
                    <TableRow className="border-t-2 border-ink-600"><TableCell className="font-weight-bold">Total Expenses</TableCell><TableCell className="text-right font-weight-bold">${settlement.totalCosts.toLocaleString()}</TableCell></TableRow>
                  </TableBody>
                </Table>
              </Stack>
            </CardBody>
          </Card>
        </Grid>

        <Card variant="elevated" inverted>
          <CardBody>
            <Stack direction="horizontal" className="items-center justify-between">
              <Stack gap={1}>
                <H3 className="text-white">Settlement Summary</H3>
                <Body className="text-on-dark-muted">
                  Net Profit: ${settlement.netProfit.toLocaleString()} ({settlement.profitMargin}% margin)
                </Body>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Badge variant={settlement.netProfit > 0 ? 'success' : 'error'}>
                  {settlement.netProfit > 0 ? 'Profitable' : 'Loss'}
                </Badge>
                <Button variant="solid"><CheckCircle size={16} className="mr-2" />Finalize Settlement</Button>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
          </>
        )}
      </Stack>
    </GvtewayAppLayout>
  );
}
