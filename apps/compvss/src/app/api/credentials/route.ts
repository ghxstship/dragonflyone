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

// Schema for credentials - uses 3NF credentials table from 0052 migration
const credentialSchema = z.object({
  organization_id: z.string().uuid(),
  event_id: z.string().uuid().optional(),
  credential_type_id: z.string().uuid(),
  holder_id: z.string().uuid().optional(),
  holder_name: z.string().min(1),
  holder_company: z.string().optional(),
  holder_role: z.string().optional(),
  holder_photo_url: z.string().url().optional(),
  valid_from: z.string().datetime().optional(),
  valid_until: z.string().datetime().optional(),
  notes: z.string().optional(),
});

// GET /api/credentials - List credentials from credentials (3NF table)
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const eventId = searchParams.get('event_id');
    const holderId = searchParams.get('holder_id');
    const typeId = searchParams.get('type_id');
    const status = searchParams.get('status');
    const expiringSoon = searchParams.get('expiring_soon') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Query credentials - 3NF table
    let query = supabase
      .from('credentials')
      .select(`
        *,
        holder:legend_people!holder_id(id, display_name, avatar_url, email),
        credential_type:credential_types!credential_type_id(id, code, name, access_level, color)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    if (holderId) {
      query = query.eq('holder_id', holderId);
    }
    if (typeId) {
      query = query.eq('credential_type_id', typeId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error('Error fetching credentials:', error);
      return NextResponse.json({ 
        credentials: [], 
        total: 0, 
        limit, 
        offset,
        summary: { total: 0, active: 0, expiring_soon: 0, expired: 0 }
      });
    }

    let credentials = data || [];
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Filter by expiry status if requested
    if (expiringSoon) {
      credentials = credentials.filter(c => {
        if (!c.valid_until) return false;
        const expiry = new Date(c.valid_until);
        return expiry > now && expiry <= sevenDaysFromNow;
      });
    }

    // Build summary
    const allCredentials = data || [];
    const summary = {
      total: count || 0,
      active: allCredentials.filter(c => c.status === 'active').length,
      expiring_soon: allCredentials.filter(c => {
        if (!c.valid_until) return false;
        const expiry = new Date(c.valid_until);
        return expiry > now && expiry <= sevenDaysFromNow;
      }).length,
      expired: allCredentials.filter(c => c.status === 'expired').length,
      by_type: allCredentials.reduce((acc, c) => {
        const type = (c.credential_type as { name?: string } | null)?.name || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({ credentials, total: credentials.length, limit, offset, summary });
  } catch (error) {
    logger.error('Error in GET /api/credentials:', error instanceof Error ? error : undefined);
    return NextResponse.json({ 
      credentials: [], 
      total: 0, 
      limit: 100, 
      offset: 0,
      summary: { total: 0, active: 0, expiring_soon: 0, expired: 0 }
    });
  }
}

// POST /api/credentials - Create credential using credentials (3NF table)
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

    // Generate credential number and barcode
    const credentialNumber = `CRED-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const barcode = `${credentialNumber}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const { data: credential, error } = await supabase
      .from('credentials')
      .insert({
        organization_id: validated.organization_id,
        event_id: validated.event_id,
        credential_type_id: validated.credential_type_id,
        holder_id: validated.holder_id,
        holder_name: validated.holder_name,
        holder_company: validated.holder_company,
        holder_role: validated.holder_role,
        holder_photo_url: validated.holder_photo_url,
        credential_number: credentialNumber,
        barcode,
        valid_from: validated.valid_from || new Date().toISOString(),
        valid_until: validated.valid_until,
        status: 'active',
        issued_at: new Date().toISOString(),
        issued_by: authResult.user?.id,
        notes: validated.notes,
      })
      .select(`
        *,
        credential_type:credential_types!credential_type_id(id, code, name, access_level)
      `)
      .single();

    if (error) {
      logger.error('Error creating credential:', error);
      return NextResponse.json({ error: 'Failed to create credential', details: error.message }, { status: 500 });
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

// PATCH /api/credentials - Update credential or scan using credentials (3NF table)
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const supabase = getSupabaseClient();
    const body = await request.json();
    const { credential_id, action, updates } = body;

    if (!credential_id) {
      return NextResponse.json({ error: 'credential_id is required' }, { status: 400 });
    }

    // Scan action - record credential scan
    if (action === 'scan') {
      const { data: credential, error } = await supabase
        .from('credentials')
        .update({
          last_scan_at: new Date().toISOString(),
          last_scan_location: body.location,
          scan_count: supabase.rpc('increment', { row_id: credential_id, column_name: 'scan_count' }),
        })
        .eq('id', credential_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to record scan' }, { status: 500 });
      }

      return NextResponse.json({ success: true, credential, message: 'Credential scanned' });
    }

    // Revoke action
    if (action === 'revoke') {
      const userRoles = authResult.user?.platformRoles || [];
      if (!COMPVSS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { data: credential, error } = await supabase
        .from('credentials')
        .update({
          status: 'revoked',
          notes: body.reason ? `Revoked: ${body.reason}` : 'Revoked',
          updated_at: new Date().toISOString(),
        })
        .eq('id', credential_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to revoke credential' }, { status: 500 });
      }

      return NextResponse.json({ success: true, credential, message: 'Credential revoked' });
    }

    // General update
    if (updates) {
      const userRoles = authResult.user?.platformRoles || [];
      if (!COMPVSS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { data: credential, error } = await supabase
        .from('credentials')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', credential_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to update credential' }, { status: 500 });
      }

      return NextResponse.json({ success: true, credential });
    }

    return NextResponse.json({ error: 'No action specified' }, { status: 400 });
  } catch (error) {
    logger.error('Error in PATCH /api/credentials:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/credentials - Remove credential using credentials (3NF table)
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

    // Soft delete by setting status to revoked
    const { error } = await supabase
      .from('credentials')
      .update({ status: 'revoked', updated_at: new Date().toISOString() })
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
