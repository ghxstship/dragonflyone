import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ContactSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  status: z.enum(['lead', 'prospect', 'client', 'inactive']).default('lead'),
  source: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const mockContacts = [
      {
        id: '1',
        first_name: 'Russell',
        last_name: 'Faibisch',
        email: 'russell@ultra.com',
        phone: '+1-305-555-0101',
        company: 'Ultra Worldwide',
        role: 'Event Director',
        status: 'client',
        source: 'referral',
        last_contact: '2024-11-20',
        lifetime_value: 2500000,
      },
      {
        id: '2',
        first_name: 'Chase',
        last_name: 'Carey',
        email: 'chase@f1group.com',
        phone: '+1-212-555-0202',
        company: 'Formula One Group',
        role: 'Executive VP',
        status: 'client',
        source: 'direct',
        last_contact: '2024-11-18',
        lifetime_value: 3200000,
      },
      {
        id: '3',
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah@eventpro.com',
        phone: '+1-415-555-0303',
        company: 'EventPro',
        role: 'CEO',
        status: 'prospect',
        source: 'conference',
        last_contact: '2024-11-22',
        lifetime_value: 0,
      },
    ];

    let filtered = mockContacts;
    if (status && status !== 'all') {
      filtered = filtered.filter(c => c.status === status);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(c =>
        c.first_name.toLowerCase().includes(searchLower) ||
        c.last_name.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower) ||
        c.company?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({ contacts: filtered, total: filtered.length });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ContactSchema.parse(body);

    const newContact = {
      id: String(Math.floor(Math.random() * 10000)),
      ...validatedData,
      last_contact: new Date().toISOString().split('T')[0],
      lifetime_value: 0,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json(newContact, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}
