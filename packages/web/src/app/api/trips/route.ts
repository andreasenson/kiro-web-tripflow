import { NextRequest, NextResponse } from 'next/server';
import { CreateTripSchema } from '@tripflow/shared';
import { findAll, create } from '@/lib/trip-store';

export async function GET() {
  const trips = findAll();
  return NextResponse.json(trips);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CreateTripSchema.parse(body);
    const trip = create(parsed);
    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { message: 'Validation failed', errors: (error as any).errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}
