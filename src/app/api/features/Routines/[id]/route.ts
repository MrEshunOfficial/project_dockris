import { NextRequest, NextResponse } from 'next/server';
import Routine, { RoutineStatus, Frequency } from '@/models/schedulesmodel/routinemodel/routineModel';
import { connect } from '@/dbconfigue/dbConfigue';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await connect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as RoutineStatus | null;
    const userId = searchParams.get('userId');
    const search = searchParams.get('search');
    const frequency = searchParams.get('frequency') as Frequency | null;

    let query: any = {};
    if (status) query.status = status;
    if (userId) query.userId = new mongoose.Types.ObjectId(userId);
    if (frequency) query.frequency = frequency;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const routines = await Routine.find(query);
    return NextResponse.json(routines);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connect();
    const newRoutineData = await req.json();
    const routine = new Routine(newRoutineData);
    await routine.save();
    return NextResponse.json(routine, { status: 201 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: 'An error occurred while creating the routine' }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connect();
    const { pathname } = new URL(req.url);
    const id = pathname.split('/').pop();

    const updateData = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Routine ID is required' }, { status: 400 });
    }

    const routine = await Routine.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!routine) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 });
    }
    return NextResponse.json(routine);
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json({ error: 'An error occurred while updating the routine' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connect();
    
    const { pathname } = new URL(req.url);
    const id = pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: 'Routine ID is required' }, { status: 400 });
    }

    const routine = await Routine.findByIdAndDelete(id);
    if (!routine) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Routine deleted successfully' });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ error: 'An error occurred while deleting the routine' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connect();
    const body = await req.json();
    const { id, date, completed } = body;

    const routine = await Routine.findById(id);
    if (!routine) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 });
    }

    const completionStatusIndex = routine.completionStatus.findIndex(
      (status) => status.date.toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0]
    );

    if (completionStatusIndex !== -1) {
      routine.completionStatus[completionStatusIndex].completed = completed;
    } else {
      routine.completionStatus.push({ date: new Date(date), completed });
    }

    if (completed) {
      routine.status = RoutineStatus.COMPLETED;
    } else if (routine.status === RoutineStatus.COMPLETED) {
      routine.status = RoutineStatus.ACTIVE;
    }

    await routine.save();
    return NextResponse.json(routine);
  } catch (error) {
    console.error('PATCH Error:', error);
    return NextResponse.json({ error: 'An error occurred while updating the completion status' }, { status: 400 });
  }
}