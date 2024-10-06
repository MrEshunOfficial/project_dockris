import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connect } from "@/dbconfigue/dbConfigue";
import Event from "@/models/schedulesmodel/event-model/Eventmodel";


connect();

// GET /api/events/:id -> Fetch an event by id
export async function GET(request: Request, { params }: { params: { id: string } }) {
 

  try {
    const { id } = params;

    // Check if the `id` is a valid ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid event ID" }, { status: 400 });
    }

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, event });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// PUT /api/events/:id -> Update an event by id
export async function PUT(request: Request, { params }: { params: { id: string } }) {

  try {
    const { id } = params;
    const body = await request.json();

    // Check if the `id` is a valid ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid event ID" }, { status: 400 });
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, body, { new: true });
    if (!updatedEvent) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, event: updatedEvent });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// DELETE /api/events/:id -> Delete an event by id
export async function DELETE(request: Request, { params }: { params: { id: string } }) {


  try {
    const { id } = params;

    // Check if the `id` is a valid ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid event ID" }, { status: 400 });
    }

    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Event deleted" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
