import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch governance documents and policies
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'policy', 'bylaw', 'charter', 'procedure', 'all'
    const category = searchParams.get('category');

    let query = supabase
      .from('governance_documents')
      .select(`
        *,
        created_by:platform_users!created_by(id, email, first_name, last_name),
        approved_by:platform_users!approved_by(id, email, first_name, last_name),
        versions:document_versions(*)
      `);

    if (type && type !== 'all') {
      query = query.eq('document_type', type);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('title', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group by category
    const grouped = data.reduce((acc: Record<string, any[]>, doc) => {
      const cat = doc.category || 'general';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(doc);
      return acc;
    }, {});

    return NextResponse.json({ documents: data, grouped });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch governance documents' },
      { status: 500 }
    );
  }
}

// POST - Create governance document
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
    const {
      title,
      document_type, // 'policy', 'bylaw', 'charter', 'procedure', 'handbook', 'nda'
      category, // 'corporate', 'hr', 'finance', 'operations', 'legal', 'compliance'
      content,
      summary,
      effective_date,
      review_date,
      requires_acknowledgment,
      acknowledgment_roles,
    } = body;

    const { data: document, error } = await supabase
      .from('governance_documents')
      .insert({
        title,
        document_type,
        category,
        content,
        summary,
        effective_date: effective_date || new Date().toISOString(),
        review_date,
        requires_acknowledgment: requires_acknowledgment || false,
        acknowledgment_roles: acknowledgment_roles || [],
        version: '1.0',
        status: 'draft',
        created_by: user.id,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create initial version record
    await supabase.from('document_versions').insert({
      document_id: document.id,
      version: '1.0',
      content,
      change_summary: 'Initial version',
      created_by: user.id,
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}

// PATCH - Update document, approve, or acknowledge
export async function PATCH(request: NextRequest) {
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
    const { document_id, action, ...updateData } = body;

    if (action === 'approve') {
      await supabase
        .from('governance_documents')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', document_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'acknowledge') {
      // Record acknowledgment
      const { error } = await supabase
        .from('document_acknowledgments')
        .insert({
          document_id,
          user_id: user.id,
          acknowledged_at: new Date().toISOString(),
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'new_version') {
      const { content, change_summary } = updateData;

      // Get current version
      const { data: current } = await supabase
        .from('governance_documents')
        .select('version')
        .eq('id', document_id)
        .single();

      const currentVersion = parseFloat(current?.version || '1.0');
      const newVersion = (currentVersion + 0.1).toFixed(1);

      // Update document
      await supabase
        .from('governance_documents')
        .update({
          content,
          version: newVersion,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        })
        .eq('id', document_id);

      // Create version record
      await supabase.from('document_versions').insert({
        document_id,
        version: newVersion,
        content,
        change_summary,
        created_by: user.id,
      });

      return NextResponse.json({ version: newVersion });
    }

    // Default: update document
    const { error } = await supabase
      .from('governance_documents')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', document_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}
