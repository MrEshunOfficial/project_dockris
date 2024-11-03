import { connect } from "@/dbconfigue/dbConfigue";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import reminderModel from "@/models/notification/reminderModel";

connect();

// Route: /api/reminder/route.ts
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

    let query: any = { createdBy: userId };
    if (entityType && entityId) {
      query.entityType = entityType;
      query.entityId = entityId;
    }

    const reminders = await reminderModel.find(query);
    return NextResponse.json({ reminders }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred while fetching reminders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" }, 
        { status: 401 }
      );
    }

    const body = await req.json();
    
    // Validation
    if (!body.title || !body.date || !body.time) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Title, date, and time are required fields" 
        }, 
        { status: 400 }
      );
    }

    const newReminder = new reminderModel({
      ...body,
      createdBy: userId
    });

    const savedReminder = await newReminder.save();

    // Ensure the saved reminder is properly formatted
    const formattedReminder = {
      ...savedReminder.toObject(),
      _id: savedReminder._id.toString(),
      createdBy: savedReminder.createdBy.toString(),
      entityId: savedReminder.entityId?.toString(),
    };

    return NextResponse.json(
      { 
        success: true,
        message: "Reminder created successfully", 
        reminder: formattedReminder 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "An error occurred while creating the reminder",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
