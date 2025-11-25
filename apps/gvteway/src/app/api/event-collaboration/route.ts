import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Event collaboration tools (promoter, venue, artist permissions)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    const { data, error } = await supabase.from('event_collaborators').select(`
      *, user:platform_users(id, first_name, last_name, email),
      permissions:collaborator_permissions(permission, granted)
    `).eq('event_id', eventId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ collaborators: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'invite') {
      const { event_id, user_id, email, role, permissions } = body;

      const { data, error } = await supabase.from('event_collaborators').insert({
        event_id, user_id, email, role, status: 'pending', invited_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      if (permissions?.length) {
        await supabase.from('collaborator_permissions').insert(
          permissions.map((p: string) => ({ collaborator_id: data.id, permission: p, granted: true }))
        );
      }

      return NextResponse.json({ collaborator: data }, { status: 201 });
    }

    if (action === 'accept') {
      const { collaborator_id } = body;

      await supabase.from('event_collaborators').update({
        status: 'active', accepted_at: new Date().toISOString()
      }).eq('id', collaborator_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'update_permissions') {
      const { collaborator_id, permissions } = body;

      // Remove existing permissions
      await supabase.from('collaborator_permissions').delete().eq('collaborator_id', collaborator_id);

      // Add new permissions
      await supabase.from('collaborator_permissions').insert(
        permissions.map((p: string) => ({ collaborator_id, permission: p, granted: true }))
      );

      return NextResponse.json({ success: true });
    }

    if (action === 'remove') {
      const { collaborator_id } = body;

      await supabase.from('event_collaborators').delete().eq('id', collaborator_id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
