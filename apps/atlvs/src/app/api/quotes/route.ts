import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schema
const quoteSchema = z.object({
  client_name: z.string().min(1),
  client_email: z.string().email().optional(),
  client_id: z.string().uuid().optional(),
  opportunity_name: z.string().min(1),
  event_type: z.enum([
    'concert', 'festival', 'corporate', 'private', 'sporting', 'theatrical',
    'wedding', 'conference', 'exhibition', 'other'
  ]).optional(),
  event_date: z.string().optional(),
  event_venue: z.string().optional(),
  event_location: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  payment_terms: z.string().optional(),
  deposit_required: z.boolean().default(false),
  deposit_amount: z.number().optional(),
  deposit_percentage: z.number().optional(),
  discount_amount: z.number().default(0),
  discount_percentage: z.number().default(0),
  tax_rate: z.number().default(0),
  valid_until: z.string().optional(),
  terms_and_conditions: z.string().optional(),
  notes: z.string().optional(),
  internal_notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const lineItemSchema = z.object({
  item_type: z.enum(['labor', 'equipment', 'service', 'material', 'package', 'fee', 'discount']),
  name: z.string().min(1),
  description: z.string().optional(),
  quantity: z.number().positive(),
  unit_price: z.number(),
  unit_of_measure: z.string().default('each'),
  discount_amount: z.number().default(0),
  discount_percentage: z.number().default(0),
  taxable: z.boolean().default(true),
  section: z.string().optional(),
  sort_order: z.number().default(0),
  is_optional: z.boolean().default(false),
  is_selected: z.boolean().default(true),
  notes: z.string().optional(),
});

// GET /api/quotes - List all quotes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const clientId = searchParams.get('client_id');
    const assignedTo = searchParams.get('assigned_to');
    const includeLineItems = searchParams.get('include_line_items') === 'true';

    let query = supabase
      .from('quotes')
      .select(`
        *,
        client:clients(id, name, email),
        assigned_user:platform_users!assigned_to(id, full_name),
        ${includeLineItems ? 'line_items:quote_line_items(*),' : ''}
        contract:contracts!converted_to_contract_id(id, contract_number)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching quotes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch quotes', details: error.message },
        { status: 500 }
      );
    }

    // Type assertion for quotes data
    interface QuoteRow {
      status: string;
      total_amount: number;
      valid_until: string | null;
      [key: string]: unknown;
    }
    const quotes = (data as unknown as QuoteRow[]) || [];

    // Calculate summary statistics
    const now = new Date();
    const summary = {
      total: quotes.length,
      by_status: {
        draft: quotes.filter(q => q.status === 'draft').length,
        sent: quotes.filter(q => q.status === 'sent').length,
        viewed: quotes.filter(q => q.status === 'viewed').length,
        negotiating: quotes.filter(q => q.status === 'negotiating').length,
        accepted: quotes.filter(q => q.status === 'accepted').length,
        declined: quotes.filter(q => q.status === 'declined').length,
        converted: quotes.filter(q => q.status === 'converted').length,
      },
      total_value: quotes
        .filter(q => ['sent', 'viewed', 'negotiating', 'accepted'].includes(q.status))
        .reduce((sum, q) => sum + Number(q.total_amount || 0), 0),
      accepted_value: quotes
        .filter(q => q.status === 'accepted')
        .reduce((sum, q) => sum + Number(q.total_amount || 0), 0),
      conversion_rate: quotes.filter(q => ['sent', 'viewed', 'negotiating'].includes(q.status)).length > 0
        ? ((quotes.filter(q => q.status === 'accepted' || q.status === 'converted').length / 
            quotes.filter(q => ['sent', 'viewed', 'negotiating', 'accepted', 'declined', 'converted'].includes(q.status)).length) * 100).toFixed(1)
        : 0,
      expiring_soon: quotes.filter(q => {
        if (!q.valid_until || !['sent', 'viewed', 'negotiating'].includes(q.status)) return false;
        const validDate = new Date(q.valid_until);
        const daysUntil = Math.ceil((validDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil > 0 && daysUntil <= 7;
      }).length,
    };

    return NextResponse.json({
      quotes: data,
      summary,
    });
  } catch (error) {
    console.error('Error in GET /api/quotes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/quotes - Create new quote with line items
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate quote data
    const validated = quoteSchema.parse(body);

    // TODO: Get organization_id and user from auth session
    const organizationId = body.organization_id || '00000000-0000-0000-0000-000000000000';
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    // Generate quote number
    const { data: quoteNumber } = await supabase.rpc('generate_quote_number', {
      org_id: organizationId,
    });

    // Create quote
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert([
        {
          ...validated,
          quote_number: quoteNumber,
          organization_id: organizationId,
          created_by: userId,
          assigned_to: body.assigned_to || userId,
          status: 'draft',
          issued_date: new Date().toISOString().split('T')[0],
        },
      ])
      .select(`
        *,
        client:clients(id, name, email),
        assigned_user:platform_users!assigned_to(id, full_name)
      `)
      .single();

    if (quoteError) {
      console.error('Error creating quote:', quoteError);
      return NextResponse.json(
        { error: 'Failed to create quote', details: quoteError.message },
        { status: 500 }
      );
    }

    // Add line items if provided
    if (body.line_items && Array.isArray(body.line_items) && body.line_items.length > 0) {
      const validatedItems = body.line_items.map((item: any) => lineItemSchema.parse(item));
      
      const { error: itemsError } = await supabase
        .from('quote_line_items')
        .insert(
          validatedItems.map((item: any, index: number) => ({
            ...item,
            quote_id: quote.id,
            sort_order: item.sort_order || index,
          }))
        );

      if (itemsError) {
        console.error('Error adding line items:', itemsError);
        // Don't fail the whole request, quote is already created
      }
    }

    // Log activity
    await supabase.rpc('log_quote_activity', {
      p_quote_id: quote.id,
      p_activity_type: 'created',
      p_user_id: userId,
      p_description: 'Quote created',
    });

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/quotes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/quotes - Update quote or bulk actions
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { quote_id, action, updates } = body;

    if (!quote_id) {
      return NextResponse.json(
        { error: 'quote_id is required' },
        { status: 400 }
      );
    }

    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    // Handle specific actions
    if (action === 'send') {
      // First get current sent_count
      const { data: currentQuote } = await supabase
        .from('quotes')
        .select('sent_count')
        .eq('id', quote_id)
        .single() as { data: { sent_count: number } | null };
      
      const { error } = await supabase
        .from('quotes')
        .update({
          status: 'sent',
          sent_count: (currentQuote?.sent_count || 0) + 1,
          last_sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Record<string, unknown>)
        .eq('id', quote_id);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to send quote', details: error.message },
          { status: 500 }
        );
      }

      await supabase.rpc('log_quote_activity', {
        p_quote_id: quote_id,
        p_activity_type: 'sent',
        p_user_id: userId,
        p_description: 'Quote sent to client',
      });

      return NextResponse.json({ success: true, message: 'Quote sent' });
    }

    if (action === 'accept') {
      const { error } = await supabase
        .from('quotes')
        .update({
          status: 'accepted',
          accepted_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        })
        .eq('id', quote_id);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to accept quote', details: error.message },
          { status: 500 }
        );
      }

      await supabase.rpc('log_quote_activity', {
        p_quote_id: quote_id,
        p_activity_type: 'accepted',
        p_user_id: userId,
        p_description: 'Quote accepted by client',
      });

      return NextResponse.json({ success: true, message: 'Quote accepted' });
    }

    if (action === 'decline') {
      const { error } = await supabase
        .from('quotes')
        .update({
          status: 'declined',
          declined_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        })
        .eq('id', quote_id);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to decline quote', details: error.message },
          { status: 500 }
        );
      }

      await supabase.rpc('log_quote_activity', {
        p_quote_id: quote_id,
        p_activity_type: 'declined',
        p_user_id: userId,
        p_description: 'Quote declined by client',
      });

      return NextResponse.json({ success: true, message: 'Quote declined' });
    }

    // General update
    if (updates) {
      const { data, error } = await supabase
        .from('quotes')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', quote_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update quote', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: 'No valid action or updates provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in PATCH /api/quotes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
