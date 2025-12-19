import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; holdId: string } }
) {
  try {
    const supabase = createAdminClient();
    const spaceId = params.id;
    const holdId = params.holdId;

    // Check if hold exists
    const { data: hold, error: holdError } = await supabase
      .from('space_holds')
      .select('id, status, space_id')
      .eq('id', holdId)
      .eq('space_id', spaceId)
      .single();

    if (holdError || !hold) {
      return NextResponse.json(
        { error: 'Hold not found' },
        { status: 404 }
      );
    }

    if (hold.status === 'released') {
      return NextResponse.json(
        { error: 'Hold has already been released' },
        { status: 400 }
      );
    }

    // Release the hold
    const { error: updateError } = await supabase
      .from('space_holds')
      .update({
        status: 'released',
        released_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', holdId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to release hold' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Hold released successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; holdId: string } }
) {
  try {
    const supabase = createAdminClient();
    const spaceId = params.id;
    const holdId = params.holdId;

    const { data: hold, error } = await supabase
      .from('space_holds')
      .select(`
        id,
        date,
        start_time,
        end_time,
        client_id,
        client:clients(id, name, email),
        client_name,
        hold_type,
        status,
        expires_at,
        notes,
        created_at,
        released_at
      `)
      .eq('id', holdId)
      .eq('space_id', spaceId)
      .single();

    if (error || !hold) {
      return NextResponse.json(
        { error: 'Hold not found' },
        { status: 404 }
      );
    }

    // Check if expired
    const isExpired = hold.expires_at && new Date(hold.expires_at) < new Date();

    return NextResponse.json({
      hold,
      is_expired: isExpired,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
