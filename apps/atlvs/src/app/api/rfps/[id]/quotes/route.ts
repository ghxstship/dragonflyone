import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const rfpId = params.id;

    // Check if RFP exists
    const { data: rfp, error: rfpError } = await supabase
      .from('rfps')
      .select('id, status, organization_id')
      .eq('id', rfpId)
      .single();

    if (rfpError || !rfp) {
      return NextResponse.json(
        { error: 'RFP not found' },
        { status: 404 }
      );
    }

    // Get all quotes for this RFP
    const { data: quotes, error: quotesError } = await supabase
      .from('rfp_quotes')
      .select(`
        id,
        rfp_vendor_id,
        total_amount,
        valid_until,
        notes,
        items,
        status,
        submitted_at,
        created_at,
        rfp_vendor:rfp_vendors(
          id,
          vendor_profile:vendor_profiles(id, name, email)
        )
      `)
      .eq('rfp_id', rfpId)
      .order('submitted_at', { ascending: false });

    if (quotesError) {
      return NextResponse.json(
        { error: 'Failed to fetch quotes' },
        { status: 500 }
      );
    }

    // Calculate comparison stats
    const amounts = quotes?.map(q => q.total_amount) || [];
    const stats = {
      total_quotes: quotes?.length || 0,
      lowest_quote: amounts.length > 0 ? Math.min(...amounts) : null,
      highest_quote: amounts.length > 0 ? Math.max(...amounts) : null,
      average_quote: amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : null,
    };

    return NextResponse.json({
      quotes: quotes || [],
      stats,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
