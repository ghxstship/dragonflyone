import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Background check integration
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('application_id');
    const userId = searchParams.get('user_id');

    let query = supabase.from('background_checks').select('*');

    if (applicationId) query = query.eq('application_id', applicationId);
    if (userId) query = query.eq('user_id', userId);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ checks: data });
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

    if (action === 'initiate') {
      const { application_id, user_id, check_types, consent_obtained } = body;

      if (!consent_obtained) {
        return NextResponse.json({ error: 'Consent required' }, { status: 400 });
      }

      const { data, error } = await supabase.from('background_checks').insert({
        application_id, user_id, check_types: check_types || ['criminal', 'employment'],
        status: 'pending', consent_obtained: true, consent_date: new Date().toISOString(),
        initiated_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // In production, this would call external background check API
      // Simulate processing
      setTimeout(async () => {
        await supabase.from('background_checks').update({
          status: 'completed', completed_at: new Date().toISOString(),
          result: 'clear'
        }).eq('id', data.id);
      }, 5000);

      return NextResponse.json({ check: data }, { status: 201 });
    }

    if (action === 'update_result') {
      const { check_id, status, result, details } = body;

      await supabase.from('background_checks').update({
        status, result, details, completed_at: new Date().toISOString()
      }).eq('id', check_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'consent') {
      const { check_id } = body;

      await supabase.from('background_checks').update({
        consent_obtained: true, consent_date: new Date().toISOString(),
        consented_by: user.id
      }).eq('id', check_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
