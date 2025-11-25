import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'ytd';
    const type = searchParams.get('type');

    const mockReports = {
      revenue: {
        total: 6650000,
        byClient: [
          { name: 'Ultra Worldwide', amount: 2500000 },
          { name: 'Formula One Group', amount: 3200000 },
          { name: 'MCH Group', amount: 950000 },
        ],
      },
      expenses: {
        total: 5620000,
        byCategory: [
          { category: 'Labor', amount: 3200000 },
          { category: 'Equipment', amount: 1100000 },
          { category: 'Operations', amount: 1320000 },
        ],
      },
      profit: {
        gross: 1030000,
        margin: 15.5,
      },
      projects: {
        completed: 45,
        inProgress: 8,
        planning: 12,
      },
      assets: {
        utilization: [
          { category: 'Lighting', utilization: 78, total: 124 },
          { category: 'Audio', utilization: 85, total: 96 },
          { category: 'Video', utilization: 62, total: 83 },
          { category: 'Staging', utilization: 71, total: 145 },
        ],
      },
    };

    if (type) {
      return NextResponse.json({ [type]: mockReports[type as keyof typeof mockReports] });
    }

    return NextResponse.json({ reports: mockReports, period });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
