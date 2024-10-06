import { connect } from '@/dbconfigue/dbConfigue';
import UserProfile from '@/models/profileModel/userModel';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handleError } from '../route';

const userProfileSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  location: z.string(),
  occupation: z.string(),
  birthdate: z.string(),
  bio: z.string(),
  avatarUrl: z.string(),
});

const userIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
): Promise<NextResponse> {
  try {
    await connect();
    const validatedUserId = userIdSchema.parse(params.userId);
    const userProfile = await UserProfile.findById(validatedUserId);
    if (!userProfile) {
      return NextResponse.json({ message: "User profile not found" }, { status: 404 });
    }
    return NextResponse.json(userProfile, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
): Promise<NextResponse> {
  try {
    await connect();
    const validatedUserId = userIdSchema.parse(params.userId);
    const body = await req.json();
    const validatedData = userProfileSchema.partial().parse(body);
    const updatedProfile = await UserProfile.findByIdAndUpdate(validatedUserId, validatedData, { new: true, runValidators: true });
    if (!updatedProfile) {
      return NextResponse.json({ message: "User profile not found" }, { status: 404 });
    }
    return NextResponse.json(updatedProfile, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
): Promise<NextResponse> {
  try {
    await connect();
    const validatedUserId = userIdSchema.parse(params.userId);
    const deletedProfile = await UserProfile.findByIdAndDelete(validatedUserId);
    if (!deletedProfile) {
      return NextResponse.json({ message: "User profile not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "User profile deleted successfully" }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}