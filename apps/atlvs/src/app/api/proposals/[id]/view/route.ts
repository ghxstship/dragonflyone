import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// Public endpoint - no auth required, tracks views
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const proposalId = params.id;

    // Get proposal with related data
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select(`
        id,
        proposal_number,
        title,
        status,
        client_id,
        client:clients(id, name, company_name),
        booking_id,
        booking:bookings(
          id,
          event_name,
          event_date,
          start_time,
          end_time,
          venue:venues(id, name, address),
          guest_count_expected
        ),
        introduction,
        terms_and_conditions,
        valid_until,
        subtotal,
        tax_amount,
        total,
        created_at,
        sent_at
      `)
      .eq('id', proposalId)
      .single();

    if (proposalError || !proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    // Check if proposal has expired
    if (proposal.valid_until && new Date(proposal.valid_until) < new Date()) {
      return NextResponse.json({
        proposal: null,
        expired: true,
        message: 'This proposal has expired',
        valid_until: proposal.valid_until,
      });
    }

    // Get line items
    const { data: lineItems } = await supabase
      .from('proposal_line_items')
      .select('*')
      .eq('proposal_id', proposalId)
      .order('sort_order', { ascending: true });

    // Get attachments
    const { data: attachments } = await supabase
      .from('proposal_attachments')
      .select('id, name, file_url, file_type, file_size')
      .eq('proposal_id', proposalId);

    // Track view
    const viewerIp = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await supabase.from('proposal_views').insert({
      proposal_id: proposalId,
      viewer_ip: viewerIp,
      user_agent: userAgent,
      viewed_at: new Date().toISOString(),
    });

    // Update view count on proposal
    await supabase.rpc('increment_proposal_views', { proposal_id: proposalId });

    // Group line items by category
    const lineItemsByCategory: Record<string, typeof lineItems> = {};
    lineItems?.forEach((item) => {
      const category = item.category || 'Other';
      if (!lineItemsByCategory[category]) {
        lineItemsByCategory[category] = [];
      }
      lineItemsByCategory[category].push(item);
    });

    return NextResponse.json({
      proposal: {
        id: proposal.id,
        proposal_number: proposal.proposal_number,
        title: proposal.title,
        status: proposal.status,
        client: proposal.client,
        booking: proposal.booking,
        introduction: proposal.introduction,
        terms_and_conditions: proposal.terms_and_conditions,
        valid_until: proposal.valid_until,
        subtotal: proposal.subtotal,
        tax_amount: proposal.tax_amount,
        total: proposal.total,
        created_at: proposal.created_at,
        sent_at: proposal.sent_at,
      },
      line_items: lineItems || [],
      line_items_by_category: lineItemsByCategory,
      attachments: attachments || [],
      expired: false,
      can_accept: proposal.status === 'sent' && 
        (!proposal.valid_until || new Date(proposal.valid_until) >= new Date()),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
