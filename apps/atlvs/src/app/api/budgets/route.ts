import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const BudgetSchema = z.object({
  name: z.string().min(1),
  category: z.string(),
  budgeted: z.number().positive(),
  period: z.string(),
  fiscal_year: z.number(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '2024-q4';

    const mockBudgets = [
      {
        id: '1',
        name: 'Ultra Music Festival 2025',
        category: 'Events',
        budgeted: 2500000,
        actual: 2350000,
        variance: 150000,
        status: 'on-track',
        period,
        fiscal_year: 2024,
      },
      {
        id: '2',
        name: 'Operations & Overhead',
        category: 'Operations',
        budgeted: 450000,
        actual: 475000,
        variance: -25000,
        status: 'over',
        period,
        fiscal_year: 2024,
      },
      {
        id: '3',
        name: 'Marketing & Sales',
        category: 'Marketing',
        budgeted: 320000,
        actual: 298000,
        variance: 22000,
        status: 'on-track',
        period,
        fiscal_year: 2024,
      },
    ];

    return NextResponse.json({ budgets: mockBudgets });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = BudgetSchema.parse(body);

    const newBudget = {
      id: String(Math.floor(Math.random() * 10000)),
      ...validatedData,
      actual: 0,
      variance: validatedData.budgeted,
      status: 'on-track',
      created_at: new Date().toISOString(),
    };

    return NextResponse.json(newBudget, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 });
  }
}
