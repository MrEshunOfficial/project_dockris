import { connect } from "@/dbconfigue/dbConfigue";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import { auth } from "@/auth";
import Todo, { ITodo } from "@/models/scheduleModel/todoModel";

connect();
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body: ITodo = await req.json();
    if (!body.title || !body.category) {
      return NextResponse.json(
        { message: "Title and category are required fields" },
        { status: 400 }
      );
    }
    if (body.subtasks && body.subtasks.length > 0) {
      body.subtasks = body.subtasks.map(subtask => ({
        ...subtask,
        id: uuidv4() // Always generate a new ID for subtasks
      }));
      body.completed = body.subtasks.every(subtask => subtask.completed);
    } else {
      body.completed = false;
    }
    
    const newTodo = new Todo({
      ...body,
      userId: userId
    });
    const savedTodo = await newTodo.save();
    return NextResponse.json(
      { message: "Todo created successfully", todo: savedTodo },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { message: "An error occurred while creating the todo", error: error.message, stack: error.stack },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "An unknown error occurred while creating the todo" },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const todos = await Todo.find({ userId: userId });
    return NextResponse.json({ todos }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred while fetching todos" },
      { status: 500 }
    );
  }
}
