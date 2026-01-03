export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { logger, withAuth, PlatformRole } from '@ghxstship/config';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const GVTEWAY_ADMIN_ROLES = [
  PlatformRole.GVTEWAY_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
];

const membershipSchema = z.object({
  tier_id: z.string().uuid(),
  user_id: z.string().uuid(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  auto_renew: z.boolean().default(true),
  payment_method_id: z.string().uuid().optional(),
});

// GET /api/membership - List memberships or get user membership
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const userId = searchParams.get('user_id');
    const tierId = searchParams.get('tier_id');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Return membership tiers
    if (type === 'tiers') {
      const { data: tiers, error } = await supabase
        .from('membership_tiers')
        .select('*')
        .eq('status', 'active')
        .order('price', { ascending: true });

      if (error) {
        return NextResponse.json({ tiers: [] });
      }
      return NextResponse.json({ tiers: tiers || [] });
    }

    // Return membership benefits
    if (type === 'benefits' && tierId) {
      const { data: benefits, error } = await supabase
        .from('membership_benefits')
        .select('*')
        .eq('tier_id', tierId)
        .order('sort_order', { ascending: true });

      if (error) {
        return NextResponse.json({ benefits: [] });
      }
      return NextResponse.json({ benefits: benefits || [] });
    }

    let query = supabase
      .from('memberships')
      .select(`
        *,
        tier:membership_tiers(id, name, price, billing_period, features),
        user:platform_users(id, email, first_name, last_name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (tierId) {
      query = query.eq('tier_id', tierId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      const errorCode = (error as { code?: string }).code || '';
      const errorMessage = error.message || '';
      if (
        errorCode === '42P01' || 
        errorCode === 'PGRST116' ||
        errorMessage.includes('does not exist') ||
        errorMessage.includes('relation')
      ) {
        return NextResponse.json({ 
          memberships: [], 
          total: 0, 
          limit, 
          offset,
          summary: { total: 0, active: 0, expired: 0, cancelled: 0 }
        });
      }
      return NextResponse.json({ 
        memberships: [], 
        total: 0, 
        limit, 
        offset,
        summary: { total: 0, active: 0, expired: 0, cancelled: 0 }
      });
    }

    const memberships = data || [];
    const summary = {
      total: count || 0,
      active: memberships.filter(m => m.status === 'active').length,
      expired: memberships.filter(m => m.status === 'expired').length,
      cancelled: memberships.filter(m => m.status === 'cancelled').length,
    };

    return NextResponse.json({ memberships, total: count, limit, offset, summary });
  } catch (error) {
    return NextResponse.json({ 
      memberships: [], 
      total: 0, 
      limit: 50, 
      offset: 0,
      summary: { total: 0, active: 0, expired: 0, cancelled: 0 }
    });
  }
}

// POST /api/membership - Create membership
export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = membershipSchema.parse(body);

    const startDate = validated.start_date || new Date().toISOString();
    
    // Get tier details to calculate end date
    const { data: tier } = await supabase
      .from('membership_tiers')
      .select('billing_period, price')
      .eq('id', validated.tier_id)
      .single();

    let endDate = validated.end_date;
    if (!endDate && tier) {
      const start = new Date(startDate);
      if (tier.billing_period === 'monthly') {
        start.setMonth(start.getMonth() + 1);
      } else if (tier.billing_period === 'yearly') {
        start.setFullYear(start.getFullYear() + 1);
      }
      endDate = start.toISOString();
    }

    const membershipNumber = `MEM-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const { data: membership, error } = await supabase
      .from('memberships')
      .insert({
        organization_id: body.organization_id || '00000000-0000-0000-0000-000000000001',
        tier_id: validated.tier_id,
        user_id: validated.user_id,
        membership_number: membershipNumber,
        start_date: startDate,
        end_date: endDate,
        auto_renew: validated.auto_renew,
        payment_method_id: validated.payment_method_id,
        status: 'active',
      })
      .select(`
        *,
        tier:membership_tiers(id, name, price, features)
      `)
      .single();

    if (error) {
      logger.error('Error creating membership:', error);
      return NextResponse.json({ error: 'Failed to create membership', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ membership }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in POST /api/membership:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/membership - Update membership
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const supabase = getSupabaseClient();
    const body = await request.json();
    const { membership_id, action, updates } = body;

    if (!membership_id) {
      return NextResponse.json({ error: 'membership_id is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (action === 'renew') {
      const { data: current } = await supabase
        .from('memberships')
        .select('end_date, tier:membership_tiers(billing_period)')
        .eq('id', membership_id)
        .single();

      if (current) {
        const endDate = new Date(current.end_date);
        const tier = current.tier as { billing_period?: string } | null;
        if (tier?.billing_period === 'monthly') {
          endDate.setMonth(endDate.getMonth() + 1);
        } else {
          endDate.setFullYear(endDate.getFullYear() + 1);
        }
        updateData.end_date = endDate.toISOString();
        updateData.status = 'active';
      }
    } else if (action === 'cancel') {
      updateData.status = 'cancelled';
      updateData.cancelled_at = new Date().toISOString();
      updateData.auto_renew = false;
    } else if (action === 'pause') {
      updateData.status = 'paused';
      updateData.paused_at = new Date().toISOString();
    } else if (action === 'resume') {
      updateData.status = 'active';
      updateData.paused_at = null;
    } else if (updates) {
      Object.assign(updateData, updates);
    }

    const { data: membership, error } = await supabase
      .from('memberships')
      .update(updateData)
      .eq('id', membership_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update membership' }, { status: 500 });
    }

    return NextResponse.json({ success: true, membership });
  } catch (error) {
    logger.error('Error in PATCH /api/membership:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/membership - Cancel membership
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!GVTEWAY_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const membershipId = searchParams.get('id');

    if (!membershipId) {
      return NextResponse.json({ error: 'Membership ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('memberships')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        auto_renew: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', membershipId);

    if (error) {
      return NextResponse.json({ error: 'Failed to cancel membership' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Membership cancelled' });
  } catch (error) {
    logger.error('Error in DELETE /api/membership:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
