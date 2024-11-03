
// File: /app/api/reminders/[id]/route.ts
import { connect } from "@/dbconfigue/dbConfigue";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import reminderModel, { IReminder } from "@/models/notification/reminderModel";

connect();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reminder = await reminderModel.findOne({ _id: params.id, createdBy: userId });

    if (!reminder) {
      return NextResponse.json({ message: "Reminder not found" }, { status: 404 });
    }

    return NextResponse.json({ reminder }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred while fetching the reminder" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reminderId = params.id;
    const body: Partial<IReminder> = await req.json();

    const updatedReminder = await reminderModel.findOneAndUpdate(
      { _id: reminderId, createdBy: userId },
      { $set: body },
      { new: true }
    );

    if (!updatedReminder) {
      return NextResponse.json(
        { message: "Reminder not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Reminder updated successfully", reminder: updatedReminder },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred while updating the reminder" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reminderId = params.id;
    const deletedReminder = await reminderModel.findOneAndDelete({
      _id: reminderId,
      createdBy: userId
    });

    if (!deletedReminder) {
      return NextResponse.json(
        { message: "Reminder not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Reminder deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred while deleting the reminder" },
      { status: 500 }
    );
  }
}

