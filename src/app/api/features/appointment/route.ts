// app/api/appointments/route.ts

import { NextRequest, NextResponse } from 'next/server';


import Appointment, { ReminderType,AppointmentStatus,
  PrivacyType, } from '@/models/schedulesmodel/appointmentModel/AppointmentModel';
import { connect } from '@/dbconfigue/dbConfigue';

export interface CreateAppointmentBody {
  title: string;
  start: string;
  end: string;
  location: string;
  description?: string;
  attendees: {
    type: 'individual' | 'count';
    individuals?: string[];
    count?: number;
  };
  reminder: {
    type: ReminderType;
    interval: string;
  };
  privacy: PrivacyType;
  recurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  status: AppointmentStatus;
  userId: string;
}

export async function GET(request: NextRequest) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as AppointmentStatus | null;

    const query = status ? { status } : {};
    const appointments = await Appointment.find(query);

    return NextResponse.json({ success: true, appointments });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect();

    const body: CreateAppointmentBody = await request.json();

    // Validate required fields
    const requiredFields = ['title', 'start', 'end', 'location', 'userId'];
    for (const field of requiredFields) {
      if (!body[field as keyof CreateAppointmentBody]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create new appointment
    const appointment = new Appointment({
      ...body,
      start: new Date(body.start),
      end: new Date(body.end),
    });

    // Save the appointment
    const savedAppointment = await appointment.save();

    return NextResponse.json({ success: true, data: savedAppointment }, { status: 201 });
  } catch (error) {
    
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 400 });
  }
}