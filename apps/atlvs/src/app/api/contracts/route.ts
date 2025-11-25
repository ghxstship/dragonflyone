import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schema
const contractSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['service', 'product', 'nda', 'employment', 'partnership', 'licensing']),
  vendor_id: z.string().uuid().optional(),
  client_id: z.string().uuid().optional(),
  counterparty_name: z.string().optional(),
  value: z.number().min(0),
  currency: z.string().default('USD'),
  start_date: z.string(), // ISO date string
  end_date: z.string().optional(),
  status: z.enum(['draft', 'pending_approval', 'active', 'expired', 'terminated', 'renewed']).default('draft'),
  terms: z.string().optional(),
  auto_renew: z.boolean().default(false),
  payment_terms: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// GET /api/contracts - List all contracts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const vendorId = searchParams.get('vendor_id');
    const expiringSoon = searchParams.get('expiring_soon') === 'true';

    let query = supabase
      .from('contracts')
      .select(`
        *,
        vendor:vendors(id, name),
        client:contacts(id, full_name),
        owner:platform_users!owner_id(id, full_name)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }

    // Get contracts expiring in next 30 days
    if (expiringSoon) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      query = query
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString().split('T')[0])
        .lte('end_date', futureDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching contracts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch contracts', details: error.message },
        { status: 500 }
      );
    }

    // Calculate summary statistics
    const summary = {
      total: data.length,
      active: data.filter(c => c.status === 'active').length,
      expiringSoon: data.filter(c => {
        if (!c.end_date) return false;
        const daysUntil = Math.ceil(
          (new Date(c.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return c.status === 'active' && daysUntil > 0 && daysUntil <= 30;
      }).length,
      totalValue: data.reduce((sum, c) => sum + Number(c.value || 0), 0),
    };

    return NextResponse.json({
      contracts: data,
      summary,
    });
  } catch (error) {
    console.error('Error in GET /api/contracts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/contracts - Create new contract
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validated = contractSchema.parse(body);

    // TODO: Get organization_id and user from auth session
    const organizationId = body.organization_id || '00000000-0000-0000-0000-000000000000';
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    const { data, error } = await supabase
      .from('contracts')
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
        vendor:vendors(id, name),
        client:contacts(id, full_name),
        owner:platform_users!owner_id(id, full_name)
      `)
      .single();

    if (error) {
      console.error('Error creating contract:', error);
      return NextResponse.json(
        { error: 'Failed to create contract', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/contracts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/contracts - Bulk update contracts (for batch operations)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { contract_ids, updates } = body;

    if (!contract_ids || !Array.isArray(contract_ids) || contract_ids.length === 0) {
      return NextResponse.json(
        { error: 'contract_ids array is required' },
        { status: 400 }
      );
    }

    // Validate updates
    const allowedUpdates = ['status', 'notes', 'tags'];
    const validUpdates = Object.keys(updates).every(key => allowedUpdates.includes(key));

    if (!validUpdates) {
      return NextResponse.json(
        { error: 'Invalid update fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('contracts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .in('id', contract_ids)
      .select();

    if (error) {
      console.error('Error updating contracts:', error);
      return NextResponse.json(
        { error: 'Failed to update contracts', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updated: data.length,
      contracts: data,
    });
  } catch (error) {
    console.error('Error in PATCH /api/contracts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
