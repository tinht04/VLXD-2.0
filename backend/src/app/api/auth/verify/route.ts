import { NextRequest } from "next/server";
import { verifyAuth, success, badRequest } from "@/lib/utils/auth";

export async function GET(request: NextRequest) {
  try {
    const user = verifyAuth(request);

    if (!user) {
      return badRequest("Invalid or expired token");
    }

    return success({
      valid: true,
      user,
    });
  } catch (error) {
    return badRequest("Invalid token");
  }
}
