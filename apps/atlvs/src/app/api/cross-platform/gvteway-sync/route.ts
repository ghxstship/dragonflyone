import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

// GET /api/cross-platform/gvteway-sync - Get financial sync status
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const eventId = searchParams.get('event_id');

    if (action === 'linked_events') {
      // Get all linked events with financial data
      const { data: links } = await supabase
        .from('cross_platform_links')
        .select(`
          *,
          atlvs_project:projects!atlvs_project_id(id, name, budget),
          gvteway_event:events!gvteway_event_id(id, name, status)
        `)
        .eq('link_type', 'atlvs_gvteway');

      return NextResponse.json({ linked_events: links || [] });
    }

    if (action === 'financial_summary' && eventId) {
      // Get financial summary for an event
      const { data: ticketSales } = await supabase
        .from('orders')
        .select('total_amount, status')
        .eq('event_id', eventId)
        .eq('status', 'completed');

      const { data: refunds } = await supabase
        .from('refunds')
        .select('amount')
        .eq('event_id', eventId);

      const grossRevenue = ticketSales?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
      const totalRefunds = refunds?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
      const netRevenue = grossRevenue - totalRefunds;

      // Get linked ATLVS project budget
      const { data: link } = await supabase
        .from('cross_platform_links')
        .select('atlvs_project_id')
        .eq('gvteway_event_id', eventId)
        .single();

      let budget = 0;
      if (link?.atlvs_project_id) {
        const { data: project } = await supabase
          .from('projects')
          .select('budget')
          .eq('id', link.atlvs_project_id)
          .single();
        budget = project?.budget || 0;
      }

      return NextResponse.json({
        event_id: eventId,
        financial_summary: {
          gross_revenue: grossRevenue,
          refunds: totalRefunds,
          net_revenue: netRevenue,
          ticket_count: ticketSales?.length || 0,
          budget,
          profit_margin: budget > 0 ? ((netRevenue - budget) / budget * 100).toFixed(2) : 0,
        },
      });
    }

    if (action === 'sync_status') {
      // Get recent sync logs
      const { data: syncLogs } = await supabase
        .from('cross_platform_sync_logs')
        .select('*')
        .eq('link_type', 'atlvs_gvteway')
        .order('synced_at', { ascending: false })
        .limit(20);

      return NextResponse.json({ sync_logs: syncLogs || [] });
    }

    // Default: Get overview
    const { data: links } = await supabase
      .from('cross_platform_links')
      .select('id')
      .eq('link_type', 'atlvs_gvteway');

    // Get total revenue from all linked events
    const { data: allRevenue } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'completed');

    const totalRevenue = allRevenue?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

    return NextResponse.json({
      total_linked_events: links?.length || 0,
      total_revenue: totalRevenue,
      sync_types: ['revenue', 'refunds', 'ticket_sales', 'financial_reports'],
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sync data' }, { status: 500 });
  }
}

// POST /api/cross-platform/gvteway-sync - Create link or sync financial data
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action || 'create_link';

    if (action === 'create_link') {
      const { atlvs_project_id, gvteway_event_id } = body;

      if (!atlvs_project_id || !gvteway_event_id) {
        return NextResponse.json({ error: 'Both IDs required' }, { status: 400 });
      }

      const { data: link, error } = await supabase
        .from('cross_platform_links')
        .insert({
          link_type: 'atlvs_gvteway',
          atlvs_project_id,
          gvteway_event_id,
          sync_enabled: true,
          sync_direction: 'gvteway_to_atlvs',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ link }, { status: 201 });
    } else if (action === 'sync_revenue') {
      const { gvteway_event_id, atlvs_project_id } = body;

      // Get GVTEWAY revenue data
      const { data: orders } = await supabase
        .from('orders')
        .select('id, total_amount, created_at, status')
        .eq('event_id', gvteway_event_id)
        .eq('status', 'completed');

      const { data: refunds } = await supabase
        .from('refunds')
        .select('id, amount, created_at')
        .eq('event_id', gvteway_event_id);

      const grossRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
      const totalRefunds = refunds?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
      const netRevenue = grossRevenue - totalRefunds;

      // Create or update revenue record in ATLVS
      const { data: revenueRecord, error } = await supabase
        .from('project_revenue')
        .upsert({
          project_id: atlvs_project_id,
          source: 'gvteway_tickets',
          source_event_id: gvteway_event_id,
          gross_amount: grossRevenue,
          refunds: totalRefunds,
          net_amount: netRevenue,
          transaction_count: orders?.length || 0,
          synced_at: new Date().toISOString(),
        }, { onConflict: 'project_id,source_event_id' })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Log the sync
      await supabase.from('cross_platform_sync_logs').insert({
        link_type: 'atlvs_gvteway',
        atlvs_project_id,
        gvteway_event_id,
        sync_direction: 'gvteway_to_atlvs',
        fields_synced: ['revenue', 'refunds'],
        sync_results: {
          gross_revenue: grossRevenue,
          refunds: totalRefunds,
          net_revenue: netRevenue,
          orders_count: orders?.length || 0,
        },
        synced_by: user.id,
        synced_at: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        revenue_record: revenueRecord,
        summary: {
          gross_revenue: grossRevenue,
          refunds: totalRefunds,
          net_revenue: netRevenue,
        },
      });
    } else if (action === 'sync_all_events') {
      // Sync all linked events
      const { data: links } = await supabase
        .from('cross_platform_links')
        .select('atlvs_project_id, gvteway_event_id')
        .eq('link_type', 'atlvs_gvteway')
        .eq('sync_enabled', true);

      const results = [];

      for (const link of links || []) {
        // Get revenue for each event
        const { data: orders } = await supabase
          .from('orders')
          .select('total_amount')
          .eq('event_id', link.gvteway_event_id)
          .eq('status', 'completed');

        const { data: refunds } = await supabase
          .from('refunds')
          .select('amount')
          .eq('event_id', link.gvteway_event_id);

        const grossRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
        const totalRefunds = refunds?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;

        await supabase
          .from('project_revenue')
          .upsert({
            project_id: link.atlvs_project_id,
            source: 'gvteway_tickets',
            source_event_id: link.gvteway_event_id,
            gross_amount: grossRevenue,
            refunds: totalRefunds,
            net_amount: grossRevenue - totalRefunds,
            transaction_count: orders?.length || 0,
            synced_at: new Date().toISOString(),
          }, { onConflict: 'project_id,source_event_id' });

        results.push({
          event_id: link.gvteway_event_id,
          project_id: link.atlvs_project_id,
          net_revenue: grossRevenue - totalRefunds,
        });
      }

      return NextResponse.json({
        success: true,
        synced_count: results.length,
        results,
      });
    } else if (action === 'generate_financial_report') {
      const { atlvs_project_id, start_date, end_date } = body;

      // Get all revenue sources for the project
      const { data: revenue } = await supabase
        .from('project_revenue')
        .select('*')
        .eq('project_id', atlvs_project_id);

      // Get project budget
      const { data: project } = await supabase
        .from('projects')
        .select('budget, name')
        .eq('id', atlvs_project_id)
        .single();

      // Get expenses
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount, category')
        .eq('project_id', atlvs_project_id);

      const totalRevenue = revenue?.reduce((sum, r) => sum + (r.net_amount || 0), 0) || 0;
      const totalExpenses = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
      const profit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (profit / totalRevenue * 100) : 0;

      // Create financial report
      const { data: report, error } = await supabase
        .from('financial_reports')
        .insert({
          project_id: atlvs_project_id,
          report_type: 'project_summary',
          period_start: start_date,
          period_end: end_date,
          total_revenue: totalRevenue,
          total_expenses: totalExpenses,
          net_profit: profit,
          profit_margin: profitMargin,
          budget: project?.budget,
          budget_variance: (project?.budget || 0) - totalExpenses,
          generated_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ report });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process sync' }, { status: 500 });
  }
}
