import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Line item schema for updates
const lineItemSchema = z.object({
  id: z.string().uuid().optional(),
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

// GET /api/quotes/[id] - Get single quote with details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get('include_history') === 'true';

    // Fetch quote with related data
    const { data: quote, error } = await supabase
      .from('quotes')
      .select(`
        *,
        client:clients(id, name, email, phone, company, address),
        assigned_user:platform_users!assigned_to(id, full_name, email),
        created_by_user:platform_users!created_by(id, full_name),
        line_items:quote_line_items(*),
        contract:contracts!converted_to_contract_id(id, contract_number, status),
        organization:organizations(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Quote not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching quote:', error);
      return NextResponse.json(
        { error: 'Failed to fetch quote', details: error.message },
        { status: 500 }
      );
    }

    // Calculate totals
    const lineItems = quote.line_items || [];
    const selectedItems = lineItems.filter((item: any) => item.is_selected);
    
    const subtotal = selectedItems.reduce((sum: number, item: any) => {
      const itemTotal = item.quantity * item.unit_price;
      const itemDiscount = item.discount_amount || (itemTotal * (item.discount_percentage || 0) / 100);
      return sum + (itemTotal - itemDiscount);
    }, 0);

    const taxableAmount = selectedItems
      .filter((item: any) => item.taxable)
      .reduce((sum: number, item: any) => {
        const itemTotal = item.quantity * item.unit_price;
        const itemDiscount = item.discount_amount || (itemTotal * (item.discount_percentage || 0) / 100);
        return sum + (itemTotal - itemDiscount);
      }, 0);

    const taxAmount = taxableAmount * (quote.tax_rate || 0) / 100;
    const quoteDiscount = quote.discount_amount || (subtotal * (quote.discount_percentage || 0) / 100);
    const totalAmount = subtotal - quoteDiscount + taxAmount;

    // Fetch activity history if requested
    let history = [];
    if (includeHistory) {
      const { data: activityData } = await supabase
        .from('quote_activity_log')
        .select(`
          *,
          user:platform_users(id, full_name)
        `)
        .eq('quote_id', id)
        .order('created_at', { ascending: false });
      
      history = activityData || [];
    }

    // Track view if status is 'sent'
    if (quote.status === 'sent') {
      await supabase
        .from('quotes')
        .update({
          status: 'viewed',
          view_count: (quote.view_count || 0) + 1,
          last_viewed_at: new Date().toISOString(),
        })
        .eq('id', id);
    }

    return NextResponse.json({
      ...quote,
      calculated: {
        subtotal,
        taxable_amount: taxableAmount,
        tax_amount: taxAmount,
        discount_amount: quoteDiscount,
        total_amount: totalAmount,
        optional_items_total: lineItems
          .filter((item: any) => item.is_optional && !item.is_selected)
          .reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0),
      },
      history,
    });
  } catch (error) {
    console.error('Error in GET /api/quotes/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/quotes/[id] - Update quote
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    // Check if quote exists and is editable
    const { data: existingQuote, error: fetchError } = await supabase
      .from('quotes')
      .select('id, status, version')
      .eq('id', id)
      .single();

    if (fetchError || !existingQuote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Only allow editing draft, sent, viewed, or negotiating quotes
    if (!['draft', 'sent', 'viewed', 'negotiating'].includes(existingQuote.status)) {
      return NextResponse.json(
        { error: `Cannot edit quote in ${existingQuote.status} status` },
        { status: 400 }
      );
    }

    // Extract line items from body
    const { line_items, ...quoteData } = body;

    // Update quote
    const { data: updatedQuote, error: updateError } = await supabase
      .from('quotes')
      .update({
        ...quoteData,
        version: (existingQuote.version || 1) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating quote:', updateError);
      return NextResponse.json(
        { error: 'Failed to update quote', details: updateError.message },
        { status: 500 }
      );
    }

    // Handle line items if provided
    if (line_items && Array.isArray(line_items)) {
      // Get existing line item IDs
      const { data: existingItems } = await supabase
        .from('quote_line_items')
        .select('id')
        .eq('quote_id', id);

      const existingIds = new Set((existingItems || []).map((item: any) => item.id));
      const newIds = new Set(line_items.filter((item: any) => item.id).map((item: any) => item.id));

      // Delete removed items
      const idsToDelete = [...existingIds].filter(existingId => !newIds.has(existingId));
      if (idsToDelete.length > 0) {
        await supabase
          .from('quote_line_items')
          .delete()
          .in('id', idsToDelete);
      }

      // Upsert line items
      for (const item of line_items) {
        const validatedItem = lineItemSchema.parse(item);
        
        if (item.id && existingIds.has(item.id)) {
          // Update existing
          await supabase
            .from('quote_line_items')
            .update(validatedItem)
            .eq('id', item.id);
        } else {
          // Insert new
          await supabase
            .from('quote_line_items')
            .insert({
              ...validatedItem,
              quote_id: id,
            });
        }
      }
    }

    // Log activity
    await supabase.rpc('log_quote_activity', {
      p_quote_id: id,
      p_activity_type: 'updated',
      p_user_id: userId,
      p_description: 'Quote updated',
      p_changes: JSON.stringify(quoteData),
    });

    // Fetch updated quote with relations
    const { data: finalQuote } = await supabase
      .from('quotes')
      .select(`
        *,
        client:clients(id, name, email),
        assigned_user:platform_users!assigned_to(id, full_name),
        line_items:quote_line_items(*)
      `)
      .eq('id', id)
      .single();

    return NextResponse.json(finalQuote);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in PUT /api/quotes/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/quotes/[id] - Delete quote
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if quote exists
    const { data: existingQuote, error: fetchError } = await supabase
      .from('quotes')
      .select('id, status, quote_number')
      .eq('id', id)
      .single();

    if (fetchError || !existingQuote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Only allow deleting draft quotes
    if (existingQuote.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft quotes can be deleted. Consider declining instead.' },
        { status: 400 }
      );
    }

    // Delete line items first (cascade should handle this, but being explicit)
    await supabase
      .from('quote_line_items')
      .delete()
      .eq('quote_id', id);

    // Delete activity log
    await supabase
      .from('quote_activity_log')
      .delete()
      .eq('quote_id', id);

    // Delete quote
    const { error: deleteError } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting quote:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete quote', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Quote ${existingQuote.quote_number} deleted`,
    });
  } catch (error) {
    console.error('Error in DELETE /api/quotes/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/quotes/[id] - Partial update or actions
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, ...data } = body;
    const userId = data.user_id || '00000000-0000-0000-0000-000000000000';

    // Fetch current quote
    const { data: quote, error: fetchError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Handle specific actions
    switch (action) {
      case 'duplicate': {
        // Generate new quote number
        const { data: newQuoteNumber } = await supabase.rpc('generate_quote_number', {
          org_id: quote.organization_id,
        });

        // Create duplicate quote
        const { data: newQuote, error: duplicateError } = await supabase
          .from('quotes')
          .insert({
            ...quote,
            id: undefined,
            quote_number: newQuoteNumber,
            status: 'draft',
            title: `${quote.title} (Copy)`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: userId,
            sent_count: 0,
            view_count: 0,
            last_sent_at: null,
            last_viewed_at: null,
            accepted_date: null,
            declined_date: null,
            converted_to_contract_id: null,
            version: 1,
          })
          .select()
          .single();

        if (duplicateError) {
          return NextResponse.json(
            { error: 'Failed to duplicate quote', details: duplicateError.message },
            { status: 500 }
          );
        }

        // Duplicate line items
        const { data: lineItems } = await supabase
          .from('quote_line_items')
          .select('*')
          .eq('quote_id', id);

        if (lineItems && lineItems.length > 0) {
          await supabase
            .from('quote_line_items')
            .insert(
              lineItems.map((item: any) => ({
                ...item,
                id: undefined,
                quote_id: newQuote.id,
              }))
            );
        }

        await supabase.rpc('log_quote_activity', {
          p_quote_id: newQuote.id,
          p_activity_type: 'created',
          p_user_id: userId,
          p_description: `Duplicated from quote ${quote.quote_number}`,
        });

        return NextResponse.json(newQuote, { status: 201 });
      }

      case 'convert_to_contract': {
        if (quote.status !== 'accepted') {
          return NextResponse.json(
            { error: 'Only accepted quotes can be converted to contracts' },
            { status: 400 }
          );
        }

        // Create contract from quote
        const { data: contract, error: contractError } = await supabase.rpc(
          'convert_quote_to_contract',
          {
            p_quote_id: id,
            p_user_id: userId,
          }
        );

        if (contractError) {
          return NextResponse.json(
            { error: 'Failed to convert quote to contract', details: contractError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Quote converted to contract',
          contract_id: contract,
        });
      }

      case 'create_revision': {
        // Create a new version of the quote
        const { data: newQuoteNumber } = await supabase.rpc('generate_quote_number', {
          org_id: quote.organization_id,
        });

        const { data: revision, error: revisionError } = await supabase
          .from('quotes')
          .insert({
            ...quote,
            id: undefined,
            quote_number: newQuoteNumber,
            status: 'draft',
            parent_quote_id: id,
            revision_number: (quote.revision_number || 0) + 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: userId,
            sent_count: 0,
            view_count: 0,
            last_sent_at: null,
            last_viewed_at: null,
            accepted_date: null,
            declined_date: null,
            version: 1,
          })
          .select()
          .single();

        if (revisionError) {
          return NextResponse.json(
            { error: 'Failed to create revision', details: revisionError.message },
            { status: 500 }
          );
        }

        // Copy line items
        const { data: lineItems } = await supabase
          .from('quote_line_items')
          .select('*')
          .eq('quote_id', id);

        if (lineItems && lineItems.length > 0) {
          await supabase
            .from('quote_line_items')
            .insert(
              lineItems.map((item: any) => ({
                ...item,
                id: undefined,
                quote_id: revision.id,
              }))
            );
        }

        // Mark original as superseded
        await supabase
          .from('quotes')
          .update({ status: 'superseded' })
          .eq('id', id);

        await supabase.rpc('log_quote_activity', {
          p_quote_id: revision.id,
          p_activity_type: 'created',
          p_user_id: userId,
          p_description: `Revision created from quote ${quote.quote_number}`,
        });

        return NextResponse.json(revision, { status: 201 });
      }

      case 'add_note': {
        const { note, is_internal } = data;
        
        await supabase.rpc('log_quote_activity', {
          p_quote_id: id,
          p_activity_type: is_internal ? 'internal_note' : 'note',
          p_user_id: userId,
          p_description: note,
        });

        return NextResponse.json({ success: true, message: 'Note added' });
      }

      case 'reassign': {
        const { assigned_to } = data;
        
        const { error: reassignError } = await supabase
          .from('quotes')
          .update({
            assigned_to,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (reassignError) {
          return NextResponse.json(
            { error: 'Failed to reassign quote', details: reassignError.message },
            { status: 500 }
          );
        }

        await supabase.rpc('log_quote_activity', {
          p_quote_id: id,
          p_activity_type: 'reassigned',
          p_user_id: userId,
          p_description: `Quote reassigned to ${assigned_to}`,
        });

        return NextResponse.json({ success: true, message: 'Quote reassigned' });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in PATCH /api/quotes/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
