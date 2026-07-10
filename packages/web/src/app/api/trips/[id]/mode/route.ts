import { NextRequest, NextResponse } from 'next/server';
import { TripStatusSchema } from '@tripflow/shared';
import { switchMode } from '@/lib/trip-store';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = TripStatusSchema.parse(body.status);
    const trip = switchMode(id, parsed);
    if (!trip) {
      return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
    }
    return NextResponse.json(trip);
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
