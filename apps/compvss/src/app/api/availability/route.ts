export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const status = searchParams.get('status');

    let query = supabase
      .from('crew_availability')
      .select('*')
      .order('start_date');

    if (userId) {
      query = query.eq('crew_member_id', userId);
    }

    if (startDate) {
      query = query.gte('start_date', startDate);
    }

    if (endDate) {
      query = query.lte('end_date', endDate);
    }

    if (status) {
      query = query.eq('availability_type', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const availability = data?.map(a => ({
      id: a.id,
      crew_member_id: a.crew_member_id,
      start_date: a.start_date,
      end_date: a.end_date,
      availability_type: a.availability_type,
      start_time: a.start_time,
      end_time: a.end_time,
      notes: a.notes,
      all_day: a.all_day,
    })) || [];

    return NextResponse.json({ availability });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
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
    const { date, status, start_time, end_time, notes } = body;

    if (!date || !status) {
      return NextResponse.json(
        { error: 'Date and status are required' },
        { status: 400 }
      );
    }

    // Upsert availability for the date
    const { data, error } = await supabase
      .from('crew_availability')
      .upsert({
        user_id: user.id,
        date,
        status,
        start_time,
        end_time,
        notes,
        calendar_source: 'manual',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,date',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ availability: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Date required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('crew_availability')
      .delete()
      .eq('user_id', user.id)
      .eq('date', date);

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
