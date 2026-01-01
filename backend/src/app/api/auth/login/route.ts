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
    const { email, password } = await request.json();

    if (!email || !password) {
      return badRequest("Missing email or password");
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return badRequest("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return badRequest("Invalid credentials");
    }

    const token = createToken(user.id, user.email);

    return success({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return serverError("Failed to login");
  }
}
