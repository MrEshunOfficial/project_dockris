// app/api/events/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connect } from "@/dbconfigue/dbConfigue";
import Event, { eventTypes, eventStatuses } from "@/models/scheduleModel/eventsModel";
import { auth } from '@/auth';
import { z } from 'zod';
import mongoose from 'mongoose';
import { eventSchema } from "@/store/type/eventTypes";

// Function to add refinements to a schema
const addEventRefinements = <T extends z.ZodType>(schema: T) => {
  return schema.refine(data => {
    if (data.startTime && data.endTime) {
      return new Date(data.startTime) < new Date(data.endTime);
    }
    return true;
  }, {
    message: "End time must be after start time",
    path: ["endTime"],
  }).refine(data => {
    if (data.price !== undefined && data.currency === undefined) {
      return false;
    }
    return true;
  }, {
    message: "Currency is required when price is specified",
    path: ["currency"],
  });
};

// Create the update schema with refinements
const updateEventSchema = addEventRefinements(eventSchema);

// Create a partial schema for PATCH requests
// const patchEventSchema = addEventRefinements(eventSchema.partial());

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

  if (error instanceof mongoose.Error.CastError) {
    return NextResponse.json({ 
      error: 'Invalid ID format'
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

// Improved error handling utility
const enhancedHandleError = (error: unknown) => {
  console.error('API Error:', error);
  
  // Known error types
  const errorHandlers: Record<string, (error: any) => NextResponse> = {
    'ZodError': (error: z.ZodError) => NextResponse.json({
      error: 'Validation error',
      details: error.errors.reduce((acc, err) => ({
        ...acc,
        [err.path.join('.')]: err.message
      }), {})
    }, { status: 400 }),
    
    'ValidationError': (error: mongoose.Error.ValidationError) => NextResponse.json({
      error: 'Database validation error',
      details: Object.fromEntries(
        Object.entries(error.errors).map(([key, err]) => [key, err.message])
      )
    }, { status: 400 }),
    
    'CastError': () => NextResponse.json({
      error: 'Invalid ID format',
      details: { id: 'Must be a valid MongoDB ObjectId' }
    }, { status: 400 }),
  };

  // Handle known error types
  const errorType = error?.constructor?.name;
  if (errorType && errorType in errorHandlers) {
    return errorHandlers[errorType](error);
  }

  // Handle generic errors
  if (error instanceof Error) {
    return NextResponse.json({
      error: 'Server error',
      message: error.message
    }, { status: 500 });
  }

  return NextResponse.json({
    error: 'Unknown error occurred',
    message: 'Please try again later'
  }, { status: 500 });
};


// Helper function to verify event access
async function verifyEventAccess(eventId: string, userId: string) {
  if (!Types.ObjectId.isValid(eventId)) {
    throw new Error('Invalid event ID');
  }

  const event = await Event.findOne({
    _id: eventId,
    $or: [
      { userId },
      { isPublic: true, status: 'confirmed' }
    ]
  });

  if (!event) {
    throw new Error('Event not found');
  }

  return event;
}

// Helper function to validate status transitions
async function validateStatusTransition(currentStatus: string, newStatus: string): Promise<boolean> {
  const allowedTransitions: Record<string, string[]> = {
    draft: ['pending', 'cancelled'],
    pending: ['confirmed', 'cancelled'],
    confirmed: ['cancelled', 'completed'],
    cancelled: [],
    completed: []
  };

  return allowedTransitions[currentStatus]?.includes(newStatus) ?? false;
}

// GET endpoint
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connect();

    const event = await verifyEventAccess(params.id, userId);
    
    // Include additional related data
    const eventData = event.toObject();
    
    // Add computed fields
    const now = new Date();
    eventData.isUpcoming = event.startTime > now;
    eventData.isOngoing = event.startTime <= now && event.endTime >= now;
    eventData.isPast = event.endTime < now;
    
    return NextResponse.json({ event: eventData });
  } catch (error) {
    return handleError(error);
  }
}

// PUT endpoint for full updates
function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id) && String(new Types.ObjectId(id)) === id;
}

// Enhanced PUT endpoint
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate the ID parameter
    if (!params.id || !isValidObjectId(params.id)) {
      return NextResponse.json({ error: 'Invalid event ID format' }, { status: 400 });
    }

    await connect();

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json({ 
        error: 'Invalid JSON in request body' 
      }, { status: 400 });
    }

    // Verify event existence and ownership
    const existingEvent = await Event.findOne({ 
      _id: params.id, 
      userId 
    }).exec();

    if (!existingEvent) {
      return NextResponse.json({ 
        error: 'Event not found or unauthorized' 
      }, { status: 404 });
    }

    // Validate the update data
    const validatedData = updateEventSchema.parse(body);

    // Process dates
    if (validatedData.startTime) {
      validatedData.startTime = new Date(validatedData.startTime);
    }
    if (validatedData.endTime) {
      validatedData.endTime = new Date(validatedData.endTime);
    }

    // Validate status transition if status is being updated
    if (validatedData.status && existingEvent.status !== validatedData.status) {
      const isValidTransition = await validateStatusTransition(
        existingEvent.status, 
        validatedData.status
      );
      if (!isValidTransition) {
        return NextResponse.json({
          error: `Invalid status transition from ${existingEvent.status} to ${validatedData.status}`
        }, { status: 400 });
      }
    }

    // Update the event
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: params.id, userId },
      { 
        $set: validatedData,
        $inc: { __v: 1 }
      },
      { 
        new: true, 
        runValidators: true,
        context: 'query' 
      }
    ).exec();

    if (!updatedEvent) {
      return NextResponse.json({ 
        error: 'Failed to update event' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Event updated successfully',
      event: updatedEvent 
    });
  } catch (error) {
    return handleError(error);
  }
}

// DELETE endpoint
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connect();

    // Verify ownership
    const event = await Event.findOne({ _id: params.id, userId });
    if (!event) {
      return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
    }

    // Check if event can be deleted
    if (event.registeredAttendees && event.registeredAttendees > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete event with registered attendees' 
      }, { status: 400 });
    }

    if (event.status === 'confirmed' && event.startTime <= new Date() && event.endTime >= new Date()) {
      return NextResponse.json({ 
        error: 'Cannot delete an ongoing event' 
      }, { status: 400 });
    }

    // Perform the deletion
    const result = await Event.deleteOne({ _id: params.id, userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Event deleted successfully' 
    });
  } catch (error) {
    return handleError(error);
  }
}

// PATCH endpoint for partial updates
const patchEventSchema = eventSchema.partial().refine(data => {
  // Validate dates if both are provided
  if (data.startTime && data.endTime) {
    return new Date(data.startTime) < new Date(data.endTime);
  }
  // If only one date is provided, validate against existing event dates
  return true;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
})
// Enhanced PATCH endpoint with better validation and error handling
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 1. Authentication check
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({
        error: 'Authentication required',
        details: { auth: 'Please log in to perform this action' }
      }, { status: 401 });
    }

    // 2. Input validation
    if (!params.id || !Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({
        error: 'Invalid request',
        details: { id: 'Invalid event ID format' }
      }, { status: 400 });
    }

    // 3. Database connection
    await connect();

    // 4. Event existence and ownership check
    const existingEvent = await Event.findOne({
      _id: new Types.ObjectId(params.id),
      userId
    });

    if (!existingEvent) {
      return NextResponse.json({
        error: 'Not found',
        details: { event: 'Event not found or access denied' }
      }, { status: 404 });
    }

    // 5. Request body parsing
    let updateData;
    try {
      updateData = await request.json();
    } catch (error) {
      return NextResponse.json({
        error: 'Invalid request',
        details: { body: 'Invalid JSON in request body' }
      }, { status: 400 });
    }

    // 6. Schema validation with detailed error handling
    const validationResult = patchEventSchema.safeParse(updateData);
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation error',
        details: validationResult.error.errors.reduce((acc, err) => ({
          ...acc,
          [err.path.join('.')]: err.message
        }), {})
      }, { status: 400 });
    }

    // 7. Business logic validation
    if (validationResult.data.status) {
      const isValidTransition = await validateStatusTransition(
        existingEvent.status,
        validationResult.data.status
      );

      if (!isValidTransition) {
        return NextResponse.json({
          error: 'Invalid operation',
          details: {
            status: `Cannot transition from ${existingEvent.status} to ${validationResult.data.status}`,
            allowedTransitions: getAllowedTransitions(existingEvent.status)
          }
        }, { status: 400 });
      }
    }

    // 8. Update operation with optimistic concurrency control
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: new Types.ObjectId(params.id),
        userId,
        __v: existingEvent.__v // Concurrency check
      },
      {
        $set: validationResult.data,
        $inc: { __v: 1 }
      },
      {
        new: true,
        runValidators: true,
        context: 'query'
      }
    );

    if (!updatedEvent) {
      return NextResponse.json({
        error: 'Update failed',
        details: {
          concurrency: 'Event was modified by another request, please retry'
        }
      }, { status: 409 });
    }

    // 9. Success response
    return NextResponse.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });

  } catch (error) {
    return enhancedHandleError(error);
  }
}

// Helper function to get allowed transitions for better error messages
function getAllowedTransitions(currentStatus: string): string[] {
  const allowedTransitions: Record<string, string[]> = {
    draft: ['pending', 'cancelled'],
    pending: ['confirmed', 'cancelled'],
    confirmed: ['cancelled', 'completed'],
    cancelled: [],
    completed: []
  };
  
  return allowedTransitions[currentStatus] || [];
}