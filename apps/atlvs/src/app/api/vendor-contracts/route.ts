import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const VendorContractSchema = z.object({
  vendor_id: z.string().uuid(),
  contract_type: z.enum(['master_service', 'purchase', 'rental', 'nda', 'sow', 'other']),
  name: z.string(),
  description: z.string().optional(),
  start_date: z.string(),
  end_date: z.string(),
  auto_renew: z.boolean().default(false),
  renewal_notice_days: z.number().int().default(30),
  value: z.number().optional(),
  payment_terms: z.string().optional(),
  document_url: z.string().url().optional(),
  key_terms: z.record(z.any()).optional(),
  contacts: z.array(z.object({
    name: z.string(),
    email: z.string().email(),
    role: z.string(),
  })).optional(),
});

// GET /api/vendor-contracts - Get vendor contracts with expiration alerts
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor_id');
    const contractId = searchParams.get('contract_id');
    const expiringWithinDays = searchParams.get('expiring_within_days');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (contractId) {
      // Get specific contract
      const { data: contract, error } = await supabase
        .from('vendor_contracts')
        .select(`
          *,
          vendor:vendors(id, name, contact_email, phone),
          renewals:contract_renewals(*)
        `)
        .eq('id', contractId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ contract });
    } else {
      // Get contracts with filters
      let query = supabase
        .from('vendor_contracts')
        .select(`
          *,
          vendor:vendors(id, name)
        `, { count: 'exact' })
        .order('end_date', { ascending: true })
        .range(offset, offset + limit - 1);

      if (vendorId) {
        query = query.eq('vendor_id', vendorId);
      }

      if (status) {
        query = query.eq('status', status);
      } else {
        query = query.neq('status', 'terminated');
      }

      if (expiringWithinDays) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + parseInt(expiringWithinDays));
        query = query.lte('end_date', futureDate.toISOString().split('T')[0]);
        query = query.gte('end_date', new Date().toISOString().split('T')[0]);
      }

      const { data: contracts, error, count } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Calculate days until expiration for each contract
      const contractsWithExpiry = contracts?.map(c => {
        const endDate = new Date(c.end_date);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const needsRenewalNotice = daysUntilExpiry <= (c.renewal_notice_days || 30);
        
        return {
          ...c,
          days_until_expiry: daysUntilExpiry,
          needs_renewal_notice: needsRenewalNotice,
          is_expired: daysUntilExpiry < 0,
        };
      });

      // Get summary stats
      const expiringIn30Days = contractsWithExpiry?.filter(c => c.days_until_expiry <= 30 && c.days_until_expiry >= 0).length || 0;
      const expiringIn60Days = contractsWithExpiry?.filter(c => c.days_until_expiry <= 60 && c.days_until_expiry >= 0).length || 0;
      const expired = contractsWithExpiry?.filter(c => c.is_expired).length || 0;

      return NextResponse.json({
        contracts: contractsWithExpiry || [],
        total: count || 0,
        summary: {
          expiring_in_30_days: expiringIn30Days,
          expiring_in_60_days: expiringIn60Days,
          expired,
        },
        limit,
        offset,
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
  }
}

// POST /api/vendor-contracts - Create contract or renewal
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action || 'create';

    if (action === 'create') {
      const validated = VendorContractSchema.parse(body);

      const { data: contract, error } = await supabase
        .from('vendor_contracts')
        .insert({
          ...validated,
          status: 'active',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Schedule renewal reminder
      if (validated.renewal_notice_days) {
        const reminderDate = new Date(validated.end_date);
        reminderDate.setDate(reminderDate.getDate() - validated.renewal_notice_days);

        await supabase.from('scheduled_notifications').insert({
          user_id: user.id,
          type: 'contract_renewal',
          title: 'Contract Renewal Reminder',
          message: `Contract "${validated.name}" expires in ${validated.renewal_notice_days} days`,
          link: `/contracts/${contract.id}`,
          scheduled_for: reminderDate.toISOString(),
          reference_type: 'vendor_contract',
          reference_id: contract.id,
        });
      }

      return NextResponse.json({ contract }, { status: 201 });
    } else if (action === 'renew') {
      const { contract_id, new_end_date, new_value, notes } = body;

      // Get current contract
      const { data: currentContract } = await supabase
        .from('vendor_contracts')
        .select('*')
        .eq('id', contract_id)
        .single();

      if (!currentContract) {
        return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
      }

      // Create renewal record
      const { data: renewal, error: renewalError } = await supabase
        .from('contract_renewals')
        .insert({
          contract_id,
          previous_end_date: currentContract.end_date,
          new_end_date,
          previous_value: currentContract.value,
          new_value: new_value || currentContract.value,
          notes,
          renewed_by: user.id,
        })
        .select()
        .single();

      if (renewalError) {
        return NextResponse.json({ error: renewalError.message }, { status: 500 });
      }

      // Update contract
      const { data: updatedContract, error } = await supabase
        .from('vendor_contracts')
        .update({
          end_date: new_end_date,
          value: new_value || currentContract.value,
          renewal_count: (currentContract.renewal_count || 0) + 1,
          last_renewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', contract_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Schedule new renewal reminder
      const reminderDate = new Date(new_end_date);
      reminderDate.setDate(reminderDate.getDate() - (currentContract.renewal_notice_days || 30));

      await supabase.from('scheduled_notifications').insert({
        user_id: user.id,
        type: 'contract_renewal',
        title: 'Contract Renewal Reminder',
        message: `Contract "${currentContract.name}" expires in ${currentContract.renewal_notice_days || 30} days`,
        link: `/contracts/${contract_id}`,
        scheduled_for: reminderDate.toISOString(),
        reference_type: 'vendor_contract',
        reference_id: contract_id,
      });

      return NextResponse.json({ 
        contract: updatedContract,
        renewal,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/vendor-contracts - Update contract
export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('contract_id');

    if (!contractId) {
      return NextResponse.json({ error: 'Contract ID required' }, { status: 400 });
    }

    const body = await request.json();

    const { data: contract, error } = await supabase
      .from('vendor_contracts')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contractId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ contract });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update contract' }, { status: 500 });
  }
}

// DELETE /api/vendor-contracts - Terminate contract
export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('contract_id');

    if (!contractId) {
      return NextResponse.json({ error: 'Contract ID required' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));

    // Soft delete - mark as terminated
    const { error } = await supabase
      .from('vendor_contracts')
      .update({
        status: 'terminated',
        terminated_at: new Date().toISOString(),
        terminated_by: user.id,
        termination_reason: body.reason,
      })
      .eq('id', contractId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Contract terminated' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to terminate contract' }, { status: 500 });
  }
}
