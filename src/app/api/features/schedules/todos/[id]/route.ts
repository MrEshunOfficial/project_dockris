import { connect } from "@/dbconfigue/dbConfigue";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth"; // Make sure to import the auth function
import Todo, { ITodo } from "@/models/scheduleModel/todoModel";

connect();

// Helper function to check user authentication
async function authenticateUser(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id || null;
}

// Combined GET function for all todos and specific todo by ID
export async function GET(
  req: NextRequest,
  { params }: { params?: { id?: string } }
): Promise<NextResponse> {
  try {
    const userId = await authenticateUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (params?.id) {
      // Fetch specific todo by ID
      const todo = await Todo.findOne({ _id: params.id, userId });
      if (!todo) {
        return NextResponse.json({ message: "Todo not found" }, { status: 404 });
      }
      return NextResponse.json({ todo }, { status: 200 });
    } else {
      // Fetch all todos with search functionality
      const { searchParams } = new URL(req.url);
      const searchTerm = searchParams.get('search');

      let query: any = { userId };
      if (searchTerm) {
        query.$or = [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ];
      }
      const todos = await Todo.find(query);
      return NextResponse.json({ todos }, { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching todo(s):", error);
    return NextResponse.json(
      { message: "An error occurred while fetching todo(s)" },
      { status: 500 }
    );
  }
}

// Updated PUT (update) todo
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const userId = await authenticateUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: Partial<ITodo> & { subtaskId?: string; deleteSubtask?: boolean } = await req.json();
    const todoId = params.id;

    const todo = await Todo.findOne({ _id: todoId, userId });

    if (!todo) {
      return NextResponse.json(
        { message: "Todo not found" },
        { status: 404 }
      );
    }

    // Check if this is a subtask update or deletion
    if (body.subtaskId) {
      const subtaskIndex = todo.subtasks?.findIndex((st: { id: string | undefined; }) => st.id === body.subtaskId);
      if (subtaskIndex === -1 || subtaskIndex === undefined) {
        return NextResponse.json(
          { message: "Subtask not found" },
          { status: 404 }
        );
      }

      if (body.deleteSubtask) {
        // Delete the subtask
        todo.subtasks.splice(subtaskIndex, 1);

        // If it's the last subtask, delete the parent todo
        if (todo.subtasks.length === 0) {
          await Todo.findOneAndDelete({ _id: todoId, userId });
          return NextResponse.json(
            { message: "Last subtask deleted. Parent todo removed." },
            { status: 200 }
          );
        }
      } else if ('completed' in body) {
        // Update subtask completion status
        todo.subtasks[subtaskIndex].completed = body.completed as boolean;
      }
    } 
    // Main task update
    else if ('completed' in body) {
      todo.completed = body.completed as boolean;
      // Update all subtasks to match the main task's completion status
      todo.subtasks = todo.subtasks.map((st: any) => ({ ...st, completed: todo.completed }));
    }
    // Other updates
    else {
      Object.assign(todo, body);
    }

    // Check if all subtasks are completed
    const allSubtasksCompleted = todo.subtasks.every((subtask: { completed: any; }) => subtask.completed);
    todo.completed = allSubtasksCompleted;
    // Save the updated todo
    // const updatedTodo = await todo.save();
    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: todoId, userId },
      { $set: body },
      { new: true, runValidators: true }
    );
    return NextResponse.json(
      { message: "Todo updated successfully", todo: updatedTodo },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred while updating the todo" },
      { status: 500 }
    );
  }
}



// Updated DELETE todo
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const userId = await authenticateUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subtaskId = searchParams.get('subtaskId');

    const todo = await Todo.findOne({ _id: params.id, userId });
    if (!todo) {
      return NextResponse.json(
        { message: "Todo not found" },
        { status: 404 }
      );
    }

    if (subtaskId) {
      // Delete specific subtask
      const subtaskIndex = todo.subtasks.findIndex((st: { id: string; }) => st.id === subtaskId);
      if (subtaskIndex === -1) {
        return NextResponse.json(
          { message: "Subtask not found" },
          { status: 404 }
        );
      }

      todo.subtasks.splice(subtaskIndex, 1);
      if (todo.subtasks.length === 0) {
        // If it's the last subtask, delete the parent todo
        await Todo.findOneAndDelete({ _id: params.id, userId });
        return NextResponse.json(
          { message: "Last subtask deleted. Parent todo removed." },
          { status: 200 }
        );
      } else {
        // Save the updated todo
        const updatedTodo = await todo.save();
        return NextResponse.json(
          { message: "Subtask deleted successfully", todo: updatedTodo },
          { status: 200 }
        );
      }
    } else {
      // Delete entire todo (including all subtasks)
      await Todo.findOneAndDelete({ _id: params.id, userId });
      return NextResponse.json(
        { message: "Todo and all its subtasks deleted successfully" },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred while deleting the todo or subtask" },
      { status: 500 }
    );
  }
}