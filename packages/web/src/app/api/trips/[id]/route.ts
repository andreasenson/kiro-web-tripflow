import { NextRequest, NextResponse } from 'next/server';
import { findOne, update, remove } from '@/lib/trip-store';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const trip = findOne(id);
  if (!trip) {
    return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
  }
  return NextResponse.json(trip);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const trip = update(id, body);
    if (!trip) {
      return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
    }
    return NextResponse.json(trip);
  } catch {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const deleted = remove(id);
  if (!deleted) {
    return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
