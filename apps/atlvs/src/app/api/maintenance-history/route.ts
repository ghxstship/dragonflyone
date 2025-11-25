import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Validation schemas
const maintenanceRecordSchema = z.object({
  asset_id: z.string().uuid(),
  type: z.enum(['preventive', 'corrective', 'inspection', 'calibration', 'repair', 'upgrade', 'cleaning']),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'deferred']).default('scheduled'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  scheduled_date: z.string().datetime(),
  completed_date: z.string().datetime().optional(),
  performed_by: z.string().uuid().optional(),
  vendor_id: z.string().uuid().optional(),
  labor_hours: z.number().min(0).optional(),
  labor_cost: z.number().min(0).optional(),
  parts_cost: z.number().min(0).optional(),
  total_cost: z.number().min(0).optional(),
  parts_used: z.array(z.object({
    name: z.string(),
    part_number: z.string().optional(),
    quantity: z.number(),
    unit_cost: z.number().optional(),
  })).optional(),
  notes: z.string().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string(),
  })).optional(),
  next_service_date: z.string().datetime().optional(),
  warranty_claim: z.boolean().default(false),
});

const serviceRecordSchema = z.object({
  asset_id: z.string().uuid(),
  service_type: z.enum(['routine', 'emergency', 'warranty', 'recall', 'upgrade']),
  service_provider: z.string(),
  service_date: z.string().datetime(),
  invoice_number: z.string().optional(),
  invoice_amount: z.number().min(0).optional(),
  work_performed: z.string(),
  technician_name: z.string().optional(),
  condition_before: z.enum(['excellent', 'good', 'fair', 'poor', 'non_functional']).optional(),
  condition_after: z.enum(['excellent', 'good', 'fair', 'poor', 'non_functional']).optional(),
  recommendations: z.string().optional(),
  warranty_used: z.boolean().default(false),
  next_service_due: z.string().datetime().optional(),
});

// GET - Get maintenance history and service records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'history' | 'upcoming' | 'overdue' | 'costs' | 'service_records'
    const assetId = searchParams.get('asset_id');
    const category = searchParams.get('category');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    if (type === 'history') {
      // Get maintenance history
      let query = supabase
        .from('maintenance_records')
        .select(`
          *,
          asset:assets(id, name, asset_tag, category),
          performer:platform_users(id, email, first_name, last_name),
          vendor:vendors(id, name)
        `, { count: 'exact' })
        .order('scheduled_date', { ascending: false });

      if (assetId) {
        query = query.eq('asset_id', assetId);
      }
      if (startDate) {
        query = query.gte('scheduled_date', startDate);
      }
      if (endDate) {
        query = query.lte('scheduled_date', endDate);
      }

      const { data: records, error, count } = await query.range(offset, offset + limit - 1);

      if (error) throw error;

      return NextResponse.json({
        records,
        total: count,
        page,
        limit,
      });
    }

    if (type === 'upcoming') {
      // Get upcoming scheduled maintenance
      const daysAhead = parseInt(searchParams.get('days') || '30');
      const futureDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString();

      let query = supabase
        .from('maintenance_records')
        .select(`
          *,
          asset:assets(id, name, asset_tag, category, status)
        `)
        .eq('status', 'scheduled')
        .gte('scheduled_date', new Date().toISOString())
        .lte('scheduled_date', futureDate)
        .order('scheduled_date', { ascending: true });

      // Note: category filtering would need to be done post-query since asset is a joined table
      // For now, we filter in memory if category is specified

      const { data: upcoming, error } = await query;

      if (error) throw error;

      // Group by week
      const byWeek = upcoming?.reduce((acc: Record<string, any[]>, record) => {
        const date = new Date(record.scheduled_date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        if (!acc[weekKey]) acc[weekKey] = [];
        acc[weekKey].push(record);
        return acc;
      }, {});

      return NextResponse.json({
        upcoming,
        by_week: byWeek,
        total: upcoming?.length || 0,
      });
    }

    if (type === 'overdue') {
      // Get overdue maintenance
      const { data: overdue, error } = await supabase
        .from('maintenance_records')
        .select(`
          *,
          asset:assets(id, name, asset_tag, category, status)
        `)
        .eq('status', 'scheduled')
        .lt('scheduled_date', new Date().toISOString())
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      // Calculate days overdue
      const enriched = overdue?.map(record => ({
        ...record,
        days_overdue: Math.floor((Date.now() - new Date(record.scheduled_date).getTime()) / (24 * 60 * 60 * 1000)),
      }));

      return NextResponse.json({
        overdue: enriched,
        total: overdue?.length || 0,
        critical_count: enriched?.filter(r => r.priority === 'critical').length || 0,
      });
    }

    if (type === 'costs') {
      // Get maintenance cost analysis
      const year = searchParams.get('year') || new Date().getFullYear().toString();
      const startOfYear = `${year}-01-01T00:00:00Z`;
      const endOfYear = `${year}-12-31T23:59:59Z`;

      const { data: records, error } = await supabase
        .from('maintenance_records')
        .select(`
          asset_id,
          type,
          labor_cost,
          parts_cost,
          total_cost,
          completed_date,
          asset:assets(id, name, category)
        `)
        .eq('status', 'completed')
        .gte('completed_date', startOfYear)
        .lte('completed_date', endOfYear);

      if (error) throw error;

      // Calculate totals by category
      const byCategory = records?.reduce((acc: Record<string, { labor: number; parts: number; total: number; count: number }>, r) => {
        const assetData = r.asset as unknown as { id: string; name: string; category: string } | null;
        const cat = assetData?.category || 'unknown';
        if (!acc[cat]) acc[cat] = { labor: 0, parts: 0, total: 0, count: 0 };
        acc[cat].labor += r.labor_cost || 0;
        acc[cat].parts += r.parts_cost || 0;
        acc[cat].total += r.total_cost || 0;
        acc[cat].count += 1;
        return acc;
      }, {});

      // Calculate totals by type
      const byType = records?.reduce((acc: Record<string, { total: number; count: number }>, r) => {
        if (!acc[r.type]) acc[r.type] = { total: 0, count: 0 };
        acc[r.type].total += r.total_cost || 0;
        acc[r.type].count += 1;
        return acc;
      }, {});

      // Monthly breakdown
      const byMonth = records?.reduce((acc: Record<string, number>, r) => {
        if (r.completed_date) {
          const month = r.completed_date.substring(0, 7);
          acc[month] = (acc[month] || 0) + (r.total_cost || 0);
        }
        return acc;
      }, {});

      // Top 10 most expensive assets
      const byAsset = records?.reduce((acc: Record<string, { name: string; total: number; count: number }>, r) => {
        const assetId = r.asset_id;
        const assetInfo = r.asset as unknown as { id: string; name: string; category: string } | null;
        if (!acc[assetId]) acc[assetId] = { name: assetInfo?.name || 'Unknown', total: 0, count: 0 };
        acc[assetId].total += r.total_cost || 0;
        acc[assetId].count += 1;
        return acc;
      }, {});

      const topAssets = Object.entries(byAsset || {})
        .map(([id, data]) => ({ asset_id: id, ...data }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      const totalCost = records?.reduce((sum, r) => sum + (r.total_cost || 0), 0) || 0;

      return NextResponse.json({
        year,
        summary: {
          total_cost: totalCost,
          total_records: records?.length || 0,
          average_cost: records?.length ? totalCost / records.length : 0,
        },
        by_category: byCategory,
        by_type: byType,
        by_month: byMonth,
        top_assets: topAssets,
      });
    }

    if (type === 'service_records') {
      // Get service records from external providers
      let query = supabase
        .from('service_records')
        .select(`
          *,
          asset:assets(id, name, asset_tag, category)
        `, { count: 'exact' })
        .order('service_date', { ascending: false });

      if (assetId) {
        query = query.eq('asset_id', assetId);
      }

      const { data: records, error, count } = await query.range(offset, offset + limit - 1);

      if (error) throw error;

      return NextResponse.json({
        records,
        total: count,
        page,
        limit,
      });
    }

    if (type === 'asset_summary' && assetId) {
      // Get complete maintenance summary for an asset
      const [maintenanceResult, serviceResult, costsResult] = await Promise.all([
        supabase
          .from('maintenance_records')
          .select('*')
          .eq('asset_id', assetId)
          .order('scheduled_date', { ascending: false }),
        supabase
          .from('service_records')
          .select('*')
          .eq('asset_id', assetId)
          .order('service_date', { ascending: false }),
        supabase
          .from('maintenance_records')
          .select('total_cost, labor_cost, parts_cost')
          .eq('asset_id', assetId)
          .eq('status', 'completed'),
      ]);

      const totalCosts = costsResult.data?.reduce((acc, r) => ({
        total: acc.total + (r.total_cost || 0),
        labor: acc.labor + (r.labor_cost || 0),
        parts: acc.parts + (r.parts_cost || 0),
      }), { total: 0, labor: 0, parts: 0 });

      const lastMaintenance = maintenanceResult.data?.find(r => r.status === 'completed');
      const nextMaintenance = maintenanceResult.data?.find(r => r.status === 'scheduled');

      return NextResponse.json({
        maintenance_records: maintenanceResult.data,
        service_records: serviceResult.data,
        summary: {
          total_maintenance_count: maintenanceResult.data?.length || 0,
          completed_count: maintenanceResult.data?.filter(r => r.status === 'completed').length || 0,
          total_service_count: serviceResult.data?.length || 0,
          total_costs: totalCosts,
          last_maintenance: lastMaintenance?.completed_date,
          next_maintenance: nextMaintenance?.scheduled_date,
        },
      });
    }

    // Default: return summary
    const [totalResult, upcomingResult, overdueResult, completedResult] = await Promise.all([
      supabase.from('maintenance_records').select('id', { count: 'exact' }),
      supabase.from('maintenance_records').select('id', { count: 'exact' })
        .eq('status', 'scheduled')
        .gte('scheduled_date', new Date().toISOString())
        .lte('scheduled_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('maintenance_records').select('id', { count: 'exact' })
        .eq('status', 'scheduled')
        .lt('scheduled_date', new Date().toISOString()),
      supabase.from('maintenance_records').select('total_cost')
        .eq('status', 'completed')
        .gte('completed_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    const yearCost = completedResult.data?.reduce((sum, r) => sum + (r.total_cost || 0), 0) || 0;

    return NextResponse.json({
      summary: {
        total_records: totalResult.count || 0,
        upcoming_30_days: upcomingResult.count || 0,
        overdue: overdueResult.count || 0,
        year_to_date_cost: yearCost,
      },
    });
  } catch (error: any) {
    console.error('Maintenance history error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create maintenance record or service record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'create_maintenance') {
      const validated = maintenanceRecordSchema.parse(body.data);

      // Calculate total cost if not provided
      const totalCost = validated.total_cost || 
        (validated.labor_cost || 0) + (validated.parts_cost || 0);

      const { data: record, error } = await supabase
        .from('maintenance_records')
        .insert({
          ...validated,
          total_cost: totalCost,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update asset's next maintenance date if provided
      if (validated.next_service_date) {
        await supabase
          .from('assets')
          .update({ 
            next_maintenance_date: validated.next_service_date,
            updated_at: new Date().toISOString(),
          })
          .eq('id', validated.asset_id);
      }

      return NextResponse.json({ record }, { status: 201 });
    }

    if (action === 'create_service_record') {
      const validated = serviceRecordSchema.parse(body.data);

      const { data: record, error } = await supabase
        .from('service_records')
        .insert({
          ...validated,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update asset condition and next service date
      const updates: any = { updated_at: new Date().toISOString() };
      if (validated.condition_after) {
        updates.condition = validated.condition_after;
      }
      if (validated.next_service_due) {
        updates.next_maintenance_date = validated.next_service_due;
      }

      await supabase.from('assets').update(updates).eq('id', validated.asset_id);

      return NextResponse.json({ record }, { status: 201 });
    }

    if (action === 'complete_maintenance') {
      const { record_id, completed_date, labor_hours, labor_cost, parts_cost, parts_used, notes, performed_by, next_service_date } = body.data;

      const totalCost = (labor_cost || 0) + (parts_cost || 0);

      const { data: record, error } = await supabase
        .from('maintenance_records')
        .update({
          status: 'completed',
          completed_date: completed_date || new Date().toISOString(),
          labor_hours,
          labor_cost,
          parts_cost,
          total_cost: totalCost,
          parts_used,
          notes,
          performed_by,
          next_service_date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', record_id)
        .select()
        .single();

      if (error) throw error;

      // Update asset's next maintenance date
      if (next_service_date) {
        await supabase
          .from('assets')
          .update({ 
            next_maintenance_date: next_service_date,
            last_maintenance_date: completed_date || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', record.asset_id);
      }

      return NextResponse.json({ record });
    }

    if (action === 'schedule_recurring') {
      // Schedule recurring maintenance
      const { asset_id, type, title, description, interval_days, start_date, end_date, priority } = body.data;

      const records = [];
      let currentDate = new Date(start_date);
      const endDateTime = end_date ? new Date(end_date) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      while (currentDate <= endDateTime) {
        records.push({
          asset_id,
          type,
          title,
          description,
          priority: priority || 'medium',
          status: 'scheduled',
          scheduled_date: currentDate.toISOString(),
          is_recurring: true,
          recurrence_interval: interval_days,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        currentDate = new Date(currentDate.getTime() + interval_days * 24 * 60 * 60 * 1000);
      }

      const { data: createdRecords, error } = await supabase
        .from('maintenance_records')
        .insert(records)
        .select();

      if (error) throw error;

      return NextResponse.json({ records: createdRecords, count: createdRecords?.length }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Maintenance history error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update maintenance record
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    // Recalculate total cost if labor or parts cost changed
    if (updates.labor_cost !== undefined || updates.parts_cost !== undefined) {
      const { data: current } = await supabase
        .from('maintenance_records')
        .select('labor_cost, parts_cost')
        .eq('id', id)
        .single();

      updates.total_cost = 
        (updates.labor_cost ?? current?.labor_cost ?? 0) + 
        (updates.parts_cost ?? current?.parts_cost ?? 0);
    }

    const { data: record, error } = await supabase
      .from('maintenance_records')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ record });
  } catch (error: any) {
    console.error('Maintenance history error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Cancel or delete maintenance record
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action'); // 'cancel' | 'delete'

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    if (action === 'cancel') {
      const { error } = await supabase
        .from('maintenance_records')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    } else {
      // Only allow deletion of scheduled records
      const { data: record } = await supabase
        .from('maintenance_records')
        .select('status')
        .eq('id', id)
        .single();

      if (record?.status === 'completed') {
        return NextResponse.json({ error: 'Cannot delete completed maintenance records' }, { status: 400 });
      }

      const { error } = await supabase
        .from('maintenance_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Maintenance history error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
