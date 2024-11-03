import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbconfigue/dbConfigue';
import { auth } from '@/auth';
import AppointmentModel from '@/models/scheduleModel/appointmentModel';
import mongoose from 'mongoose';

// Helper function to validate MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

// Helper function to handle errors consistently
function handleError(error: unknown): NextResponse {
  console.error('API Error:', error);
  if (error instanceof Error && 'name' in error && error.name === 'ValidationError') {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
    { status: 500 }
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid appointment ID' }, { status: 400 });
    }

    await connect();

    const appointment = await AppointmentModel.findOne({
      _id: id,
      userId
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({ appointment }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid appointment ID' }, { status: 400 });
    }

    const body = await req.json();

    await connect();

    // Find appointment and check ownership
    const existingAppointment = await AppointmentModel.findOne({
      _id: id,
      userId
    });

    if (!existingAppointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Update appointment with new data
    // Using findOneAndUpdate to get the updated document
    const updatedAppointment = await AppointmentModel.findOneAndUpdate(
      { _id: id, userId },
      { ...body, userId }, // Ensure userId cannot be changed
      { 
        new: true, // Return the updated document
        runValidators: true // Run mongoose validations
      }
    );

    return NextResponse.json({
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid appointment ID' }, { status: 400 });
    }

    await connect();

    const appointment = await AppointmentModel.findOneAndDelete({
      _id: id,
      userId
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Appointment deleted successfully'
    }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}