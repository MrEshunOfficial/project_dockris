// app/api/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { AuthUtils } from "@/lib/auth";
import User from "@/models/authentication/authModel";
import { connect } from "@/dbconfigue/dbConfigue";
import { profileSchema } from "@/models/authentication/profileSchema";

// Ensure database connection
connect();

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const user = await AuthUtils.getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await User.findById(user.id).select("-password");
    if (!dbUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const includeProfile = req.nextUrl.searchParams.get('includeProfile') === 'true';
    
    const responseData = {
      id: dbUser._id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      ...(includeProfile && { profile: dbUser.profile })
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Fetch current user error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const user = await AuthUtils.getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const updatedProfile = await req.json();
    
    // Validate the profile data
    const validationResult = profileSchema.safeParse(updatedProfile);
    if (!validationResult.success) {
      return NextResponse.json({
        message: "Invalid profile data",
        errors: validationResult.error.errors
      }, { status: 400 });
    }

    const dbUser = await User.findByIdAndUpdate(
      user.id,
      { $set: { profile: validationResult.data } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!dbUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: dbUser._id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      profile: dbUser.profile
    }, { status: 200 });
  } catch (error) {
    console.error("Update user profile error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}