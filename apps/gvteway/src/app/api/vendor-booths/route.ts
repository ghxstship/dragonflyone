import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const boothSchema = z.object({
  event_id: z.string().uuid(),
  vendor_id: z.string().uuid().optional(),
  booth_name: z.string().min(1),
  booth_number: z.string().optional(),
  location: z.string().optional(),
  category: z.string().optional(),
  commission_rate: z.number().min(0).max(100).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const boothId = searchParams.get('booth_id');
    const type = searchParams.get('type');

    if (type === 'sales_report' && boothId) {
      const { data: sales, error } = await supabase
        .from('vendor_booth_sales')
        .select('*')
        .eq('booth_id', boothId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const summary = {
        total_gross: sales?.reduce((sum, s) => sum + s.gross_amount, 0) || 0,
        total_commission: sales?.reduce((sum, s) => sum + (s.commission_amount || 0), 0) || 0,
        total_net: sales?.reduce((sum, s) => sum + (s.net_amount || 0), 0) || 0,
        transaction_count: sales?.length || 0,
      };

      return NextResponse.json({ sales, summary });
    }

    if (type === 'commission_report' && eventId) {
      const { data: booths } = await supabase
        .from('vendor_booths')
        .select(`
          id, booth_name, vendor_id, commission_rate,
          sales:vendor_booth_sales(gross_amount, commission_amount, net_amount)
        `)
        .eq('event_id', eventId);

      const report = booths?.map(booth => ({
        booth_id: booth.id,
        booth_name: booth.booth_name,
        commission_rate: booth.commission_rate,
        total_gross: booth.sales?.reduce((sum: number, s: any) => sum + s.gross_amount, 0) || 0,
        total_commission: booth.sales?.reduce((sum: number, s: any) => sum + (s.commission_amount || 0), 0) || 0,
        total_net: booth.sales?.reduce((sum: number, s: any) => sum + (s.net_amount || 0), 0) || 0,
      }));

      return NextResponse.json({ commission_report: report });
    }

    let query = supabase
      .from('vendor_booths')
      .select(`*, vendor:vendors(id, name)`)
      .order('booth_number');

    if (eventId) query = query.eq('event_id', eventId);

    const { data: booths, error } = await query;
    if (error) throw error;

    return NextResponse.json({ booths });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'record_sale') {
      const { booth_id, transaction_id, gross_amount } = body.data;

      // Get booth commission rate
      const { data: booth } = await supabase
        .from('vendor_booths')
        .select('commission_rate')
        .eq('id', booth_id)
        .single();

      const commissionRate = booth?.commission_rate || 0;
      const commissionAmount = gross_amount * (commissionRate / 100);
      const netAmount = gross_amount - commissionAmount;

      const { data: sale, error } = await supabase
        .from('vendor_booth_sales')
        .insert({
          booth_id,
          transaction_id,
          gross_amount,
          commission_amount: commissionAmount,
          net_amount: netAmount,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ sale }, { status: 201 });
    }

    const validated = boothSchema.parse(body);

    const { data: booth, error } = await supabase
      .from('vendor_booths')
      .insert({ ...validated, status: 'active', created_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ booth }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const { data: booth, error } = await supabase
      .from('vendor_booths')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ booth });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabase
      .from('vendor_booths')
      .update({ status: 'inactive' })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
