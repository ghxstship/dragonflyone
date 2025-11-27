import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Version control and update notifications for knowledge base
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('document_id');
    const type = searchParams.get('type');

    if (documentId) {
      const { data } = await supabase.from('document_versions').select(`
        *, author:platform_users(first_name, last_name)
      `).eq('document_id', documentId).order('version_number', { ascending: false });

      return NextResponse.json({ versions: data });
    }

    // Get recent updates
    let query = supabase.from('document_versions').select(`
      *, document:knowledge_documents(title, category)
    `).order('created_at', { ascending: false }).limit(50);

    if (type) query = query.eq('document.category', type);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ updates: data });
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

    if (action === 'save_version') {
      const { document_id, content, change_summary } = body;

      // Get current version number
      const { data: latest } = await supabase.from('document_versions').select('version_number')
        .eq('document_id', document_id).order('version_number', { ascending: false }).limit(1).single();

      const newVersion = (latest?.version_number || 0) + 1;

      const { data, error } = await supabase.from('document_versions').insert({
        document_id, version_number: newVersion, content, change_summary, author_id: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Update main document
      await supabase.from('knowledge_documents').update({
        content, current_version: newVersion, updated_at: new Date().toISOString()
      }).eq('id', document_id);

      return NextResponse.json({ version: data }, { status: 201 });
    }

    if (action === 'subscribe') {
      const { document_id } = body;

      await supabase.from('document_subscriptions').upsert({
        document_id, user_id: user.id, subscribed_at: new Date().toISOString()
      }, { onConflict: 'document_id,user_id' });

      return NextResponse.json({ success: true });
    }

    if (action === 'rollback') {
      const { document_id, version_number } = body;

      const { data: version } = await supabase.from('document_versions').select('content')
        .eq('document_id', document_id).eq('version_number', version_number).single();

      if (!version) return NextResponse.json({ error: 'Version not found' }, { status: 404 });

      // Create new version with rolled back content
      const { data: latest } = await supabase.from('document_versions').select('version_number')
        .eq('document_id', document_id).order('version_number', { ascending: false }).limit(1).single();

      await supabase.from('document_versions').insert({
        document_id, version_number: (latest?.version_number || 0) + 1,
        content: version.content, change_summary: `Rolled back to version ${version_number}`, author_id: user.id
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
