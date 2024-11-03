// app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbconfigue/dbConfigue';
import { z } from 'zod';
import { auth } from '@/auth';
import Event, { eventTypes, eventStatuses } from '@/models/scheduleModel/eventsModel';
import mongoose from 'mongoose';
import { cleanRequestBody, eventSchema } from '@/store/type/eventTypes';


function handleError(error: unknown): NextResponse {
  console.error('API Error:', error);
  
  if (error instanceof z.ZodError) {
    return NextResponse.json({ 
      error: 'Validation error', 
      details: error.errors 
    }, { status: 400 });
  }
  
  if (error instanceof mongoose.Error.ValidationError) {
    return NextResponse.json({ 
      error: 'Validation error',
      details: Object.values(error.errors).map(err => err.message)
    }, { status: 400 });
  }

  if (error instanceof Error) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }

  return NextResponse.json({ 
    error: 'An unexpected error occurred' 
  }, { status: 500 });
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connect();

    // Parse query parameters
    const url = new URL(req.url);
    const params = new URLSearchParams(url.search);
    
    // Build query
    const query: any = { userId };
    
    // Filter by status
    const status = params.get('status');
    if (status && eventStatuses.includes(status as any)) {
      query.status = status;
    }

    // Filter by type
    const type = params.get('type');
    if (type && eventTypes.includes(type as any)) {
      query.type = type;
    }

    // Date range filter
    const startDate = params.get('startDate');
    const endDate = params.get('endDate');
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }

    // Pagination
    const page = parseInt(params.get('page') || '1');
    const limit = Math.min(parseInt(params.get('limit') || '10'), 100);
    const skip = (page - 1) * limit;

    // Execute query
    const [events, total] = await Promise.all([
      Event.find(query)
        .sort({ startTime: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Event.countDocuments(query)
    ]);

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, { status: 200 });

  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Clean the request body and validate
    const cleanedBody = cleanRequestBody(body);
    const validatedData = eventSchema.parse(cleanedBody);

    await connect();

    // Create new event
    const event = new Event({
      ...validatedData,
      userId
    });

    // Save to database
    const savedEvent = await event.save();

    return NextResponse.json({
      message: 'Event created successfully',
      event: savedEvent
    }, { status: 201 });

  } catch (error) {
    return handleError(error);
  }
}

