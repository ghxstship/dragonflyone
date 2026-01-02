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

const ATLVS_ADMIN_ROLES = [
  PlatformRole.ATLVS_ADMIN,
  PlatformRole.ATLVS_SUPER_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
];

const contractSchema = z.object({
  title: z.string().min(1),
  contract_type: z.string().optional(),
  party_a_org_id: z.string().uuid().optional(),
  party_b_org_id: z.string().uuid().optional(),
  contract_value: z.number().positive().optional(),
  currency: z.string().default('USD'),
  start_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
  payment_terms: z.string().optional(),
  auto_renew: z.boolean().default(false),
  governing_law: z.string().optional(),
});

// GET /api/contracts - List contracts
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const contractType = searchParams.get('type');
    const partyId = searchParams.get('party_id');
    const statusFilter = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('docs_profile_contract')
      .select(`
        *,
        document:legend_documents(id, title, status, created_at),
        party_a:legend_organizations!docs_profile_contract_party_a_org_id_fkey(id, name),
        party_b:legend_organizations!docs_profile_contract_party_b_org_id_fkey(id, name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (contractType) {
      query = query.eq('contract_type', contractType);
    }
    if (partyId) {
      query = query.or(`party_a_org_id.eq.${partyId},party_b_org_id.eq.${partyId}`);
    }
    if (statusFilter) {
      // Filter by document status if provided
      query = query.eq('document.status', statusFilter);
    }

    const { data, error, count } = await query;

    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ 
          contracts: [], 
          total: 0, 
          limit, 
          offset,
          summary: { total: 0, active: 0, expiring_soon: 0, total_value: 0 }
        });
      }
      logger.error('Error fetching contracts:', error);
      return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
    }

    const contracts = data || [];
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const summary = {
      total: count || 0,
      active: contracts.filter(c => {
        if (!c.end_date) return true;
        return new Date(c.end_date) > now;
      }).length,
      expiring_soon: contracts.filter(c => {
        if (!c.end_date) return false;
        const endDate = new Date(c.end_date);
        return endDate > now && endDate <= thirtyDaysFromNow;
      }).length,
      total_value: contracts.reduce((sum, c) => sum + (c.contract_value || 0), 0),
      by_type: contracts.reduce((acc, c) => {
        const type = c.contract_type || 'Other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({ contracts, total: count, limit, offset, summary });
  } catch (error) {
    logger.error('Error in GET /api/contracts:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/contracts - Create contract
export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = contractSchema.parse(body);

    // First create the document
    const { data: document, error: docError } = await supabase
      .from('legend_documents')
      .insert({
        organization_id: body.organization_id || '00000000-0000-0000-0000-000000000001',
        title: validated.title,
        document_type: 'contract',
        status: 'draft',
        created_by: authResult.user?.id,
      })
      .select()
      .single();

    if (docError) {
      logger.error('Error creating document:', docError);
      return NextResponse.json({ error: 'Failed to create contract document' }, { status: 500 });
    }

    // Then create the contract profile
    const { data: contract, error } = await supabase
      .from('docs_profile_contract')
      .insert({
        document_id: document.id,
        contract_type: validated.contract_type,
        party_a_org_id: validated.party_a_org_id,
        party_b_org_id: validated.party_b_org_id,
        contract_value: validated.contract_value,
        currency: validated.currency,
        start_date: validated.start_date,
        end_date: validated.end_date,
        payment_terms: validated.payment_terms,
        auto_renew: validated.auto_renew,
        governing_law: validated.governing_law,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating contract:', error);
      return NextResponse.json({ error: 'Failed to create contract', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ contract: { ...contract, document } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in POST /api/contracts:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/contracts - Update contract
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();
    const { contract_id, updates, action } = body;

    if (!contract_id) {
      return NextResponse.json({ error: 'contract_id is required' }, { status: 400 });
    }

    if (action === 'execute') {
      updates.executed_date = new Date().toISOString();
      updates.executed_by_a = authResult.user?.id;
    } else if (action === 'terminate') {
      updates.end_date = new Date().toISOString();
    }

    const { data: contract, error } = await supabase
      .from('docs_profile_contract')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', contract_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update contract' }, { status: 500 });
    }

    return NextResponse.json({ success: true, contract });
  } catch (error) {
    logger.error('Error in PATCH /api/contracts:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/contracts - Delete contract
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('id');

    if (!contractId) {
      return NextResponse.json({ error: 'Contract ID required' }, { status: 400 });
    }

    // Get document_id first
    const { data: contract } = await supabase
      .from('docs_profile_contract')
      .select('document_id')
      .eq('id', contractId)
      .single();

    // Delete contract profile
    await supabase
      .from('docs_profile_contract')
      .delete()
      .eq('id', contractId);

    // Delete document
    if (contract?.document_id) {
      await supabase
        .from('legend_documents')
        .delete()
        .eq('id', contract.document_id);
    }

    return NextResponse.json({ success: true, message: 'Contract deleted' });
  } catch (error) {
    logger.error('Error in DELETE /api/contracts:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
