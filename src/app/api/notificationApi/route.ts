// /api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbconfigue/dbConfigue';
import { sendEmail } from '@/lib/emailService';
import notificationModel from '@/models/notification/notificationModel';
import { getSession } from 'next-auth/react';

// Function to handle different HTTP methods (GET, POST, etc.)
export async function GET(req: NextRequest) {
  await connect(); // Ensure we're connected to MongoDB

  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 }); // Return if not authenticated
  }

  const userId = session.user?.id as string; // Get the MongoDB user ID from session

  try {
    const notifications = await notificationModel.find({ userId });
    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching notifications', error }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await connect(); // Ensure we're connected to MongoDB

  const session = await getSession(); // Get the session to identify the user

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 }); // Return if not authenticated
  }

  const userId = session.user?.id as string; // Get the MongoDB user ID from session

  try {
    const body = await req.json(); // Parse the incoming request body
    const { message, scheduledFor, recurringType } = body;

    const newNotification = await notificationModel.create({
      userId,
      message: {
        title: message.title,
        body: message.body,
      },
      scheduledFor,
      recurringType,
    });

    // Send email notification to the user
    const userEmail = session.user?.email as string; // Assuming user's email is available in the session
    const emailSubject = `New Notification: ${message.title}`;
    const emailBody = `You have a new notification: ${message.body}`;
    
    // Call the sendEmail function to send an email
    await sendEmail(
      userEmail,
      emailSubject,
      emailBody,
      `<p>${emailBody}</p>`,
      {
        to: userEmail,
        subject: emailSubject,
        text: emailBody,
        html: `<p>${emailBody}</p>`
      }
    );
    return NextResponse.json(newNotification, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating notification', error }, { status: 500 });
  }
}
