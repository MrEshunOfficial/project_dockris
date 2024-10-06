// API Route
import { connect } from "@/dbconfigue/dbConfigue";
import Todo from "@/models/schedulesmodel/todoModel/TodoModel";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

interface ITodo {
  title: string;
  description?: string;
  dueDateTime?: Date;
  priority: 'lowest' | 'low' | 'medium' | 'high' | 'highest';
  category: 'work' | 'personal' | 'family' | 'hobbies' | 'education';
  completed?: boolean;
  tags?: string[];
  estimatedDuration?: number;
  subtasks?: {id?: string; title: string; completed: boolean }[];
  links?: string[];
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connect();
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
        id: subtask.id || uuidv4()
      }));
      body.completed = body.subtasks.every(subtask => subtask.completed);
    } else {
      body.completed = false;
    }
    
    const newTodo = new Todo(body);
    const savedTodo = await newTodo.save();
    
    return NextResponse.json(
      { message: "Todo created successfully", todo: savedTodo },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating todo:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { message: "An error occurred while creating the todo", error: error.message },
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
    await connect();
    const todos = await Todo.find({});
    return NextResponse.json({ todos }, { status: 200 });
  } catch (error) {
    console.error("Error fetching todos:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching todos" },
      { status: 500 }
    );
  }
}