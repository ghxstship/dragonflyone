import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Bid submission portal with file attachments
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const rfpId = searchParams.get('rfp_id');

    let query = supabase.from('bid_submissions').select(`
      *, rfp:rfps(id, title, deadline), attachments:bid_attachments(id, name, url, type)
    `).eq('submitted_by', user.id);

    if (rfpId) query = query.eq('rfp_id', rfpId);

    const { data, error } = await query.order('submitted_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ submissions: data });
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
    const { rfp_id, proposal_summary, total_amount, timeline, attachments, line_items } = body;

    // Check deadline
    const { data: rfp } = await supabase.from('rfps').select('deadline').eq('id', rfp_id).single();
    if (rfp && new Date(rfp.deadline) < new Date()) {
      return NextResponse.json({ error: 'Submission deadline has passed' }, { status: 400 });
    }

    const { data: submission, error } = await supabase.from('bid_submissions').insert({
      rfp_id, proposal_summary, total_amount, timeline,
      line_items: line_items || [], status: 'submitted',
      submitted_by: user.id, submitted_at: new Date().toISOString()
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Add attachments
    if (attachments?.length) {
      await supabase.from('bid_attachments').insert(
        attachments.map((a: any) => ({ submission_id: submission.id, name: a.name, url: a.url, type: a.type }))
      );
    }

    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, action } = body;

    if (action === 'withdraw') {
      await supabase.from('bid_submissions').update({
        status: 'withdrawn', withdrawn_at: new Date().toISOString()
      }).eq('id', id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
