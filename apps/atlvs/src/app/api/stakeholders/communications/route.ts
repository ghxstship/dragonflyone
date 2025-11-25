import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
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
      return NextResponse.json({ error: error.message }, { status: 500 });
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
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, subject, content, recipients, project_id } = body;

    if (!subject || !content || !recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Subject, content, and recipients are required' },
        { status: 400 }
      );
    }

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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get stakeholder emails for sending
    const { data: stakeholders } = await supabase
      .from('stakeholders')
      .select('email, name')
      .in('id', resolvedRecipients);

    // TODO: Send actual emails via email service
    // For now, just log
    console.log('Would send emails to:', stakeholders?.map(s => s.email));

    return NextResponse.json({ communication }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
