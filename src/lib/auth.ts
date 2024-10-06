// lib/auth.ts
import { JWTPayload, SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  exp?: number;
}

export class AuthUtils {
  private static readonly TOKEN_SECRET = process.env.TOKEN_SECRET;
  public static readonly TOKEN_EXPIRY = 2 * 24 * 60 * 60;

  private static getSecret() {
    if (!this.TOKEN_SECRET) {
      throw new Error("TOKEN_SECRET is not defined in environment variables");
    }
    return new TextEncoder().encode(this.TOKEN_SECRET);
  }

  public static async signToken(payload: Omit<TokenPayload, 'exp'>): Promise<string> {
    const tokenPayload = {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + this.TOKEN_EXPIRY,
    } as JWTPayload;
    
    return new SignJWT(tokenPayload)
      .setProtectedHeader({ alg: "HS256" })
      .sign(this.getSecret());
  }

  public static async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const { payload } = await jwtVerify(token, this.getSecret());
      return payload as unknown as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  public static getTokenFromRequest(request: NextRequest): string | null {
    return request.cookies.get("token")?.value || null;
  }

  public static async getCurrentUser(request: NextRequest): Promise<TokenPayload | null> {
    const token = this.getTokenFromRequest(request);
    if (!token) return null;

    try {
      const payload = await this.verifyToken(token);
      
      // Check if token is expired
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        return null;
      }
      
      return payload;
    } catch {
      return null;
    }
  }

  public static getUserFromHeaders(headers: Headers): { id: string; role: string } | null {
    const userId = headers.get('userId');
    const userRole = headers.get('userRole'); // Fixed: changed from 'userId' to 'userRole'

    if (!userId || !userRole) return null;

    return {
      id: userId,
      role: userRole,
    };
  }
}