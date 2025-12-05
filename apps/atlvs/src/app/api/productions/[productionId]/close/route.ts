import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { log } from '@ghxstship/config';

export async function GET(
  _request: NextRequest,
  { params }: { params: { productionId: string } }
) {
  try {
    const supabase = await createClient();
    const { productionId } = params;

    // Get production close status
    const { data: production, error } = await supabase
      .from('productions')
      .select('id, name, status, close_checklist')
      .eq('id', productionId)
      .single();

    if (error) {
      log.error('Failed to fetch production close status', { error, productionId });
      return NextResponse.json({ error: 'Failed to fetch production' }, { status: 500 });
    }

    return NextResponse.json({ production });
  } catch (error) {
    log.error('Error in production close GET', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { productionId: string } }
) {
  try {
    const supabase = await createClient();
    const { productionId } = params;
    const body = await request.json();
    const { checklist } = body;

    // Update production close checklist
    const { data, error } = await supabase
      .from('productions')
      .update({
        close_checklist: checklist,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productionId)
      .select()
      .single();

    if (error) {
      log.error('Failed to update production close checklist', { error, productionId });
      return NextResponse.json({ error: 'Failed to update checklist' }, { status: 500 });
    }

    log.info('Production close checklist updated', { productionId });
    return NextResponse.json({ production: data });
  } catch (error) {
    log.error('Error in production close POST', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { productionId: string } }
) {
  try {
    const supabase = await createClient();
    const { productionId } = params;

    // Archive the production
    const { data, error } = await supabase
      .from('productions')
      .update({
        status: 'archived',
        archived_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', productionId)
      .select()
      .single();

    if (error) {
      log.error('Failed to archive production', { error, productionId });
      return NextResponse.json({ error: 'Failed to archive production' }, { status: 500 });
    }

    log.info('Production archived', { productionId });
    return NextResponse.json({ production: data, message: 'Production archived successfully' });
  } catch (error) {
    log.error('Error in production close PUT', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
