import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import userRoutines, { RoutineDocument, RoutineStatus, Frequency } from "@/models/scheduleModel/routineModel";
import { connect } from "@/dbconfigue/dbConfigue";
import { isValidObjectId } from 'mongoose';



// Helper function to validate routine ID
const validateRoutineId = (id: string): boolean => {
  if (!id || id === 'undefined' || !isValidObjectId(id)) {
    return false;
  }
  return true;
};

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    if (!validateRoutineId(params.id)) {
      return NextResponse.json(
        { error: 'Invalid routine ID provided' },
        { status: 400 }
      );
    }

    await connect();

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const routine = await userRoutines.findOne({ _id: params.id, userId }).exec();
    if (!routine) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 });
    }
    return NextResponse.json({ message: "Routine retrieved successfully", routine }, { status: 200 });

  } catch (error) {
    console.error('GET Error:', error);
    return handleError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    if (!validateRoutineId(params.id)) {
      return NextResponse.json(
        { error: 'Invalid routine ID provided' },
        { status: 400 }
      );
    }

    await connect();

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Validate dates and times
    if (body.startTime && body.endTime) {
      const startTime = new Date(body.startTime);
      const endTime = new Date(body.endTime);
      
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        return NextResponse.json({ 
          error: 'Invalid date format for startTime or endTime' 
        }, { status: 400 });
      }
      
      if (startTime >= endTime) {
        return NextResponse.json({ 
          error: 'Start time must be before end time' 
        }, { status: 400 });
      }
    }
    
    // Additional validation checks
    const validationErrors = [];
    
    if (body.status && !Object.values(RoutineStatus).includes(body.status)) {
      validationErrors.push(`Invalid status. Must be one of: ${Object.values(RoutineStatus).join(', ')}`);
    }
    
    if (body.frequency && !Object.values(Frequency).includes(body.frequency)) {
      validationErrors.push(`Invalid frequency. Must be one of: ${Object.values(Frequency).join(', ')}`);
    }
    
    if ((body.frequency === Frequency.WEEKLY || body.frequency === Frequency.BIWEEKLY) 
        && (!body.daysOfWeek || body.daysOfWeek.length === 0)) {
      validationErrors.push('Days of week must be specified for weekly or biweekly routines');
    }
    
    if (body.frequency === Frequency.MONTHLY && !body.monthlyDate) {
      validationErrors.push('Monthly date must be specified for monthly routines');
    }
    
    if (validationErrors.length > 0) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationErrors 
      }, { status: 400 });
    }

    const updatedRoutine = await userRoutines.findOneAndUpdate(
      { _id: params.id, userId },
      { $set: body },
      { 
        new: true,
        runValidators: true,
      }
    ).exec();

    if (!updatedRoutine) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Routine updated successfully", routine: updatedRoutine },
      { status: 200 }
    );

  } catch (error) {
    console.error('PUT Error:', {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      routineId: params.id
    });
    return handleError(error);
  }
}

// Helper function to handle errors consistently
const handleError = (error: unknown): NextResponse => {
  if (error instanceof Error) {
    // Handle specific MongoDB errors
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { error: 'Duplicate entry found' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "An error occurred while processing your request",
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      },
      { status: 500 }
    );
  }
  
  return NextResponse.json(
    { error: "An unknown error occurred" },
    { status: 500 }
  );
};

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await connect();

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deletedRoutine = await userRoutines.findOneAndDelete(
      { _id: params.id, userId: userId },
      { maxTimeMS: 10000 } // Add timeout to prevent long-running queries
    ).exec();

    if (!deletedRoutine) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Routine deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error('DELETE Error:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { message: "An error occurred while deleting the routine", error: error.message, stack: error.stack },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "An unknown error occurred while deleting the routine" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await connect();

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, date } = body;

    const routine = await userRoutines.findOne({ _id: params.id, userId: userId });
    if (!routine) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 });
    }

    let updatedRoutine;
    
    try {
      switch (action) {
        case 'markCompleted':
          updatedRoutine = await routine.markAsCompleted(new Date(date));
          break;
        case 'pause':
          updatedRoutine = await routine.pauseRoutine();
          break;
        case 'resume':
          updatedRoutine = await routine.resumeRoutine();
          break;
        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }
    } catch (methodError) {
      throw methodError;
    }

    return NextResponse.json({ 
      message: "Routine updated successfully", 
      routine: updatedRoutine 
    }, { status: 200 });
    
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          message: "An error occurred while updating the routine", 
          error: error.message, 
          stack: error.stack 
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "An unknown error occurred while updating the routine" },
      { status: 500 }
    );
  }
}