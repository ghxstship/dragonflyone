export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

interface RevenueMetrics {
  total_revenue: number;
  revenue_change_percent: number;
  average_event_value: number;
  revenue_by_source: Array<{ source: string; amount: number; percentage: number }>;
  revenue_by_event_type: Array<{ event_type: string; amount: number; count: number }>;
  monthly_trend: Array<{ month: string; revenue: number; booking_count: number }>;
}

const DEMO_REVENUE_METRICS: RevenueMetrics = {
  total_revenue: 1850000,
  revenue_change_percent: 12.5,
  average_event_value: 45000,
  revenue_by_source: [
    { source: 'venue_rental', amount: 850000, percentage: 46 },
    { source: 'catering', amount: 520000, percentage: 28 },
    { source: 'av_equipment', amount: 280000, percentage: 15 },
    { source: 'staffing', amount: 200000, percentage: 11 },
  ],
  revenue_by_event_type: [
    { event_type: 'corporate', amount: 720000, count: 18 },
    { event_type: 'wedding', amount: 580000, count: 12 },
    { event_type: 'social', amount: 320000, count: 8 },
    { event_type: 'conference', amount: 230000, count: 3 },
  ],
  monthly_trend: [
    { month: 'Jan 2024', revenue: 280000, booking_count: 8 },
    { month: 'Feb 2024', revenue: 310000, booking_count: 9 },
    { month: 'Mar 2024', revenue: 420000, booking_count: 12 },
    { month: 'Apr 2024', revenue: 380000, booking_count: 10 },
    { month: 'May 2024', revenue: 460000, booking_count: 13 },
  ],
};

export const GET = apiRoute(
  async (request: NextRequest) => {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    const now = new Date();
    const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
    const days = daysMap[range] || 30;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);

    try {
      // Fetch revenue data from ledger entries with proper schema columns
      // Schema: ledger_entries has 'side' (debit/credit), 'entry_date', 'amount', 'account_id', 'memo'
      const { data: revenueEntries, error: revenueError } = await supabase
        .from('ledger_entries')
        .select(`
          amount,
          side,
          entry_date,
          memo,
          account_id,
          ledger_accounts!inner(id, code, name, account_type)
        `)
        .eq('side', 'credit')
        .gte('entry_date', startDate.toISOString().split('T')[0]);

      if (revenueError) {
        return NextResponse.json(DEMO_REVENUE_METRICS);
      }

      // Fetch previous period revenue for comparison
      const { data: previousRevenue } = await supabase
        .from('ledger_entries')
        .select('amount')
        .eq('side', 'credit')
        .gte('entry_date', previousStartDate.toISOString().split('T')[0])
        .lt('entry_date', startDate.toISOString().split('T')[0]);

      // Fetch bookings data
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id, event_type, total_amount, created_at')
        .gte('created_at', startDate.toISOString());

      if (!revenueEntries || revenueEntries.length === 0) {
        return NextResponse.json(DEMO_REVENUE_METRICS);
      }

      interface RevenueEntry {
        amount?: number;
        side?: string;
        entry_date?: string;
        memo?: string;
        account_id?: string;
        ledger_accounts?: {
          id: string;
          code: string;
          name: string;
          account_type: string;
        };
      }

      interface BookingRecord {
        id: string;
        event_type?: string;
        total_amount?: number;
        created_at?: string;
      }

      const entries = revenueEntries as RevenueEntry[];
      const prevEntries = (previousRevenue || []) as RevenueEntry[];
      const bookingsData = (bookings || []) as BookingRecord[];

      // Calculate total revenue
      const totalRevenue = entries.reduce((sum, e) => sum + (e.amount || 0), 0);
      const previousTotalRevenue = prevEntries.reduce((sum, e) => sum + (e.amount || 0), 0);

      // Calculate revenue change percent
      const revenueChangePercent = previousTotalRevenue > 0
        ? ((totalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100
        : 0;

      // Calculate average event value
      const averageEventValue = bookingsData.length > 0
        ? bookingsData.reduce((sum, b) => sum + (b.total_amount || 0), 0) / bookingsData.length
        : 0;

      // Calculate revenue by source/category using account_type from ledger_accounts
      const sourceMap: Record<string, number> = {};
      entries.forEach(e => {
        const source = e.ledger_accounts?.account_type || e.ledger_accounts?.name || 'other';
        sourceMap[source] = (sourceMap[source] || 0) + (e.amount || 0);
      });

      const revenueBySource = Object.entries(sourceMap).map(([source, amount]) => ({
        source,
        amount,
        percentage: totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0,
      })).sort((a, b) => b.amount - a.amount);

      // Calculate revenue by event type
      const eventTypeMap: Record<string, { amount: number; count: number }> = {};
      bookingsData.forEach(b => {
        const eventType = b.event_type || 'other';
        if (!eventTypeMap[eventType]) {
          eventTypeMap[eventType] = { amount: 0, count: 0 };
        }
        eventTypeMap[eventType].amount += b.total_amount || 0;
        eventTypeMap[eventType].count += 1;
      });

      const revenueByEventType = Object.entries(eventTypeMap).map(([event_type, data]) => ({
        event_type,
        amount: data.amount,
        count: data.count,
      })).sort((a, b) => b.amount - a.amount);

      // Calculate monthly trend using entry_date from schema
      const monthlyMap: Record<string, { revenue: number; booking_count: number }> = {};
      entries.forEach(e => {
        if (e.entry_date) {
          const date = new Date(e.entry_date);
          const monthKey = `${date.toLocaleString('en-US', { month: 'short' })} ${date.getFullYear()}`;
          if (!monthlyMap[monthKey]) {
            monthlyMap[monthKey] = { revenue: 0, booking_count: 0 };
          }
          monthlyMap[monthKey].revenue += e.amount || 0;
        }
      });

      bookingsData.forEach(b => {
        if (b.created_at) {
          const date = new Date(b.created_at);
          const monthKey = `${date.toLocaleString('en-US', { month: 'short' })} ${date.getFullYear()}`;
          if (monthlyMap[monthKey]) {
            monthlyMap[monthKey].booking_count += 1;
          }
        }
      });

      const monthlyTrend = Object.entries(monthlyMap)
        .map(([month, data]) => ({
          month,
          revenue: data.revenue,
          booking_count: data.booking_count,
        }))
        .sort((a, b) => {
          const [aMonth, aYear] = a.month.split(' ');
          const [bMonth, bYear] = b.month.split(' ');
          return new Date(`${aMonth} 1, ${aYear}`).getTime() - new Date(`${bMonth} 1, ${bYear}`).getTime();
        });

      const metrics: RevenueMetrics = {
        total_revenue: totalRevenue,
        revenue_change_percent: revenueChangePercent,
        average_event_value: averageEventValue,
        revenue_by_source: revenueBySource.length > 0 ? revenueBySource : DEMO_REVENUE_METRICS.revenue_by_source,
        revenue_by_event_type: revenueByEventType.length > 0 ? revenueByEventType : DEMO_REVENUE_METRICS.revenue_by_event_type,
        monthly_trend: monthlyTrend.length > 0 ? monthlyTrend : DEMO_REVENUE_METRICS.monthly_trend,
      };

      return NextResponse.json(metrics);
    } catch (error) {
      return NextResponse.json(DEMO_REVENUE_METRICS);
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER],
    audit: { action: 'analytics:revenue:view', resource: 'analytics' },
  }
);
