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

const COMPVSS_ADMIN_ROLES = [
  PlatformRole.COMPVSS_ADMIN,
  PlatformRole.COMPVSS_TEAM_MEMBER,
  PlatformRole.LEGEND_SUPER_ADMIN,
];

const credentialSchema = z.object({
  crew_member_id: z.string().uuid(),
  certification_id: z.string().uuid(),
  issue_date: z.string().datetime().optional(),
  expiry_date: z.string().datetime().optional(),
  credential_number: z.string().optional(),
  issuing_authority: z.string().optional(),
  document_url: z.string().url().optional(),
});

// GET /api/credentials - List crew credentials/certifications
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const crewMemberId = searchParams.get('crew_member_id');
    const certificationId = searchParams.get('certification_id');
    const expiringSoon = searchParams.get('expiring_soon') === 'true';
    const expired = searchParams.get('expired') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('crew_member_certifications')
      .select(`
        *,
        crew_member:crew_members(id, first_name, last_name, email, employee_id),
        certification:certifications(id, name, description, issuing_authority, validity_period_months)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (crewMemberId) {
      query = query.eq('crew_member_id', crewMemberId);
    }
    if (certificationId) {
      query = query.eq('certification_id', certificationId);
    }

    const { data, error, count } = await query;

    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ 
          credentials: [], 
          total: 0, 
          limit, 
          offset,
          summary: { total: 0, valid: 0, expiring_soon: 0, expired: 0 }
        });
      }
      logger.error('Error fetching credentials:', error);
      return NextResponse.json({ error: 'Failed to fetch credentials' }, { status: 500 });
    }

    let credentials = data || [];
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Filter by expiry status if requested
    if (expiringSoon) {
      credentials = credentials.filter(c => {
        if (!c.expiry_date) return false;
        const expiry = new Date(c.expiry_date);
        return expiry > now && expiry <= thirtyDaysFromNow;
      });
    }
    if (expired) {
      credentials = credentials.filter(c => {
        if (!c.expiry_date) return false;
        return new Date(c.expiry_date) < now;
      });
    }

    // Build summary
    const allCredentials = data || [];
    const summary = {
      total: count || 0,
      valid: allCredentials.filter(c => !c.expiry_date || new Date(c.expiry_date) > now).length,
      expiring_soon: allCredentials.filter(c => {
        if (!c.expiry_date) return false;
        const expiry = new Date(c.expiry_date);
        return expiry > now && expiry <= thirtyDaysFromNow;
      }).length,
      expired: allCredentials.filter(c => c.expiry_date && new Date(c.expiry_date) < now).length,
    };

    return NextResponse.json({ credentials, total: credentials.length, limit, offset, summary });
  } catch (error) {
    logger.error('Error in GET /api/credentials:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/credentials - Add credential to crew member
export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = credentialSchema.parse(body);

    const { data: credential, error } = await supabase
      .from('crew_member_certifications')
      .insert({
        crew_member_id: validated.crew_member_id,
        certification_id: validated.certification_id,
        issue_date: validated.issue_date,
        expiry_date: validated.expiry_date,
        credential_number: validated.credential_number,
        document_url: validated.document_url,
      })
      .select(`
        *,
        certification:certifications(id, name)
      `)
      .single();

    if (error) {
      logger.error('Error adding credential:', error);
      return NextResponse.json({ error: 'Failed to add credential', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ credential }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in POST /api/credentials:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/credentials - Update credential
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();
    const { credential_id, updates } = body;

    if (!credential_id) {
      return NextResponse.json({ error: 'credential_id is required' }, { status: 400 });
    }

    const { data: credential, error } = await supabase
      .from('crew_member_certifications')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', credential_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update credential' }, { status: 500 });
    }

    return NextResponse.json({ success: true, credential });
  } catch (error) {
    logger.error('Error in PATCH /api/credentials:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/credentials - Remove credential
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const credentialId = searchParams.get('id');

    if (!credentialId) {
      return NextResponse.json({ error: 'Credential ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('crew_member_certifications')
      .delete()
      .eq('id', credentialId);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete credential' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Credential removed' });
  } catch (error) {
    logger.error('Error in DELETE /api/credentials:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
