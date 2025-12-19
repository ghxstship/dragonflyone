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
      .select('id, status, title, organization_id, requirements')
      .eq('id', rfpId)
      .single();

    if (rfpError || !rfp) {
      return NextResponse.json(
        { error: 'RFP not found' },
        { status: 404 }
      );
    }

    // Get all quotes for this RFP with vendor details
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
          status,
          vendor_profile:vendor_profiles(id, name, email, company_name, rating)
        )
      `)
      .eq('rfp_id', rfpId)
      .order('total_amount', { ascending: true });

    if (quotesError) {
      return NextResponse.json(
        { error: 'Failed to fetch quotes' },
        { status: 500 }
      );
    }

    // Calculate comparison metrics
    const amounts = quotes?.map(q => q.total_amount) || [];
    const lowestQuote = amounts.length > 0 ? Math.min(...amounts) : null;
    const highestQuote = amounts.length > 0 ? Math.max(...amounts) : null;
    const averageQuote = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : null;
    const priceRange = lowestQuote && highestQuote ? highestQuote - lowestQuote : null;

    // Build comparison data
    const comparison = quotes?.map(quote => {
      const vendor = quote.rfp_vendor?.vendor_profile;
      const savingsVsHighest = highestQuote ? highestQuote - quote.total_amount : 0;
      const savingsPercent = highestQuote ? ((savingsVsHighest / highestQuote) * 100).toFixed(1) : '0';

      return {
        quote_id: quote.id,
        vendor_id: vendor?.id || null,
        vendor_name: vendor?.name || vendor?.company_name || 'Unknown Vendor',
        vendor_email: vendor?.email || null,
        vendor_rating: vendor?.rating || null,
        total_amount: quote.total_amount,
        is_lowest: quote.total_amount === lowestQuote,
        savings_vs_highest: savingsVsHighest,
        savings_percent: parseFloat(savingsPercent),
        items: quote.items || [],
        notes: quote.notes,
        status: quote.status,
        submitted_at: quote.submitted_at,
        valid_until: quote.valid_until,
      };
    }) || [];

    return NextResponse.json({
      rfp: {
        id: rfp.id,
        title: rfp.title,
        status: rfp.status,
        requirements: rfp.requirements,
      },
      comparison,
      summary: {
        total_quotes: quotes?.length || 0,
        lowest_quote: lowestQuote,
        highest_quote: highestQuote,
        average_quote: averageQuote,
        price_range: priceRange,
        potential_savings: priceRange,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
