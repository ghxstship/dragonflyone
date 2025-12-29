export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const updateContractSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  contract_type: z.string().optional(),
  status: z.enum(['draft', 'pending_review', 'active', 'expired', 'terminated']).optional(),
  vendor_id: z.string().uuid().optional(),
  client_id: z.string().uuid().optional(),
  owner_id: z.string().uuid().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  value: z.number().optional(),
  terms: z.string().optional(),
  auto_renew: z.boolean().optional(),
  renewal_terms: z.string().optional(),
  notice_period_days: z.number().optional(),
  id: z.string().uuid().optional(),
  created_at: z.string().optional(),
  created_by: z.string().uuid().optional(),
  organization_id: z.string().uuid().optional(),
});

// GET /api/contracts/[id] - Get contract by ID
const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;

    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        vendor:vendors(id, name, email, phone),
        client:contacts(id, full_name, email, phone),
        owner:platform_users!owner_id(id, full_name, email),
        milestones:contract_milestones(*),
        amendments:contract_amendments(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Contract not found' },
          { status: 404 }
        );
      }

      logger.error('Error fetching contract:', error);
      return NextResponse.json(
        { error: 'Failed to fetch contract', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    logger.error('Error in GET /api/contracts/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/contracts/[id] - Update contract
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const validatedData = updateContractSchema.parse(body);

    // Remove fields that shouldn't be updated directly
    // Destructure to exclude id, created_at, created_by, organization_id from updates
    const { 
      id: excludedId, 
      created_at: excludedCreatedAt, 
      created_by: excludedCreatedBy, 
      organization_id: excludedOrgId, 
      ...updates 
    } = validatedData;
    // Log excluded fields for audit purposes
    if (excludedId || excludedCreatedAt || excludedCreatedBy || excludedOrgId) {
      logger.debug('Excluded immutable fields from contract update');
    }

    const { data, error } = await supabase
      .from('contracts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        vendor:vendors(id, name),
        client:contacts(id, full_name),
        owner:platform_users!owner_id(id, full_name)
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Contract not found' },
          { status: 404 }
        );
      }

      logger.error('Error updating contract:', error);
      return NextResponse.json(
        { error: 'Failed to update contract', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    logger.error('Error in PATCH /api/contracts/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/contracts/[id] - Delete contract
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;

    // Only allow deletion of draft contracts
    const { data: contract } = await supabase
      .from('contracts')
      .select('status')
      .eq('id', id)
      .single();

    if (contract && contract.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft contracts can be deleted' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting contract:', error);
      return NextResponse.json(
        { error: 'Failed to delete contract', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error in DELETE /api/contracts/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
