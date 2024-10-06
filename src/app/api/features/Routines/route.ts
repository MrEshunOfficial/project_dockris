// File: app/api/routines/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Routine, { RoutineStatus } from '@/models/schedulesmodel/routinemodel/routineModel';
import { connect } from '@/dbconfigue/dbConfigue';

export async function GET(req: NextRequest) {
  await connect();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const status = searchParams.get('status') as RoutineStatus | null;

  let query: any = {};
  if (userId) query.userId = userId;
  if (status) query.status = status;

  try {
    const routines = await Routine.find(query);
    return NextResponse.json(routines);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await connect();
  const body = await req.json();

  try {
    const routine = await Routine.create(body);
    return NextResponse.json(routine, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
