import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'spending') {
      const { data: pos } = await supabase
        .from('purchase_orders')
        .select('total_amount, vendor_id, category, created_at')
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .in('status', ['approved', 'sent', 'received', 'completed']);

      const byCategory: Record<string, number[]> = {};
      pos?.forEach(po => {
        const cat = po.category || 'Other';
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(po.total_amount);
      });

      const anomalies: any[] = [];
      Object.entries(byCategory).forEach(([category, amounts]) => {
        if (amounts.length < 3) return;
        const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const stdDev = Math.sqrt(amounts.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / amounts.length);
        const threshold = mean + 2 * stdDev;

        amounts.forEach((amount, i) => {
          if (amount > threshold) {
            anomalies.push({
              type: 'high_spend',
              category,
              amount,
              threshold: Math.round(threshold * 100) / 100,
              deviation: Math.round(((amount - mean) / stdDev) * 100) / 100,
            });
          }
        });
      });

      return NextResponse.json({ anomalies, total: anomalies.length });
    }

    if (type === 'revenue') {
      const { data: invoices } = await supabase
        .from('invoices')
        .select('total_amount, client_id, created_at')
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

      const byMonth: Record<string, number> = {};
      invoices?.forEach(inv => {
        const month = inv.created_at.substring(0, 7);
        byMonth[month] = (byMonth[month] || 0) + inv.total_amount;
      });

      const values = Object.values(byMonth);
      if (values.length < 2) {
        return NextResponse.json({ anomalies: [], message: 'Insufficient data' });
      }

      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const stdDev = Math.sqrt(values.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / values.length);

      const anomalies = Object.entries(byMonth)
        .filter(([, amount]) => Math.abs(amount - mean) > 2 * stdDev)
        .map(([month, amount]) => ({
          type: amount > mean ? 'high_revenue' : 'low_revenue',
          month,
          amount,
          deviation: Math.round(((amount - mean) / stdDev) * 100) / 100,
        }));

      return NextResponse.json({ anomalies, by_month: byMonth });
    }

    if (type === 'timesheet') {
      const { data: timesheets } = await supabase
        .from('timesheets')
        .select('employee_id, hours, date, employee:platform_users(first_name, last_name)')
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .eq('status', 'approved');

      const byEmployee: Record<string, { name: string; hours: number[] }> = {};
      timesheets?.forEach(ts => {
        const emp = ts.employee as any;
        if (!byEmployee[ts.employee_id]) {
          byEmployee[ts.employee_id] = { name: emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown', hours: [] };
        }
        byEmployee[ts.employee_id].hours.push(ts.hours);
      });

      const anomalies: any[] = [];
      Object.entries(byEmployee).forEach(([empId, data]) => {
        if (data.hours.length < 5) return;
        const mean = data.hours.reduce((a, b) => a + b, 0) / data.hours.length;
        const stdDev = Math.sqrt(data.hours.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / data.hours.length);

        data.hours.forEach(hours => {
          if (hours > mean + 2 * stdDev || hours < mean - 2 * stdDev) {
            anomalies.push({
              type: hours > mean ? 'high_hours' : 'low_hours',
              employee_id: empId,
              employee_name: data.name,
              hours,
              average: Math.round(mean * 100) / 100,
            });
          }
        });
      });

      return NextResponse.json({ anomalies });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metric, threshold, notification_channels } = body;

    const { data: alert, error } = await supabase
      .from('anomaly_alerts')
      .insert({
        metric,
        threshold,
        notification_channels,
        status: 'active',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ alert }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
