import { NextRequest, NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key';

export function verifyAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function createToken(userId: string, email: string) {
  return jwt.sign({ userId, email }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function serverError(message: string) {
  return NextResponse.json({ error: message }, { status: 500 });
}

export function success(data: any, status = 200) {
  return NextResponse.json(data, { status });
}
