import { NextRequest, NextResponse } from 'next/server';
import { UserProfile } from '@/models/profileModel/userProfileModel';
import { connect } from '@/dbconfigue/dbConfigue';
import { z } from 'zod';
import { auth } from '@/auth';
import { profileSchema } from '@/store/type/profileSchema';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

function handleError(error: unknown): NextResponse {
  console.error('API Error:', error);
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
  }
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
    { status: 500 }
  );
}

// POST: Create a new user profile
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    const userId = session?.user?.id;
    if (!userEmail || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = await req.json();
    const validatedData = profileSchema.parse(data);
    await connect();
    const existingProfile = await UserProfile.findOne({ userId });
    if (existingProfile) {
      return NextResponse.json({ error: 'Profile already exists' }, { status: 409 });
    }
    const newUserProfile = new UserProfile({ ...validatedData, userId });
    const savedProfile = await newUserProfile.save();
    return NextResponse.json(savedProfile, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

// GET: Retrieve user profile
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connect();
    const userProfile = await UserProfile.findOne({ userId }).select('-__v');
    if (!userProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    return NextResponse.json(userProfile, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

// PUT: Update existing profile
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = await req.json();
    const validatedData = profileSchema.parse(data);
    await connect();
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { ...validatedData, dateOfBirth: new Date(validatedData.dateOfBirth) },
      { new: true, runValidators: true }
    ).select('-__v');
    if (!updatedProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    return NextResponse.json(updatedProfile, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

// DELETE: Delete user profile
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connect();
    const deletedProfile = await UserProfile.findOneAndDelete({ userId });
    if (!deletedProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Profile deleted successfully' }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('profilePicture') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Save the file
    const uniqueFilename = `${Date.now()}-${file.name}`;
    const filePath = join(uploadsDir, uniqueFilename);
    await writeFile(filePath, buffer);
    
    // Update the user profile with the new picture URL
    await connect();
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { profilePicture: `/uploads/${uniqueFilename}` },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!updatedProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profilePicture: updatedProfile.profilePicture }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}
