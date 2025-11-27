import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

// Validation schemas
const credentialSchema = z.object({
  employee_id: z.string().uuid(),
  credential_type: z.enum(['license', 'certification', 'permit', 'clearance', 'registration', 'endorsement']),
  name: z.string().min(1),
  issuing_authority: z.string(),
  credential_number: z.string().optional(),
  issue_date: z.string().datetime(),
  expiration_date: z.string().datetime().optional(),
  renewal_required: z.boolean().default(true),
  renewal_period_months: z.number().optional(),
  cost: z.number().optional(),
  document_url: z.string().url().optional(),
  notes: z.string().optional(),
});

// GET - Get credentials data
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'all' | 'expiring' | 'expired' | 'employee'
    const employeeId = searchParams.get('employee_id');
    const credentialType = searchParams.get('credential_type');
    const daysAhead = parseInt(searchParams.get('days') || '60');

    if (type === 'all' || !type) {
      let query = supabase
        .from('employee_credentials')
        .select(`
          *,
          employee:platform_users(id, first_name, last_name, email, department_id)
        `)
        .eq('status', 'active')
        .order('expiration_date', { ascending: true });

      if (employeeId) query = query.eq('employee_id', employeeId);
      if (credentialType) query = query.eq('credential_type', credentialType);

      const { data: credentials, error } = await query;

      if (error) throw error;

      // Enrich with expiration status
      const enriched = credentials?.map(c => {
        const daysUntilExpiry = c.expiration_date 
          ? Math.ceil((new Date(c.expiration_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
          : null;
        
        return {
          ...c,
          days_until_expiry: daysUntilExpiry,
          expiration_status: getExpirationStatus(daysUntilExpiry),
        };
      });

      return NextResponse.json({ credentials: enriched });
    }

    if (type === 'expiring') {
      const futureDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString();

      const { data: expiring, error } = await supabase
        .from('employee_credentials')
        .select(`
          *,
          employee:platform_users(id, first_name, last_name, email)
        `)
        .eq('status', 'active')
        .eq('renewal_required', true)
        .lte('expiration_date', futureDate)
        .gte('expiration_date', new Date().toISOString())
        .order('expiration_date', { ascending: true });

      if (error) throw error;

      const enriched = expiring?.map(c => ({
        ...c,
        days_until_expiry: Math.ceil((new Date(c.expiration_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
      }));

      // Group by urgency
      const urgent = enriched?.filter(c => c.days_until_expiry <= 30) || [];
      const upcoming = enriched?.filter(c => c.days_until_expiry > 30) || [];

      return NextResponse.json({
        expiring: enriched,
        urgent,
        upcoming,
        total_expiring: enriched?.length || 0,
      });
    }

    if (type === 'expired') {
      const { data: expired, error } = await supabase
        .from('employee_credentials')
        .select(`
          *,
          employee:platform_users(id, first_name, last_name, email)
        `)
        .eq('status', 'active')
        .lt('expiration_date', new Date().toISOString())
        .order('expiration_date', { ascending: false });

      if (error) throw error;

      const enriched = expired?.map(c => ({
        ...c,
        days_expired: Math.ceil((Date.now() - new Date(c.expiration_date).getTime()) / (24 * 60 * 60 * 1000)),
      }));

      return NextResponse.json({
        expired: enriched,
        total_expired: enriched?.length || 0,
      });
    }

    if (type === 'employee' && employeeId) {
      const { data: credentials, error } = await supabase
        .from('employee_credentials')
        .select('*')
        .eq('employee_id', employeeId)
        .order('expiration_date', { ascending: true });

      if (error) throw error;

      const active = credentials?.filter(c => c.status === 'active') || [];
      const expired = active.filter(c => c.expiration_date && new Date(c.expiration_date) < new Date());
      const expiringSoon = active.filter(c => {
        if (!c.expiration_date) return false;
        const daysUntil = (new Date(c.expiration_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000);
        return daysUntil > 0 && daysUntil <= 60;
      });

      return NextResponse.json({
        credentials,
        summary: {
          total: active.length,
          expired: expired.length,
          expiring_soon: expiringSoon.length,
          valid: active.length - expired.length,
        },
      });
    }

    // Default: return summary
    const { data: all } = await supabase
      .from('employee_credentials')
      .select('expiration_date, status, renewal_required');

    const active = all?.filter(c => c.status === 'active') || [];
    const expired = active.filter(c => c.expiration_date && new Date(c.expiration_date) < new Date());
    const expiringSoon = active.filter(c => {
      if (!c.expiration_date) return false;
      const daysUntil = (new Date(c.expiration_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000);
      return daysUntil > 0 && daysUntil <= 60;
    });

    return NextResponse.json({
      summary: {
        total_credentials: active.length,
        expired: expired.length,
        expiring_within_60_days: expiringSoon.length,
        requires_renewal: active.filter(c => c.renewal_required).length,
      },
    });
  } catch (error: any) {
    console.error('Credentials error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create credential or send reminder
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'create_credential') {
      const validated = credentialSchema.parse(body.data);

      const { data: credential, error } = await supabase
        .from('employee_credentials')
        .insert({
          ...validated,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ credential }, { status: 201 });
    }

    if (action === 'send_renewal_reminder') {
      const { credential_id, reminder_type } = body.data;

      // Get credential details
      const { data: credential } = await supabase
        .from('employee_credentials')
        .select(`
          *,
          employee:platform_users(id, first_name, last_name, email)
        `)
        .eq('id', credential_id)
        .single();

      if (!credential) {
        return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
      }

      // Log the reminder
      await supabase.from('credential_reminders').insert({
        credential_id,
        reminder_type,
        sent_at: new Date().toISOString(),
        recipient_email: (credential.employee as any)?.email,
      });

      // TODO: Trigger actual email notification

      return NextResponse.json({ success: true, message: 'Reminder sent' });
    }

    if (action === 'bulk_reminder') {
      // Send reminders for all expiring credentials
      const daysAhead = body.data.days_ahead || 60;
      const futureDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString();

      const { data: expiring } = await supabase
        .from('employee_credentials')
        .select(`
          id,
          employee:platform_users(id, email)
        `)
        .eq('status', 'active')
        .eq('renewal_required', true)
        .lte('expiration_date', futureDate)
        .gte('expiration_date', new Date().toISOString());

      const reminders = expiring?.map(c => ({
        credential_id: c.id,
        reminder_type: 'bulk_expiration',
        sent_at: new Date().toISOString(),
        recipient_email: (c.employee as any)?.email,
      })) || [];

      if (reminders.length) {
        await supabase.from('credential_reminders').insert(reminders);
      }

      return NextResponse.json({ 
        success: true, 
        reminders_sent: reminders.length,
      });
    }

    if (action === 'renew_credential') {
      const { credential_id, new_expiration_date, renewal_cost, document_url } = body.data;

      // Get current credential
      const { data: current } = await supabase
        .from('employee_credentials')
        .select('*')
        .eq('id', credential_id)
        .single();

      if (!current) {
        return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
      }

      // Update credential
      const { data: credential, error } = await supabase
        .from('employee_credentials')
        .update({
          expiration_date: new_expiration_date,
          document_url: document_url || current.document_url,
          last_renewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', credential_id)
        .select()
        .single();

      if (error) throw error;

      // Log renewal history
      await supabase.from('credential_renewals').insert({
        credential_id,
        previous_expiration: current.expiration_date,
        new_expiration: new_expiration_date,
        renewal_cost,
        renewed_at: new Date().toISOString(),
      });

      return NextResponse.json({ credential });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Credentials error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update credential
export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const { data: credential, error } = await supabase
      .from('employee_credentials')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ credential });
  } catch (error: any) {
    console.error('Credentials error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Deactivate credential
export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('employee_credentials')
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Credentials error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper function
function getExpirationStatus(daysUntilExpiry: number | null): string {
  if (daysUntilExpiry === null) return 'no_expiration';
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'critical';
  if (daysUntilExpiry <= 60) return 'warning';
  if (daysUntilExpiry <= 90) return 'upcoming';
  return 'valid';
}
