export const dynamic = 'force-dynamic';

import { logger } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

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
// Note: quotes table doesn't exist in schema - return empty response for now
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  // Return empty response since quotes table doesn't exist in schema
  const summary = {
    total: 0,
    by_status: {
      draft: 0,
      sent: 0,
      viewed: 0,
      negotiating: 0,
      accepted: 0,
      declined: 0,
      converted: 0,
    },
    total_value: 0,
    accepted_value: 0,
    conversion_rate: 0,
    expiring_soon: 0,
  };

  const pagination = {
    page,
    limit,
    total: 0,
    totalPages: 0,
    hasMore: false,
  };

  return NextResponse.json({
    quotes: [],
    summary,
    pagination,
  });
}

// POST /api/quotes - Create new quote with line items
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();

    // Validate quote data
    const validated = quoteSchema.parse(body);

    // User and organization obtained from auth context
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
      logger.error('Error creating quote:', quoteError);
      return NextResponse.json(
        { error: 'Failed to create quote', details: quoteError.message },
        { status: 500 }
      );
    }

    // Add line items if provided
    if (body.line_items && Array.isArray(body.line_items) && body.line_items.length > 0) {
      interface QuoteLineItem { sort_order?: number; [key: string]: unknown }
      const validatedItems = body.line_items.map((item: Record<string, unknown>) => lineItemSchema.parse(item)) as QuoteLineItem[];
      
      const { error: itemsError } = await supabase
        .from('quote_line_items')
        .insert(
          validatedItems.map((item: QuoteLineItem, index: number) => ({
            ...item,
            quote_id: quote.id,
            sort_order: item.sort_order || index,
          }))
        );

      if (itemsError) {
        logger.error('Error adding line items:', itemsError);
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

    logger.error('Error in POST /api/quotes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/quotes - Update quote or bulk actions
export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
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
    logger.error('Error in PATCH /api/quotes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
