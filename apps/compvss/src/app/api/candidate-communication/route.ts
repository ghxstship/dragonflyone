import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Automated candidate communication
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('application_id');
    const templateType = searchParams.get('template_type');

    if (templateType) {
      const { data } = await supabase.from('communication_templates').select('*')
        .eq('template_type', templateType);
      return NextResponse.json({ templates: data });
    }

    const { data, error } = await supabase.from('candidate_communications').select('*')
      .eq('application_id', applicationId).order('sent_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ communications: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'send') {
      const { application_id, template_id, channel, subject, content, variables } = body;

      // Get template if provided
      let finalContent = content;
      let finalSubject = subject;

      if (template_id) {
        const { data: template } = await supabase.from('communication_templates').select('*')
          .eq('id', template_id).single();

        if (template) {
          finalContent = template.content;
          finalSubject = template.subject;

          // Replace variables
          Object.entries(variables || {}).forEach(([key, value]) => {
            finalContent = finalContent.replace(new RegExp(`{{${key}}}`, 'g'), value as string);
            finalSubject = finalSubject.replace(new RegExp(`{{${key}}}`, 'g'), value as string);
          });
        }
      }

      const { data, error } = await supabase.from('candidate_communications').insert({
        application_id, template_id, channel: channel || 'email',
        subject: finalSubject, content: finalContent,
        status: 'sent', sent_at: new Date().toISOString(), sent_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ communication: data }, { status: 201 });
    }

    if (action === 'schedule') {
      const { application_id, template_id, channel, scheduled_at, variables } = body;

      const { data, error } = await supabase.from('candidate_communications').insert({
        application_id, template_id, channel: channel || 'email',
        variables, status: 'scheduled', scheduled_at, created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ communication: data }, { status: 201 });
    }

    if (action === 'create_template') {
      const { template_type, name, subject, content, variables } = body;

      const { data, error } = await supabase.from('communication_templates').insert({
        template_type, name, subject, content, variables: variables || [], created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ template: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
