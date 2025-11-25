import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { origin, destination, mode } = body;

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination required' },
        { status: 400 }
      );
    }

    // In production, this would call Google Maps Directions API or similar
    // For now, return mock directions based on mode
    const steps = generateMockDirections(origin, destination, mode || 'driving');

    return NextResponse.json({ steps });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateMockDirections(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  mode: string
) {
  // Calculate approximate distance
  const distance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
  
  // Estimate time based on mode
  let speedKmh = 50; // driving
  if (mode === 'walking') speedKmh = 5;
  if (mode === 'transit') speedKmh = 30;
  
  const timeMinutes = Math.round((distance / speedKmh) * 60);

  const steps = [
    {
      instruction: 'Head toward the main road',
      distance: '0.2 km',
      duration: mode === 'walking' ? '3 min' : '1 min',
    },
    {
      instruction: `Continue ${mode === 'transit' ? 'to the transit station' : 'straight'}`,
      distance: `${(distance * 0.3).toFixed(1)} km`,
      duration: `${Math.round(timeMinutes * 0.3)} min`,
    },
  ];

  if (mode === 'transit') {
    steps.push({
      instruction: 'Board the transit line toward downtown',
      distance: `${(distance * 0.5).toFixed(1)} km`,
      duration: `${Math.round(timeMinutes * 0.4)} min`,
    });
    steps.push({
      instruction: 'Exit at the venue station',
      distance: '0 km',
      duration: '1 min',
    });
  } else {
    steps.push({
      instruction: `Turn right onto Main Street`,
      distance: `${(distance * 0.4).toFixed(1)} km`,
      duration: `${Math.round(timeMinutes * 0.4)} min`,
    });
  }

  steps.push({
    instruction: 'Continue to the venue entrance',
    distance: `${(distance * 0.2).toFixed(1)} km`,
    duration: `${Math.round(timeMinutes * 0.2)} min`,
  });

  steps.push({
    instruction: 'Arrive at your destination',
    distance: '0 km',
    duration: '0 min',
  });

  return steps;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
