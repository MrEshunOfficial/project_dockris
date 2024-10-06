// app/api/appointments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Appointment, {
  ReminderType,
  AppointmentStatus,
  PrivacyType,
} from '@/models/schedulesmodel/appointmentModel/AppointmentModel';
import { connect } from '@/dbconfigue/dbConfigue';
import validator from 'validator';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connect();
    const appointment = await Appointment.findById(params.id);

    if (!appointment) {
      return NextResponse.json({ message: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching appointment'}, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    await connect();

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: 'Invalid appointment ID' }, { status: 400 });
    }

    // Find the existing appointment
    const existingAppointment = await Appointment.findById(params.id);
    if (!existingAppointment) {
      return NextResponse.json({ message: 'Appointment not found' }, { status: 404 });
    }

    // Validate and update fields
    if (body.title) {
      if (!validator.isLength(body.title, { min: 1, max: 255 })) {
        return NextResponse.json({ message: 'Title must be between 1 and 255 characters' }, { status: 400 });
      }
      existingAppointment.title = body.title;
    }
    
    if (body.start && body.end) {
      const startDate = new Date(body.start);
      const endDate = new Date(body.end);
      if (startDate >= endDate) {
        return NextResponse.json({ message: 'Start date must be before end date' }, { status: 400 });
      }
      existingAppointment.start = startDate;
      existingAppointment.end = endDate;
    } else if (body.start) {
      const startDate = new Date(body.start);
      if (startDate >= existingAppointment.end) {
        return NextResponse.json({ message: 'Start date must be before existing end date' }, { status: 400 });
      }
      existingAppointment.start = startDate;
    } else if (body.end) {
      const endDate = new Date(body.end);
      if (existingAppointment.start >= endDate) {
        return NextResponse.json({ message: 'Existing start date must be before end date' }, { status: 400 });
      }
      existingAppointment.end = endDate;
    }

    if (body.location) {
      if (!validator.isLength(body.location, { min: 1, max: 255 })) {
        return NextResponse.json({ message: 'Location must be between 1 and 255 characters' }, { status: 400 });
      }
      existingAppointment.location = body.location;
    }

    if (body.description !== undefined) {
      if (body.description && !validator.isLength(body.description, { max: 1000 })) {
        return NextResponse.json({ message: 'Description must not exceed 1000 characters' }, { status: 400 });
      }
      existingAppointment.description = body.description;
    }

    if (body.attendees) {
      if (!['individual', 'count'].includes(body.attendees.type)) {
        return NextResponse.json({ message: 'Invalid attendees type' }, { status: 400 });
      }
      if (body.attendees.type === 'individual' && body.attendees.individuals) {
        for (const email of body.attendees.individuals) {
          if (!validator.isEmail(email)) {
            return NextResponse.json({ message: 'Invalid email address for attendee' }, { status: 400 });
          }
        }
      }
      if (body.attendees.type === 'count' && body.attendees.count !== undefined) {
        if (body.attendees.count <= 0) {
          return NextResponse.json({ message: 'Attendee count must be a positive number' }, { status: 400 });
        }
      }
      existingAppointment.attendees = body.attendees;
    }

    if (body.reminder) {
      if (!Object.values(ReminderType).includes(body.reminder.type)) {
        return NextResponse.json({ message: 'Invalid reminder type' }, { status: 400 });
      }
      if (!validator.isLength(body.reminder.interval, { min: 1, max: 50 })) {
        return NextResponse.json({ message: 'Reminder interval must be between 1 and 50 characters' }, { status: 400 });
      }
      existingAppointment.reminder = body.reminder;
    }

    if (body.privacy) {
      if (!Object.values(PrivacyType).includes(body.privacy)) {
        return NextResponse.json({ message: 'Invalid privacy type' }, { status: 400 });
      }
      existingAppointment.privacy = body.privacy;
    }

    if (body.recurring !== undefined) {
      existingAppointment.recurring = body.recurring;
      if (body.recurring && body.recurrencePattern) {
        if (!['daily', 'weekly', 'monthly', 'yearly'].includes(body.recurrencePattern)) {
          return NextResponse.json({ message: 'Invalid recurrence pattern' }, { status: 400 });
        }
        existingAppointment.recurrencePattern = body.recurrencePattern;
      } else if (body.recurring && !existingAppointment.recurrencePattern) {
        return NextResponse.json({ message: 'Recurrence pattern is required for recurring appointments' }, { status: 400 });
      }
    }

    if (body.status) {
      if (!Object.values(AppointmentStatus).includes(body.status)) {
        return NextResponse.json({ message: 'Invalid appointment status' }, { status: 400 });
      }
      existingAppointment.status = body.status;
    }

    // Save the updated appointment
    const updatedAppointment = await existingAppointment.save();

    return NextResponse.json({
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ message: 'Error updating appointment' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connect();
    const deletedAppointment = await Appointment.findByIdAndDelete(params.id);

    if (!deletedAppointment) {
      return NextResponse.json({ message: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting appointment'}, { status: 500 });
  }
}