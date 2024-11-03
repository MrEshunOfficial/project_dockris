import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbconfigue/dbConfigue';
import notificationModel from '@/models/notification/notificationModel';
import { getSession } from 'next-auth/react';

// Route handler for GET, PUT, and DELETE
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connect(); // Connect to the database
  const session = await getSession(); // Get session

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user?.id; // Get the user ID
  const { id } = params; // Extract notification ID from the request

  try {
    const notification = await notificationModel.findOne({ _id: id, userId });
    if (!notification) {
      return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
    }
    return NextResponse.json(notification, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching notification', error }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connect();
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user?.id;
  const { id } = params;
  const { message, scheduledFor, recurringType } = await req.json(); // Parse request body

  try {
    const updatedNotification = await notificationModel.findByIdAndUpdate(
      id,
      {
        message: {
          title: message.title,
          body: message.body,
        },
        scheduledFor,
        recurringType,
        userId, // Make sure to associate the notification with the user
      },
      { new: true }
    );
    if (!updatedNotification) {
      return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
    }
    return NextResponse.json(updatedNotification, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating notification', error }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await connect();
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const deletedNotification = await notificationModel.findByIdAndDelete(id);
    if (!deletedNotification) {
      return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
    }
    return NextResponse.json(null, { status: 204 }); // 204 No Content
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting notification', error }, { status: 500 });
  }
}
