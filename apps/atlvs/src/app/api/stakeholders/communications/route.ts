export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createCommunicationSchema = z.object({
  type: z.enum(['update', 'announcement', 'request', 'report']).optional(),
  subject: z.string().min(1),
  content: z.string().min(1),
  recipients: z.array(z.string()).min(1),
  project_id: z.string().uuid().optional(),
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
    const projectId = searchParams.get('project_id');
    const stakeholderId = searchParams.get('stakeholder_id');

    let query = supabase
      .from('stakeholder_communications')
      .select(`
        *,
        sender:platform_users(id, first_name, last_name, email)
      `)
      .order('sent_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (stakeholderId) {
      query = query.contains('recipients', [stakeholderId]);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    const communications = data?.map(c => ({
      ...c,
      sent_by: c.sender ? `${c.sender.first_name} ${c.sender.last_name}` : 'System',
    })) || [];

    return NextResponse.json({ communications });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createCommunicationSchema.parse(body);
    const { type, subject, content, recipients, project_id } = validatedData;

    // Resolve "all" to actual stakeholder IDs
    let resolvedRecipients = recipients;
    if (recipients.includes('all')) {
      const { data: allStakeholders } = await supabase
        .from('stakeholders')
        .select('id')
        .eq('status', 'active');
      resolvedRecipients = allStakeholders?.map(s => s.id) || [];
    }

    // Create communication record
    const { data: communication, error } = await supabase
      .from('stakeholder_communications')
      .insert({
        type: type || 'update',
        subject,
        content,
        recipients: resolvedRecipients,
        project_id,
        sent_by: user.id,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    // Get stakeholder emails for sending
    const { data: stakeholders } = await supabase
      .from('stakeholders')
      .select('email, name')
      .in('id', resolvedRecipients);

    // Emails sent via edge function via email service
    // For now, just log
    logger.info('Would send emails to:', stakeholders?.map(s => s.email));

    return NextResponse.json({ communication }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
