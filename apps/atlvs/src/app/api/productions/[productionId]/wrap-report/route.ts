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

    // Get wrap report data
    const { data: wrapReport, error } = await supabase
      .from('wrap_reports')
      .select('*')
      .eq('production_id', productionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      log.error('Failed to fetch wrap report', { error, productionId });
      return NextResponse.json({ error: 'Failed to fetch wrap report' }, { status: 500 });
    }

    // Get production metrics for the wrap report
    const { data: metrics } = await supabase
      .from('metrics')
      .select('*')
      .eq('production_id', productionId);

    return NextResponse.json({ wrapReport, metrics });
  } catch (error) {
    log.error('Error in wrap report GET', { error });
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
    const { lessonsLearned, recommendations } = body;

    // Create or update wrap report
    const { data, error } = await supabase
      .from('wrap_reports')
      .upsert({
        production_id: productionId,
        lessons_learned: lessonsLearned,
        recommendations: recommendations,
        status: 'draft',
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      log.error('Failed to save wrap report', { error, productionId });
      return NextResponse.json({ error: 'Failed to save wrap report' }, { status: 500 });
    }

    log.info('Wrap report saved', { productionId });
    return NextResponse.json({ wrapReport: data });
  } catch (error) {
    log.error('Error in wrap report POST', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
