export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { log } from '@ghxstship/config';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ProductionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  tagline: z.string().optional(),
  description: z.string().optional(),
  format: z.string().optional(),
  genre: z.string().optional(),
  announcementDate: z.string().optional(),
  onSaleDate: z.string().optional(),
  previewStart: z.string().optional(),
  openingDate: z.string().optional(),
  closingDate: z.string().optional(),
  loadInStart: z.string().optional(),
  loadOutEnd: z.string().optional(),
  venueId: z.string().uuid().optional(),
  capacityPerShow: z.number().optional(),
  showsPerDay: z.number().optional(),
  runtimeMinutes: z.number().optional(),
  productionBudget: z.number().optional(),
  operatingBudgetWeekly: z.number().optional(),
  ticketPriceMin: z.number().optional(),
  ticketPriceMax: z.number().optional(),
  projectedGross: z.number().optional(),
  breakEvenPercentage: z.number().optional(),
  sponsorshipTarget: z.number().optional(),
  blueprintId: z.string().uuid().optional(),
});

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
    
    const validationResult = ProductionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }
    
    const validated = validationResult.data;

    const productionData = {
      title: validated.title,
      tagline: validated.tagline,
      description: validated.description,
      format: validated.format,
      genre: validated.genre,
      announcement_date: validated.announcementDate || null,
      on_sale_date: validated.onSaleDate || null,
      preview_start: validated.previewStart || null,
      opening_date: validated.openingDate || null,
      closing_date: validated.closingDate || null,
      load_in_date: validated.loadInStart || null,
      load_out_date: validated.loadOutEnd || null,
      venue_id: validated.venueId || null,
      capacity_per_show: validated.capacityPerShow || 0,
      shows_per_day: validated.showsPerDay || 1,
      runtime_minutes: validated.runtimeMinutes || 90,
      budget: validated.productionBudget || 0,
      operating_budget_weekly: validated.operatingBudgetWeekly || 0,
      ticket_price_min: validated.ticketPriceMin || 0,
      ticket_price_max: validated.ticketPriceMax || 0,
      projected_gross: validated.projectedGross || 0,
      break_even_percentage: validated.breakEvenPercentage || 70,
      sponsorship_target: validated.sponsorshipTarget || 0,
      blueprint_id: validated.blueprintId || null,
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
