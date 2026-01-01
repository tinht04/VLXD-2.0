import { NextRequest } from "next/server";
import * as bcrypt from "bcrypt";
import prisma from "@/lib/db/prisma";
import {
  success,
  badRequest,
  serverError,
  createToken,
} from "@/lib/utils/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return badRequest("Missing required fields");
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return badRequest("Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const token = createToken(user.id, user.email);

    return success(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      },
      201
    );
  } catch (error) {
    console.error("POST /api/auth/register error:", error);
    return serverError("Failed to register user");
  }
}
