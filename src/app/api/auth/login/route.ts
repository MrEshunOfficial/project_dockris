// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import User from "@/models/authentication/authModel";
import { connect } from "@/dbconfigue/dbConfigue";
import { AuthUtils } from "@/lib/auth";

// Ensure database connection
connect();

// Define the request body schema
const loginSchema = z.object({
  email: z.string().email().nonempty("Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.errors.map(e => e.message).join(", "), success: false },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { message: "Invalid credentials", success: false },
        { status: 401 }
      );
    }

    // Create and sign token
    const token = await AuthUtils.signToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Create response
    const response = NextResponse.json(
      { message: "Login successful", success: true },
      { status: 200 }
    );

    // Set token as HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: AuthUtils.TOKEN_EXPIRY,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error during login process:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}