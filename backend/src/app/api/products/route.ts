import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { success, badRequest, serverError, verifyAuth } from "@/lib/utils/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const products = await prisma.product.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return success({ products });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return serverError("Failed to fetch products");
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify auth (temporarily disabled for testing)
    // const user = verifyAuth(request);
    // if (!user) {
    //   return badRequest("Unauthorized");
    // }

    const data = await request.json();

    const { name, unit, price, category } = data;

    if (!name || !unit || !price || !category) {
      return badRequest("Missing required fields");
    }

    const product = await prisma.product.create({
      data: {
        name,
        unit,
        price: parseFloat(price),
        category,
      },
    });

    return success({ product }, 201);
  } catch (error: any) {
    if (error.code === "P2002") {
      return badRequest("Product name already exists");
    }
    console.error("POST /api/products error:", error);
    return serverError("Failed to create product");
  }
}
