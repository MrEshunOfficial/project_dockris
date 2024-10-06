import { NextRequest, NextResponse } from 'next/server';
import Event, { IEvent } from '@/models/schedulesmodel/event-model/Eventmodel';
import { connect } from '@/dbconfigue/dbConfigue';

// Connect to the database
connect();

// GET: Fetch all events
export async function GET(req: NextRequest) {
  try {
    const events = await Event.find();
    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

// POST: Create a new event
export async function POST(req: NextRequest) {
  try {
    const body: IEvent = await req.json();
    const newEvent = new Event(body);
    await newEvent.save();
    return NextResponse.json({ success: true, data: newEvent }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 400 });
  }
}

