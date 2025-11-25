import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const convertSchema = z.object({
  conversion_type: z.enum(['contract', 'invoice', 'project']),
  user_id: z.string().uuid().optional(),
  additional_data: z.record(z.any()).optional(),
});

// POST /api/quotes/[id]/convert - Convert quote to contract, invoice, or project
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const validated = convertSchema.parse(body);
    const userId = validated.user_id || '00000000-0000-0000-0000-000000000000';

    // Fetch quote with line items
    const { data: quote, error: fetchError } = await supabase
      .from('quotes')
      .select(`
        *,
        client:clients(*),
        line_items:quote_line_items(*),
        organization:organizations(*)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Validate quote status
    if (quote.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Only accepted quotes can be converted' },
        { status: 400 }
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

    switch (validated.conversion_type) {
      case 'contract': {
        // Generate contract number
        const { data: contractNumber } = await supabase.rpc('generate_contract_number', {
          org_id: quote.organization_id,
        });

        // Create contract
        const { data: contract, error: contractError } = await supabase
          .from('contracts')
          .insert({
            contract_number: contractNumber,
            organization_id: quote.organization_id,
            client_id: quote.client_id,
            quote_id: id,
            title: quote.title,
            description: quote.description,
            status: 'draft',
            contract_type: 'service_agreement',
            start_date: quote.event_date,
            total_value: totalAmount,
            payment_terms: quote.payment_terms,
            deposit_required: quote.deposit_required,
            deposit_amount: quote.deposit_amount || (totalAmount * (quote.deposit_percentage || 0) / 100),
            terms_and_conditions: quote.terms_and_conditions,
            created_by: userId,
            assigned_to: quote.assigned_to,
            ...validated.additional_data,
          })
          .select()
          .single();

        if (contractError) {
          console.error('Error creating contract:', contractError);
          return NextResponse.json(
            { error: 'Failed to create contract', details: contractError.message },
            { status: 500 }
          );
        }

        // Create contract line items
        if (selectedItems.length > 0) {
          await supabase
            .from('contract_line_items')
            .insert(
              selectedItems.map((item: any, index: number) => ({
                contract_id: contract.id,
                item_type: item.item_type,
                name: item.name,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                unit_of_measure: item.unit_of_measure,
                total_price: item.quantity * item.unit_price,
                sort_order: index,
              }))
            );
        }

        // Update quote status
        await supabase
          .from('quotes')
          .update({
            status: 'converted',
            converted_to_contract_id: contract.id,
            converted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        // Log activity
        await supabase.rpc('log_quote_activity', {
          p_quote_id: id,
          p_activity_type: 'converted_to_contract',
          p_user_id: userId,
          p_description: `Converted to contract ${contractNumber}`,
        });

        return NextResponse.json({
          success: true,
          conversion_type: 'contract',
          contract_id: contract.id,
          contract_number: contractNumber,
          contract,
        }, { status: 201 });
      }

      case 'invoice': {
        // Generate invoice number
        const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number', {
          org_id: quote.organization_id,
        });

        // Create invoice
        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            invoice_number: invoiceNumber,
            organization_id: quote.organization_id,
            client_id: quote.client_id,
            quote_id: id,
            status: 'draft',
            issue_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            subtotal,
            tax_rate: quote.tax_rate,
            tax_amount: taxAmount,
            discount_amount: quoteDiscount,
            total_amount: totalAmount,
            amount_due: totalAmount,
            payment_terms: quote.payment_terms,
            notes: quote.notes,
            created_by: userId,
            ...validated.additional_data,
          })
          .select()
          .single();

        if (invoiceError) {
          console.error('Error creating invoice:', invoiceError);
          return NextResponse.json(
            { error: 'Failed to create invoice', details: invoiceError.message },
            { status: 500 }
          );
        }

        // Create invoice line items
        if (selectedItems.length > 0) {
          await supabase
            .from('invoice_line_items')
            .insert(
              selectedItems.map((item: any, index: number) => ({
                invoice_id: invoice.id,
                description: `${item.name}${item.description ? ` - ${item.description}` : ''}`,
                quantity: item.quantity,
                unit_price: item.unit_price,
                amount: item.quantity * item.unit_price,
                taxable: item.taxable,
                sort_order: index,
              }))
            );
        }

        // Log activity
        await supabase.rpc('log_quote_activity', {
          p_quote_id: id,
          p_activity_type: 'converted_to_invoice',
          p_user_id: userId,
          p_description: `Invoice ${invoiceNumber} created`,
        });

        return NextResponse.json({
          success: true,
          conversion_type: 'invoice',
          invoice_id: invoice.id,
          invoice_number: invoiceNumber,
          invoice,
        }, { status: 201 });
      }

      case 'project': {
        // Generate project code
        const { data: projectCode } = await supabase.rpc('generate_project_code', {
          org_id: quote.organization_id,
        });

        // Create project in ATLVS
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .insert({
            project_code: projectCode,
            organization_id: quote.organization_id,
            client_id: quote.client_id,
            quote_id: id,
            name: quote.opportunity_name || quote.title,
            description: quote.description,
            status: 'planning',
            project_type: quote.event_type || 'production',
            start_date: quote.event_date,
            budget_amount: totalAmount,
            estimated_revenue: totalAmount,
            created_by: userId,
            project_manager_id: quote.assigned_to,
            ...validated.additional_data,
          })
          .select()
          .single();

        if (projectError) {
          console.error('Error creating project:', projectError);
          return NextResponse.json(
            { error: 'Failed to create project', details: projectError.message },
            { status: 500 }
          );
        }

        // Create budget line items from quote
        if (selectedItems.length > 0) {
          await supabase
            .from('project_budget_items')
            .insert(
              selectedItems.map((item: any) => ({
                project_id: project.id,
                category: item.item_type,
                name: item.name,
                description: item.description,
                budgeted_amount: item.quantity * item.unit_price,
                quantity: item.quantity,
                unit_cost: item.unit_price,
              }))
            );
        }

        // Log activity
        await supabase.rpc('log_quote_activity', {
          p_quote_id: id,
          p_activity_type: 'converted_to_project',
          p_user_id: userId,
          p_description: `Project ${projectCode} created`,
        });

        return NextResponse.json({
          success: true,
          conversion_type: 'project',
          project_id: project.id,
          project_code: projectCode,
          project,
        }, { status: 201 });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid conversion type' },
          { status: 400 }
        );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/quotes/[id]/convert:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
