import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Validation schemas
const emergencyContactSchema = z.object({
  employee_id: z.string().uuid(),
  name: z.string().min(1),
  relationship: z.string().min(1),
  phone_primary: z.string().min(10),
  phone_secondary: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  is_primary: z.boolean().default(false),
  notes: z.string().optional(),
});

const notificationSchema = z.object({
  type: z.enum(['emergency', 'incident', 'weather', 'security', 'general']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string().min(1),
  message: z.string().min(1),
  affected_departments: z.array(z.string().uuid()).optional(),
  affected_locations: z.array(z.string()).optional(),
  notify_emergency_contacts: z.boolean().default(false),
});

// GET - Get emergency contacts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'contacts' | 'employee' | 'notifications' | 'directory'
    const employeeId = searchParams.get('employee_id');
    const departmentId = searchParams.get('department_id');

    if (type === 'contacts' || !type) {
      let query = supabase
        .from('emergency_contacts')
        .select(`
          *,
          employee:platform_users(id, first_name, last_name, email, department_id)
        `)
        .order('is_primary', { ascending: false });

      if (employeeId) query = query.eq('employee_id', employeeId);

      const { data: contacts, error } = await query;

      if (error) throw error;

      return NextResponse.json({ contacts });
    }

    if (type === 'employee' && employeeId) {
      const { data: contacts, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('employee_id', employeeId)
        .order('is_primary', { ascending: false });

      if (error) throw error;

      const primary = contacts?.find(c => c.is_primary);

      return NextResponse.json({
        contacts,
        primary_contact: primary,
        has_emergency_contact: contacts && contacts.length > 0,
      });
    }

    if (type === 'notifications') {
      const { data: notifications, error } = await supabase
        .from('emergency_notifications')
        .select(`
          *,
          sent_by:platform_users(id, first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return NextResponse.json({ notifications });
    }

    if (type === 'directory') {
      // Get emergency contact directory by department
      const { data: employees, error } = await supabase
        .from('platform_users')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          department_id,
          department:departments(id, name),
          emergency_contacts(id, name, phone_primary, relationship, is_primary)
        `)
        .eq('status', 'active');

      if (error) throw error;

      // Group by department
      const byDepartment = employees?.reduce((acc: Record<string, any[]>, emp) => {
        const deptName = (emp.department as any)?.name || 'Unassigned';
        if (!acc[deptName]) acc[deptName] = [];
        
        const primaryContact = (emp.emergency_contacts as any[])?.find(c => c.is_primary);
        
        acc[deptName].push({
          employee_id: emp.id,
          employee_name: `${emp.first_name} ${emp.last_name}`,
          employee_phone: emp.phone,
          employee_email: emp.email,
          emergency_contact: primaryContact ? {
            name: primaryContact.name,
            phone: primaryContact.phone_primary,
            relationship: primaryContact.relationship,
          } : null,
          has_emergency_contact: (emp.emergency_contacts as any[])?.length > 0,
        });
        
        return acc;
      }, {});

      // Count missing contacts
      const missingContacts = employees?.filter(e => 
        !(e.emergency_contacts as any[])?.length
      ).length || 0;

      return NextResponse.json({
        directory: byDepartment,
        summary: {
          total_employees: employees?.length || 0,
          with_contacts: (employees?.length || 0) - missingContacts,
          missing_contacts: missingContacts,
          compliance_rate: employees?.length 
            ? Math.round(((employees.length - missingContacts) / employees.length) * 100) 
            : 0,
        },
      });
    }

    // Default: return summary
    const { data: employees } = await supabase
      .from('platform_users')
      .select(`
        id,
        emergency_contacts(id)
      `)
      .eq('status', 'active');

    const withContacts = employees?.filter(e => (e.emergency_contacts as any[])?.length > 0).length || 0;
    const total = employees?.length || 0;

    return NextResponse.json({
      summary: {
        total_employees: total,
        with_emergency_contacts: withContacts,
        missing_contacts: total - withContacts,
        compliance_rate: total > 0 ? Math.round((withContacts / total) * 100) : 0,
      },
    });
  } catch (error: any) {
    console.error('Emergency contacts error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create contact or send notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'create_contact') {
      const validated = emergencyContactSchema.parse(body.data);

      // If setting as primary, unset other primary contacts
      if (validated.is_primary) {
        await supabase
          .from('emergency_contacts')
          .update({ is_primary: false })
          .eq('employee_id', validated.employee_id)
          .eq('is_primary', true);
      }

      const { data: contact, error } = await supabase
        .from('emergency_contacts')
        .insert({
          ...validated,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ contact }, { status: 201 });
    }

    if (action === 'send_notification') {
      const validated = notificationSchema.parse(body.data);
      const sentBy = body.sent_by;

      // Create notification record
      const { data: notification, error } = await supabase
        .from('emergency_notifications')
        .insert({
          ...validated,
          sent_by: sentBy,
          status: 'sent',
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Get affected employees
      let employeesQuery = supabase
        .from('platform_users')
        .select('id, first_name, last_name, email, phone');

      if (validated.affected_departments?.length) {
        employeesQuery = employeesQuery.in('department_id', validated.affected_departments);
      }

      const { data: employees } = await employeesQuery;

      // Log recipients
      const recipients = employees?.map(emp => ({
        notification_id: notification.id,
        employee_id: emp.id,
        delivery_method: 'email',
        status: 'pending',
        created_at: new Date().toISOString(),
      })) || [];

      if (recipients.length) {
        await supabase.from('notification_recipients').insert(recipients);
      }

      // If notify_emergency_contacts is true, also get emergency contacts
      let emergencyContactsNotified = 0;
      if (validated.notify_emergency_contacts) {
        const employeeIds = employees?.map(e => e.id) || [];
        
        const { data: emergencyContacts } = await supabase
          .from('emergency_contacts')
          .select('id, employee_id, name, phone_primary, email')
          .in('employee_id', employeeIds)
          .eq('is_primary', true);

        emergencyContactsNotified = emergencyContacts?.length || 0;

        // Log emergency contact notifications
        const ecRecipients = emergencyContacts?.map(ec => ({
          notification_id: notification.id,
          emergency_contact_id: ec.id,
          delivery_method: 'sms',
          status: 'pending',
          created_at: new Date().toISOString(),
        })) || [];

        if (ecRecipients.length) {
          await supabase.from('notification_recipients').insert(ecRecipients);
        }
      }

      // TODO: Trigger actual notifications via email/SMS service

      return NextResponse.json({
        notification,
        employees_notified: employees?.length || 0,
        emergency_contacts_notified: emergencyContactsNotified,
      }, { status: 201 });
    }

    if (action === 'bulk_import') {
      // Bulk import emergency contacts
      const { contacts } = body.data;

      const contactRecords = contacts.map((c: any) => ({
        ...c,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { data: imported, error } = await supabase
        .from('emergency_contacts')
        .insert(contactRecords)
        .select();

      if (error) throw error;

      return NextResponse.json({ 
        imported: imported?.length || 0,
      }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Emergency contacts error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update contact
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    // If setting as primary, unset other primary contacts
    if (updates.is_primary) {
      const { data: current } = await supabase
        .from('emergency_contacts')
        .select('employee_id')
        .eq('id', id)
        .single();

      if (current) {
        await supabase
          .from('emergency_contacts')
          .update({ is_primary: false })
          .eq('employee_id', current.employee_id)
          .eq('is_primary', true);
      }
    }

    const { data: contact, error } = await supabase
      .from('emergency_contacts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ contact });
  } catch (error: any) {
    console.error('Emergency contacts error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove contact
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Emergency contacts error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
