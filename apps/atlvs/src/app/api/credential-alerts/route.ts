export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createCredentialSchema = z.object({
  employee_id: z.string().uuid(),
  credential_type: z.string().min(1),
  credential_number: z.string().optional(),
  issuing_authority: z.string().optional(),
  issue_date: z.string(),
  expiry_date: z.string(),
  document_url: z.string().url().optional(),
});

const renewSchema = z.object({
  id: z.string().uuid(),
  action: z.literal('renew'),
  new_expiry_date: z.string(),
  document_url: z.string().url().optional(),
});

const sendReminderSchema = z.object({
  id: z.string().uuid(),
  action: z.literal('send_reminder'),
});

const updateCredentialSchema = z.discriminatedUnion('action', [renewSchema, sendReminderSchema]);

// License and credential expiration alerts
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
    const daysAhead = parseInt(searchParams.get('days_ahead') || '90');
    const employeeId = searchParams.get('employee_id');

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    let query = supabase.from('employee_credentials').select(`
      *, employee:employees(id, first_name, last_name, email, department)
    `).lte('expiry_date', futureDate.toISOString()).gte('expiry_date', new Date().toISOString());

    if (employeeId) query = query.eq('employee_id', employeeId);

    const { data, error } = await query.order('expiry_date', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Get expired credentials
    const { data: expired } = await supabase.from('employee_credentials').select(`
      *, employee:employees(id, first_name, last_name, email)
    `).lt('expiry_date', new Date().toISOString()).eq('status', 'active');

    return NextResponse.json({
      expiring_soon: data,
      expired: expired || [],
      summary: {
        expiring_30_days: data?.filter(c => daysUntilExpiry(c.expiry_date) <= 30).length || 0,
        expiring_60_days: data?.filter(c => daysUntilExpiry(c.expiry_date) <= 60).length || 0,
        expiring_90_days: data?.length || 0,
        already_expired: expired?.length || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch credentials' }, { status: 500 });
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

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = createCredentialSchema.parse(body);
    const { employee_id, credential_type, credential_number, issuing_authority, issue_date, expiry_date, document_url } = validatedData;

    const { data, error } = await supabase.from('employee_credentials').insert({
      employee_id, credential_type, credential_number, issuing_authority,
      issue_date, expiry_date, document_url, status: 'active', created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ credential: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create credential' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
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
    const validatedData = updateCredentialSchema.parse(body);
    const { id, action } = validatedData;

    if (action === 'renew') {
      const { new_expiry_date, document_url } = validatedData;
      await supabase.from('employee_credentials').update({
        expiry_date: new_expiry_date, document_url, status: 'active',
        renewed_at: new Date().toISOString()
      }).eq('id', id);

      return NextResponse.json({ success: true, message: 'Credential renewed' });
    }

    if (action === 'send_reminder') {
      const { data: cred } = await supabase.from('employee_credentials').select(`
        *, employee:employees(id, email, first_name)
      `).eq('id', id).single();

      // Create notification
      await supabase.from('notifications').insert({
        user_id: cred?.employee?.id,
        type: 'credential_expiring',
        title: 'Credential Expiring Soon',
        message: `Your ${cred?.credential_type} expires on ${cred?.expiry_date}`,
        reference_id: id
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

function daysUntilExpiry(expiryDate: string): number {
  return Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
