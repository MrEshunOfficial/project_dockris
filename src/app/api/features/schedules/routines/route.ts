import { connect } from "@/dbconfigue/dbConfigue";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import userRoutines, { RoutineDocument, Frequency, RoutineStatus } from "@/models/scheduleModel/routineModel";

connect();

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: Partial<RoutineDocument> = await req.json();

    // Comprehensive validation
    const requiredFields = ["title", "startTime", "endTime", "frequency"];
    for (const field of requiredFields) {
      if (!body[field as keyof RoutineDocument]) {
        return NextResponse.json(
          { message: `${field} is a required field` },
          { status: 400 }
        );
      }
    }

    // Additional frequency-specific validations
    if (body.frequency === Frequency.WEEKLY && (!body.daysOfWeek || body.daysOfWeek.length === 0)) {
      return NextResponse.json(
        { message: "daysOfWeek is required for weekly routines" },
        { status: 400 }
      );
    }

    if (body.frequency === Frequency.MONTHLY && !body.monthlyDate) {
      return NextResponse.json(
        { message: "monthlyDate is required for monthly routines" },
        { status: 400 }
      );
    }

    const newRoutine = new userRoutines({
      ...body,
      userId: userId,
      status: RoutineStatus.ACTIVE,
      streak: 0,
      dailyCompletionStatus: []
    });

    const savedRoutine = await newRoutine.save();

    return NextResponse.json(
      { message: "Routine created successfully", routine: savedRoutine },
      { status: 201 }
    );

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { message: "An error occurred while creating the routine", error: error.message, stack: error.stack },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "An unknown error occurred while creating the routine" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as RoutineStatus | null;
    const frequency = searchParams.get('frequency') as Frequency | null;

    let query: any = { userId };

    if (status) {
      query.status = status;
    }

    if (frequency) {
      query.frequency = frequency;
    }

    const routines = await userRoutines.find(query);

    return NextResponse.json(
      { message: "Routines retrieved successfully", routines },
      { status: 200 }
    );

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { message: "An error occurred while retrieving routines", error: error.message, stack: error.stack },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "An unknown error occurred while retrieving routines" },
      { status: 500 }
    );
  }
}