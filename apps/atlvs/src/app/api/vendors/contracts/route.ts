export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const VendorContractSchema = z.object({
  vendor_id: z.string().uuid(),
  contract_type: z.string().min(1),
  category: z.string().min(1),
  value: z.number().positive(),
  start_date: z.string(),
  expiry_date: z.string(),
  auto_renew: z.boolean().default(false),
  terms: z.string().optional(),
  notes: z.string().optional(),
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
      .from('vendor_contracts')
      .select(`
        *,
        vendors(id, name)
      `, { count: 'exact' })
      .order('expiry_date', { ascending: true })
      .range(offset, offset + limit - 1);

    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error('Error fetching vendor contracts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch vendor contracts', details: error.message },
        { status: 500 }
      );
    }

    const now = new Date();
    const contractsWithStatus = (data || []).map(c => {
      const expiryDate = new Date(c.expiry_date);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      let calculatedStatus = c.status || 'active';
      if (daysUntilExpiry < 0) {
        calculatedStatus = 'expired';
      } else if (daysUntilExpiry <= 30) {
        calculatedStatus = 'expiring';
      }

      return {
        ...c,
        status: calculatedStatus,
        vendor_name: c.vendors?.name || 'Unknown Vendor',
        days_until_expiry: daysUntilExpiry,
      };
    });

    const summary = {
      total: count || 0,
      active: contractsWithStatus.filter(c => c.status === 'active').length,
      expiring: contractsWithStatus.filter(c => c.status === 'expiring').length,
      expired: contractsWithStatus.filter(c => c.status === 'expired').length,
      total_value: contractsWithStatus.reduce((sum, c) => sum + (c.value || 0), 0),
    };

    return NextResponse.json({
      contracts: contractsWithStatus,
      summary,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('Error in GET /api/vendors/contracts:', error);
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
    const validated = VendorContractSchema.parse(body);

    const { data: contract, error } = await supabase
      .from('vendor_contracts')
      .insert({
        vendor_id: validated.vendor_id,
        contract_type: validated.contract_type,
        category: validated.category,
        value: validated.value,
        start_date: validated.start_date,
        expiry_date: validated.expiry_date,
        auto_renew: validated.auto_renew,
        terms: validated.terms,
        notes: validated.notes,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating vendor contract:', error);
      return NextResponse.json(
        { error: 'Failed to create vendor contract', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(contract, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Error in POST /api/vendors/contracts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
