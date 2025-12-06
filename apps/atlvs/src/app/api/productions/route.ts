import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { log } from '@ghxstship/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('productions')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      log.error('Failed to fetch productions', { error });
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ productions: data });
  } catch (error) {
    log.error('Productions GET error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const productionData = {
      title: body.title,
      tagline: body.tagline,
      description: body.description,
      format: body.format,
      genre: body.genre,
      announcement_date: body.announcementDate || null,
      on_sale_date: body.onSaleDate || null,
      preview_start: body.previewStart || null,
      opening_date: body.openingDate || null,
      closing_date: body.closingDate || null,
      load_in_date: body.loadInStart || null,
      load_out_date: body.loadOutEnd || null,
      venue_id: body.venueId || null,
      capacity_per_show: body.capacityPerShow || 0,
      shows_per_day: body.showsPerDay || 1,
      runtime_minutes: body.runtimeMinutes || 90,
      budget: body.productionBudget || 0,
      operating_budget_weekly: body.operatingBudgetWeekly || 0,
      ticket_price_min: body.ticketPriceMin || 0,
      ticket_price_max: body.ticketPriceMax || 0,
      projected_gross: body.projectedGross || 0,
      break_even_percentage: body.breakEvenPercentage || 70,
      sponsorship_target: body.sponsorshipTarget || 0,
      blueprint_id: body.blueprintId || null,
      status: 'draft',
    };

    const { data, error } = await supabase
      .from('productions')
      .insert(productionData)
      .select()
      .single();

    if (error) {
      log.error('Failed to create production', { error });
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    log.info('Production created', { productionId: data.id });

    return NextResponse.json({ id: data.id, production: data }, { status: 201 });
  } catch (error) {
    log.error('Productions POST error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
