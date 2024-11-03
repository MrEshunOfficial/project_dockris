import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbconfigue/dbConfigue';
import { z } from 'zod';
import { auth } from '@/auth';
import AppointmentModel, { IAppointment } from '@/models/scheduleModel/appointmentModel';

function handleError(error: unknown): NextResponse {
  console.error('API Error:', error);
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
  }
  // Handle mongoose validation errors
  if (error instanceof Error && 'name' in error && error.name === 'ValidationError') {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
    { status: 500 }
  );
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connect();

    // Get all appointments for the user
    const appointments = await AppointmentModel
      .find({ userId })
      .sort({ dueDateTime: 1 })
      .lean();

    return NextResponse.json({ appointments }, { status: 200 });

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

    // Parse request body
    const body: Partial<IAppointment> = await req.json();
    
    // Check required fields
    const requiredFields = ["title", "dueDateTime", "location"];
    for (const field of requiredFields) {
      if (!body[field as keyof IAppointment]) {
        return NextResponse.json(
          { error: `${field} is a required field` },
          { status: 400 }
        );
      }
    }

    await connect();

    // Create new appointment - Mongoose will handle validation based on the schema
    const appointment = new AppointmentModel({
      ...body,
      userId
    });

    // Save to database - This will trigger mongoose validations
    const savedAppointment = await appointment.save();

    // Return success response
    return NextResponse.json({
      message: 'Appointment created successfully',
      appointment: savedAppointment
    }, { status: 201 });

  } catch (error) {
    return handleError(error);
  }
}
