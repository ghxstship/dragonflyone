import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

// Validation schema
const complianceItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  compliance_type: z.enum(['insurance', 'license', 'certification', 'permit', 'registration', 'audit', 'inspection', 'regulation']),
  category: z.string().optional(),
  provider_name: z.string().optional(),
  provider_contact: z.string().optional(),
  policy_number: z.string().optional(),
  status: z.enum(['active', 'expired', 'pending', 'cancelled', 'suspended']).default('active'),
  issue_date: z.string().optional(),
  effective_date: z.string(),
  expiration_date: z.string().optional(),
  annual_cost: z.number().optional(),
  coverage_amount: z.number().optional(),
  deductible: z.number().optional(),
  reminder_days_before: z.number().default(30),
  auto_renew: z.boolean().default(false),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/compliance - List all compliance items
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const expiringSoon = searchParams.get('expiring_soon') === 'true';

    let query = supabase
      .from('compliance_items')
      .select(`
        *,
        owner:platform_users!owner_id(id, full_name)
      `)
      .order('expiration_date', { ascending: true, nullsFirst: false });

    // Apply filters
    if (type) {
      query = query.eq('compliance_type', type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    // Get items expiring in next 30 days
    if (expiringSoon) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      query = query
        .eq('status', 'active')
        .gte('expiration_date', new Date().toISOString().split('T')[0])
        .lte('expiration_date', futureDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching compliance items:', error);
      return NextResponse.json(
        { error: 'Failed to fetch compliance items', details: error.message },
        { status: 500 }
      );
    }

    // Calculate summary statistics
    const now = new Date();
    const summary = {
      total: data.length,
      active: data.filter(item => item.status === 'active').length,
      expired: data.filter(item => item.status === 'expired').length,
      expiringSoon: data.filter(item => {
        if (!item.expiration_date) return false;
        const expDate = new Date(item.expiration_date);
        const daysUntil = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return item.status === 'active' && daysUntil > 0 && daysUntil <= 30;
      }).length,
      totalAnnualCost: data.reduce((sum, item) => sum + Number(item.annual_cost || 0), 0),
      byType: {
        insurance: data.filter(item => item.compliance_type === 'insurance').length,
        license: data.filter(item => item.compliance_type === 'license').length,
        certification: data.filter(item => item.compliance_type === 'certification').length,
        permit: data.filter(item => item.compliance_type === 'permit').length,
      },
    };

    return NextResponse.json({
      items: data,
      summary,
    });
  } catch (error) {
    console.error('Error in GET /api/compliance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/compliance - Create new compliance item
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();

    // Validate input
    const validated = complianceItemSchema.parse(body);

    // TODO: Get organization_id and user from auth session
    const organizationId = body.organization_id || '00000000-0000-0000-0000-000000000000';
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    const { data, error } = await supabase
      .from('compliance_items')
      .insert([
        {
          ...validated,
          organization_id: organizationId,
          created_by: userId,
          owner_id: userId,
        },
      ])
      .select(`
        *,
        owner:platform_users!owner_id(id, full_name)
      `)
      .single();

    if (error) {
      console.error('Error creating compliance item:', error);
      return NextResponse.json(
        { error: 'Failed to create compliance item', details: error.message },
        { status: 500 }
      );
    }

    // Log creation event
    await supabase
      .from('compliance_events')
      .insert([
        {
          compliance_item_id: data.id,
          event_type: 'created',
          description: 'Compliance item created',
          performed_by: userId,
        },
      ]);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/compliance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/compliance - Bulk update compliance items
export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const { item_ids, updates } = body;

    if (!item_ids || !Array.isArray(item_ids) || item_ids.length === 0) {
      return NextResponse.json(
        { error: 'item_ids array is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('compliance_items')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .in('id', item_ids)
      .select();

    if (error) {
      console.error('Error updating compliance items:', error);
      return NextResponse.json(
        { error: 'Failed to update compliance items', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updated: data.length,
      items: data,
    });
  } catch (error) {
    console.error('Error in PATCH /api/compliance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
