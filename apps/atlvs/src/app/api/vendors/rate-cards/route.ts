export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const RateCardItemSchema = z.object({
  description: z.string().min(1),
  unit: z.string().default('day'),
  daily_rate: z.number().positive(),
  weekly_rate: z.number().positive().optional(),
  monthly_rate: z.number().positive().optional(),
});

const RateCardSchema = z.object({
  vendor_id: z.string().uuid(),
  category: z.string().min(1),
  effective_date: z.string(),
  expiration_date: z.string(),
  notes: z.string().optional(),
  items: z.array(RateCardItemSchema).default([]),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor_id');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let query = supabase
      .from('vendor_rate_cards')
      .select(`
        *,
        vendors(id, name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error('Error fetching rate cards:', error);
      return NextResponse.json(
        { error: 'Failed to fetch rate cards', details: error.message },
        { status: 500 }
      );
    }

    // Calculate status based on dates
    const now = new Date();
    const rateCardsWithStatus = (data || []).map(rc => {
      const expirationDate = new Date(rc.expiration_date);
      const effectiveDate = new Date(rc.effective_date);
      
      let status = 'pending';
      if (now >= effectiveDate && now <= expirationDate) {
        status = 'active';
      } else if (now > expirationDate) {
        status = 'expired';
      }

      return {
        ...rc,
        status,
        vendor_name: rc.vendors?.name || 'Unknown Vendor',
      };
    });

    return NextResponse.json({
      rate_cards: rateCardsWithStatus,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('Error in GET /api/vendors/rate-cards:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validated = RateCardSchema.parse(body);

    const { data: rateCard, error } = await supabase
      .from('vendor_rate_cards')
      .insert({
        vendor_id: validated.vendor_id,
        category: validated.category,
        effective_date: validated.effective_date,
        expiration_date: validated.expiration_date,
        notes: validated.notes,
        items: validated.items,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating rate card:', error);
      return NextResponse.json(
        { error: 'Failed to create rate card', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(rateCard, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Error in POST /api/vendors/rate-cards:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
