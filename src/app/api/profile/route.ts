import { connect } from '@/dbconfigue/dbConfigue';
import User from '@/models/authentication/authModel';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

// Input validation schemas
const userProfileSchema = z.object({
  name: z.string(),
  phone: z.string().optional(),
  location: z.string().optional(),
  occupation: z.string().optional(),
  birthdate: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
});

// Helper function
export const handleError = (error: unknown): NextResponse => {
  console.error("API error:", error);
  if (error instanceof z.ZodError) {
    return NextResponse.json({ message: "Validation failed", errors: error.errors }, { status: 400 });
  }
  if (error instanceof Error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
  return NextResponse.json({ message: "An unknown error occurred" }, { status: 500 });
};

// Helper function to get user ID from token
const getUserIdFromToken = (req: NextRequest): string | null => {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET as string) as { id: string };
    return decoded.id;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};

export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    await connect();
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = userProfileSchema.parse(body);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { profile: validatedData } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Profile updated successfully", user: updatedUser }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await connect();
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    await connect();
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $unset: { profile: 1 } },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Profile deleted successfully", user: updatedUser }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}